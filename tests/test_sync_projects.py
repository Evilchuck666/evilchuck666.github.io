"""Offline regression tests for catalogue additions, removals and API failures."""

import contextlib
import copy
import io
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qs, urlsplit

from scripts import sync_projects as sync

ROOT = Path(__file__).resolve().parent.parent


def repository(name="Example", repo_id=1, **values):
    return {"id": repo_id, "name": name, "owner": {"login": "Evilchuck666"},
            "private": False, "fork": False, "description": "A useful project.",
            "language": "Python", "topics": [], **values}


class ProjectSyncTests(unittest.TestCase):
    def setUp(self):
        self.config = sync.load_config(ROOT / "projects.json")
        self.config["order"] = ["Pinned"]
        self.config["overrides"] = {"Pinned": {"category": "games", "description": "Curated copy."}}

    def select(self, *repos):
        return sync.select_projects(list(repos), self.config)

    def test_pinned_order_then_alphabetical_and_curated_copy(self):
        projects = self.select(repository("Zebra", 1), repository("Alpha", 2),
                               repository("Pinned", 3))
        self.assertEqual([item["name"] for item in projects], ["Pinned", "Alpha", "Zebra"])
        self.assertEqual(projects[0]["description"], "Curated copy.")
        self.assertEqual(projects[0]["category"], "games")
        self.assertEqual(projects[1]["category"], "tools")

    def test_topics_override_category_and_control_visibility(self):
        projects = self.select(repository("Pinned", topics=["portfolio-media", "music", "audio"]))
        self.assertEqual(projects[0]["category"], "media")
        self.assertEqual(projects[0]["tags"], ["audio", "music"])
        with self.assertRaises(sync.SyncError):
            self.select(repository(topics=["portfolio-media", "portfolio-games"]))

    def test_private_forks_self_and_excluded_topics_are_omitted(self):
        self.assertEqual(self.select(
            repository("Private", 1, private=True), repository("Fork", 2, fork=True),
            repository("EVILCHUCK666.github.io", 3),
            repository("Hidden", 4, topics=["portfolio-exclude"])), [])
        self.config["exclude_forks"] = False
        self.assertEqual(len(self.select(repository(fork=True))), 1)

    def test_missing_optional_metadata_and_html_escaping(self):
        project = self.select(repository(description=None, language=None))[0]
        self.assertEqual(project["language"], "Code")
        self.assertIn("documentation", project["description"])
        card = sync.render_cards(self.select(repository(
            description='<script>alert("x")</script> & music', language="C++",
            topics=['<img src=x onerror="alert(1)">'])))
        self.assertNotIn("<script>", card)
        self.assertNotIn("<img ", card)
        self.assertIn("&lt;script&gt;", card)
        self.assertIn("&amp; music", card)

    def test_incomplete_or_duplicate_records_are_rejected(self):
        bad_records = [None, {}, repository(private=None), repository(topics=None),
                       repository(owner={"login": "SomeoneElse"}),
                       repository(description={}), repository(name='Bad"Name')]
        for record in bad_records:
            with self.subTest(record=record), self.assertRaises(sync.SyncError):
                self.select(record)
        with self.assertRaises(sync.SyncError):
            self.select(repository(), repository("Other"))
        with self.assertRaises(sync.SyncError):
            self.select(repository(), repository("example", 2))

    def test_additions_removals_counter_and_surrounding_html(self):
        html = f"before 99 PUBLIC PROJECTS\n{sync.START}\nold card\n{sync.END}\nafter"
        updated = sync.update_html(html, self.select(repository("New"), repository("Pinned", 2)))
        self.assertTrue(updated.startswith("before 2 PUBLIC PROJECTS\n"))
        self.assertTrue(updated.endswith("\nafter"))
        self.assertIn("01 / GAMES", updated)
        self.assertIn("02 / TOOLS", updated)
        self.assertNotIn("old card", updated)
        self.assertEqual(sync.update_html(updated, self.select(repository("New"), repository("Pinned", 2))), updated)
        removed = sync.update_html(updated, [])
        self.assertIn("0 PUBLIC PROJECTS", removed)
        self.assertNotIn('class="repo-card"', removed)

    def test_missing_or_duplicate_markers_and_counters_are_rejected(self):
        for html in ("1 PUBLIC PROJECTS", f"{sync.START}{sync.END}",
                     f"1 PUBLIC PROJECTS{sync.START}{sync.START}{sync.END}",
                     f"1 PUBLIC PROJECTS 2 PUBLIC PROJECTS{sync.START}{sync.END}"):
            with self.subTest(html=html), self.assertRaises(sync.SyncError):
                sync.update_html(html, [])

    def test_api_pagination(self):
        pages = [[repository(f"Repo{index}", index + 1) for index in range(100)],
                 [repository("Last", 101)]]
        responses = [io.StringIO(json.dumps(page)) for page in pages]
        with patch.object(sync, "urlopen", side_effect=responses) as request:
            result = sync.fetch_repositories("Evilchuck666", token="test-token")
        self.assertEqual(len(result), 101)
        self.assertEqual(request.call_count, 2)
        second = request.call_args_list[1].args[0]
        self.assertEqual(parse_qs(urlsplit(second.full_url).query)["page"], ["2"])
        self.assertEqual(second.get_header("Authorization"), "Bearer test-token")
        self.assertEqual(request.call_args.kwargs["timeout"], 30)

    def test_later_page_failure_cannot_produce_partial_result(self):
        first = io.StringIO(json.dumps([repository(f"Repo{i}", i + 1) for i in range(100)]))
        with patch.object(sync, "urlopen", side_effect=[first, URLError("offline")]):
            with self.assertRaises(sync.SyncError):
                sync.fetch_repositories("Evilchuck666")
        for failure in (HTTPError("https://api.github.com", 403, "rate limit", {}, None),
                        TimeoutError()):
            with patch.object(sync, "urlopen", side_effect=failure):
                with self.assertRaises(sync.SyncError):
                    sync.fetch_repositories("Evilchuck666")
        with patch.object(sync, "urlopen", return_value=io.StringIO('{"message": "error"}')):
            with self.assertRaises(sync.SyncError):
                sync.fetch_repositories("Evilchuck666")

    def test_cli_check_write_idempotence_and_failure_preserve_original(self):
        with tempfile.TemporaryDirectory() as directory:
            index = Path(directory) / "index.html"
            original = f"prefix 1 PUBLIC PROJECTS\n{sync.START}\nold\n{sync.END}\nsuffix"
            index.write_text(original, encoding="utf-8")
            args = ["--index", str(index)]
            with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
                with patch.object(sync, "fetch_repositories", return_value=[repository()]):
                    self.assertEqual(sync.main(args + ["--check"]), 1)
                    self.assertEqual(index.read_text(encoding="utf-8"), original)
                    self.assertEqual(sync.main(args), 0)
                    updated = index.read_text(encoding="utf-8")
                    self.assertNotEqual(updated, original)
                    self.assertEqual(sync.main(args + ["--check"]), 0)
                    self.assertEqual(sync.main(args), 0)
                for failure in (sync.SyncError("offline"), json.JSONDecodeError("bad JSON", "", 0)):
                    with patch.object(sync, "fetch_repositories", side_effect=failure):
                        self.assertEqual(sync.main(args), 2)
                        self.assertEqual(index.read_text(encoding="utf-8"), updated)
                with patch.object(sync, "fetch_repositories", return_value=[repository(private=None)]):
                    self.assertEqual(sync.main(args), 2)
                    self.assertEqual(index.read_text(encoding="utf-8"), updated)
                with patch.object(sync, "fetch_repositories", return_value=[repository()]), \
                        patch.object(sync.Path, "replace", side_effect=OSError("disk full")):
                    index.write_text(original, encoding="utf-8")
                    self.assertEqual(sync.main(args), 2)
                    self.assertEqual(index.read_text(encoding="utf-8"), original)
            self.assertEqual([file.name for file in Path(directory).iterdir()], ["index.html"])

    def test_config_typo_fails_instead_of_misclassifying_projects(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "projects.json"
            for mutate in (
                lambda config: config.update(default_category="video"),
                lambda config: config.update(order=["Foo", "foo"]),
                lambda config: config["overrides"].update(Example={"catgeory": "games"}),
            ):
                config = copy.deepcopy(self.config)
                mutate(config)
                path.write_text(json.dumps(config), encoding="utf-8")
                with self.assertRaises(sync.SyncError):
                    sync.load_config(path)


if __name__ == "__main__":
    unittest.main()
