/*
 ******************************************************************************
 * Treasure Hunt Game                                                          *
 * File: /header.js                                                            *
 * Purpose: Composes the reusable header from branding and navigation          *
 *          components.                                                        *
 * Author: Alysha Pursley                                                      *
 * Copyright: (c) 2026 Alysha Pursley.                                         *
 * License: Proprietary; see LICENSE                                           *
 ******************************************************************************
 */

import { createBrandMarkup } from "./brand.js";
import {
	configureNavigationToggle,
	createNavigationMarkup,
} from "./navigation.js";

export function renderHeader() {
	const header = document.querySelector("[data-site-header]");

	if (!header) {
		return;
	}

	header.className = "site-header";
	header.innerHTML = `
    <div class="header-inner">
      ${createBrandMarkup()}
      ${createNavigationMarkup()}
    </div>
  `;

	configureNavigationToggle();
}
