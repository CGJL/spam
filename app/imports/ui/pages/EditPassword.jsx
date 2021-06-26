import React from 'react';
import { Grid, Loader, Header, Segment, Image } from 'semantic-ui-react';
import swal from 'sweetalert';
import { AutoForm, ErrorsField, HiddenField, SubmitField, TextField } from 'uniforms-semantic';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';
import { Passwords } from '../../api/password/Password';
import { EncryptionKey } from '../../api/encryption/EncryptionKey';
import { CryptoUtil } from '../../api/encryption/CryptoUtil';

const bridge = new SimpleSchema2Bridge(Passwords.schema);

const passwordValid = function(password, existingPasswords) {
  if (password !== null) {
      const existingMatches = existingPasswords
      ? existingPasswords.filter(existingPassword => existingPassword
          && (password === Meteor.user().username || password === existingPassword.name || password === existingPassword.url))
      : [];
      if (password.match(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,20}$/) === null) {
      swal('Error', 'Password not added: Password must be 8 - 20 characters long and have at least one uppercase letter, lowercase letter, number, and special character', 'error');
      return false;
      } if (existingMatches.length > 0) {
      swal('Error', 'Password not added: Password cannot be the same as your username or an existing URL or password name.', 'error');
      return false;
      }
  }
  return true;
}

const urlValid = function(url, password, existingPasswords) {
  if (password !== null && url != null) {
      const existingMatches = existingPasswords
      ? existingPasswords.filter(existingPassword => existingPassword && url === existingPassword.url)
      : [];
      if (password === url) {
          swal('Error', 'Password not added: The URL must not be the same as the password.', 'error');
          return false;
      } if (existingMatches.length > 0) {
          swal('Error', 'Password not added: The URL cannot be the same as an existing URL.', 'error');
          return false;
      }
  }
  return true;
}

const nameValid = function(name, password) {
  if (password !== null && name !== null) {
      if (password === name) {
          swal('Error', 'Password not added: The password\'s name must not be the same as the password.', 'error');
          return false;
      }
  }
  return true;
}

/** Renders the Page for editing a single document. */
class EditPassword extends React.Component {
  // On successful submit, insert the data.
  submit(data) {
    const { password, url, name, _id } = data;
    const dataValid = passwordValid(password, this.props.passwords) && urlValid(url, password, this.props.passwords) && nameValid(name, password);
    if (dataValid) {
      const image = `${url}/favicon.ico`;
      Passwords.collection.update(_id, { $set: { password, url, name, image } }, (error) => (error ?
        swal('Error', error.message, 'error') :
        swal('Success', 'Password updated successfully', 'success')));
    }
  }

  // If the subscription(s) have been received, render the page, otherwise show a loading icon.
  render() {
    if (this.props.ready && this.props.encryptionKey) {
      CryptoUtil.decryptPassword(this.props.doc.password, this.props.encryptionKey);
      return this.renderPage();
    } else {
      return <Loader active>Getting data</Loader>;
    }
  }

  // Render the form. Use Uniforms: https://github.com/vazco/uniforms
  renderPage() {
    return (
      <Grid container centered>
        <Grid.Column>
          <Header as="h2" textAlign="center">Edit Password</Header>
          <Image src={this.props.doc.image} style={{ paddingBottom: "15px" }} size='small' centered/>
          <AutoForm schema={bridge} onSubmit={data => this.submit(data)} model={this.props.doc}>
            <Segment>
              <TextField name="username"/>
              <TextField name='password'/>
              <TextField name='name'/>
              <TextField name='url'/>
              <TextField name='description'/>
              <SubmitField value='Submit'/>
              <ErrorsField/>
            </Segment>
          </AutoForm>
        </Grid.Column>
      </Grid>
    );
  }
}

// Require the presence of a Stuff document in the props object. Uniforms adds 'model' to the props, which we use.
EditPassword.propTypes = {
  doc: PropTypes.object,
  model: PropTypes.object,
  ready: PropTypes.bool.isRequired,
};

// withTracker connects Meteor data to React components. https://guide.meteor.com/react.html#using-withTracker
export default withTracker(({ match }) => {
  // TODO: Add database integration
  // Get the documentID from the URL field. See imports/ui/layouts/App.jsx for the route containing :_id.
  const documentId = match.params._id;
  const subscription = Meteor.subscribe(Passwords.userPublicationName);
  // Determine if the subscription is ready
  const ready = subscription.ready();
  // Get the document
  const doc = Passwords.collection.findOne(documentId);
  const passwords = Passwords.collection.find({}).fetch();
  const encryptionKey = EncryptionKey.findOne({}).key;
  return {
    doc,
    passwords,
    ready,
    encryptionKey
  };
})(EditPassword);
