/**
 * Internal dependencies
 */
import { hasJetpackSiteJetpackThemesExtendedFeatures } from 'calypso/state/sites/selectors';
import { getTheme } from 'calypso/state/themes/selectors/get-theme';
import { isWpcomTheme } from 'calypso/state/themes/selectors/is-wpcom-theme';

import 'calypso/state/themes/init';

/**
 * Whether a given theme is installed or can be installed on a Jetpack site.
 *
 * @param  {object}  state   Global state tree
 * @param  {string}  themeId Theme ID for which we check availability
 * @param  {number}  siteId  Site ID
 * @returns {boolean}         True if siteId is a Jetpack site on which theme is installed or can be installed.
 */
export function isThemeAvailableOnJetpackSite( state, themeId, siteId ) {
	return (
		!! getTheme( state, siteId, themeId ) || // The theme is already available or...
		( isWpcomTheme( state, themeId ) && // ...it's a WP.com theme and...
			hasJetpackSiteJetpackThemesExtendedFeatures( state, siteId ) ) // ...the site supports theme installation from WP.com.
	);
}
