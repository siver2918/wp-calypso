/**
 * Internal dependencies
 */
import { registerReducer } from 'calypso/state/redux-store';
import editorDeprecationGroupReducer from './reducer';

registerReducer( [ 'currentUser', 'inEditorDeprecationGroup' ], editorDeprecationGroupReducer );
