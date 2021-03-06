'use strict';

exports.load = (registerCommand, registerHandler, moduleStorage) => {
  var commandsRegex = /^(show|add|list|indexes|kill)\s+([^\s]*)(?:\s([^]*))?/i;

  var retrieveEntry = (entryType, api, argStr, quietMode) => {
    if(argStr.match(commandsRegex) === null) {
      argStr = 'show ' + argStr;
    }

    var rawParsedCmd = argStr.match(commandsRegex);
    var parsedCmd = {
      cmdName: rawParsedCmd[1],
      entryName: rawParsedCmd[2],
      content: rawParsedCmd[3] || ''
    };

    var hops = 0;
    while(moduleStorage.exists(entryType + '-alias/' + parsedCmd.entryName.toLowerCase())) {
      parsedCmd.entryName = moduleStorage.getItem(entryType + '-alias/' + parsedCmd.entryName.toLowerCase());
      hops = hops + 1;
      if(hops == 10) {
        api.reply('TOO MUCH RECURSION, FUCK YOU!');
        break;
      }
    }

    var quotedUser = null;

    if(entryType === 'quote') { // 1nasty special case
      quotedUser = api.resolveUserMention(parsedCmd.entryName);
      parsedCmd.entryName = quotedUser.idOrFallback;
    }

    parsedCmd.entryKey = entryType + '/' + parsedCmd.entryName.toLowerCase();

    switch(parsedCmd.cmdName) {
      case 'show':
        if(!moduleStorage.exists(parsedCmd.entryKey)) {
          if(!quietMode)
            api.reply('Nothing there!');
          return false;
        }

        var entries = moduleStorage.getItem(parsedCmd.entryKey);
        api.say(entries[Math.floor(Math.random() * entries.length)]);
        return true;

      case 'add':
        var entries = [];
        if(moduleStorage.exists(parsedCmd.entryKey)) {
          entries = moduleStorage.getItem(parsedCmd.entryKey);
        }

        if(entryType === 'quote') { // nasty special case
          entries.push('<' + quotedUser.username + '> ' + parsedCmd.content);
        } else {
          entries.push(parsedCmd.content);
        }

        moduleStorage.setItem(parsedCmd.entryKey, entries);
        api.reply('Added!');
        break;

      case 'list':
        if(!moduleStorage.exists(parsedCmd.entryKey)) {
          api.reply('Nothing there!');
        } else {
          var entries = moduleStorage.getItem(parsedCmd.entryKey);
          api.say(entries.join('\n'));
        }

        break;
      case 'indexes':
        if(!api.userIsAdmin) {
          api.reply('Nay.');
          return;
        }

        if(!moduleStorage.exists(parsedCmd.entryKey)) {
          api.reply('Nothing there!');
        } else {
          var entries = moduleStorage.getItem(parsedCmd.entryKey);
          api.say(entries.map((value, key) => `${key + 1}. ${value}`).join('\n'));
        }

        break;
      case 'kill':
        if(!api.userIsAdmin) {
          api.reply('Nope.');
          return;
        }

        var entries = [];
        if(moduleStorage.exists(parsedCmd.entryKey)) {
          entries = moduleStorage.getItem(parsedCmd.entryKey);
        }

        var index = parseInt(parsedCmd.content, 10);
        index = index < 0 ? entries.length + index : index - 1; // allow negative indexes
        if(isNaN(index) || index < 0 || index > entries.length - 1) {
          index = entries.length - 1;
        }

        if(entries.length > 0) {
          var removedEntry = entries.splice(index, 1);
          if(entries.length === 0) {
            moduleStorage.removeItem(parsedCmd.entryKey);
          } else {
            moduleStorage.setItem(parsedCmd.entryKey, entries);
          }

          api.reply('Killed \'' + removedEntry + '\'');
        } else {
          api.reply('Nothing to remove.');
        }

        break;
    }
  };

  registerCommand('quote', ['q'], 'raw', (api, argStr) => {
    retrieveEntry('quote', api, argStr);
  }, ['quote <user>: Show a random quote from a particular user.',
    'quote show <user>: As above.',
    'quote add <user> <quote>: Add a quote for a particular user.',
    'quote list <user>: Show all stored quotes for a particular user.',
    'quote indexes <user>: Show all stored quotes (with their index) for a user.',
    'quote kill <user> <b>: Remove a quote. [admin only]'
  ].join('\n'));

  registerCommand('db', [], 'raw', (api, argStr) => {
    retrieveEntry('db', api, argStr);
  }, [
    'db <topic>: Show a random entry from a particular topic.',
    'db show <topic>: As above.',
    'db add <topic> <content>: Add an entry for a particular topic.',
    'db list <topic>: Show all stored entries for a particular topic.',
    'db indexes <user>: Show all stored entries (with their index) for a topic. [admin only]',
    'db kill <topic> <n>: Remove an entry. [admin only]'
  ].join('\n'));

  registerHandler('message', (api, msgContent) => {
    if(msgContent.startsWith('!')) {
      return retrieveEntry('db', api, 'show ' + msgContent.slice(1), true);
    } else if(Math.random() > 0.9999) {
      return retrieveEntry('db', api, 'show _', true);
    }
  });

  registerCommand('quote-alias', ['qalias'], 'words', (api, args) => {
    if(args.length !== 2) {
      api.reply('Stop being bad.');
    } else {
      moduleStorage.setItem('quote-alias/' + args[0].toLowerCase(), api.resolveUserMention(args[1]).idOrFallback);
      api.reply('Aliased.');
    }
  }, 'quote-alias <alias> <user>: Add an alias for a user.');

  registerCommand('quote-unalias', ['qunalias'], 'words', (api, args) => {
    if(args.length !== 1) {
      api.reply('Stop being bad.');
    } else {
      moduleStorage.removeItem('quote-alias/' + args[0].toLowerCase());
      api.reply('Unaliased.');
    }
  }, 'quote-unalias <alias>: Remove an alias.');

  registerCommand('db-alias', ['dbalias'], 'words', (api, args) => {
    if(args.length !== 2) {
      api.reply('Stop being bad.');
    } else {
      moduleStorage.setItem('db-alias/' + args[0].toLowerCase(), args[1].toLowerCase());
      api.reply('Aliased.');
    }
  }, 'db-alias <alias> <user>: Add an alias for a user.');

  registerCommand('db-unalias', ['dbunalias'], 'words', (api, args) => {
    if(args.length !== 1) {
      api.reply('Stop being bad.');
    } else {
      moduleStorage.removeItem('db-alias/' + args[0].toLowerCase());
      api.reply('Unaliased.');
    }
  }, 'db-unalias <alias>: Remove an alias.');
};
