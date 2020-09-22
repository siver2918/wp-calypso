/**
 * Internal dependencies
 */
import { withStorageKey } from 'calypso/state/utils';
import { EDITOR_DEPRECATION_GROUP_SET } from 'calypso/state/action-types';

export const editorDeprecationGroupReducer = ( state = '', { type, inEditorDeprecationGroup } ) =>
	type === EDITOR_DEPRECATION_GROUP_SET ? inEditorDeprecationGroup : state;

export default withStorageKey( 'inEditorDeprecationGroup', editorDeprecationGroupReducer );
