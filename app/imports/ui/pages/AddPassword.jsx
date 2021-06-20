import React from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import { Grid, Header, Loader, Segment } from 'semantic-ui-react';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';
import { AutoForm, ErrorsField, SubmitField, TextField } from 'uniforms-semantic';
import SimpleSchema from 'simpl-schema';
import swal from 'sweetalert';
import { Password } from '../../api/password/Password';
import bcrypt from 'bcryptjs';
import { CryptoUtil } from '../../api/encryption/CryptoUtil';
import { EncryptionKey } from '../../api/encryption/EncryptionKey';
import iroh from 'iroh';


const passwordValidIroh = () => {
  let code = `
    function passwordValid(password) {
      if (password !== null) {
        if (password.match(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,20}$/) === null) {
          return false;
        }
      }
      return true;
    }
    passwordValid(null);
    passwordValid('some non-null, invalid pwd...');
    passwordValid('Abc123!@#');
  `;
  let stage = new Iroh.Stage(code);
  stage.addListener(Iroh.FUNCTION).on('enter', function(e) {
    console.log("argument: " + e.arguments[0]);
  });
  stage.addListener(Iroh.FUNCTION).on('return', function(e) {
    console.log("return: " + e.return);
  });
  eval(stage.script);
}

const nameValid = (name, password) => {
  if (password !== null && name !== null) {
    if (password === name) {
      swal('Error', 'Password not added: The password\'s name must not be the same as the password.', 'error');
      return false;
    }
  }
  return true;
}

const urlValid = (url, password, existingPasswords) => {
  if (password !== null && url != null) {
    const existingMatches = existingPasswords.filter(existingPassword => url === existingPassword.url);
    if (password === url) {
      swal('Error', 'Password not added: The URL must not be the same as the password.', 'error');
      return false;
    } else if (existingMatches.length > 0) {
      swal('Error', 'Password not added: The URL cannot be the same as an existing URL.', 'error');
      return false;
    }
  }
  return true;
}

const passwordValid = (password, existingPasswords) => {
  //passwordValidIroh();
  if (password !== null) {
    const existingMatches = existingPasswords.filter(existingPassword =>
      password === Meteor.user().username || password === existingPassword.name || password === existingPassword.url);
    if (password.match(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,20}$/) === null) {
      swal('Error', 'Password not added: Password must be 8 - 20 characters long and have at least one uppercase letter, lowercase letter, number, and special character', 'error');
      return false;
    } else if (existingMatches.length > 0) {
      swal('Error', 'Password not added: Password cannot be the same as your username or an existing URL or password name.', 'error');
      return false;
    }
  }
  return true;
}

const confirmPasswordValid = (password, confirmPassword) => {
  if (password != null && confirmPassword != null) {
    if (password !== confirmPassword) {
      swal('Error', 'Password not added: \'Password\' and \'Confirm Password\' fields do not match.', 'error');
      return false;
    }
  }
  return true;
}

const formSchema = new SimpleSchema({
  password: {
    type: String,
    min: 8,
    max: 20
  },
  confirmPassword: {
    type: String,
    min: 8,
    max: 20
  },
  url: {
    type: String,
    min: 3,
    max: 2048
  },
  name: {
    type: String,
    required: false,
    max: 20
  }
});

formSchema.labels({
  password: 'Password',
  confirmPassword: 'Confirm Password',
  url: 'URL',
  name: 'Name for Password'
});

const bridge = new SimpleSchema2Bridge(formSchema);

class AddPassword extends React.Component {

  submit(data, formRef) {
    const { password, confirmPassword, url, name } = data;

    const dataValid = passwordValid(password, this.props.passwords) && confirmPasswordValid(confirmPassword) && urlValid(url, password, this.props.passwords) && nameValid(name, password);

    if (dataValid) {
      let encryptedPass = CryptoUtil.encryptPassword(password, EncryptionKey.findOne().key);
          Password.collection.insert({ password: encryptedPass, url: url, name: name ? name : url, date: new Date(), username: Meteor.user().username },
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
              <TextField type='password' name='password' placeholder='Password'/>
              <TextField type='password' name='confirmPassword' placeholder='Confirm Password'/>
              <TextField name='url' placeholder='URL'/>
              <TextField name='name' placeholder='Name for Password'/>
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
  ready: PropTypes.bool.isRequired
}

export default withTracker(() => {
  const subscription = Meteor.subscribe(Password.userPublicationName);
  const ready = subscription.ready();
  const passwords = Password.collection.find({}).fetch();
  return {
    passwords,
    ready
  };
})(AddPassword);
