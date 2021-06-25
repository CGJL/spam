import React from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Container, Header, Card, Loader, Grid, Input } from 'semantic-ui-react';
import Proptypes from 'prop-types';
import { Passwords } from '../../api/password/Password';
import PasswordItem from '../components/PasswordItem';

/* Render Password Collection into a set of cards */
class AllPasswords extends React.Component {

  state = {
    searchInput: ''
  };

  setSearchValue(event) {
    this.setState({ searchInput: event.target.value });
  }

  filterPasswords() {
    return this.props.passwords.filter((password) => 
      password.name.toLowerCase().indexOf(this.state.searchInput.toLowerCase()) !== -1 ||
      password.url.toLowerCase().indexOf(this.state.searchInput.toLowerCase()) !== -1
    );
  }

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
        <Grid>
          <Grid.Row>
            <Grid.Column>
              <Header as="h1" textAlign="center" style={{ paddingTop: '40px', paddingBottom: '30px' }}>All Passwords</Header>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <Input
                type='text'
                value={this.state.searchInput}
                fluid
                size='large'
                onChange={this.setSearchValue.bind(this)}
                placeholder='Search for a password'
                action={{ icon: 'search' }}
                style ={{ paddingBottom: '15px' }}
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <Card.Group centered style={{ paddingBottom: '40px' }}>
          {this.filterPasswords().map((passwords, index) => <PasswordItem key={index} password={passwords}/>)}
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

  // ensuring minimongo is populated with all collections prior to running render()
  const sub2 = Meteor.subscribe(Passwords.userPublicationName);

  return {
    passwords: Passwords.collection.find({}).fetch(),
    ready: sub2.ready(),
  };
})(AllPasswords);
