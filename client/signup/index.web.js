/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import controller from './controller';
import { makeLayout, render as clientRender } from 'controller';
import { getLanguageRouteParam } from 'lib/i18n-utils';

export default function () {
	const lang = getLanguageRouteParam();

	const routes = [
		`/start/${ lang }`,
		`/start/:flowName/${ lang }`,
		`/start/:flowName/:stepName/${ lang }`,
		`/start/:flowName/:stepName/:stepSectionName/${ lang }`,
	];

	page(
		routes,
		controller.redirectTests,
		controller.saveInitialContext,
		controller.redirectWithoutLocaleIfLoggedIn,
		controller.redirectToFlow,
		controller.start,
		controller.importSiteInfoFromQuery,
		makeLayout,
		clientRender,
		controller.notifyLoaded
	);

	page.exit( routes, controller.notifyUnloaded );
}
