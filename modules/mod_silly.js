'use strict';

const Module = require('../lib/Module');
const log = require('minilog')('silly');

class SillyModule extends Module {
  static get dependencies() {
    return ['messages'];
  }

  initialize(messages) {
    messages.addCommand('test', (message, args) => {
      message.reply(`Hello, ${message.member.displayName}!`);
    });
  }
}

module.exports = SillyModule;
