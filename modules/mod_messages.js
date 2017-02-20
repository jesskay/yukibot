// jscs:disable disallowArrayDestructuringReturn
'use strict';

const Module = require('../lib/Module');
const assert = require('assert');
const log = require('minilog')('messages');

class MessagesModule extends Module {
  initialize() {
    this.core.on('message', this.onMessage.bind(this));
    this.commands = {};
    this.aliases = {};
  }

  addCommand(name, func) {
    this.commands[name] = func;
  }

  addAlias(name, ...aliases) {
    assert(typeof this.commands[name] == 'function', `adding an alias for non-existing command ${name}`);
    aliases.forEach(alias => {
      this.aliases[alias] = name;
    });
  }

  onMessage(message) {
    if(message.content.substr(0, this.core.prefix.length) == this.core.prefix) {
      let [command, ...args] = message.content.substr(this.core.prefix.length).split(' ');
      if(this.aliases[command] !== undefined) command = this.aliases[command];
      if(this.commands[command] !== undefined) {
        return this.commands[command](message, args);
      }
    }
  }
}

module.exports = MessagesModule;
