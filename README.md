# Evilchuck666 — The personal workshop

Personal website for Carlos Martínez: backend development, classic games, video tools and the Suifuto Remon automotive project.

Built with HTML, CSS and a small JavaScript enhancement. No framework, build step, external fonts, analytics or runtime dependencies. All twelve project entries are in the HTML and remain available without JavaScript.

## Preview

Open `index.html` directly in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Files

- `index.html`: biography, featured work and complete project catalogue.
- `styles.css`: responsive dark/Champion Yellow design, original CSS illustrations and reduced-motion support.
- `script.js`: accessible category filters; hides no content until JavaScript loads.
- `assets/favicon.svg`: local EC favicon.

Edit catalogue entries in `index.html`. Each `.repo-card` has one category: `games`, `media`, `tools` or `garage`. Update the displayed project total if entries are added or removed.

## Content

The biography follows Carlos's existing self-description in the Swift livery catalogue. Project descriptions come from the previous portfolio and repository documentation. The graphical badges and cassette are original decorative illustrations, not product screenshots.

## Deployment

GitHub Pages serves `main`. The workshop redesign was integrated from `redesign/personal-workshop`. Preview future changes locally before publishing them.

## Backup and rollback

The original `main` is preserved at:

- Branch: `backup/main-before-redesign-2026-10-28`
- Commit: `8663375fb0807dbf83a149b65febb568f0c34398`
- Independent Git bundle, outside the website: `../evilchuck666-main-2026-10-28.bundle`

The bundle contains the complete original `main` history and was verified with `git bundle verify`. The backup branch is also available on GitHub. The independent bundle remains local.

To inspect the old site, first commit or stash any unfinished edits, then:

```sh
git switch backup/main-before-redesign-2026-10-28
```

If the redesign is later merged, restore the previous tracked site files without rewriting history (start with a clean working tree):

```sh
git switch main
git restore --source=backup/main-before-redesign-2026-10-28 --staged --worktree -- .
git commit -m "Restore portfolio before workshop redesign"
```

Push that restoration commit only when ready to republish it.

To recover the old repository independently:

```sh
git clone ../evilchuck666-main-2026-10-28.bundle ../evilchuck666-original
```

## License

[GPLv3](LICENSE).
