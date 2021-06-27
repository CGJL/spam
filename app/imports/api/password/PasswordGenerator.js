/** Class that generates a random password */
class PasswordGenerator {
  constructor() {

  }

  /**
   *
   * @param {Number} min Minimum integer value (inclusive) to be generated.
   * @param {Number} max Maximum integer value (inclusive) to be generated.
   * @returns Any integer between min and max inclusive
   */
  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max) + 1;
    return Math.floor(Math.random() * (max - min) + min);
  }

  /**
   * Generates a random password to meet a specified length
   * @param {Number} length Maximum length of the random password
   */
  getRandomPassword(length) {
    length = Math.floor(length);
    const lowerAlphas = 'abcdefghijklmnopqrstuvwxyz';
    const upperAlphas = lowerAlphas.toUpperCase();
    const numbers = '1234567890';
    const symbols = '!@#$%^&*()=+-_[]{}<>/.,';

    const allowed = lowerAlphas + upperAlphas + numbers + symbols;
    const allowedLength = allowed.length;
    let pass = '';
    for (let i = 0; i < length; i++) {
      pass += allowed[this.getRandomInt(0, allowedLength - 1)];
    }
    return pass;
  }
}

export const PassGen = new PasswordGenerator();
