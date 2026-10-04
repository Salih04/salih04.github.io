"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";
import { useLab } from "./LabProvider";

type Props = Omit<ComponentProps<typeof Link>, "href"> & { href: string };

/** A Link that plays the room transition on plain clicks; modified clicks behave normally. */
export function LabLink({ href, onClick, ...rest }: Props) {
  const { navigate } = useLab();
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navigate(href);
  };
  return <Link href={href} onClick={handle} {...rest} />;
}
