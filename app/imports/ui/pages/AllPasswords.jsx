import React from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Container, Header, Card, Loader } from 'semantic-ui-react';
import Proptypes from 'prop-types';
import { Passwords } from '../../api/password/Password';
import PasswordItem from '../components/PasswordItem';

class AllPasswords extends React.Component {

  render() {
    return (this.props.ready) ? this.renderPage() : <Loader active>Getting Data</Loader>;
  }

  renderPage() {
    let myjson = {};
    if (Meteor.isServer) {
      myjson = JSON.parse(Assets.getText('data.json'));
      console.log(myjson);
    }
    return (
      <Container id="AllPasswords-page">
        <Header as="h1" textAlign="center" style={{ paddingTop: '40px', paddingBottom: '30px' }}> All Passwords</Header>
        <Card.Group centered style={{ paddingBottom: '40px' }}>
          {this.props.passwords.map((passwords, index) => <PasswordItem key={index} password={passwords}/>)}
        </Card.Group>
      </Container>
    );
  }
}

AllPasswords.propTypes = {
  ready: Proptypes.bool.isRequired,
  passwords: Proptypes.array.isRequired,
};

export default withTracker(() => {
  const sub2 = Meteor.subscribe(Passwords.userPublicationName);

  return {
    passwords: Passwords.collection.fin({}).fetch(),
    ready: sub2.ready(),
  };
})(AllPasswords);
