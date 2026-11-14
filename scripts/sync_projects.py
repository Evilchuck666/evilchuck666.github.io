#!/usr/bin/env python3
"""Synchronize the static project catalogue using GitHub's public REST API.

Standard library only. Fetch and validate every page before touching index.html.
"""

import argparse
import json
import os
import re
import sys
import tempfile
from html import escape
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlencode
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent.parent
CATEGORIES = {"games", "media", "tools", "garage"}
START = "        <!-- PROJECTS:START -->"
END = "        <!-- PROJECTS:END -->"
REPO_NAME = re.compile(r"[A-Za-z0-9_.-]+\Z")


class SyncError(ValueError):
    """Invalid input or an incomplete GitHub response; leave the catalogue alone."""


def load_config(path):
    config = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(config, dict):
        raise SyncError("Configuration must be an object")
    user = config.get("user", "")
    if not isinstance(user, str) or not re.fullmatch(r"[A-Za-z0-9-]+", user):
        raise SyncError("Invalid GitHub user")
    if config.get("default_category") not in CATEGORIES:
        raise SyncError("Invalid default_category")
    if not isinstance(config.get("exclude_forks"), bool):
        raise SyncError("exclude_forks must be true or false")
    for field in ("exclude", "order"):
        values = config.get(field)
        if not isinstance(values, list) or any(
            not isinstance(value, str) or not REPO_NAME.fullmatch(value) for value in values
        ):
            raise SyncError(f"{field} must contain repository names")
        if len({value.casefold() for value in values}) != len(values):
            raise SyncError(f"Duplicate names in {field}")
    overrides = config.get("overrides")
    if not isinstance(overrides, dict):
        raise SyncError("overrides must be an object")
    if len({name.casefold() for name in overrides}) != len(overrides):
        raise SyncError("Duplicate names in overrides")
    for name, values in overrides.items():
        if not REPO_NAME.fullmatch(name) or not isinstance(values, dict):
            raise SyncError("Invalid repository override")
        if set(values) - {"category", "description", "language", "tags"}:
            raise SyncError(f"Unknown override field for {name}")
        if "category" in values and values["category"] not in CATEGORIES:
            raise SyncError(f"Invalid category for {name}")
        for field in ("description", "language"):
            if field in values and not isinstance(values[field], str):
                raise SyncError(f"Invalid {field} for {name}")
        if "tags" in values and (
            not isinstance(values["tags"], list)
            or any(not isinstance(tag, str) for tag in values["tags"])
        ):
            raise SyncError(f"Invalid tags for {name}")
    return config


def fetch_repositories(user, token=None):
    repositories = []
    for page in range(1, 1001):
        query = urlencode({"type": "owner", "sort": "full_name", "direction": "asc",
                           "per_page": 100, "page": page})
        request = Request(f"https://api.github.com/users/{quote(user, safe='')}/repos?{query}")
        request.add_header("Accept", "application/vnd.github+json")
        request.add_header("X-GitHub-Api-Version", "2026-03-10")
        request.add_header("User-Agent", "personal-workshop-project-sync")
        if token:
            request.add_header("Authorization", f"Bearer {token}")
        try:
            with urlopen(request, timeout=30) as response:
                batch = json.load(response)
        except HTTPError as exc:
            raise SyncError(f"GitHub returned HTTP {exc.code} on page {page}") from exc
        except (URLError, TimeoutError) as exc:
            raise SyncError(f"Could not fetch GitHub repositories on page {page}") from exc
        if not isinstance(batch, list) or len(batch) > 100:
            raise SyncError(f"Invalid repository response on page {page}")
        repositories.extend(batch)
        if len(batch) < 100:
            return repositories
    raise SyncError("Pagination limit exceeded")


