/*
 * Internal dependencies
 */
const handler = require( 'wpcom-xhr-request' );
const keychain = require( 'desktop/lib/keychain' );
const { OAUTH_TOKEN } = require( 'desktop/lib/keychain/keys' );

const promiseTimeout = function ( ms, promise ) {
	const timeout = new Promise( ( _, reject ) => {
		const id = setTimeout( () => {
			clearTimeout( id );
			reject( `Request timed out in ${ ms } ms` );
		}, ms );
	} );

	return Promise.race( [ promise, timeout ] );
};

async function fetchNote( noteId ) {
	const token = await keychain.get( OAUTH_TOKEN );

	return new Promise( ( resolve, reject ) => {
		handler(
			{
				path: `/notifications/${ noteId }`,
				authToken: token,
				apiVersion: '1.1',
				query: {
					fields: 'id,type,unread,body,subject,timestamp,meta,note_hash',
				},
			},
			( error, body ) => {
				if ( error ) {
					reject( error );
				}

				if ( body.notes && Array.isArray( body.notes ) && body.notes.length > 0 ) {
					return resolve( body.notes[ 0 ] );
				}

				return resolve( null );
			}
		);
	} );
}

async function markReadStatus( noteId, isRead ) {
	const token = await keychain.get( OAUTH_TOKEN );

	return new Promise( ( resolve, reject ) => {
		handler(
			{
				method: 'POST',
				path: '/notifications/read',
				authToken: token,
				formData: {
					counts: {
						[ noteId ]: isRead ? 9999 : -1,
					},
				},
			},
			( error ) => {
				if ( error ) {
					reject( error );
				}
				resolve( null );
			}
		);
	} );
}

module.exports = {
	fetchNote: ( noteId ) => promiseTimeout( 300, fetchNote( noteId ) ),
	markReadStatus: ( noteId, isRead ) => promiseTimeout( 300, markReadStatus( noteId, isRead ) ),
};
