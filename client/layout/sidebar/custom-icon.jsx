/**
 * SidebarCustomIcon -
 *   Renders an <img> tag with props supplied if icon is a data image
 *   or a dashicon in other case.
 *   Adds className="sidebar__menu-icon" to the supplied className.
 *
 *   Purpose: To display a custom icon in the sidebar when using a
 *   source other than grid icons or material icons.
 **/

/**
 * External dependencies
 */
import React from 'react';

const SidebarCustomIcon = ( { alt, className, icon, ...rest } ) => {
	if ( ! icon ) {
		return null;
	}

	if ( 0 !== icon.indexOf( 'dashicons-' ) ) {
		return (
			<img
				alt={ alt || '' }
				className={ 'sidebar__menu-icon ' + ( className || '' ) }
				src={ icon }
				{ ...rest }
			/>
		);
	}

	return <span className={ 'sidebar__menu-icon dashicons-before ' + icon } { ...rest }></span>;
};
export default SidebarCustomIcon;
