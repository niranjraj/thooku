# Thooku

Thooku is an Agent Skill for website design reconnaissance and reconstruction planning. Give it one or more URLs and it produces an evidence-based report of the site's layout, typography, design tokens, components, motion, responsive behavior, user flows, and assets, plus a free-first plan to rebuild it.

## Install

The skill is a folder named `thooku` that contains `SKILL.md` and `references/`. The folder name must stay `thooku` so it matches the `name` field in `SKILL.md`.

### Claude Code

Project install:
```bash
mkdir -p .claude/skills
git clone https://github.com/niranjraj/thooku.git .claude/skills/thooku
```

Global install:
```bash
mkdir -p ~/.claude/skills
git clone https://github.com/niranjraj/thooku.git ~/.claude/skills/thooku
```

On Windows, the global location is `%USERPROFILE%\.claude\skills\thooku\`.

Invoke with `/thooku https://example.com`, or ask Claude to inspect a URL.

### Other agents (skills CLI)

Agents that support the open Agent Skills format can install it from GitHub with:
```bash
npx skills add niranjraj/thooku
```

### claude.ai

Zip the `thooku` folder (with `SKILL.md` at the top level of the folder) and upload it under Settings > Capabilities > Skills. Availability depends on plan and workspace settings.

## Requirements

- The skill instructions are free. No API key or paid service is required.
- For dynamic inspection (menus, animations, responsive behavior), install free browser tooling such as Playwright. See `references/tooling.md`.
- Live browsing and shell execution depend on the agent environment and its permissions. Without them, Thooku falls back to static analysis and says so.

## Contents

- `SKILL.md`: the full workflow and output contract.
- `references/tooling.md`: free-first tool setup and alternatives.
- `LICENSE`: MIT license text.

## Multiple websites

Thooku supports one or many URLs. When given multiple sites, it creates per-site profiles, a cross-site comparison matrix, a record of shared, unique, and conflicting patterns, and, if requested, a unified design system and free-first implementation plan. It samples representative pages rather than claiming to crawl every URL, and keeps observations attributable to their source.

## Responsible use

Thooku inspects only publicly accessible pages, or pages you are authorized to access. It does not bypass CAPTCHAs, paywalls, logins, or bot protection, and it does not copy proprietary assets, copy, or source code. It reproduces design patterns, not brands.

## License

MIT. See `LICENSE`.
