# 🧰 Evilchuck666 — The personal workshop

![Platform](https://img.shields.io/badge/platform-Web-blue)
![HTML](https://img.shields.io/badge/HTML-5-blue)
![CSS](https://img.shields.io/badge/CSS-3-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2015-blue)
![Requires](https://img.shields.io/badge/requires-modern%20browser-blue)
[![License](https://img.shields.io/badge/license-GPLv3-green)](LICENSE)
[![Build and tests](https://github.com/Evilchuck666/evilchuck666.github.io/actions/workflows/checks.yml/badge.svg?branch=main)](https://github.com/Evilchuck666/evilchuck666.github.io/actions/workflows/checks.yml)

Personal website for Carlos Martínez: backend development, classic games, video tools and the Suifuto Remon automotive project.

Built with HTML, CSS and a small JavaScript enhancement. No framework, external fonts, analytics or runtime dependencies. Project entries are generated as static HTML and remain available without JavaScript or browser requests to GitHub.

## 👀 Preview

Open `index.html` directly in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## 🧱 Files

- `index.html`: biography, featured work and complete project catalogue.
- `styles.css`: responsive dark/Champion Yellow design, original CSS illustrations and reduced-motion support.
- `script.js`: accessible category filters and four-card pagination for every category.
- `assets/favicon.svg`: local EC favicon.
- `projects.json`: catalogue categories, exclusions, ordering and curated copy.
- `scripts/sync_projects.py`: synchronizes the cards and total with public GitHub repositories.
- `tests/test_site.py`: static checks for links, ids, filters and the project catalogue.
- `tests/test_pagination.cjs`: dependency-free behavior tests for filters and pagination.
- `tests/test_sync_projects.py`: offline regression tests for synchronization and API failures.
- `.github/workflows/checks.yml`: runs the checks on every push and pull request.
- `.github/workflows/projects.yml`: synchronizes, checks, commits changes and deploys Pages.

**All projects** and each category show up to four cards per page, in one row of four on desktop
(two columns on tablets, one on phones). Previous/Next buttons and numbered pages
sit above the cards, to the right of the category filters, wrapping on narrow
screens. The shorter catalogue exposes more of the content that follows.
Pagination appears whenever the selected category has more than four projects;
its page count and range use only that category's matching projects. Selecting
any category, including All projects, resets to page one. Page changes announce the range and move
focus to the first displayed project without scrolling the page. Without JavaScript, the full catalogue
remains visible and the filters and pagination controls stay hidden.

## 🔄 Automatic project catalogue

The `Sync projects and deploy` workflow runs on pushes to `main`, every six hours
(`00:23`, `06:23`, `12:23`, `18:23` UTC), and manually from the Actions tab. GitHub
may delay scheduled runs. The workflow lists all public repositories owned by
`Evilchuck666`, adds new ones, removes missing/private ones, updates the project
total and numbering, runs the checks, and commits `index.html` only when it changes.
The checked site is then deployed explicitly, because commits made with
`GITHUB_TOKEN` do not trigger another Pages build.

Only the cards between `<!-- PROJECTS:START -->` and `<!-- PROJECTS:END -->` and the
`PUBLIC PROJECTS` counter are generated. Edit `projects.json` for curated content;
direct edits to generated cards are overwritten on the next sync. The featured
projects, biography, styles and filter behavior are maintained separately.

### Categories and exclusions

Add one of these **topics on the GitHub repository** to choose its category:

| Topic | Website filter |
| --- | --- |
| `portfolio-games` | Games |
| `portfolio-media` | Video & audio |
| `portfolio-tools` | Everyday tools |
| `portfolio-garage` | Garage |

Category priority is: repository topic → `overrides` category in `projects.json` →
`default_category` (`tools`). All included projects also appear in **All projects**.
Conflicting category topics stop the sync with an error instead of guessing.

- Add `portfolio-exclude` to hide a repository, or list its name in `exclude`.
- Forks and this portfolio repository are excluded by default. Public archived
  repositories remain included. Set `exclude_forks` to `false` to include forks.
- `order` pins existing projects in their current order; new projects follow in
  alphabetical order. Comparisons of repository names ignore case.
- `overrides` can set `category`, `description`, `language` and `tags` for any repo.
  Existing cards retain their curated copy. Otherwise, the script uses GitHub's
  description, primary language and first two topics (alphabetically, excluding
  `portfolio-*` topics). Missing metadata gets a neutral fallback.
- Renames appear automatically under the new name. Move any matching `order`,
  `exclude` or `overrides` entry to the new name to preserve customizations.

The current additions classify Echora, echora-web and Trackfolio as media, and
ArchivAries uses the tools default. The echora-web description is curated from
its README because its GitHub description is empty.

### Run locally

Python 3.10+ is sufficient; no packages or personal access token are required.
The workflow uses its built-in `GITHUB_TOKEN`. Locally, that environment variable
is optional and can raise the public API rate limit. Never put tokens in files.

```sh
python3 scripts/sync_projects.py --check
python3 scripts/sync_projects.py
```

`--check` leaves files untouched and exits `0` when current or `1` when changes
are needed. Errors exit `2`. Every API page is fetched and validated before the
HTML is replaced atomically; network errors, rate limits, malformed responses or
missing generation markers leave the original catalogue intact. A deleted repo
is removed only after a successful complete listing. An empty category keeps its
filter, which then shows zero projects.

## 🧪 Tests

The [`Build and tests`](.github/workflows/checks.yml) workflow checks the JavaScript syntax and runs the site tests. They need only Python 3 and Node.js, with no packages to install. To run them locally:

```sh
node --check script.js
node --test tests/test_pagination.cjs
python3 -m unittest discover -v tests
```

The tests check local files, links, ids, filters, numbering and the project total.
Synchronizer tests cover additions/removals, ordering, categories, exclusions,
HTML escaping, pagination, check mode, idempotence and preservation of the HTML
when an API page fails or writing fails. Tests use mocked API responses and never
need network access.

## ✍️ Content

The biography follows Carlos's existing self-description in the Swift livery catalogue. Project descriptions come from the previous portfolio and repository documentation. The graphical badges and window-snapping screen are original decorative illustrations, not product screenshots.

## 🚀 Deployment

One-time activation after publishing these changes:

1. In **Settings → Pages → Build and deployment → Source**, select **GitHub Actions**.
2. Ensure Actions is enabled and branch rules allow the built-in Actions token to
   commit catalogue updates to `main` (`contents: write` is declared in the job).
   Protected branches or rulesets may require an explicit exception for the bot.
3. Run **Actions → Sync projects and deploy → Run workflow**, selecting `main`.
   Confirm that both the sync and deployment jobs finish successfully.

The workflow publishes only `index.html`, `styles.css`, `script.js` and `assets/`
directly, without a Jekyll build. It never force-pushes; a concurrent push to `main` makes the bot
push fail safely, and the next run starts from the latest `main`. There are no
empty keepalive commits. GitHub can disable scheduled workflows after 60 days
without repository activity; re-enable the schedule in Actions if that happens.
See GitHub's documentation for [scheduled workflow limitations](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule),
[the token's Pages restriction](https://docs.github.com/en/actions/concepts/security/github_token)
and [Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

Preview future changes locally before publishing them.

## 📜 License

[GPLv3](LICENSE).
