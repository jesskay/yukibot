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
    this.parsers = {};

    this.addParser('split', (args, _, splitter) => [args.split(splitter || ' ')]);
    this.addParser('text', args => [args]);
    this.addParser('match', (args, _, pattern) => args.match(pattern).slice(1));
  }

  addCommand(name, parser, func, ...options) {
    assert(!this.commands[name], `adding a command that already exists: ${name}`);
    assert.equal(typeof this.parsers[parser], 'function',
     `adding a command with unknown argument parser: ${name}, ${parser}`);
    this.commands[name] = {
      parser,
      func,
      options
    };
  }

  addAlias(name, ...aliases) {
    assert(this.commands[name], `adding an alias for non-existing command: ${name}`);
    aliases.forEach(alias => {
      this.aliases[alias] = name;
    });
  }

  addParser(name, func) {
    assert(typeof this.parsers[name] == 'undefined', `adding an argument parser that already exists: ${name}`);
    this.parsers[name] = func;
  }

  onMessage(message) {
    const prefix = this.core.prefix;
    if(message.content.substr(0, prefix.length) != prefix)
      return; // Break early if no prefix on message

    let parts = message.content.substr(prefix.length).split(' ');
    let command = parts[0];
    let args = parts.slice(1).join(' ');

    if(this.aliases[command] !== undefined) command = this.aliases[command];
    if(this.commands[command] == undefined)
      return; // Break if unknown command

    if(!(args = this._parseArguments(command, args, message)))
      return; // Break if arg parsing fails

    this.commands[command].func(message, ...args);
  }

  getAliases(command) {
    if(this.aliases[command] !== undefined) command = this.aliases[command];
    if(this.commands[command] == undefined) return [];

    return Object.keys(this.aliases).filter(alias => this.aliases[alias] == command);
  }

  _parseArguments(name, args, message) {
    assert(this.commands[name], `attempted to parse unknown command ${name}`);
    const command = this.commands[name];
    return this.parsers[command.parser](args, message, ...command.options);
  }
}

module.exports = MessagesModule;
