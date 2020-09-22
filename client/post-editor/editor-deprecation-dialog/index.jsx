/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * WordPress dependencies
 */
import { Button, Modal } from '@wordpress/components';

/**
 * Internal dependencies
 */
import isEditorDeprecationDialogShowing from 'calypso/state/selectors/is-editor-deprecation-dialog-showing';
import { hideEditorDeprecationDialog } from 'calypso/state/ui/editor-deprecation-dialog/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { setSelectedEditor } from 'calypso/state/selected-editor/actions';
import { localize } from 'i18n-calypso';
import {
	composeAnalytics,
	recordTracksEvent,
	withAnalytics,
} from 'calypso/state/analytics/actions';
import { getEditorPostId } from 'calypso/state/editor/selectors';
import { getEditedPostValue } from 'calypso/state/posts/selectors';
import getGutenbergEditorUrl from 'calypso/state/selectors/get-gutenberg-editor-url';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { localizeUrl } from 'calypso/lib/i18n-utils';
import { preventWidows } from 'calypso/lib/formatting';
import FormattedDate from 'calypso/components/formatted-date';
import { withLocalizedMoment } from 'calypso/components/localized-moment';

/**
 * Style dependencies
 */
import './style.scss';

class EditorDeprecationDialog extends Component {
	static propTypes = {
		// connected properties
		translate: PropTypes.func,
		gutenbergUrl: PropTypes.string,
		hideDialog: PropTypes.func,
		optIn: PropTypes.func,
		logNotNow: PropTypes.func,
		siteId: PropTypes.number,
		isDialogShowing: PropTypes.bool,
	};

	notNow = () => {
		const { logNotNow, hideDialog } = this.props;
		logNotNow();
		hideDialog();
	};

	optInToGutenberg = () => {
		const { gutenbergUrl, optIn, siteId, hideDialog } = this.props;
		hideDialog();
		optIn( siteId, gutenbergUrl );
	};

	render() {
		const { isDialogShowing, translate } = this.props;

		if ( ! isDialogShowing ) {
			return null;
		}

		const dateFormat = this.props.moment.localeData().longDateFormat( 'LL' );

		return (
			<Modal
				title={ translate( 'The new WordPress editor is coming.' ) }
				className="editor-deprecation-dialog"
				onRequestClose={ this.notNow }
				isDismissible={ false }
				shouldCloseOnClickOutside={ false }
			>
				<div className="editor-deprecation-dialog__illustration" />

				<p className="editor-deprecation-dialog__subhead">
					{ preventWidows(
						translate(
							'Get a head start before we activate it for everyone in the near future. {{support}}Read more{{/support}}.',
							{
								components: {
									date: (
										<strong>
											<FormattedDate date="2020-07-01" format={ dateFormat } />
										</strong>
									),
									support: (
										<InlineSupportLink
											supportPostId={ 167510 }
											supportLink={ localizeUrl(
												'https://wordpress.com/support/replacing-the-older-wordpress-com-editor-with-the-wordpress-block-editor/'
											) }
											showIcon={ false }
											tracksEvent="calypso_editor_deprecate_support_page_view"
											statsGroup="calypso_editor"
											statsName="editor_deprecate_learn_more"
										/>
									),
								},
							}
						)
					) }
				</p>
				<Button onClick={ this.optInToGutenberg } isPrimary>
					{ translate( 'Use the WordPress editor' ) }
				</Button>
				<Button onClick={ this.notNow } isLink>
					{ translate( 'Not now' ) }
				</Button>
			</Modal>
		);
	}
}

const mapDispatchToProps = ( dispatch ) => ( {
	optIn: ( siteId, gutenbergUrl ) => {
		dispatch(
			withAnalytics(
				composeAnalytics(
					recordTracksEvent( 'calypso_editor_deprecation_dialog', {
						opt_in: true,
					} )
				),
				setSelectedEditor( siteId, 'gutenberg', gutenbergUrl )
			)
		);
	},
	logNotNow: () => {
		dispatch(
			withAnalytics(
				composeAnalytics(
					recordTracksEvent( 'calypso_editor_deprecation_dialog', {
						opt_in: false,
					} )
				)
			)
		);
	},
	hideDialog: () => dispatch( hideEditorDeprecationDialog() ),
} );

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const postId = getEditorPostId( state );
	const postType = getEditedPostValue( state, siteId, postId, 'type' );
	const isDialogShowing = isEditorDeprecationDialogShowing( state );
	const gutenbergUrl = getGutenbergEditorUrl( state, siteId, postId, postType );

	return {
		siteId,
		isDialogShowing,
		gutenbergUrl: gutenbergUrl,
	};
}, mapDispatchToProps )( localize( withLocalizedMoment( EditorDeprecationDialog ) ) );
