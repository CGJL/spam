import React from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import { Grid, Header, Loader, Segment, Button } from 'semantic-ui-react';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';
import { AutoForm, ErrorsField, SubmitField, TextField } from 'uniforms-semantic';
import swal from 'sweetalert';
// eslint-disable-next-line no-unused-vars
import iroh from 'iroh';
import { Passwords } from '../../api/password/Password';
import { CryptoUtil } from '../../api/encryption/CryptoUtil';
import { EncryptionKey } from '../../api/encryption/EncryptionKey';
import { PassGen } from '../../api/password/PasswordGenerator';

const passwordValidIroh = () => {
  const code = `
    function passwordValid(password, existingPasswords) {
      if (password !== null) {
        const existingMatches = existingPasswords 
        ? existingPasswords.filter(existingPassword =>
            existingPassword
            && (password === Meteor.user().username || password === existingPassword.name || password === existingPassword.url))
        : [];
        if (password.match(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,20}$/) === null) {
          return false;
        } else if (password.match(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,20}$/) === null) {
          return false;
        }
      }
      return true;
    }
    passwordValid(null, null);
    passwordValid('some non-null, invalid pwd...', null);
    passwordValid('Abc123!@#', null);
  `;
  const stage = new Iroh.Stage(code);
  stage.addListener(Iroh.FUNCTION).on('enter', function (e) {
    console.log(`argument1: ${e.arguments[0]}, argument2: ${e.arguments[1]}`);
  });
  stage.addListener(Iroh.FUNCTION).on('return', function (e) {
    console.log(`return: ${e.return}`);
  });
  console.log();
  // eslint-disable-next-line no-eval
  eval(stage.script);
};

const urlValidIroh = () => {
  const code = `
    function urlValid (url, password, existingPasswords) {
      if (password !== null && url != null) {
        const existingMatches = existingPasswords
          ? existingPasswords.filter(existingPassword => existingPassword && url === existingPassword.url)
          : [];
          console.log(existingMatches);
        if (password === url) {
          return false;
        } else if (existingMatches.length > 0) {
          return false;
        }
      }
      return true;
    }
    urlValid('url1', 'password1', [{ url: 'url1', password: 'password1' }, { url: 'anotherurl1', password: 'anotherpassword1' }]);
    urlValid('password1', 'password1', [{ url: 'url1', password: 'password1' }, { url: 'anotherurl1', password: 'anotherpassword1' }]);
    urlValid('url2', 'password2', []);
  `;
  const stage = new Iroh.Stage(code);
  stage.addListener(Iroh.FUNCTION).on('enter', function (e) {
    console.log(`argument1: ${e.arguments[0]}, argument2: ${e.arguments[1]}, argument3: ${e.arguments[2]}`);
  });
  stage.addListener(Iroh.FUNCTION).on('return', function (e) {
    console.log(`return: ${e.return}`);
  });
  console.log();
  // eslint-disable-next-line no-eval
  eval(stage.script);
};

const nameValid = (name, password) => {
  if (password !== null && name !== null) {
    if (password === name) {
      swal('Error', 'Password not added: The password\'s name must not be the same as the password.', 'error');
      return false;
    }
  }
  return true;
};

const urlValid = (url, password, existingPasswords) => {
  // urlValidIroh();
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

const usernameValid = (username, password) => {
  if (password !== null && username != null) {
    if (password === username) {
      swal('Error', 'Password not added: The username must not be the same as the password.', 'error');
      return false;
    }
  }
  return true;
};

const passwordValid = (password, existingPasswords) => {
  passwordValidIroh();
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

const confirmPasswordValid = (password, confirmPassword) => {
  if (password != null && confirmPassword != null) {
    if (password !== confirmPassword) {
      swal('Error', 'Password not added: \'Password\' and \'Confirm Password\' fields do not match.', 'error');
      return false;
    }
  }
  return true;
};

const bridge = new SimpleSchema2Bridge(Passwords.schema);

class AddPassword extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      passwordVisibility: 'password',
      confirmPasswordVisibility: 'password',
      visibilityToggleLabel: 'Un-hide Password',
    };
  }

  submit(data, formRef) {
    const { password, confirmPassword, url, name, username, description } = data;

    const dataValid = passwordValid(password, this.props.passwords)
      && confirmPasswordValid(confirmPassword)
      && urlValid(url, password, this.props.passwords)
      && nameValid(name, password)
      && usernameValid(username, password);

    if (dataValid) {
      const encryptedPass = CryptoUtil.encryptPassword(password, EncryptionKey.findOne().key);
      Passwords.collection.insert({
        password: encryptedPass,
        url: url,
        name: name || url,
        username: username,
        description: description,
        image: `${url}/favicon.ico`,
        owner: Meteor.user().username,
      },
      (error) => {
        if (error) {
          swal('Error', error.message, 'error');
        } else {
          swal('Success', 'Password added successfully', 'success');
          formRef.reset();
        }
      });
    }
  }

  handleToggleClick = (event) => {
    event.preventDefault();
    this.setState({ passwordVisibility: this.state.passwordVisibility === 'password' ? '' : 'password' });
    this.setState({ confirmPasswordVisibility: this.state.confirmPasswordVisibility === 'password' ? '' : 'password' });
    this.setState({ visibilityToggleLabel: this.state.passwordVisibility === 'password' ? 'Hide Password' : 'Un-hide Password' });
  };

  generatePassword = (event) => {
    event.preventDefault();
    let pass = PassGen.getRandomPassword(16);
    document.getElementById('password').value = pass;
    document.getElementById('confirmPassword').value = pass;
  };

  render() {
    return (this.props.ready) ? this.renderPage() : <Loader active>Getting data</Loader>;
  }

  renderPage() {
    let fRef = null;

    return (
      <Grid container centered>
        <Grid.Column>
          <Header as="h2" textAlign="center">Add Password</Header>
          <AutoForm ref={ref => { fRef = ref; }} schema={bridge} onSubmit={data => this.submit(data, fRef)} >
            <Segment>
              <Button size='small' floated='right' toggle onClick={this.handleToggleClick} content={this.state.visibilityToggleLabel}/>
              <Button size='small' floated='right' onClick={this.generatePassword}>Generate Password</Button>
              <br/>
              <TextField name='username' placeholder='Username'/>
              <TextField type={this.state.passwordVisibility} name='password' placeholder='Password'/>
              <TextField type={this.state.confirmPasswordVisibility} name='confirmPassword' placeholder='Confirm Password'/>
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

AddPassword.propTypes = {
  passwords: PropTypes.array.isRequired,
  ready: PropTypes.bool.isRequired,
};

export default withTracker(() => {
  const subscription = Meteor.subscribe(Passwords.userPublicationName);
  const ready = subscription.ready();
  const passwords = Passwords.collection.find({}).fetch();
  return {
    passwords,
    ready,
  };
})(AddPassword);
