import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import { Passwords } from '../../api/password/Password';

// alanning:roles publication
// Recommended code to publish roles for each user.
Meteor.publish(null, function () {
  if (this.userId) {
    return Meteor.roleAssignment.find({ 'user._id': this.userId });
  }
  return this.ready();
});

Meteor.publish(Passwords.userPublicationName, function () {
  if (this.userId) {
    const username = Meteor.users.findOne(this.userId).username;
    return Passwords.collection.find({ owner: username });
  }
  return this.ready();
});

Meteor.publish(Passwords.adminPublicationName, function () {
  if (this.userId && Roles.userIsInRole(this.userId, 'admin')) {
    return Passwords.collection.find();
  }
  return this.ready();
});
