/*
 ******************************************************************************
 * Treasure Hunt Game                                                          *
 * File: /paths.js                                                             *
 * Purpose: Provides relative page paths for shared components under root and  *
 *          nested page routes.                                                *
 * Author: Alysha Pursley                                                      *
 * Copyright: (c) 2026 Alysha Pursley.                                         *
 * License: Proprietary; see LICENSE                                           *
 ******************************************************************************
 */
function isPagesDirectory() {
	const pathSegments = window.location.pathname.split("/").filter(Boolean);
	return pathSegments.at(-2) === "pages";
}

export function getPagesBasePath() {
	return isPagesDirectory() ? "" : "pages/";
}

export function getAssetsBasePath() {
	return isPagesDirectory() ? "../assets/" : "assets/";
}
