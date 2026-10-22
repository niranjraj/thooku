# Changelog

All notable changes to thooku are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/).

## [1.1.0] - 2026-10-22

### Added
- Phase 0 tooling preflight: detect a browser tool, ask before installing, fall back to static mode.
- Three Playwright CLI probes in `scripts/`: `stack-probe.js`, `animations-probe.js`, `motion-probe.js`.
- `references/js-inspection.md`: how to run and read the probes, plus a library-to-free-alternative table.
- Trade dress rule in the operating principles.
- README disclaimer.
- CI syntax check for the probe scripts.

### Changed
- Skill description wording: "recreate the design patterns of" replaces "clone ... rebuild".
- README "Claude Code plugin" badge no longer uses the Anthropic logo.
- Output section 10 is now "Asset and dependency inventory" and includes detected frameworks and motion libraries.
- Tooling docs cover the Chrome/Chromium requirement and the `install-browser chromium` path.

## [1.0.0] - 2026-10-22

### Added
- `thooku` skill: website design reconnaissance from one or more URLs.
- Seven-phase workflow: scope and access, structure and visuals, interactions and motion, design system, component and flow inventory, assets and dependencies, reconstruction.
- Multi-site mode with site registry, bounded crawl plan, cross-site matrix, and synthesis rules.
- Evidence labels (`Observed`, `Measured`, `Inferred`, `Unknown`) and a quality gate before finishing.
- Free-first tooling guide in `references/tooling.md` (Playwright CLI, Python + Playwright, static-only).
- Claude Code plugin marketplace manifest.
- CI check for SKILL.md frontmatter and a tag-triggered release workflow that attaches `thooku.zip`.

[1.1.0]: https://github.com/niranjraj/thooku/releases/tag/v1.1.0
[1.0.0]: https://github.com/niranjraj/thooku/releases/tag/v1.0.0
