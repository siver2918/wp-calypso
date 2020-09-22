/**
 * Internal Dependencies
 */
import { getPreference } from 'calypso/state/preferences/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { savePreference } from 'calypso/state/preferences/actions';

export const dismissNudge = () => ( dispatch, getState ) => {
	const siteId = getSelectedSiteId( getState() );
	const preference = getPreference( getState(), 'upwork-dismissible-nudge' ) || {};

	return dispatch(
		savePreference( 'upwork-dismissible-nudge', {
			...preference,
			...{
				[ siteId ]: [
					...( preference[ siteId ] || [] ),
					{
						dismissedAt: Date.now(),
						type: 'dismiss',
					},
				],
			},
		} )
	);
};
