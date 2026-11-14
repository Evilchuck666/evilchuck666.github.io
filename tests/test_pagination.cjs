// Exercise the browser script with a minimal DOM, using Node's standard library.
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { test } = require("node:test");
const { runInNewContext } = require("node:vm");
const { resolve } = require("node:path");

const root = resolve(__dirname, "..");
const script = readFileSync(resolve(root, "script.js"), "utf8");
const html = readFileSync(resolve(root, "index.html"), "utf8");
const catalogue = Array.from(html.matchAll(/class="repo-card" data-category="([^"]+)"/g), (match) => match[1]);

function setup(categories = catalogue) {
  let focused;
  class Element {
    constructor(dataset = {}) {
      this.dataset = dataset;
      this.hidden = false;
      this.attributes = {};
      this.children = [];
      this.listeners = {};
      this.textContent = "";
    }
    setAttribute(name, value) { this.attributes[name] = value; }
    removeAttribute(name) { delete this.attributes[name]; }
    addEventListener(name, handler) { this.listeners[name] = handler; }
    append(child) { this.children.push(child); }
    click() { if (!this.disabled) this.listeners.click?.(); }
    focus() { focused = this; }
    scrollIntoView() { this.scrolled = true; }
    querySelector() { return this.link; }
  }
  const names = ["catalog-controls", "filters", "filter-status", "repo-grid", "pagination", "pagination-pages",
    "previous-page", "next-page", "pagination-summary"];
  const elements = Object.fromEntries(names.map((name) => [name, new Element()]));
  elements.filters.hidden = elements.pagination.hidden = true;
  const buttons = Array.from(html.matchAll(/data-filter="([^"]+)"[^>]*>([^<]+)</g), (match) => {
    const button = new Element({ filter: match[1] });
    button.textContent = match[2];
    return button;
  });
  const cards = categories.map((category) => {
    const card = new Element({ category });
    card.link = new Element();
    return card;
  });
  const document = {
    querySelector: (selector) => elements[selector.slice(1)],
    getElementById: (id) => elements[id],
    querySelectorAll: (selector) => selector === "[data-filter]" ? buttons : cards,
    createElement: () => new Element(),
  };
  runInNewContext(script, { document });
  return {
    elements, cards,
    filter: (category) => buttons.find((button) => button.dataset.filter === category),
    pages: elements["pagination-pages"].children,
    visible: () => cards.filter((card) => !card.hidden),
    focused: () => focused,
    previous: elements["previous-page"], next: elements["next-page"],
  };
}

test("All projects starts with the first four cards and an accessible current page", () => {
  const ui = setup();
  assert.deepEqual(ui.visible(), ui.cards.slice(0, 4));
  assert.equal(ui.elements.pagination.hidden, false);
  assert.equal(ui.previous.disabled, true);
  assert.equal(ui.next.disabled, false);
  assert.equal(ui.pages.length, Math.ceil(catalogue.length / 4));
  assert.equal(ui.pages[0].attributes["aria-current"], "page");
  assert.equal(ui.pages[0].attributes["aria-controls"], "repo-grid");
  assert.equal(ui.elements["pagination-summary"].textContent, `1–4 of ${catalogue.length}`);
  assert.equal(ui.focused(), undefined, "Initial load must not steal focus");
});

test("Next, Previous and direct page selection reach every project in order", () => {
  const ui = setup();
  const seen = [...ui.visible()];
  for (let page = 1; page < ui.pages.length; page += 1) {
    ui.next.click();
    const expected = ui.cards.slice(page * 4, (page + 1) * 4);
    assert.deepEqual(ui.visible(), expected);
    assert.equal(ui.pages[page].attributes["aria-current"], "page");
    assert.equal(ui.pages.filter((button) => button.attributes["aria-current"]).length, 1);
    assert.equal(ui.focused(), expected[0].link);
    assert.equal(ui.elements["catalog-controls"].scrolled, true);
    seen.push(...ui.visible());
  }
  assert.deepEqual(seen, ui.cards);
  assert.equal(ui.next.disabled, true);
  ui.next.click();
  assert.equal(ui.next.disabled, true);
  ui.previous.click();
  assert.deepEqual(ui.visible(), ui.cards.slice((ui.pages.length - 2) * 4, (ui.pages.length - 1) * 4));
  ui.pages[0].click();
  assert.deepEqual(ui.visible(), ui.cards.slice(0, 4));
  assert.equal(ui.previous.disabled, true);
});

test("Category filters show all matches and returning to All projects resets page one", () => {
  const ui = setup();
  ui.next.click();
  for (const category of ["media", "games", "tools", "garage"]) {
    ui.filter(category).click();
    const matching = ui.cards.filter((card) => card.dataset.category === category);
    assert.deepEqual(ui.visible(), matching);
    assert.equal(ui.elements.pagination.hidden, true);
    assert.equal(ui.filter(category).attributes["aria-pressed"], "true");
    assert.ok(ui.elements["filter-status"].textContent.startsWith(`${matching.length} projects shown:`));
    ui.next.click();
    assert.deepEqual(ui.visible(), matching, "Hidden pagination must not change a category");
  }
  ui.filter("all").click();
  assert.deepEqual(ui.visible(), ui.cards.slice(0, 4));
  assert.equal(ui.elements.pagination.hidden, false);
  assert.equal(ui.pages[0].attributes["aria-current"], "page");
});

test("Pagination adapts to empty, single-page and growing catalogues", () => {
  for (const total of [0, 1, 3, 4, 5, 8, 9, 16, 17]) {
    const ui = setup(Array(total).fill("games"));
    assert.equal(ui.visible().length, Math.min(4, total));
    assert.equal(ui.elements.pagination.hidden, total <= 4);
    assert.equal(ui.pages.length, Math.max(1, Math.ceil(total / 4)));
    ui.pages.at(-1).click();
    assert.equal(ui.visible().length, total === 0 ? 0 : ((total - 1) % 4) + 1);
    assert.equal(ui.next.disabled, true);
    ui.filter("media").click();
    assert.equal(ui.visible().length, 0);
    assert.equal(ui.elements.pagination.hidden, true);
    ui.filter("all").click();
    assert.equal(ui.visible().length, Math.min(4, total));
  }
});
