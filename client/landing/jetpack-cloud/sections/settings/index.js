/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import {
	settings,
	hostSelection,
	credentials,
	withTop,
	settingsToHostSelection,
} from 'calypso/landing/jetpack-cloud/sections/settings/controller';
import {
	settingsPath,
	settingsHostSelectionPath,
	settingsCredentialsPath,
} from 'calypso/lib/jetpack/paths';
import { isEnabled } from 'calypso/config';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';

export default function () {
	if ( isJetpackCloud() ) {
		if ( isEnabled( 'jetpack/server-credentials-advanced-flow' ) ) {
			page( settingsPath( ':site' ), settingsToHostSelection );

			page(
				settingsHostSelectionPath(),
				siteSelection,
				sites,
				navigation,
				makeLayout,
				clientRender
			);
			page(
				settingsHostSelectionPath( ':site' ),
				siteSelection,
				navigation,
				hostSelection,
				withTop( 0 ),
				makeLayout,
				clientRender
			);

			page(
				settingsCredentialsPath( ':site', ':host' ),
				siteSelection,
				navigation,
				credentials,
				withTop( 1 ),
				makeLayout,
				clientRender
			);
		} else {
			page( settingsPath(), siteSelection, sites, navigation, makeLayout, clientRender );
			page(
				settingsPath( ':site' ),
				siteSelection,
				navigation,
				settings,
				makeLayout,
				clientRender
			);
		}
	}
}
