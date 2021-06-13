import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';

class PasswordsCollection {
  constructor() {
    this.name = 'Passwords';
    this.collection = new Mongo.Collection(this.name);
    this.schema = new SimpleSchema({
      password: String,
      url: String,
      date: Date,
      owner: String
    }, { tracker: Tracker });
    this.collection.attachSchema(this.schema);
  }
}

export const Passwords = new PasswordsCollection();
