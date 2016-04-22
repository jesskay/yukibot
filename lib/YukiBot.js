'use strict';

var fs = require('fs');
var Discord = require('discord.js');
var jsonfile = require('jsonfile');

var ModuleStorage = require('./ModuleStorage.js');

class YukiBot extends Discord.Client {
  constructor() {
    super();

    this.config = jsonfile.readFileSync('./config.json');
    this.creds = jsonfile.readFileSync('./credentials.json');

    if(!fs.existsSync('./storage')) {
      fs.mkdirSync('./storage');
    }

    this.commands = {};
    this.modules = { '-core-': {} };
    this.aliases = {};
    this.handlers = {};

    this.loadCore();
    this.loadModules();

    this.on('message', msg => {
      if(msg.author.id !== this.user.id && msg.content !== '') {
        var tokens = msg.content.split(' ');
        var cmd = null;
        if(tokens[0] === '<@' + this.user.id + '>') {
          var argStr = tokens.slice(2).join(' ');
          var cmd = tokens[1].toLowerCase();
        } else if(tokens[0][0] === '!') {
          var argStr = tokens.slice(1).join(' ');
          var cmd = tokens[0].slice(1).toLowerCase();
        }

        if(this.aliases.hasOwnProperty(cmd)) {
          cmd = this.aliases[cmd];
        }

        var clientApi = {
          'channelId': () => {
            if(msg.channel.isPrivate) {
              return('@' + msg.channel.id);
            } else {
              return('#' + msg.channel.id);
            }
          },
          'userMention': () => msg.author.mention(),
          'resolveUserMention': userStr => {
            var user = null;
            if(userStr.match(/^<@\d+>/)) {
              user = this.users.get('id', userStr.slice(2, -1));
            } else {
              if(userStr.match(/@.*/))
                userStr = userStr.slice(1);
              user = this.users.filter(user => user.username.toLowerCase() === userStr.toLowerCase())[0];
            }

            if(user) {
              return {
                idOrFallback: '<@' + user.id + '>',
                username: user.username
              };
            } else {
              return {
                idOrFallback: userStr,
                username: userStr
              };
            }
          },
          'reply': replyMsg => {
            if(msg.channel instanceof Discord.PMChannel) {
              this.sendMessage(msg.channel, replyMsg).then();
            } else {
              this.sendMessage(msg.channel, '<@' + msg.author.id + '> ' + replyMsg).then();
            }
          },
          'say': (sayMsg, channel) => {
            if(!channel) {
              channel = msg.channel;
            } else if(typeof channel === 'string') {
              if(channel.startsWith('#') && this.channels.has('id', channel.slice(1))) {
                channel = this.channels.get('id', channel.slice(1));
              } else if(channel.startsWith('@') && this.privateChannels.has('id', channel.slice(1))) {
                channel = this.privateChannels.get('id', channel.slice(1));
              } else {
                channel = msg.channel; // safe fallback
              }
            }

            this.sendMessage(channel, sayMsg, {}, (e, m) => {
              if(e) console.log(e);
            }).then();
          },
          'userIsAdmin': (this.config.adminIds || []).indexOf(msg.author.id) >= 0
        };

        if(this.commands[cmd] instanceof Function) {
          if(this.commands[cmd].argMode === 'raw') {
            this.commands[cmd](clientApi, argStr);
          } else if(this.commands[cmd].argMode === 'commas') {
            var args = argStr.split(/\s*,+\s*/);
            this.commands[cmd](clientApi, args);
          } else if(this.commands[cmd].argMode === 'words') {
            var args = argStr.split(/[\s,]+/);
            this.commands[cmd](clientApi, args);
          } else {
            var args = argStr.split(/\s+/);
            this.commands[cmd](clientApi, args);
          }
        } else if(this.handlers.message) {
          for(var i = 0; i < this.handlers.message.length; i++) {
            if(this.handlers.message[i](clientApi, msg.content))
              break; // stop trying handlers on a truthy return/
          }
        }
      }
    });

    var loginPromise;
    if(this.creds.token) {
      loginPromise = this.loginWithToken(this.creds.token, this.creds.email, this.creds.password);
    } else {
      loginPromise = this.login(this.creds.email, this.creds.password);
    }

    loginPromise.then(() => {
      this.emit('ready');
    }).catch(reason => {
      console.log('Failed: ' + reason);
    });
  }

  loadCore() {
    this.modules['-core-'] = require('../modules/mod_core');
    this.modules['-core-'].name = '-core-';
    this.modules['-core-'].requirePath = '../modules/mod_core';
    this.modules['-core-'].load(this);
  }

  loadModules() {
    (this.config.modules || []).forEach(moduleName => {
      this.modules[moduleName] = require('../modules/mod_' + moduleName);
      this.modules[moduleName].name = moduleName;
      this.modules[moduleName].requirePath = '../modules/mod_' + moduleName;
      var modulizedRegisterCommand = this.registerCommand.bind(this, moduleName);
      var modulizedRegisterHandler = this.registerHandler.bind(this, moduleName);
      var moduleStorage = new ModuleStorage(moduleName);

      this.modules[moduleName].load(modulizedRegisterCommand, modulizedRegisterHandler, moduleStorage, {
        'say': (sayMsg, channel) => {
          if(!channel) {
            return; // doesn't make sense
          } else if(typeof channel === 'string') {
            if(channel.startsWith('#')) {
              channel = channel.slice(1);
            } else if(channel.startsWith('@') && this.privateChannels.has('id', channel.slice(1))) {
              channel = this.privateChannels.get('id', channel.slice(1));
            } else {
              return; // doesn't make sense
            }
          }

          console.log(channel);
          this.sendMessage(channel, sayMsg, {}, (e, m) => {
            if(e) console.log(e);
          });
        }
      });
      console.log('Loaded \'' + moduleName + '\'');
    });
  }

  registerCommand(moduleName, cmdName, cmdAliases, argMode, cmdFunc, desc) {
    if(this.modules[moduleName].commands) {
      this.modules[moduleName].commands.push(cmdName);
    } else {
      this.modules[moduleName].commands = [cmdName];
    }

    this.commands[cmdName] = cmdFunc;
    this.commands[cmdName].argMode = argMode;
    this.commands[cmdName].aliases = cmdAliases;
    this.commands[cmdName].desc = desc || '';
    cmdAliases.forEach(alias => this.aliases[alias] = cmdName);
  }

  unregisterCommand(cmdName) {
    if(!(this.commands[cmdName])) {
      return;
    }

    this.commands[cmdName].aliases.forEach(alias => delete this.aliases[alias]);
    delete this.commands[cmdName];
  }

  registerHandler(moduleName, handlerType, handlerFunc) {
    if(!this.handlers[handlerType]) {
      this.handlers[handlerType] = [];
    }

    handlerFunc.moduleName = moduleName;
    this.handlers[handlerType].push(handlerFunc);
  }

  unloadModules() {
    this.handlers = {};
    Object.keys(this.modules).filter(m => m !== '-core-').forEach(moduleName => {
      try {
        this.modules[moduleName].unload();
      } catch(e) {
        // do jack shit
      }

      if(this.modules[moduleName].commands) {
        this.modules[moduleName].commands.forEach((cmdName) => {
          this.unregisterCommand(cmdName);
        });
      }

      try {
        delete require.cache[require.resolve(this.modules[moduleName].requirePath)];
      } catch(e) {
        // also do jack shit
      }

      delete this.modules[moduleName];
    });
  }
}

module.exports = YukiBot;
