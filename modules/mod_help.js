'use strict';

const Module = require('../lib/Module');
const log = require('minilog')('help');

class HelpModule extends Module {
  static get dependencies() {
    return ['messages'];
  }

  initialize(messages) {
    this.entries = {};

    const prefix = this.core.prefix;
    messages.addCommand('help', 'text', (message, text) => {
      if(text.substr(0, prefix.length) == prefix) {
        text = text.substr(prefix.length);
      }

      let command = text;
      if(messages.aliases[command] !== undefined) command = messages.aliases[command];
      if(this.entries[command] == undefined) {
        let commands = Object.keys(messages.commands).map(cmd => {
          let aliases = messages.getAliases(cmd)
            .map(alias => `${this.core.prefix}${alias}`)
            .join(", ");

          if(aliases.length > 0) {
            return `${this.core.prefix}${cmd} (or: ${aliases})`;
          }

          return `${this.core.prefix}${cmd}`;
        });
        message.reply(`\nI know the following commands:\n\`\`\`\n${commands.join('\n')}\`\`\``);
      } else {
        let aliases = messages.getAliases(command)
          .map(alias => `${this.core.prefix}${alias}`)
          .join(", ");
        message.reply(`\n**${this.core.prefix}${command}** (aliases: ${aliases})\n${this.entries[command]}`);
      }
    });
    messages.addAlias('help', '?');

    this.addEntry('help', 'Displays help information.', ['help', 'help <command>'])
  }

  addEntry(command, description, usages) {
    let prefixified = usages.map(usage => `  ${this.core.prefix}${usage}`).join('\n');
    this.entries[command] = `${description}\n\nUsage:\n${prefixified}`;
  }
}

module.exports = HelpModule;
