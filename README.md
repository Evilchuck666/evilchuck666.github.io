# 🧰 Evilchuck666 — The personal workshop

![Platform](https://img.shields.io/badge/platform-Web-blue)
![HTML](https://img.shields.io/badge/HTML-5-blue)
![CSS](https://img.shields.io/badge/CSS-3-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2015-blue)
![Requires](https://img.shields.io/badge/requires-modern%20browser-blue)
[![License](https://img.shields.io/badge/license-GPLv3-green)](LICENSE)
[![Build and tests](https://github.com/Evilchuck666/evilchuck666.github.io/actions/workflows/checks.yml/badge.svg?branch=main)](https://github.com/Evilchuck666/evilchuck666.github.io/actions/workflows/checks.yml)

Personal website for Carlos Martínez: backend development, classic games, video tools and the Suifuto Remon automotive project.

Built with HTML, CSS and a small JavaScript enhancement. No framework, build step, external fonts, analytics or runtime dependencies. All twelve project entries are in the HTML and remain available without JavaScript.

## 👀 Preview

Open `index.html` directly in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## 🧱 Files

- `index.html`: biography, featured work and complete project catalogue.
- `styles.css`: responsive dark/Champion Yellow design, original CSS illustrations and reduced-motion support.
- `script.js`: accessible category filters; hides no content until JavaScript loads.
- `assets/favicon.svg`: local EC favicon.
- `tests/test_site.py`: static checks for links, ids, filters and the project catalogue.
- `.github/workflows/checks.yml`: runs the checks on every push and pull request.

Edit catalogue entries in `index.html`. Each `.repo-card` has one category: `games`, `media`, `tools` or `garage`. Update the displayed project total if entries are added or removed.

## 🧪 Tests

The [`Build and tests`](.github/workflows/checks.yml) workflow checks the JavaScript syntax and runs the site tests. They need only Python 3 and Node.js, with no packages to install. To run them locally:

```sh
node --check script.js
python3 -m unittest discover -v tests
```

The tests check that local files and in-page links exist, ids are unique, external links use HTTPS, every category has a filter, and the project cards are numbered and match the displayed total.

## ✍️ Content

The biography follows Carlos's existing self-description in the Swift livery catalogue. Project descriptions come from the previous portfolio and repository documentation. The graphical badges and cassette are original decorative illustrations, not product screenshots.

## 🚀 Deployment

GitHub Pages serves `main`. Preview future changes locally before publishing them.

## 📜 License

[GPLv3](LICENSE).
