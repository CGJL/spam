import { Meteor } from 'meteor/meteor';
import { Passwords } from '../../api/password/Password.js';
import { CryptoUtil } from '../../api/encryption/CryptoUtil';

/* eslint-disable no-console */

function addPasswordData(data) {
  console.log(`  Adding password: name=${data.name} owner=${data.owner}`);
  Passwords.collection.insert(data);
}

if (Passwords.collection.find().count() === 0) {
  if (Meteor.settings.defaultPasswords && Meteor.settings.defaultAccounts) {

    // Create key/value structure to store encryption keys for default accounts
    const passwordDict = {};
    Meteor.settings.defaultAccounts.forEach((user) => {
      passwordDict[user.email] = CryptoUtil.generateKey(user.password);
    });

    console.log('Creating default Password data.');

    Meteor.settings.defaultPasswords.forEach((passwordData) => {
      const encryptedPasswordData = passwordData;
      // Encrypt the default passwords if they belong to a known default account
      if (passwordDict[passwordData.owner]) {
        const plain = passwordData.password;
        const encrypted = CryptoUtil.encryptPassword(plain, passwordDict[passwordData.owner]);
        encryptedPasswordData.password = encrypted;
      }
      addPasswordData(encryptedPasswordData);
    });
  }
}
