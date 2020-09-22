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

function includesPackage( pkgList, pkgName ) {
	return pkgList.find( ( p ) => p.name === pkgName );
}

function dependencyNamesOfType( depList, type ) {
	return depList.filter( ( dep ) => dep.type === type ).map( ( dep ) => dep.name );
}

function completeDependencies( packageList ) {
	const visitedFolders = new Set();

	function processPackageDependencies( pkg, contexts ) {
		const packageFolder = contexts[ 0 ] + '/' + pkg.name;

		// read module's package.json
		const packageJson = JSON.parse( fs.readFileSync( packageFolder + '/package.json' ) );

		// collect dependencies from various fields
		const packageDependencies = [
			'dependencies',
			'peerDependencies',
			'optionalDependencies',
		].flatMap( ( type ) =>
			Object.keys( packageJson[ type ] || {} ).map( ( name ) => ( { name, type } ) )
		);

		// bail out if package has no dependencies
		if ( ! packageDependencies.length ) {
			return;
		}

		const peers = dependencyNamesOfType( packageDependencies, 'peerDependencies' );
		if ( peers.length ) {
			console.log( 'Package ' + pkg.name + ' has peer deps:', peers );
		}

		const opts = dependencyNamesOfType( packageDependencies, 'optionalDependencies' );
		if ( opts.length ) {
			console.log( 'Package ' + pkg.name + ' has optional deps:', opts );
		}

		// unshift the module's nested node_modules to contexts
		contexts = [ packageFolder + '/node_modules', ...contexts ];

		// iterate its dependencies
		for ( const dependency of packageDependencies ) {
			// find the dependency in node_modules tree
			const foundContextIdx = contexts.findIndex( ( context ) =>
				fs.existsSync( context + '/' + dependency.name )
			);

			if ( foundContextIdx === -1 ) {
				console.error( 'Package ' + dependency.name + ' not found' );
				return;
			}

			const dependencyFolder = contexts[ foundContextIdx ] + '/' + dependency.name;

			// skip if the folder was already visited
			if ( visitedFolders.has( dependencyFolder ) ) {
				continue;
			}

			// mark the folder as visited
			visitedFolders.add( dependencyFolder );

			// Collect as external to be shipped if it's top-level.
			// Subpackages are already shipped together with the parent.
			if (
				foundContextIdx === contexts.length - 1 &&
				! includesPackage( packageList, dependency.name )
			) {
				console.log(
					'adding to node_modules because required by ' + pkg.name + ':',
					dependency.name
				);
				packageList.push( dependency );
			}

			// recursively collect dependencies
			processPackageDependencies( dependency, contexts.slice( foundContextIdx ) );
		}
	}

	// the packageList grows as the loop iterates. Process only the original elements
	const packageListLength = packageList.length;
	for ( let i = 0; i < packageListLength; i++ ) {
		processPackageDependencies( packageList[ i ], [ 'node_modules' ] );
	}
}

function shipDependencies( packageList ) {
	const destDir = 'build/node_modules';
	mkdirp( destDir );
	for ( const pkg of packageList ) {
		console.log( 'Copying:', pkg.name );
		rcopy( 'node_modules/' + pkg.name, destDir + '/' + pkg.name, { overwrite: true } );
	}
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

					if ( ! includesPackage( externalModules, requestModule ) ) {
						console.log( 'adding to node_modules because required by bundle:', requestModule );
						externalModules.push( { type: 'bundle', name: requestModule } );
					}
				}
			}

			console.log( 'Bundle directly requests ' + externalModules.length + ' packages' );

			completeDependencies( externalModules );

			console.log( 'Shipping ' + externalModules.length + ' packages to build/ folder' );
			console.log( 'Optionals:', dependencyNamesOfType( externalModules, 'optionalDependencies' ) );
			console.log( 'Peers:', dependencyNamesOfType( externalModules, 'peerDependencies' ) );

			shipDependencies( externalModules );
		} );
	}
};
