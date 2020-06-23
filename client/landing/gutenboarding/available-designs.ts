/**
 * External dependencies
 */
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import { isEnabled } from '../../config';
import type { Design } from './stores/onboard/types';
const availableDesignsConfig = require( './available-designs-config.json' );

interface AvailableDesigns {
	featured: Design[];
}

const availableDesigns: Readonly< AvailableDesigns > = availableDesignsConfig;

export const getDesignImageUrl = ( design: Design ) => {
	// We temporarily show pre-generated screenshots until we can generate tall versions dynamically using mshots.
	// See `bin/generate-gutenboarding-design-thumbnails.js` for generating screenshots.
	// https://github.com/Automattic/mShots/issues/16
	// https://github.com/Automattic/wp-calypso/issues/40564

	// if ( ! isEnabled( 'gutenboarding/mshot-preview' ) ) {
	// 	return `/calypso/page-templates/design-screenshots/${ design.slug }_${ design.template }_${ design.theme }.jpg`;
	// }

	const mshotsUrl = 'https://s0.wp.com/mshots/v1/';
	const designsEndpoint = 'https://public-api.wordpress.com/rest/v1/template/demo/';
	const previewUrl = addQueryArgs(
		`${ designsEndpoint }${ encodeURIComponent( design.theme ) }/${ encodeURIComponent(
			design.template
		) }`,
		{
			font_headings: design.fonts.headings,
			font_base: design.fonts.base,
			viewport_height: 700,
		}
	);
	const mshotsRequest = addQueryArgs( mshotsUrl + encodeURIComponent( previewUrl ), {
		vpw: 1200,
		vph: 3072,
		w: 700,
		h: 1800,
		// requeue: true, // Uncomment this line to force the screenshots to be regenerated
	} );
	return mshotsRequest;
};

/**
 * Asynchronously load available design images
 */
export function prefetchDesignThumbs() {
	if ( typeof window !== 'undefined' ) {
		getAvailableDesigns().featured.forEach( ( design: Design ) => {
			const href = getDesignImageUrl( design );
			const link = document.createElement( 'link' );
			link.rel = 'prefetch';
			link.as = 'image';
			link.href = href;
			document.head.appendChild( link );
		} );
	}
}

export function getAvailableDesigns(
	includeEdgeDesigns: boolean = isEnabled( 'gutenboarding/edge-templates' ),
	useFseDesigns: boolean = isEnabled( 'gutenboarding/site-editor' )
) {
	let designs = availableDesigns;

	if ( ! includeEdgeDesigns ) {
		designs = {
			...designs,
			featured: designs.featured.filter( ( design ) => ! design.is_alpha ),
		};
	}

	// If we are in the FSE flow, only show FSE designs. In normal flows, remove
	// the FSE designs.
	designs = {
		...designs,
		featured: designs.featured.filter( ( design ) =>
			useFseDesigns ? design.is_fse : ! design.is_fse
		),
	};

	return designs;
}

export default getAvailableDesigns();
