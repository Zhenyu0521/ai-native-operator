# Site Favicon Consistency Design

## Goal

Display the existing black `ANO` favicon on every HTML page while preserving each page's current browser-tab title.

## Root Cause

Only a subset of pages declare a favicon. Pages without a favicon declaration fall back to the browser's generic globe icon.

## Design

- Store the existing black rounded-square `ANO` artwork once as `favicon.svg` at the site root.
- Make every root-level HTML page reference `favicon.svg` with `<link rel="icon" href="favicon.svg" type="image/svg+xml" />`.
- Make nested HTML pages reference the same asset with the correct relative path, such as `../favicon.svg` for `workspace-hub/index.html`.
- Update the Learning article generator so newly synced articles receive the same favicon automatically.
- Leave every existing `<title>` unchanged.

## Testing

- Add a regression test that discovers all repository HTML pages and confirms each has exactly one favicon declaration.
- Confirm each declaration resolves to the shared root favicon from the page's directory.
- Confirm the Learning article generator includes the shared favicon reference.
- Run the complete Node test suite after implementation.

## Scope

This change affects browser-tab icons only. It does not alter page content, titles, navigation, styling, or deployment behavior.
