/**
 * External dependencies
 */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { showGutenbergOptInDialog } from 'calypso/state/ui/gutenberg-opt-in-dialog/actions';
import EditorGutenbergOptInDialog from 'calypso/post-editor/editor-gutenberg-opt-in-dialog';
import EditorGutenbergBlocksWarningDialog from 'calypso/post-editor/editor-gutenberg-blocks-warning-dialog';
import { getEditorRawContent, isEditorLoading } from 'calypso/state/editor/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import isGutenbergOptInEnabled from 'calypso/state/selectors/is-gutenberg-opt-in-enabled';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import isPrivateSite from 'calypso/state/selectors/is-private-site';
import getWpAdminClassicEditorRedirectionUrl from '../../state/selectors/get-wp-admin-classic-editor-redirection-url';
import isEditorDeprecationDialogShowing from 'calypso/state/selectors/is-editor-deprecation-dialog-showing';
import { isEnabled } from 'calypso/config';

/**
 * We don't support classic editor in Calypso for private atomic sites. This components makes sure
 * we always redirect such users to wp-admin version of classic editor.
 * * When opt-in dialogs are enabled, we always show one - either "This post contains blocks" or the opt-in dialog.
 * * When opt-in dialogs are disabled, we redirect to wp-admin right away.
 */
const EditorGutenbergDialogs: React.FC< {} > = () => {
	const [ hasGutenbergBlocks, setHasGutenbergBlocks ] = useState< boolean | null >( null );

	const siteId = useSelector( getSelectedSiteId ) as number;
	const isAtomic = useSelector( ( state ) => isSiteAutomatedTransfer( state, siteId ) );
	const isPrivate = useSelector( ( state ) => isPrivateSite( state, siteId ) );
	const isPrivateAtomic = isAtomic && isPrivate;

	const postContent = useSelector( getEditorRawContent );
	const isLoading = useSelector( isEditorLoading );
	const isPostContentLoaded = ! isLoading && postContent !== null;

	const optInEnabled = useSelector( ( state ) => isGutenbergOptInEnabled( state, siteId ) );
	const wpAdminRedirectionUrl = useSelector( ( state ) =>
		getWpAdminClassicEditorRedirectionUrl( state, siteId )
	);

	const editorDeprecationDialogShowing = useSelector( ( state ) =>
		isEditorDeprecationDialogShowing( state )
	);

	const dispatch = useDispatch();

	useEffect(
		function () {
			if ( hasGutenbergBlocks !== null || ! isPostContentLoaded || ! isPrivateAtomic ) {
				return;
			}
			const hasGutenbergContent = ( postContent || '' ).indexOf( '<!-- wp:' ) !== -1;
			setHasGutenbergBlocks( hasGutenbergContent );

			// Sometimes API will tell us opt-in dialogs shouldn't show up at all, in such case let's
			// redirect to wp-admin right away
			if ( ! optInEnabled ) {
				window.location.href = wpAdminRedirectionUrl;
				return;
			}

			// If the post doesn't have any Gutenberg content, it means <EditorGutenbergBlocksWarningDialog /> is not going
			// to be displayed. In this case, let's trigger <EditorGutenbergOptInDialog /> dialog
			if ( ! hasGutenbergContent ) {
				dispatch( showGutenbergOptInDialog() );
			}
		},
		// Disabling eslint check because hasGutenbergContent is only set inside this effect
		// and we don't want to rerun it once it's updated
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[
			dispatch,
			isPrivateAtomic,
			isPostContentLoaded,
			postContent,
			optInEnabled,
			wpAdminRedirectionUrl,
		]
	);

	if ( editorDeprecationDialogShowing && ! isEnabled( 'desktop' ) ) {
		// This condition needs to be kept in sync with https://github.com/Automattic/wp-calypso/blob/dbfef92960de2c1a8f4b061cdd9b5d1914c12648/client/post-editor/post-editor.jsx#L305
		return null;
	}

	return (
		<>
			<EditorGutenbergOptInDialog />
			<EditorGutenbergBlocksWarningDialog hasGutenbergBlocks={ !! hasGutenbergBlocks } />
		</>
	);
};
EditorGutenbergDialogs.displayName = 'EditorGutenbergDialogs';

export default EditorGutenbergDialogs;
