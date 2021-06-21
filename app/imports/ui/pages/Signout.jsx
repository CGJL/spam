import React from 'react';
import { Meteor } from 'meteor/meteor';
import { Header } from 'semantic-ui-react';
import { EncryptionKey } from '../../api/encryption/EncryptionKey';

/** After the user clicks the "Signout" link in the NavBar, log them out and display this page. */
export default class Signout extends React.Component {
  render() {
    // Clear local MongoDB collection holding the user's encryption key
    EncryptionKey.remove({});
    Meteor.logout();
    return (
      <Header id="signout-page" as="h2" textAlign="center">
        <p>You are signed out.</p>
      </Header>
    );
  }
}
