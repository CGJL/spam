import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';

/** Define a local Mongo collection to hold the data. */
const EncryptionKey = new Mongo.Collection(null);

const EncryptionKeySchema = new SimpleSchema({
  key: String,
}, { tracker: Tracker });

EncryptionKey.attachSchema(EncryptionKeySchema);

/** Make the collection and schema available to other code. */
export { EncryptionKey };
