import { Meteor } from 'meteor/meteor';
import { Stuffs } from '../../api/stuff/Stuff.js';
import { Passwords } from '../../api/password/Password.js';

/* eslint-disable no-console */

// Initialize the database with a default data document.
function addStuffData(data) {
  console.log(`  Adding: ${data.name} (${data.owner})`);
  Stuffs.collection.insert(data);
}

// Initialize the StuffsCollection if empty.
if (Stuffs.collection.find().count() === 0) {
  if (Meteor.settings.defaultData) {
    console.log('Creating default Stuffs data.');
    Meteor.settings.defaultData[0].stuffData.map(data => addStuffData(data));
  }
}

function addPasswordData(data) {
  console.log(`  Adding: ${data.name} (${data.owner})`);
  Passwords.collection.insert(data);
}

if (Passwords.collection.find().count() === 0) {
  if (Meteor.settings.defaultData) {
    console.log('Creating default Password data.');
    Meteor.settings.defaultData[1].passwordData.map(data => addPasswordData(data));
  }
}
