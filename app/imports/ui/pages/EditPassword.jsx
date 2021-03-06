import React from 'react';
import { Grid, Loader, Header, Segment, Button } from 'semantic-ui-react';
import swal from 'sweetalert';
import { AutoForm, ErrorsField, SubmitField, TextField } from 'uniforms-semantic';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';
import { Passwords } from '../../api/password/Password';
import { EncryptionKey } from '../../api/encryption/EncryptionKey';
import { CryptoUtil } from '../../api/encryption/CryptoUtil';
import FaviconPreview from '../components/FaviconPreview';

const bridge = new SimpleSchema2Bridge(Passwords.schema);

const passwordValid = function (password, existingPasswords) {
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
};

const urlValid = function (url, password, existingPasswords) {
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
};

const nameValid = function (name, password) {
  if (password !== null && name !== null) {
    if (password === name) {
      swal('Error', 'Password not added: The password\'s name must not be the same as the password.', 'error');
      return false;
    }
  }
  return true;
};

const usernameValid = (username, password) => {
  if (password !== null && username != null) {
    if (password === username) {
      swal('Error', 'Password not added: The username must not be the same as the password.', 'error');
      return false;
    }
  }
  return true;
};

/** Renders the Page for editing a single document. */
class EditPassword extends React.Component {

  // On successful submit, insert the data.
  submit(data) {
    const { password, url, name, username, description, _id } = data;
    const dataValid = passwordValid(password, this.props.passwords)
      && nameValid(name, password)
      && urlValid(url, password, this.props.passwords)
      && usernameValid(username, password);
    const encryptedPass = CryptoUtil.encryptPassword(password, EncryptionKey.findOne().key);
    if (dataValid) {
      const image = `${url}/favicon.ico`;
      Passwords.collection.update(_id, { $set: { password: encryptedPass, url, name: name || url, username, description, image } }, (error) => (error ?
        swal('Error', error.message, 'error') :
        swal('Success', 'Password updated successfully', 'success')));
    }
  }

  handleToggleClick = (event) => {
    event.preventDefault();
    // eslint-disable-next-line no-undef
    const passwordVisibility = document.getElementById('password').getAttribute('type');
    // eslint-disable-next-line no-undef
    document.getElementById('password').setAttribute('type', passwordVisibility === 'password' ? '' : 'password');
    // eslint-disable-next-line no-undef
    document.getElementById('visibilityToggle').innerText = passwordVisibility === 'password' ? 'Hide Password' : 'Un-hide Password';
  };

  // If the subscription(s) have been received, render the page, otherwise show a loading icon.
  render() {
    if (this.props.ready && this.props.encryptionKey) {
      this.props.doc.password = CryptoUtil.decryptPassword(this.props.doc.password, this.props.encryptionKey);
      return this.renderPage();
    }
    return <Loader active>Getting data</Loader>;

  }

  // Render the form. Use Uniforms: https://github.com/vazco/uniforms
  renderPage() {
    return (
      <Grid container centered>
        <Grid.Column>
          <Header as="h2" textAlign="center">Edit Password</Header>
          <FaviconPreview url={this.props.doc.url}/>
          <AutoForm schema={bridge} onSubmit={data => this.submit(data)} model={this.props.doc}>
            <Segment>
              <Button id='visibilityToggle' size='small' floated='right' toggle onClick={this.handleToggleClick}>Un-hide Password</Button>
              <br/>
              <TextField name='username' placeholder='Username'/>
              <TextField id='password' type='password' name='password' placeholder='Password'/>
              <TextField name='url' placeholder='URL'/>
              <TextField name='name' placeholder='Name for Password'/>
              <TextField name='description' placeholder='Description for Password'/>
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
  passwords: PropTypes.array,
  model: PropTypes.object,
  ready: PropTypes.bool.isRequired,
  encryptionKey: PropTypes.string,
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
  const passwords = Passwords.collection.find({}).fetch().filter(password => password._id !== documentId);
  const encryptionKey = EncryptionKey.findOne({}).key;
  return {
    doc,
    passwords,
    ready,
    encryptionKey,
  };
})(EditPassword);
