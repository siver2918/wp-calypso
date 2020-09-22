/**
 * Internal dependencies
 */
import { SECTION_SET } from 'calypso/state/action-types';

export function setSection( section, options = {} ) {
	const action = {
		...options,
		type: SECTION_SET,
	};
	if ( section ) {
		action.section = section;
	}

	return action;
}
