/*
  ******************************************************************************
 * Treasure Hunt Game                                                          *
 * File: /brand.js                                                             *
 * Purpose: Builds the reusable brand markup shared by site pages.             *
 * Author: Alysha Pursley                                                      *
 * Copyright: (c) 2026 Alysha Pursley.                                         *
 * License: Proprietary; see LICENSE                                           *
  ******************************************************************************
 */
import { getPagesBasePath, getAssetsBasePath } from "./paths.js";


export function createBrandMarkup() {
  return `
    <a class="brand" href="${getPagesBasePath()}index.html" aria-label="Treasure Hunt home">
      <img
        class="brand-logo"
        src="${getAssetsBasePath()}images/treasure-hunt-logo.webp"
        width="512"
        height="512"
        alt="Treasure Hunt logo"
      />
      <span class="brand-text">
        <span class="brand-title">Treasure<span>Hunt</span></span>
        <span class="brand-subtitle">Player vs. intelligent agent</span>
      </span>
    </a>
  `;
}
