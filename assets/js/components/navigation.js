/*
  ******************************************************************************
 * Treasure Hunt Game                                                          *
 * File: /navigation.js                                                        *
 * Purpose: Builds shared page navigation and manages the compact-menu         *
 *          interaction.                                                       *
 * Author: Alysha Pursley                                                      *
 * Copyright: (c) 2026 Alysha Pursley.                                         *
 * License: Proprietary; see LICENSE                                           *
  ******************************************************************************
 */
import { getPagesBasePath } from "./paths.js";


const NAVIGATION_ITEMS = [
  ["Game", "index.html"],
  ["Info", "info.html"],
  ["Case Study", "case-study.html"],
  ["Articles", "articles.html"],
  ["Reflection", "reflection.html"],
];

function getCurrentPage() {
  return window.location.pathname.split("/").pop() || "index.html";
}

export function createNavigationMarkup() {
  const currentPage = getCurrentPage();

  const links = NAVIGATION_ITEMS.map(([label, href]) => {
    const isActive = href === currentPage;
    const activeClass = isActive ? ' class="active"' : "";
    const currentAttribute = isActive ? ' aria-current="page"' : "";

    return `<a href="${getPagesBasePath()}${href}"${activeClass}${currentAttribute}>${label}</a>`;
  }).join("");

  return `
    <button
      class="nav-toggle"
      type="button"
      aria-expanded="false"
      aria-controls="primary-navigation"
    >
      Menu
    </button>
    <nav class="nav-links" id="primary-navigation" aria-label="Main navigation">
      ${links}
    </nav>
  `;
}

export function configureNavigationToggle() {
  const toggle = document.querySelector(".nav-toggle");
  const navigation = document.querySelector("#primary-navigation");

  if (!toggle || !navigation) {
    return;
  }

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    navigation.classList.toggle("is-open", !isOpen);
  });

  // Escape closes the compact navigation whether focus is on its toggle or a link.
  const closeOnEscape = (event) => {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      toggle.setAttribute("aria-expanded", "false");
      navigation.classList.remove("is-open");
      toggle.focus();
    }
  };

  toggle.addEventListener("keydown", closeOnEscape);
  navigation.addEventListener("keydown", closeOnEscape);
}
