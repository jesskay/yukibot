'use strict';

const Module = require('../lib/Module');
const log = require('minilog')('silly');

class SillyModule extends Module {
  static get dependencies() {
    return ['messages'];
  }

  initialize(messages) {
    messages.addCommand('test', 'split', (message, args) => {
      message.reply(`Hello, ${message.member.displayName}!`);
    });

    messages.addCommand('test2', 'match', (message, mode, text) => {
      message.reply(`Hello, ${message.member.displayName}!\nMode: ${mode}\nText: ${text}`);
    }, /(add|del) (.*?)$/);
  }
}

module.exports = SillyModule;
