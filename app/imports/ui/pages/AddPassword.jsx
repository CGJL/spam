import React from 'react';
import { Grid, Header, Segment } from 'semantic-ui-react';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';
import { AutoForm, ErrorsField, SubmitField, TextField } from 'uniforms-semantic';
import SimpleSchema from 'simpl-schema';
import swal from 'sweetalert';
import { Passwords } from '../../api/password/Password';
import bcrypt from 'bcryptjs';

const nameValidate = (name, password) => {
  if (password && name && password === name) {
    swal('Error', 'Password not added: The password\'s name must not be the same as the password.', 'error');
  }
  return password === name;
}

const urlValidate = (url, password) => {
  if (password && url && password === url) {
    swal('Error', 'Password not added: The URL must not be the same as the password.', 'error');
  }
  return password === url;
}

const passwordValidate = (password) => {
  if (password && password !== "^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$") {
    swal('Error', 'Password not added: Password must be 8 - 20 characters long and have at least one uppercase letter, lowercase letter, number, and special character', 'error');
  }
  return password !== "^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$";
}

const confirmPasswordValidate = (password, confirmPassword) => {
  if (password && confirmPassword && password !== confirmPassword) {
    swal('Error', 'Password not added: \'Password\' and \'Confirm Password\' fields do not match.', 'error');
  }
  return password !== confirmPassword;
}

const formSchema = new SimpleSchema({
  password: {
    type: String,
    min: 8,
    max: 20,
    custom() {
      return passwordValidate(this.value);
    }
  },
  confirmPassword: {
    type: String,
    min: 8,
    max: 20,
    custom() {
      return confirmPasswordValidate(this.value, this.field('password').value);
    }
  },
  url: {
    type: String,
    min: 3,
    max: 2048,
    custom() {
      return urlValidate(this.value, this.field('password').value)
    }
  },
  name: {
    type: String,
    required: false,
    max: 20,
    custom() {
      return nameValidate(this.value, this.field('password').value)
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

// columns for Password table in database: password, url, name, date, owner
class AddPassword extends React.Component {

  hashPassword(newPassword, owner) {
    // TODO: compare with columns in other tables like Users
    const hasExistingMatch = Passwords.collection.find( { $where: () => {
      return this.owner === owner && (bcrypt.compare(newPassword, this.password)
          || newPassword === this.name
          || newPassword === this.url
          || newPassword === this.owner);
    } } );
    if (hasExistingMatch) {
      swal('Error', 'Password not added: Password cannot be the same as your name or an existing password, URL, or name.', 'error');
      return null;
    } else {
      return bcrypt.hash(newPassword, 10, (error, hash) => {
        if (error) {
          swal('Error', error.message, 'error');
        }
        return hash;
      });
    }
  }

  submit(data, formRef) {
    const { password, url, name } = data;
    const hash = this.hashPassword(password);
    if (hash) {
      Passwords.collection.insert({ password: hash, url: url, name: name, date: new Date(), owner: Meteor.user().username },
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
