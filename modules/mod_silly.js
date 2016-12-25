'use strict';

const Module = require('../lib/Module');

class SillyModule extends Module {
  constructor() {
    super('messages');
  }

  initialize(messages) {
    messages.addCommand('test', (message, args) => {
      message.reply(`Hello, ${message.member.displayName}!`);
    });
  }
}

module.exports = SillyModule;
