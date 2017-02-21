'use strict';

function randomChoice(choices) {
  return choices[Math.floor(Math.random() * choices.length)];
}

exports.load = (registerCommand, registerHandler, moduleStorage) => {
  registerCommand('roll', ['dice'], 'words', (api, args) => {
    var rolls = [];
    var bad_dice = [];

    var internalError = false;
    args.forEach(dice => {
      if(dice === "") {
        dice = "d6";
      }

      if(dice.match(/\bd?[1-9][0-9]*\b/)) {
        if(dice[0] === "d") {
          dice = dice.slice(1);
        }
        if(parseInt(dice) === 0) {
          dice = "6";
        }
        var sides = parseInt(dice);
        rolls.push([sides, Math.floor(Math.random() * parseInt(sides)) + 1]);
      } else {
        bad_dice.push(dice);
        internalError = true;
        return;
      }
    });

    if(internalError) {
      api.reply("Sorry, I didn't understand any of [" + bad_dice.map(d => "'" + d.toString() + "'").join(", ") + "], please use d<number> or <number>.");
      return;
    }

    api.reply('\n' + rolls.map(roll => {
      var sides = roll[0];
      var result = roll[1];
      
      return ("d" + sides.toString() + " :game_die:`" + result.toString() + "`")
    }).join('\n'));
  }, 'roll [<N>...]: Rolls one or more dice with N sides (default 6).');

  registerCommand('flip', ['coin'], 'raw', (api, argStr) => {
    var count = parseInt(argStr);
    if(isNaN(count)) {
      count = 1;
    }

    var flips = [];
    for(var i = 0; i < count; i++) {
      if(Math.random() >= 0.5) {
        flips.push('heads');
      } else {
        flips.push('tails');
      }
    }

    api.reply(flips.join(', '));
  }, 'flip [N]: Flips N coins (default 1).');

  registerCommand('choice', ['choose'], 'commas', (api, args) => {
    if(args.length <= 1) {
      api.reply('That\'s not even a choice, silly.');
    } else {
      api.reply(randomChoice(args));
    }
  }, 'choice <comma-separated options>: Choose between a number of different options.');
};
