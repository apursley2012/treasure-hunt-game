/*
 ******************************************************************************
 * Treasure Hunt Game                                                          *
 * File: /footer.js                                                            *
 * Purpose: Renders shared footer links and copyright text on site pages.      *
 * Author: Alysha Pursley                                                      *
 * Copyright: (c) 2026 Alysha Pursley.                                         *
 * License: Proprietary; see LICENSE                                           *
 ******************************************************************************
 */

import { getPagesBasePath } from "./paths.js";

const FOOTER_LINKS = [
	["Case Study", "case-study.html"],
	["Articles", "articles.html"],
	["Privacy", "privacy.html"],
	["Terms", "terms.html"],
	["Accessibility", "accessibility.html"],
];

export function renderFooter() {
	const footer = document.querySelector("[data-site-footer]");

	if (!footer) {
		return;
	}

	const base = getPagesBasePath();
	const links = FOOTER_LINKS.map(
		([label, path]) => `<a href="${base}${path}">${label}</a>`,
	).join("");

	footer.className = "site-footer";
	footer.innerHTML = `
    <div class="footer-inner">
      <span>Treasure Hunt Game</span>
      <nav class="footer-links" aria-label="Project and legal pages">
        ${links}
      </nav>
      <span>© ${new Date().getFullYear()} Alysha Pursley</span>
    </div>
  `;
}

import { getPagesBasePath } from "./paths.js";

const FOOTER_LINKS = [
  ["Case Study", "case-study.html"],
  ["Articles", "articles.html"],
  ["Privacy", "privacy.html"],
  ["Terms", "terms.html"],
  ["Accessibility", "accessibility.html"],
];

export function renderFooter() {
  const footer = document.querySelector("[data-site-footer]");

  if (!footer) {
    return;
  }

  const base = getPagesBasePath();
  const links = FOOTER_LINKS.map(
    ([label, path]) => `<a href="${base}${path}">${label}</a>`,
  ).join("");

  footer.className = "site-footer";
  footer.innerHTML = `
    <div class="footer-inner">
      <span>Treasure Hunt Game</span>
      <nav class="footer-links" aria-label="Project and legal pages">
        ${links}
      </nav>
      <span>© ${new Date().getFullYear()} Alysha Pursley</span>
    </div>
  `;
}
