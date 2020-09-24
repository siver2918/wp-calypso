#!/usr/bin/env node

/**
 * This script generates SVG versions of PlantUML (https://plantuml.com/)
 * files in the docs/ directory which can be used in Markdown files.
 */

const plantuml = require( 'node-plantuml' );
const fs = require( 'fs' ); // eslint-disable-line import/no-nodejs-modules, wpcalypso/import-docblock
const path = require( 'path' );

for ( const filename of fs.readdirSync( 'docs' ) ) {
	// eslint-disable-next-line no-console
	const ext = path.extname( filename );
	if ( ext === '.puml' ) {
		const inputPath = path.join( 'docs', filename );
		const base = filename.substr( 0, filename.lastIndexOf( ext ) );
		const outputPath = path.join( 'docs', base ) + '.svg';
		const generator = plantuml.generate( inputPath, { format: 'svg' } );
		generator.out.pipe( fs.createWriteStream( outputPath ) );
	}
}
