/* eslint-disable no-console */
const handler = require( 'wpcom-xhr-request' );

const noteId = `4917875160`;
const authToken = process.env.OAUTH_TOKEN;

// module.exports = function ( noteId ) {
handler(
	{
		path: `/notifications/${ noteId }`,
		authToken,
		apiVersion: '1.1',
		query: {
			fields: 'id,type,unread,body,subject,timestamp,meta,note_hash',
		},
	},
	( error, body ) => {
		if ( error ) {
			return console.error( 'Request failed: ', error );
		}

		const note = body.notes[ 0 ];

		console.log( 'Returned message body: ', note );
		console.log( 'Body: ', note.body );
		// TODO: note.body[1].actions -> approve-comment === false means unapproved!
		console.log( 'Meta: ', note.meta );
		console.log( 'Header: ', note.header );
		console.log( 'Post title: ', note.header[ 1 ].text );
		console.log( 'Site title: ', note.header[ 1 ].text );
		console.log( 'isApproved?', '' );
	}
);
// };
