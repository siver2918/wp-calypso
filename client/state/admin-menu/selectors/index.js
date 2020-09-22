/**
 * Internal dependencies
 */
import 'calypso/state/inline-help/init';

export function getAdminMenu( state, siteId ) {
	const stateSlice = state?.adminMenu;

	if ( ! stateSlice || ! siteId ) {
		return null;
	}

	return state.adminMenu[ siteId ] || null;
}
