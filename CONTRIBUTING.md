# Contributing to thooku

Thanks for helping. thooku is instructions plus a few probe scripts, so most contributions are edits to Markdown or small JavaScript files.

## Ways to help

- Report a site where the output was wrong or incomplete.
- Add an example report under `examples/` (see `examples/README.md`).
- Add framework or motion-library detection to `skills/thooku/scripts/stack-probe.js`.
- Document another browser tool or agent in `skills/thooku/references/tooling.md`.
- Fix unclear wording in `skills/thooku/SKILL.md`.

Look for issues labeled [good first issue](https://github.com/niranjraj/thooku/labels/good%20first%20issue). Ask questions in [Discussions](https://github.com/niranjraj/thooku/discussions).

## Workflow

1. Fork the repo and create a branch.
2. Make a focused change. One topic per pull request.
3. Run the CI checks locally:

   ```bash
   npm install --no-save --no-package-lock yaml@2.6.1
   node tests/frontmatter.mjs
   for f in skills/thooku/scripts/*.js; do
     tmp="$(mktemp --suffix=.js)"
     { printf 'module.exports = '; cat "$f"; } > "$tmp"
     node --check "$tmp" && echo "ok $f"
   done
   ```

4. Add a line under `[Unreleased]` in `CHANGELOG.md`.
5. Open a pull request and describe what you tested.

## Rules for the skill

- Keep claims honest. Every measured value in a report carries an evidence label: `Observed`, `Measured`, `Inferred`, or `Unknown`.
- Do not add steps that copy logos, copy text, proprietary images, or source code. thooku documents design patterns.
- Do not add steps that bypass logins, paywalls, CAPTCHAs, or bot protection.
- Keep the skill free-first: no paid API or key requirement.
- Probe scripts must be a single expression so the CI syntax check passes.

## Becoming a collaborator

Contributors who send several useful changes can be invited as repository collaborators. Mention in an issue or discussion that you are interested.

## License

By contributing you agree that your work is released under the [MIT License](LICENSE).
