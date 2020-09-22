/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import { connect } from 'react-redux';
import { get, map } from 'lodash';
import Gridicon from 'calypso/components/gridicon';

/**
 * Internal dependencies
 */
import FormLabel from 'calypso/components/forms/form-label';
import FormRadio from 'calypso/components/forms/form-radio';
import QueryPostFormats from 'calypso/components/data/query-post-formats';
import { recordEditorStat, recordEditorEvent } from 'calypso/state/posts/stats';
import AccordionSection from 'calypso/components/accordion/section';
import EditorThemeHelp from 'calypso/post-editor/editor-theme-help';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getPostFormats } from 'calypso/state/post-formats/selectors';
import { getEditorPostId } from 'calypso/state/editor/selectors';
import { getEditedPostValue } from 'calypso/state/posts/selectors';
import getSiteDefaultPostFormat from 'calypso/state/selectors/get-site-default-post-format';
import { editPost } from 'calypso/state/posts/actions';

/**
 * Style dependencies
 */
import './style.scss';

const ICONS = {
	aside: 'aside',
	image: 'image',
	video: 'video-camera',
	quote: 'quote',
	link: 'link',
	gallery: 'image-multiple',
	status: 'pencil',
	audio: 'audio',
	chat: 'comment',
};

function getPostFormatIcon( postFormatSlug ) {
	return get( ICONS, [ postFormatSlug ], 'posts' );
}

class EditorPostFormats extends React.Component {
	static propTypes = {
		siteId: PropTypes.number,
		postId: PropTypes.number,
		postFormats: PropTypes.object,
		formatValue: PropTypes.string,
	};

	getSelectedPostFormat() {
		const { formatValue } = this.props;
		const isSupportedFormat = !! this.getPostFormats()[ formatValue ];

		return isSupportedFormat ? formatValue : 'standard';
	}

	getPostFormats() {
		let formats = {
			standard: this.props.translate( 'Standard', {
				context: 'Post format',
			} ),
		};

		if ( this.props.postFormats ) {
			formats = Object.assign( formats, this.props.postFormats );
		}

		return formats;
	}

	onChange = ( event ) => {
		const format = event.target.value;

		this.props.editPost( this.props.siteId, this.props.postId, { format } );
		this.props.recordEditorStat( 'post_format_changed' );
		this.props.recordEditorEvent( 'Changed Post Format', format );
	};

	renderPostFormats() {
		const selectedFormat = this.getSelectedPostFormat();

		return map( this.getPostFormats(), ( postFormatLabel, postFormatSlug ) => {
			return (
				<li key={ postFormatSlug } className="editor-post-formats__format">
					<FormLabel>
						<FormRadio
							name="format"
							value={ postFormatSlug }
							checked={ postFormatSlug === selectedFormat }
							onChange={ this.onChange }
							label={
								<>
									<span className={ 'editor-post-formats__format-icon' }>
										<Gridicon icon={ getPostFormatIcon( postFormatSlug ) } size={ 18 } />
									</span>
									{ postFormatLabel }
								</>
							}
						/>
					</FormLabel>
				</li>
			);
		} );
	}

	render() {
		return (
			<AccordionSection>
				<EditorThemeHelp className="editor-post-formats__help-link" />
				<QueryPostFormats siteId={ this.props.siteId } />
				<ul className="editor-post-formats">{ this.renderPostFormats() }</ul>
			</AccordionSection>
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const postId = getEditorPostId( state );
		const postFormats = getPostFormats( state, siteId );
		const formatValue =
			getEditedPostValue( state, siteId, postId, 'format' ) ||
			getSiteDefaultPostFormat( state, siteId );

		return { siteId, postId, postFormats, formatValue };
	},
	{ editPost, recordEditorStat, recordEditorEvent }
)( localize( EditorPostFormats ) );
