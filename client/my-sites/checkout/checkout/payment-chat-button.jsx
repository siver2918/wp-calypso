/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'calypso/components/gridicon';

/**
 * Internal dependencies
 */
import HappychatButton from 'calypso/components/happychat/button';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

export class PaymentChatButton extends Component {
	chatButtonClicked = () => {
		this.props.recordTracksEvent( 'calypso_presales_chat_click' );
	};

	render() {
		const { translate } = this.props;

		return (
			<HappychatButton className="checkout__payment-chat-button" onClick={ this.chatButtonClicked }>
				<Gridicon icon="chat" className="checkout__payment-chat-button-icon" />
				{ translate( 'Need help? Chat with us' ) }
			</HappychatButton>
		);
	}
}

export default connect( null, { recordTracksEvent } )( localize( PaymentChatButton ) );
