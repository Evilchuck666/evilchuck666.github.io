"use strict";

// Every project is present in the HTML. Filtering is a progressive enhancement.
const filters = document.querySelector(".filters");
const buttons = Array.from(document.querySelectorAll("[data-filter]"));
const cards = Array.from(document.querySelectorAll(".repo-card"));
const status = document.getElementById("filter-status");

if (filters && status && buttons.length && cards.length) {
  filters.hidden = false;
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const category = button.dataset.filter;
      buttons.forEach((item) => {
        item.setAttribute("aria-pressed", String(item === button));
      });
      let count = 0;
      cards.forEach((card) => {
        card.hidden = category !== "all" && card.dataset.category !== category;
        if (!card.hidden) count += 1;
      });
      status.textContent = `${count} projects shown: ${button.textContent}.`;
    });
  });
}
