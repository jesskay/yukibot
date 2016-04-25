'use strict';

var request = require('request');
var cheerio = require('cheerio');
var imageboard = require('../lib/imageboard');

const ratingToTag = {
  'safe': 'rating:safe',
  'questionable': 'rating:questionable',
  'explicit': 'rating:explicit',
  's': 'rating:safe',
  'q': 'rating:questionable',
  'e': 'rating:explicit',
  '-safe': '-rating:safe',
  '-questionable': '-rating:questionable',
  '-explicit': '-rating:explicit',
  '-s': '-rating:safe',
  '-q': '-rating:questionable',
  '-e': '-rating:explicit',
  'lewd': '-rating:safe',
  'none': ''
};

function imageboardFetch(type, api, tags, prefix) {
  imageboard[type](tags, (err, pagelink, hotlink) => {
    if(err instanceof RangeError) {
      api.reply('Oops, too many tags. Try using less~');
    } else if(err instanceof imageboard.NotFoundError) {
      api.reply('Sorry, couldn\'t find anything. :<');
    } else if (err !== null) {
      api.reply('Something went very wrong! Try again later maybe? :<');
    } else {
      var result = [pagelink, hotlink];
      if(prefix !== undefined) {
        result.unshift(prefix);
      }

      api.reply(result.join('\n'));
    }
  });
}

exports.load = (registerCommand, registerHandler, moduleStorage) => {
  registerCommand('e621', [], 'raw', (api, argStr) => {
    var tags = argStr.split(/\s+/);
    imageboardFetch('e621', api, tags, 'Okay, I think I found something~');
  }, 'e621 <tags>: links a random image from the tag(s) provided.');

  registerCommand('gelbooru', ['gel'], 'raw', (api, argStr) => {
    var tags = argStr.split(/\s+/);
    imageboardFetch('gelbooru', api, tags, 'Okay, I think I found something~');
  }, 'gelbooru <tags>: links a random image from the tag(s) provided');

  registerCommand('imageboard-add', ['ibadd'], 'raw', (api, argStr) => {
    var args = argStr.split(' ');
    var info = {
      command: args[0],
      type: args[1],
      tags: args.slice(2)
    };

    if(!moduleStorage.exists(info.command)) {
      moduleStorage.setItem(info.command, info);
      api.reply('Created that shortcut, have fun~');
    }
  }, 'imageboard-add <command> <gelbooru|e621> <tags>: creates a shortcut for quick imageboard searches');

  registerCommand('imageboard-kill', ['ibkill'], 'raw', (api, argStr) => {
    if(!api.userIsAdmin) {
      api.reply('Nope!');
      return;
    }

    if(moduleStorage.exists(argStr)) {
      moduleStorage.removeItem(argStr);
      api.reply('Killed !' + argStr + ', it\'s dead jim!');
    } else {
      api.reply('Nothing to kill, oh noo~');
    }
  }, 'imageboard-kill <command>: removes an imageboard shortcut');

  registerHandler('message', (api, msgContent) => {
    if(msgContent.startsWith('!')) {
      var args = msgContent.slice(1).split(/\s+/);
      var tags = args[1] || 'safe';
      if(moduleStorage.exists(args[0])) {
        var info = moduleStorage.getItem(args[0]);
        var tags = [].concat(info.tags, [ratingToTag[tags.toLowerCase()] || 'rating:safe']);
        imageboardFetch(info.type, api, tags);
      }

      return false;
    }
  });
};
