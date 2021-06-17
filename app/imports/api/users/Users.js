import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';

/** Define a Mongo collection to hold the data. */
const Users = new Mongo.Collection('Users');

const UsersSchema = new SimpleSchema({
	// The email the user uses to login
	email: {
		type: String
	},
	// The hash of the user's password
	password: {
		type: String
	},
	// Time of last login
	lastLogin: {
		type: Date
	}
}, { tracker: Tracker });

/** Attach this schema to the collection. */
Users.attachSchema(UsersSchema);

/** Make the collection and schema available to other code. */
export { Users, UsersSchema };
