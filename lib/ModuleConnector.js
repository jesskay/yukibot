// jscs:disable requireCapitalizedConstructors
'use strict';

class ModuleConnector {
  constructor(bot, moduleName) {
    this.bot = bot;
    this.moduleName = moduleName;

    // (re)initialize the bot class's storage for this module
    this.bot.commands[this.moduleName] = {};
    this.bot.aliases[this.moduleName] = {};
    this.bot.handlers[this.moduleName] = {};
  }

  registerHandler(handlerType, handlerClass) {
    this.bot.handlers[this.moduleName][handlerType] = this.bot.handlers[this.moduleName][handlerType] || [];
    this.bot.handlers[this.moduleName][handlerType].push(new handlerClass(this));
  }

  registerCommand(name, options, cmdClass) {
    // fill optional details with sane defaults
    options.aliases = options.aliases || {};
    options.argMode = options.argMode || 'raw';

    this.bot.commands[this.moduleName][name] = new cmdClass(this);

    this.bot.commands[this.moduleName][name].argMode = options.argMode;

    for(var alias of options.aliases) {
      if(typeof alias == 'string') {
        // simple alias
        this.bot.aliases[this.moduleName][alias] = name;
      } else if(alias instanceof Array) {
        if(alias.length != 2) {
          throw new Error('Tried to register complex alias with a wrong-sized array.');
        } else {
          this.bot.aliases[this.moduleName][alias[0]] = alias[1];
        }
      } else {
        for(var key of alias.keys()) {
          this.bot.aliases[this.moduleName][key] = alias[key];
        }
      }
    }
  }
}

module.exports = ModuleConnector;
