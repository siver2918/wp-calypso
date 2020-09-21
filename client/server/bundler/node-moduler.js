/**
 * External Dependencies
 */
const fs = require( 'fs' ); // eslint-disable-line  import/no-nodejs-modules
const { builtinModules } = require( 'module' );
const rcopy = require( 'recursive-copy' );
const mkdirp = require( 'mkdirp' );

function getModule( request ) {
	const parts = request.split( '/' );
	if ( parts[ 0 ].startsWith( '@' ) ) {
		return parts[ 0 ] + '/' + parts[ 1 ];
	}
	return parts[ 0 ];
}

module.exports = class NodeModuler {
	apply( compiler ) {
		compiler.hooks.afterEmit.tapAsync( 'NodeModuler', ( compilation ) => {
			const externalModules = [];
			for ( const module of compilation.modules ) {
				if ( module.external ) {
					const requestModule = getModule( module.userRequest );

					if ( builtinModules.includes( requestModule ) ) {
						// native Node.js module, not in node_modules
						continue;
					}

					if ( requestModule.startsWith( './' ) || requestModule.startsWith( '../' ) ) {
						// loading local file by relative path, not in node_modules
						continue;
					}

					if ( ! externalModules.includes( requestModule ) ) {
						console.log( 'adding to node_modules because required by bundle:', requestModule );
						externalModules.push( requestModule );
					}
				}
			}

			const visitedFolders = new Set();

			function collectDependencies( mod, contexts ) {
				console.log( 'collecting', mod, contexts );
				const modFolder = contexts[ 0 ] + '/' + mod;

				// read module's package.json
				const pkg = JSON.parse( fs.readFileSync( modFolder + '/package.json' ) );

				// bail out if package has no dependencies
				if ( ! pkg.dependencies ) {
					console.log( 'Package ' + mod + ' has no dependencies, skipping' );
					return;
				}

				// unshift the module's nested node_modules to contexts
				contexts = [ modFolder + '/node_modules', ...contexts ];

				// iterate its dependencies
				for ( const dep of Object.keys( pkg.dependencies ) ) {
					// find the dependency in node_modules tree
					const foundContextIdx = contexts.findIndex( ( context ) =>
						fs.existsSync( context + '/' + dep )
					);

					if ( foundContextIdx === -1 ) {
						console.error( 'Package ' + dep + ' not found' );
						return;
					}

					const depFolder = contexts[ foundContextIdx ] + '/' + dep;

					// skip if the folder was already visited
					if ( visitedFolders.has( depFolder ) ) {
						continue;
					}

					// mark the folder as visited
					visitedFolders.add( depFolder );

					// collect as external to be shipped if it's top-level
					if ( foundContextIdx === contexts.length - 1 ) {
						if ( ! externalModules.includes( dep ) ) {
							console.log( 'adding to node_modules because required by ' + mod + ':', dep );
							externalModules.push( dep );
						}
					} else {
						console.log( 'subpackage ' + depFolder + ' already shipping thanks to parent' );
					}

					// recursively collect dependencies
					collectDependencies( dep, contexts.slice( foundContextIdx ) );
				}
			}

			for ( let i = 0; i < externalModules.length; i++ ) {
				collectDependencies( externalModules[ i ], [ 'node_modules' ] );
			}

			console.log( 'Shipping ' + externalModules.length + ' packages to build/ folder' );
			const shipDir = 'build/node_modules';
			mkdirp( shipDir );
			for ( const mod of externalModules ) {
				console.log( 'Copying:', mod );
				rcopy( 'node_modules/' + mod, shipDir + '/' + mod, { overwrite: true } );
			}
		} );
	}
};
