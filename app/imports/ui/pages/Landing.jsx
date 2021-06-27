import React from 'react';
import { Grid, Image, Button } from 'semantic-ui-react';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import { withRouter, NavLink } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';

/** A simple static component to render some text for the landing page. */
class Landing extends React.Component {
  render() {
    return (
      <Grid id='landing-page' verticalAlign='middle' textAlign='center' container>

        <Grid.Column width={4}>
          <Image size='small' src="/images/spam-landing-lock.png"/>
        </Grid.Column>

        <Grid.Column width={10}>
          <h1>Welcome to Simple Password Account Manager (SPAM)</h1>
          <p>Store and track your passwords in one place.</p>
        </Grid.Column>

        <Grid.Column width={14}>
          {
            this.props.currentUser
              ? ([
                <Button key='add' as={NavLink} activeClassName="" exact to="/add">Add Password</Button>,
                <Button key='view' as={NavLink} activeClassName="" exact to="/all-passwords">View Passwords</Button>,
              ])
              : ([
                <Button key='login' as={NavLink} activeClassName="" exact to="/signin">Login</Button>,
                <Button key='register' as={NavLink} activeClassName="" exact to="/signup">Register</Button>,
              ])
          }
        </Grid.Column>

      </Grid>
    );
  }
}

Landing.propTypes = {
  currentUser: PropTypes.string,
};

const LandingPage = withTracker(() => ({
  currentUser: Meteor.user() ? Meteor.user().username : '',
}))(Landing);

export default withRouter(LandingPage);
