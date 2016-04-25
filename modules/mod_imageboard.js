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
  'lewd': '-rating:safe'
};

function createPresetLookup(presetTags) {
  presetTags = presetTags.split(/\s+/);
  return (api, args) => {
    var tags = [].concat(presetTags, [ratingToTag[args[0].toLowerCase()] || 'rating:safe']);
    imageboard.gelbooru(tags, (err, pagelink, hotlink) => {
      if(err instanceof imageboard.NotFoundError) {
        api.reply('Sorry, couldn\'t find anything. :<');
      } else if (err !== null) {
        api.reply('Something went very wrong! Try again later maybe? :<');
      } else {
        api.reply([
          pagelink,
          hotlink
        ].join('\n'));
      }
    });
  };
}

exports.load = (registerCommand, registerHandler, moduleStorage) => {
  registerCommand('e621', [], 'raw', (api, argStr) => {
    var tags = argStr.split(/\s+/);
    imageboard.e621(tags, (err, pagelink, hotlink) => {
      if(err instanceof RangeError) {
        api.reply('Oops, too many tags. You can only use 5!');
      } else if(err instanceof imageboard.NotFoundError) {
        api.reply('Sorry, couldn\'t find anything. :<');
      } else if (err !== null) {
        api.reply('Something went very wrong! Try again later maybe? :<');
      } else {
        api.reply([
          'Okay, I think I found something~',
          pagelink,
          hotlink
        ].join('\n'));
      }
    });
  }, 'e621 <tags>: links a random image from the tag(s) provided.');

  registerCommand('gelbooru', ['gel'], 'raw', (api, argStr) => {
    var tags = argStr.split(/\s+/);
    imageboard.gelbooru(tags, (err, pagelink, hotlink) => {
      if(err instanceof imageboard.NotFoundError) {
        api.reply('Sorry, couldn\'t find anything. :<');
      } else if (err !== null) {
        api.reply('Something went very wrong! Try again later maybe? :<');
      } else {
        api.reply([
          'Okay, I think I found something~',
          pagelink,
          hotlink
        ].join('\n'));
      }
    });
  }, 'gelbooru <tags>: links a random image from the tag(s) provided');

  registerCommand('am', [], 'words',
    createPresetLookup('fox_ears fox_tail -spread_anus -huge_breasts -gigantic_breasts -gore -scat score:>50'),
    'am: links a random safe (usually, tagging is hard) foxie from gelbooru'
  );

  registerCommand('riley', [], 'words',
    createPresetLookup('akane_(naomi)'),
    'riley: links a random safe (usually, tagging is hard) Akane from gelbooru'
  );
};
