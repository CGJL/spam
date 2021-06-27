import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';

/* Encapsulates state and variable values for stuff. */
class PasswordCollection {
  constructor() {

    /* Name of this collection. */
    this.name = 'PasswordCollection';

    /* Defining Mongo Collection */
    this.collection = new Mongo.Collection(this.name);

    /* Defining the structure of each document in the collection */
    this.schema = new SimpleSchema({
      owner: {
        type: String,
        required: false,
      },
      image: {
        type: String,
        defaultValue: 'https://react.semantic-ui.com/images/wireframe/image.png',
      },
      url: {
        type: String,
        min: 3,
        max: 2048,
      },
      username: {
        type: String,
        max: 20,
      },
      password: {
        type: String,
      },
      confirmPassword: {
        type: String,
        required: false,
      },
      name: {
        type: String,
        required: false,
        max: 20,
      },
      date: {
        type: Date,
        defaultValue: new Date(),
      },
      description: {
        type: String,
        required: false,
        defaultValue: '',
        max: 250,
      },
    }, { tracker: Tracker });

    this.schema.labels({
      password: 'Password',
      confirmPassword: 'Confirm Password',
      username: 'Username',
      url: 'URL',
      name: 'Name for Password',
      description: 'Description for Password',
    });

    /* Attach schema to collection
    so all items inserted to document is checked against schema. */
    this.collection.attachSchema(this.schema);

    /* Still need to define names for publications and subscriptions.
    i.e. this.userPublicationName = `${this.name}.publication.user`; */
    this.userPublicationName = `${this.name}.publication.user`;
    this.adminPublicationName = `${this.name}.publication.admin`;
  }
}

/**
 *  Instance of type collection.
 * @type {PasswordsCollection}
 */

export const Passwords = new PasswordCollection();
