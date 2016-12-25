'use strict';

const Module = require('../lib/Module');

class MessagesModule extends Module {
  initialize(core) {
    core.on('message', this.onMessage.bind(this));
    this.commands = {};
  }

  addCommand(name, func) {
    this.commands[name] = func;
  }

  onMessage(message) {
    Object.keys(this.commands).forEach(command => {
      if(message.content.substr(0, command.length + 1) == `!${command}`) {
        let args = message.content.substr(command.length + 2).split(' ');
        this.commands[command](message, args);
      }
    });
  }
}

module.exports = MessagesModule;
