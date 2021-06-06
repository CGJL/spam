import React from 'react';
import { Grid, Header, Segment } from 'semantic-ui-react';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';
import { AutoForm, ErrorsField, SubmitField, TextField } from 'uniforms-semantic';
import SimpleSchema from 'simpl-schema';

const formSchema = new SimpleSchema({
  password: String,
  confirmPassword: String,
  url: String,
  name: String,
  required: [
    'password',
    'confirmPassword',
    'url',
  ],
});

const bridge = new SimpleSchema2Bridge(formSchema);

class AddPassword extends React.Component {
/*  // On submit, insert the data.
  submit(data, formRef) {
    const { password, comfirmPassword, url, name } = data;
    const owner = Meteor.user().username;
    // TODO: Add password to Database
  } */

  render() {
    let fRef = null;
    return (
      <Grid container centered>
        <Grid.Column>
          <Header as="h2" textAlign="center">Add Password</Header>
          <AutoForm ref={ref => { fRef = ref; }} schema={bridge} onSubmit={data => this.submit(data, fRef)} >
            <Segment>
              <TextField name='password'/>
              <TextField name='confirmPassword'/>
              <TextField name='url'/>
              <TextField name='name'/>
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
