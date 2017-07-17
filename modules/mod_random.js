'use strict';

const Module = require('../lib/Module');
const log = require('minilog')('random');
const roll = new (require('roll'))();

class RandomModule extends Module {
  static get dependencies() {
    return ['messages', 'help'];
  }

  initialize(messages, help) {
    messages.addCommand('choice', 'split', (message, args) => {
      let index = Math.floor(Math.random() * args.length);
      message.reply(args[index]);
    }, /,\s?/g);
    messages.addAlias('choice', 'choose');
    help.addEntry('choice', 'Randomly picks between multiple choices.', ['choice <option 1>, <option 2>, ...<option N>']);

    messages.addCommand('dice', 'text', (message, text) => {
      if(!roll.validate(text)) {
        return message.reply(`\`${text}\` is not valid dice notation!`);
      }

      let dice = roll.roll(text);
      message.reply(`:game_die:${dice.result}`);
    });
    messages.addAlias('dice', 'roll');
    help.addEntry('dice', 'Rolls dice according to d20 format.', ['dice <dice string>']);

    messages.addCommand('coin', 'text', (message, text) => {
      message.reply(Math.random() < 0.5 ? 'it\'s heads!' : 'it\'s tails!');
    });
    messages.addAlias('coin', 'flip');
    help.addEntry('coin', 'Flips a coin.', ['coin']);

  }
}

module.exports = RandomModule;
