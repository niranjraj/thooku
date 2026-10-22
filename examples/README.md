# Example reports

Real thooku reports for public sites live here, one folder per site. They show what the output looks like before you run it yourself.

## Add one

1. Pick a public marketing site you are allowed to inspect, and run:

   ```text
   /thooku https://example.com
   ```

2. Save the report as `examples/<site-name>/report.md`.
3. Keep the color swatches. They render on GitHub.
4. Add a line at the top with the date inspected and the tool used (Playwright CLI, MCP, or static mode).
5. Do not include copied logos, copy text, images, or source code from the site. Record design values and observations only.
6. Open a pull request.

## Format

Each example is the full report as thooku produced it, so readers see the real evidence labels (`Observed`, `Measured`, `Inferred`, `Unknown`) and the quality gate. Do not hand-edit values.
