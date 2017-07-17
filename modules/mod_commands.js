// jscs:disable disallowArrayDestructuringReturn
'use strict';

const Module = require('../lib/Module');
const log = require('minilog')('commands');

class CommandsModule extends Module {
  static get dependencies() {
    return ['messages', 'help', 'database'];
  }

  initialize(messages, help, database) {
    this.db = database;
    this.core.on('message', this.onMessage.bind(this));

    // TODO use match arg parser
    messages.addCommand('command', 'split', (message, args) => {
      let collection = this.db.collection('commands', message.guild.id);
      let subcommand = args.shift();
      switch(subcommand) {
        case 'add':
          let command = args.shift();
          let response = args.join(' ');

          collection.insert({ command, response }).then(() => {
            message.reply('added!');
          });
          break;
        case 'delete':
        case 'del':
          // TODO
          break;
      }
    });
    help.addEntry('command', 'Manipulate per-server commands.', ['command add <command> <response>']);
    messages.addAlias('command', 'cmd');
  }

  onMessage(message) {
    log.debug(message.content, this.core.prefix);
    if(message.content.substr(0, this.core.prefix.length) != this.core.prefix)
      return true;

    let command = message.content.substr(this.core.prefix.length).split(' ')[0];
    let collection = this.db.collection('commands', message.guild.id);
    log.debug('searching for cmd in mongodb');
    collection.findOne({ command }, (err, doc) => {
      log.debug(doc);
      if(err || !doc) return;
      message.channel.sendMessage(doc.response);
    });
  }
}

module.exports = CommandsModule;
