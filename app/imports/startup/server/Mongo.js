import { Meteor } from 'meteor/meteor';
import { Passwords } from '../../api/password/Password.js';
import { CryptoUtil } from '../../api/encryption/CryptoUtil';

/* eslint-disable no-console */

function addPasswordData(data) {
  console.log(`  Adding password: name=${data.name} owner=${data.username}`);
  Passwords.collection.insert(data);
}

if (Passwords.collection.find().count() === 0) {
  if (Meteor.settings.defaultData && Meteor.settings.defaultAccounts) {

    // Create key/value structure to store encryption keys for default accounts
    let passwordDict = {};
    Meteor.settings.defaultAccounts.forEach((user) =>
      passwordDict[user.email] = CryptoUtil.generateKey(user.password)
    )

    console.log('Creating default Password data.');

    Meteor.settings.defaultData[1].passwordData.map(data => {
      // Encrypt the default passwords if they belong to a known default account
      if (passwordDict[data.username]) {
        let plain = data.password;
        let encrypted = CryptoUtil.encryptPassword(plain, passwordDict[data.username]);
        data.password = encrypted;
      }
      addPasswordData(data)
    });
  }
}
