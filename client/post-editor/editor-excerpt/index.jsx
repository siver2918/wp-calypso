/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { recordEditorStat, recordEditorEvent } from 'calypso/state/posts/stats';
import TrackInputChanges from 'calypso/components/track-input-changes';
import FormTextarea from 'calypso/components/forms/form-textarea';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getEditorPostId } from 'calypso/state/editor/selectors';
import { getEditedPostValue } from 'calypso/state/posts/selectors';
import { editPost } from 'calypso/state/posts/actions';

class EditorExcerpt extends React.Component {
	recordExcerptChangeStats = () => {
		this.props.recordEditorStat( 'excerpt_changed' );
		this.props.recordEditorEvent( 'Changed Excerpt' );
	};

	onExcerptChange = ( event ) => {
		const excerpt = event.target.value;
		this.props.editPost( this.props.siteId, this.props.postId, { excerpt } );
	};

	render() {
		const { excerpt, translate } = this.props;
		const placeholder = translate( 'Write an excerpt…' );

		return (
			<TrackInputChanges onNewValue={ this.recordExcerptChangeStats }>
				<FormTextarea
					id="excerpt"
					name="excerpt"
					onChange={ this.onExcerptChange }
					value={ excerpt }
					placeholder={ placeholder }
					aria-label={ placeholder }
				/>
			</TrackInputChanges>
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const postId = getEditorPostId( state );
		const excerpt = getEditedPostValue( state, siteId, postId, 'excerpt' );

		return { siteId, postId, excerpt };
	},
	{ editPost, recordEditorStat, recordEditorEvent }
)( localize( EditorExcerpt ) );
