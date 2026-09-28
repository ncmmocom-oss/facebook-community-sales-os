# Security Integration Policy

## Production rule

Security tooling must not alter the Social AIO business logic, collection semantics, ranking/gating semantics, worker scheduling semantics, or output semantics unless a reviewed product change explicitly requires it.

## RedAmon integration boundary

RedAmon is treated as an **authorized staging red-team tool**, not as an Apps Script dependency and not as a production runtime component.

Allowed use:
- staging or disposable test environments owned by the project;
- manual or explicitly approved security exercises;
- vulnerability validation, triage, and remediation evidence;
- pull requests reviewed before merge.

Not allowed:
- autonomous scans against third-party systems without written authorization;
- execution from Google Apps Script;
- production credentials copied into RedAmon;
- direct auto-merge of remediation changes;
- unrestricted network targets.

Required controls before a RedAmon exercise:
1. explicit target allowlist;
2. staging credentials with least privilege;
3. isolated runner/network;
4. time-bounded engagement;
5. artifact/log retention;
6. human review before any remediation merge.

## Runtime supply-chain controls

- Control Center loads Runtime.js and ImportDialog.html atomically through Bootstrap V2.3.
- Runtime and UI share the contract marker `scan-scope-v2`.
- Any contract mismatch fails closed.
- Manual checkbox scan and scheduler Due Queue use different commands and scope assertions.
- GitHub CI blocks regressions in those boundaries and performs a basic secret-material check.

## awesome-ai-agents-2026

This repository is a discovery/catalog source only. It is **not a production dependency**.

Any tool selected from that catalog must be independently reviewed for:
- license;
- maintenance activity;
- authentication/secret handling;
- sandboxing and tool permissions;
- human approval gates;
- observability/auditability;
- rollback/kill switch;
- compatibility with the existing Social AIO architecture.

Do not vendor or auto-install tools solely because they appear in the catalog.
