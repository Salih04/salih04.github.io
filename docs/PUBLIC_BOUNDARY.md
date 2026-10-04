# Public information boundary

S//LAB describes real systems, so a sanitization layer is part of the product. The portfolio explains
**concepts, responsibilities and decisions**. It never reproduces private infrastructure.

## Never publish

- Credentials, tokens, keys or secrets of any kind
- Private endpoints, hostnames, IP addresses or connection strings
- Private repository paths or local filesystem paths
- Internal identifiers (tenant IDs, user IDs, UUIDs, resource names)
- Proprietary source code
- Security implementation details, including authentication internals and tenant-isolation mechanics
- Database migrations or schemas
- Production configuration
- Confidential employer information (internal systems, tools, data, people, roadmaps)

## How the boundary is enforced

1. **Content shape.** Content types (`src/content/types.ts`) have fields for problems, options, reasons,
   trade-offs and evidence. They have no fields for configuration, endpoints or code. Where details are withheld
   on purpose, the record says so in a `boundary` note (for example, SAMS Authentication).
2. **Automated scan.** `scripts/public-boundary.mjs` runs on `src/` before every build and on the exported
   `out/` HTML afterwards, and fails the build on any finding:

   | Rule | Catches |
   | --- | --- |
   | `private-key`, `token`, `secret-assignment` | Key material, credential-shaped tokens, secrets assigned to literals |
   | `connection-string` | `postgres://`, `redis://`, `mongodb://`, `amqp://` and similar |
   | `url` | Any URL whose host is not in `ALLOWED_HOSTS` |
   | `localhost`, `ip-address`, `internal-host` | Local endpoints, IPv4 addresses, `*.internal` / `*.corp` / `*.lan` hosts |
   | `private-path` | `/home/<user>/`, `/Users/<user>/`, `C:\Users\` |
   | `uuid` | Internal identifiers |
   | `email` | Any email address except the one published in `src/content/site.ts` |

   A single line can opt out of a single rule with `boundary-allow: <rule-id>` and a reason in a comment.
   Reviewers should question every one.
3. **Labelled demonstrations.** Every interactive view of a real system is labelled as scripted or synthetic,
   so that no visitor mistakes it for live infrastructure.

## Before adding content

- Could someone use this sentence to locate, access or attack a real system? Remove it.
- Would a former employer consider it confidential? Describe the problem and the practice instead.
- Is a number real and yours to publish? If it isn't, leave it out. Never invent metrics.
