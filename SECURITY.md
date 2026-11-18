# Security Policy

## Reporting a vulnerability

Please report security issues privately through GitHub's
[private vulnerability reporting](https://github.com/bc891119/l3on-plugins/security/advisories/new)
instead of opening a public issue. You can expect a first response within 7 days.

## Scope

The plugins in this repository contain skills (instruction files), helper scripts, and a
review agent limited to the Read tool: no hooks, no MCP servers, no background processes,
no telemetry. The `designing-websites` skill pre-approves its four bundled scripts through
`allowed-tools` for the turn that invokes it. The README section 「這個外掛會做什麼」
lists every outbound connection the scripts can make.

Only the latest released version of each plugin is supported.
