/**
 * Internal Dependencies
 */
import { getPreference } from 'calypso/state/preferences/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { savePreference } from 'calypso/state/preferences/actions';

export const dismissNudge = () => ( dispatch, getState ) => {
	const siteId = getSelectedSiteId( getState() );
	const preference = getPreference( getState(), 'ecommerce-manage-dismissible-nudge' ) || {};

	return dispatch(
		savePreference(
			'ecommerce-manage-dismissible-nudge',
			Object.assign( {}, preference, {
				[ siteId ]: [
					...( preference[ siteId ] || [] ),
					{
						dismissedAt: Date.now(),
						type: 'dismiss',
					},
				],
			} )
		)
	);
};
