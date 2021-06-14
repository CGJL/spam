import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';
import { string } from 'prop-types';

/* Encapsulates state and variable values for stuff. */
class PasswordCollection {
  constructor() {

    /* Name of this collection. */
    this.name = 'PasswordCollection';

    /* Defining Mongo Collection */
    this.collection = new Mongo.Collection(this.name);

    /* Defining the structure of each document in the collection */
    this.schema = new SimpleSchema({
      image: {
        type: String,
        defaultValue: 'https://react.semantic-ui.com/images/wireframe/image.png',
      },
      url: {
        type: String,
        defaultValue: 'None',
      },
      username: {
        type: String,
        defaultValue: 'None',
      },
      password: {
        type: String,
        defaultValue: 'None',
      },
      description: {
        type: String,
        defaultValue: '',
      }, {tracker: Tracker});

      /*Attach schema to collection
      so all items inserted to document is checked against schema. */
      this.collection.attachSchema(this.schema);

      /*Still need to define names for publications and subscriptions.
      i.e. this.userPublicationName = `${this.name}.publication.user`; */


  }
}

/** 
 *  Instance of type collection. 
 * @type {StuffsColleciton}
 */

export const Password = new PasswordCollection();