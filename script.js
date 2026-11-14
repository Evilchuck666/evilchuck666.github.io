"use strict";

// Every project is present in the HTML. Filters and pagination enhance that list.
const pageSize = 4;
const controls = document.querySelector(".catalog-controls");
const filters = document.querySelector(".filters");
const buttons = Array.from(document.querySelectorAll("[data-filter]"));
const cards = Array.from(document.querySelectorAll(".repo-card"));
const status = document.getElementById("filter-status");
const grid = document.getElementById("repo-grid");
const pagination = document.querySelector(".pagination");
const pageNumbers = document.querySelector(".pagination-pages");
const previous = document.getElementById("previous-page");
const next = document.getElementById("next-page");
const summary = document.getElementById("pagination-summary");

if (controls && filters && status && grid && pagination && pageNumbers && previous && next && summary && buttons.length) {
  let category = "all";
  let currentPage = 1;
  let totalPages = Math.max(1, Math.ceil(cards.length / pageSize));
  const pageButtons = [];

  function render() {
    const matching = cards.filter((card) => category === "all" || card.dataset.category === category);
    totalPages = Math.max(1, Math.ceil(matching.length / pageSize));
    const start = (currentPage - 1) * pageSize;
    cards.forEach((card) => { card.hidden = true; });
    matching.forEach((card, index) => {
      card.hidden = index < start || index >= start + pageSize;
    });
    buttons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.filter === category));
    });
    pagination.hidden = totalPages === 1;
    previous.disabled = currentPage === 1;
    next.disabled = currentPage === totalPages;
    pageButtons.forEach((button, index) => {
      button.hidden = index >= totalPages;
      if (index + 1 === currentPage) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
    summary.textContent = `${matching.length ? start + 1 : 0}–${Math.min(start + pageSize, matching.length)} of ${matching.length}`;
    const label = buttons.find((button) => button.dataset.filter === category).textContent;
    status.textContent = `Projects ${summary.textContent}: ${label}. Page ${currentPage} of ${totalPages}.`;
  }

  function goToPage(page) {
    if (page < 1 || page > totalPages || page === currentPage) return;
    currentPage = page;
    render();
    // Start reading the new page at its first project, including for keyboard users.
    cards.find((card) => !card.hidden)?.querySelector("h4 a")?.focus({ preventScroll: true });
  }

  for (let page = 1; page <= totalPages; page += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = String(page);
    button.setAttribute("aria-label", `Page ${page}`);
    button.setAttribute("aria-controls", "repo-grid");
    button.addEventListener("click", () => goToPage(page));
    pageNumbers.append(button);
    pageButtons.push(button);
  }
  previous.addEventListener("click", () => goToPage(currentPage - 1));
  next.addEventListener("click", () => goToPage(currentPage + 1));
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      category = button.dataset.filter;
      currentPage = 1;
      render();
    });
  });
  render();
  filters.hidden = false;
}
