"""Static checks for the site. Standard library only: python3 -m unittest discover tests"""

import re
import unittest
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parent.parent
INDEX = ROOT / "index.html"
STYLES = ROOT / "styles.css"


class SiteParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.links = []
        self.filters = []
        self.cards = []
        self._card_label = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            self.ids.append(attrs["id"])
        for name in ("href", "src"):
            if name in attrs:
                self.links.append((tag, attrs[name]))
        if "data-filter" in attrs:
            self.filters.append(attrs["data-filter"])
        if "repo-card" in attrs.get("class", "").split():
            self.cards.append({"category": attrs.get("data-category"), "label": None})
        if "repo-top" in attrs.get("class", "").split():
            self._card_label = True

    def handle_data(self, data):
        # The first text inside .repo-top is the card label, e.g. "01 / GAMES".
        if self._card_label and data.strip():
            self.cards[-1]["label"] = data.strip()
            self._card_label = False


class SiteTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html = INDEX.read_text(encoding="utf-8")
        cls.site = SiteParser()
        cls.site.feed(cls.html)

    def test_ids_are_unique(self):
        duplicates = sorted({i for i in self.site.ids if self.site.ids.count(i) > 1})
        self.assertEqual(duplicates, [])

    def test_in_page_links_point_to_existing_ids(self):
        for _, link in self.site.links:
            if link.startswith("#") and link != "#":
                with self.subTest(link=link):
                    self.assertIn(link[1:], self.site.ids)

    def test_local_files_exist(self):
        references = [link for _, link in self.site.links]
        references += re.findall(r"url\(\s*['\"]?([^'\")]+)", STYLES.read_text(encoding="utf-8"))
        for link in references:
            parts = urlsplit(link)
            if parts.scheme or link.startswith("#") or not parts.path:
                continue
            with self.subTest(link=link):
                self.assertTrue((ROOT / parts.path).is_file(), f"{link} not found")

    def test_external_links_use_https(self):
        for _, link in self.site.links:
            if urlsplit(link).scheme not in ("", "https"):
                with self.subTest(link=link):
                    self.fail(f"{link} is not https")

    def test_every_category_has_a_filter(self):
        categories = {card["category"] for card in self.site.cards}
        self.assertEqual(self.site.filters[0], "all")
        self.assertEqual(set(self.site.filters[1:]), categories)

    def test_cards_are_numbered_and_labelled(self):
        for number, card in enumerate(self.site.cards, start=1):
            with self.subTest(card=number):
                self.assertEqual(card["label"], f"{number:02d} / {card['category'].upper()}")

    def test_project_total_matches_cards(self):
        total = re.search(r"(\d+) PUBLIC PROJECTS", self.html)
        self.assertIsNotNone(total)
        self.assertEqual(int(total.group(1)), len(self.site.cards))

    def test_script_hooks_exist(self):
        for hook in ('class="filters"', 'id="filter-status"', 'class="repo-card"'):
            with self.subTest(hook=hook):
                self.assertIn(hook, self.html)


if __name__ == "__main__":
    unittest.main()
