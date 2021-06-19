import React from 'react';
import { Grid, Header, Segment } from 'semantic-ui-react';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';
import { AutoForm, ErrorsField, SubmitField, TextField } from 'uniforms-semantic';
import SimpleSchema from 'simpl-schema';
import swal from 'sweetalert';
import { Password } from '../../api/password/Password';
import bcrypt from 'bcryptjs';
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

const urlValid = (url, password) => {
  if (password !== null && url != null) {
    if (password === url) {
      swal('Error', 'Password not added: The URL must not be the same as the password.', 'error');
      return false;
    }
  }
  return true;
}

const passwordValid = (password) => {
  passwordValidIroh();
  if (password !== null) {
    if (password.match(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,20}$/) === null) {
      swal('Error', 'Password not added: Password must be 8 - 20 characters long and have at least one uppercase letter, lowercase letter, number, and special character', 'error');
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
    max: 20,
    custom() {
      return passwordValid(this.value);
    }
  },
  confirmPassword: {
    type: String,
    min: 8,
    max: 20,
    custom() {
      return confirmPasswordValid(this.value, this.field('password').value);
    }
  },
  url: {
    type: String,
    min: 3,
    max: 2048,
    custom() {
      return urlValid(this.value, this.field('password').value)
    }
  },
  name: {
    type: String,
    required: false,
    max: 20,
    custom() {
      return nameValid(this.value, this.field('password').value)
    }
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
    const { password, url, name } = data;

    const hasExistingMatch = Password.collection.find( { $where: () => {
        return this.username === username
          && (bcrypt.compare(password, this.password)
            || password === this.name
            || password === this.url
            || password === this.username);
      } } );

    if (hasExistingMatch.count() === 0) {
      bcrypt.hash(password, 10, (error, hash) => {
        if (error) {
          swal('Error', error.message, 'error');
        } else {
          Password.collection.insert({ password: hash, url: url, name: name, date: new Date(), username: Meteor.user().username },
            (error) => {
              if (error) {
                swal('Error', error.message, 'error');
              } else {
                swal('Success', 'Password added successfully', 'success');
                formRef.reset();
              }
            });
        }
      });
    } else {
      swal('Error', 'Password not added: Password cannot be the same as your username or an existing password, URL, or password name.', 'error');
    }
  }

  render() {
    let fRef = null;
    return (
      <Grid container centered>
        <Grid.Column>
          <Header as="h2" textAlign="center">Add Password</Header>
          <AutoForm ref={ref => { fRef = ref; }} schema={bridge} onSubmit={data => this.submit(data, fRef)} >
            <Segment>
              <TextField name='password' placeholder='Password'/>
              <TextField name='confirmPassword' placeholder='Confirm Password'/>
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

export default AddPassword;
