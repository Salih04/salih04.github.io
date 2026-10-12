#!/usr/bin/env python3
"""Recompute reported control rates from FinanceIQ's per-model result data.

Python standard library only. This audits saved experiment data; it does not
refit models, rerun Monte Carlo experiments, or establish predictive validity.
Usage: python reproduce_counts.py --repo ./capstone-financeIQ
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
import math
from collections import defaultdict
from pathlib import Path
from statistics import NormalDist


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ValueError(message)


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def wilson(successes: int, total: int) -> list[float]:
    z = NormalDist().inv_cdf(0.975)
    p = successes / total
    denominator = 1 + z * z / total
    centre = (p + z * z / (2 * total)) / denominator
    radius = z * math.sqrt(p * (1 - p) / total + z * z / (4 * total**2)) / denominator
    return [max(0.0, centre - radius), min(1.0, centre + radius)]


def verify_manifest(repo: Path, directory: Path) -> None:
    manifest = json.loads((directory / "artifact_manifest.json").read_text())
    for item in manifest["artifacts"]:
        path = repo / item["path"]
        require(path.is_file(), f"Missing artifact: {path}")
        require(sha256(path) == item["sha256"], f"Artifact hash mismatch: {path}")


def audit(repo: Path) -> dict:
    nc = repo / "experiments/results_thesis/negative_control"
    calibration = repo / "experiments/results_thesis/positive_control_calibration"
    verify_manifest(repo, nc)
    verify_manifest(repo, calibration)
    config = json.loads((nc / "attempt_provenance.json").read_text())["registered_configuration"]
    dataset = repo / config["dataset_path"]
    require(sha256(dataset) == config["dataset_sha256"], "Frozen dataset hash mismatch")
    models = set(config["models"])
    require(len(models) == 6 and config["model_family_divisor"] == 6, "Unexpected model family")
    expected_ids = {
        "NC0_ROW_PERMUTED_MASK_RANK_GAUSSIAN": set(range(1000, 2000)),
        "NC1_TARGET_PERMUTATION": set(range(2000, 3000)),
    }
    grouped: dict = defaultdict(dict)
    with (nc / "repetitions.csv").open(newline="") as handle:
        for row in csv.DictReader(handle):
            require(row["control"] in expected_ids, "Unexpected confirmatory control")
            key = (row["control"], int(row["repetition_id"]))
            require(row["model"] not in grouped[key], f"Duplicate model cell: {key}")
            require(row["analyzable"] == "True" and row["model_status"] == "ANALYZABLE", f"Invalid model cell: {key}")
            p = float(row["permutation_p_value_two_sided"])
            require(math.isfinite(p) and 0 <= p <= 1, f"Invalid p-value: {key}")
            grouped[key][row["model"]] = p
    controls = []
    for control, expected in expected_ids.items():
        cells = {rep: values for (name, rep), values in grouped.items() if name == control}
        require(set(cells) == expected, f"Missing or unexpected repetition IDs: {control}")
        for rep, values in cells.items():
            require(set(values) == models, f"Incomplete model family: {control}/{rep}")
        # Recompute from the six raw p-values; do not trust stored rejection flags.
        rejected = sum(min(1.0, 6 * min(values.values())) < 0.05 for values in cells.values())
        total = len(cells)
        controls.append({
            "control": control, "repetitions": total, "model_rows": total * len(models),
            "rejections": rejected, "rate": rejected / total,
            "wilson_95_pointwise": wilson(rejected, total),
        })
    with (nc / "control_summary.csv").open(newline="") as handle:
        summary = {row["control"]: row for row in csv.DictReader(handle)}
    for result in controls:
        row = summary[result["control"]]
        require(result["rejections"] == int(row["rejection_count"]), "Published count mismatch")
        require(result["repetitions"] == int(row["analyzable_repetitions"]), "Published denominator mismatch")
        require(math.isclose(result["rate"], float(row["fpr_estimate"]), abs_tol=1e-12), "Published rate mismatch")
        for computed, field in zip(result["wilson_95_pointwise"], ("wilson_95_pointwise_low", "wilson_95_pointwise_high")):
            require(math.isclose(computed, float(row[field]), abs_tol=1e-10), "Published interval mismatch")
    levels: dict = defaultdict(dict)
    with (calibration / "repetitions.csv").open(newline="") as handle:
        for row in csv.DictReader(handle):
            theta, rep = float(row["ic_injected"]), int(row["repetition"])
            require(rep not in levels[theta], "Duplicate calibration cell")
            require(row["carrier"] == "equity" and row["model"] == "ridge", "Unexpected calibration arm")
            p = float(row["permutation_p_value_two_sided"])
            require(math.isfinite(p) and 0 <= p <= 1, "Invalid calibration p-value")
            levels[theta][rep] = min(1.0, 5 * p) < 0.05
    require(set(levels) == {0, 0.1, 0.2, 0.3, 0.35, 0.4}, "Unexpected calibration grid")
    curve = []
    for theta, cells in sorted(levels.items()):
        require(set(cells) == set(range(200, 600)), "Incomplete calibration repetition IDs")
        count = sum(cells.values())
        curve.append({"theta": theta, "detections": count, "repetitions": len(cells), "rate": count / len(cells), "wilson_95_pointwise": wilson(count, len(cells))})
    with (calibration / "calibration_curve.csv").open(newline="") as handle:
        published = {float(row["ic_injected"]): row for row in csv.DictReader(handle)}
    for result in curve:
        require(result["detections"] == int(published[result["theta"]]["primary_detections"]), "Calibration summary mismatch")
    return {
        "scope": "Recomputed statistics from saved experiment data; no model refit or new scientific run",
        "dataset_sha256": sha256(dataset),
        "artifact_hashes_verified": True,
        "negative_controls": controls,
        "calibration": curve,
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", required=True, type=Path)
    arguments = parser.parse_args()
    print(json.dumps(audit(arguments.repo.resolve()), indent=2))
