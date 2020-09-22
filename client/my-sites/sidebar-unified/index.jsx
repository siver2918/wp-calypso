/**
 * MySitesSidebarUnified
 *   Renders the Sidebar for "My Sites", except all of the menus and items are
 *   driven off a WPCom endpoint: /sites/${sideId}/admin-menu, which is loaded
 *   into state.adminMenu in a data layer.
 *
 *    Currently experimental/WIP.
 **/

/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { getCurrentRoute } from 'calypso/state/selectors/get-current-route';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getAdminMenu } from 'calypso/state/admin-menu/selectors';
import { isUnderDomainManagementAll } from 'calypso/my-sites/domains/paths';
import { isUnderEmailManagementAll } from 'calypso/my-sites/email/paths';
import { requestAdminMenu } from '../../state/admin-menu/actions';
import CurrentSite from 'calypso/my-sites/current-site';
import MySitesSidebarUnifiedItem from './item';
import MySitesSidebarUnifiedMenu from './menu';
import Sidebar from 'calypso/layout/sidebar';
import SidebarSeparator from 'calypso/layout/sidebar/separator';

import 'calypso/layout/sidebar-unified/style.scss';
import 'calypso/state/admin-menu/init';

export const MySitesSidebarUnified = ( { path } ) => {
	const reduxDispatch = useDispatch();
	const selectedSiteId = useSelector( getSelectedSiteId );
	useEffect( () => {
		if ( selectedSiteId !== null ) {
			reduxDispatch( requestAdminMenu( selectedSiteId ) );
		}
	}, [ reduxDispatch, selectedSiteId ] );

	// Extract this?
	const menuItems = useSelector( ( state ) => {
		const menu = getAdminMenu( state, getSelectedSiteId( state ) );
		return menu != null ? Object.values( menu ) : [];
	} );

	// Extract this?
	const isAllDomainsView = useSelector( ( state ) => {
		const currentRoute = getCurrentRoute( state );
		return isUnderDomainManagementAll( currentRoute ) || isUnderEmailManagementAll( currentRoute );
	} );

	//console.log( { menuItems } );
	return (
		<Sidebar>
			<CurrentSite forceAllSitesView={ isAllDomainsView } />
			{ menuItems.map( ( item, i ) => {
				if ( 'type' in item && item.type === 'separator' ) {
					return <SidebarSeparator key={ i } />;
				}
				if ( ! ( 'children' in item ) || item.children.length === 0 ) {
					return (
						<MySitesSidebarUnifiedItem isTopLevel key={ item.slug } path={ path } { ...item } />
					);
				}
				return <MySitesSidebarUnifiedMenu key={ item.slug } path={ path } { ...item } />;
			} ) }
		</Sidebar>
	);
};
export default MySitesSidebarUnified;
