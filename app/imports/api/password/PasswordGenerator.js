/** Class that generates a random password */
class PasswordGenerator {

  /**
   *
   * @param {Number} min Minimum integer value (inclusive) to be generated.
   * @param {Number} max Maximum integer value (inclusive) to be generated.
   * @returns Any integer between min and max inclusive
   */
  getRandomInt(min, max) {
    const roundedMin = Math.ceil(min);
    const roundedMax = Math.floor(max) + 1;
    return Math.floor(Math.random() * (roundedMax - roundedMin) + roundedMin);
  }

  /**
   * Generates a random password to meet a specified length
   * @param {Number} length Maximum length of the random password
   */
  getRandomPassword(length) {
    const roundedLength = Math.floor(length);
    const lowerAlphas = 'abcdefghijklmnopqrstuvwxyz';
    const upperAlphas = lowerAlphas.toUpperCase();
    const numbers = '1234567890';
    const symbols = '!@#$%^&*()=+-_[]{}<>/.,';

    const allowed = lowerAlphas + upperAlphas + numbers + symbols;
    const allowedLength = allowed.length;
    let pass = '';
    for (let i = 0; i < roundedLength; i++) {
      pass += allowed[this.getRandomInt(0, allowedLength - 1)];
    }
    return pass;
  }
}

export const PassGen = new PasswordGenerator();