def select_projects(repositories, config):
    if not isinstance(repositories, list):
        raise SyncError("Repository data must be a list")
    excluded = {name.casefold() for name in config["exclude"]}
    overrides = {name.casefold(): value for name, value in config["overrides"].items()}
    order = {name.casefold(): index for index, name in enumerate(config["order"])}
    projects = []
    seen_ids, seen_names = set(), set()
    for repo in repositories:
        if not isinstance(repo, dict):
            raise SyncError("Invalid repository record")
        name, repo_id = repo.get("name"), repo.get("id")
        if not isinstance(name, str) or not REPO_NAME.fullmatch(name):
            raise SyncError("Invalid repository name")
        if type(repo_id) is not int or repo_id <= 0:
            raise SyncError(f"Missing repository ID for {name}")
        if repo_id in seen_ids or name.casefold() in seen_names:
            raise SyncError(f"Duplicate repository: {name}; retry the synchronization")
        seen_ids.add(repo_id)
        seen_names.add(name.casefold())
        owner = repo.get("owner")
        if (not isinstance(owner, dict) or not isinstance(owner.get("login"), str)
                or owner["login"].casefold() != config["user"].casefold()):
            raise SyncError(f"Unexpected repository owner for {name}")
        if not isinstance(repo.get("private"), bool) or not isinstance(repo.get("fork"), bool):
            raise SyncError(f"Missing visibility or fork status for {name}")
        topics = repo.get("topics")
        if not isinstance(topics, list) or any(not isinstance(topic, str) for topic in topics):
            raise SyncError(f"Invalid topics for {name}")
        if (repo["private"] or name.casefold() in excluded or "portfolio-exclude" in topics
                or (repo["fork"] and config["exclude_forks"])):
            continue
        override = overrides.get(name.casefold(), {})
        categories = {topic.removeprefix("portfolio-") for topic in topics
                      if topic in {f"portfolio-{category}" for category in CATEGORIES}}
        if len(categories) > 1:
            raise SyncError(f"Conflicting portfolio category topics for {name}")
        # An explicit repository topic can reclassify an existing project too.
        category = next(iter(categories), override.get("category", config["default_category"]))
        description = override.get("description", repo.get("description"))
        language = override.get("language", repo.get("language"))
        for field, value in (("description", description), ("language", language)):
            if value is not None and not isinstance(value, str):
                raise SyncError(f"Invalid {field} for {name}")
        tags = override.get("tags", sorted(topic for topic in topics
                                          if not topic.startswith("portfolio-"))[:2])
        projects.append({
            "name": name,
            "url": f"https://github.com/{config['user']}/{quote(name, safe='')}",
            "category": category,
            "description": description or "Source code and project documentation on GitHub.",
            "language": language or "Code",
            "tags": tags,
        })
    return sorted(projects, key=lambda project: (
        order.get(project["name"].casefold(), len(order)), project["name"].casefold()
    ))


def render_cards(projects):
    cards = []
    for number, project in enumerate(projects, start=1):
        category = project["category"]
        cards.append(
            f'        <article class="repo-card" data-category="{category}">\n'
            f'          <div class="repo-top mono"><span>{number:02d} / {category.upper()}</span>'
            f'<span>{escape(project["language"])}</span></div>\n'
            f'          <h4><a href="{escape(project["url"], quote=True)}">'
            f'{escape(project["name"])}<span aria-hidden="true">↗</span></a></h4>\n'
            f'          <p>{escape(project["description"])}</p>\n'
            f'          <div class="repo-tags mono">{escape(" / ".join(project["tags"]))}</div>\n'
            '        </article>'
        )
    return "\n".join(cards)


def update_html(html, projects):
    if html.count(START) != 1 or html.count(END) != 1:
        raise SyncError("Expected exactly one pair of PROJECTS markers in index.html")
    before, rest = html.split(START)
    _, after = rest.split(END)
    updated = before + START + "\n" + render_cards(projects) + "\n" + END + after
    updated, count = re.subn(r"\b\d+ PUBLIC PROJECTS\b", f"{len(projects)} PUBLIC PROJECTS", updated)
    if count != 1:
        raise SyncError("Expected exactly one PUBLIC PROJECTS counter in index.html")
    return updated


def atomic_write(path, content):
    # Replace the original only after the entire new file has been written.
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", dir=path.parent,
                                         prefix=f".{path.name}.", delete=False) as output:
            temporary = Path(output.name)
            output.write(content)
        temporary.chmod(path.stat().st_mode & 0o777)
        temporary.replace(path)
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--config", type=Path, default=ROOT / "projects.json")
    parser.add_argument("--index", type=Path, default=ROOT / "index.html")
    parser.add_argument("--check", action="store_true", help="Do not write; exit 1 if out of date")
    args = parser.parse_args(argv)
    try:
        config = load_config(args.config)
        repositories = fetch_repositories(config["user"], os.environ.get("GITHUB_TOKEN"))
        projects = select_projects(repositories, config)
        original = args.index.read_text(encoding="utf-8")
        updated = update_html(original, projects)
        if original == updated:
            print(f"Catalogue is current: {len(projects)} projects.")
            return 0
        if args.check:
            print(f"Catalogue needs updating: {len(projects)} projects. No files changed.")
            return 1
        atomic_write(args.index, updated)
        print(f"Updated catalogue: {len(projects)} projects.")
        return 0
    except (SyncError, OSError, ValueError) as exc:
        print(f"Project sync failed: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
