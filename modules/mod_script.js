'use strict';

var vm = require('vm');
var util = require('util');

var persistentContext = vm.createContext({ });

exports.load = (registerCommand, registerHandler, moduleStorage) => {
  registerCommand('js', ['$'], 'raw', (api, argStr) => {
    var code = argStr;
    var match;

    // JS doesn't support dot matching newline
    if(match = code.match(/```\w*\n([\s\S]*?)\n```/i)) {
      code = match[1];
    } else if(match = code.match(/`(.*?)`/i)) {
      code = match[1];
    }

    try {
      api.reply(util.inspect(vm.runInNewContext(code, {}, { timeout: 10000 })));
    } catch(e) {
      api.reply(e.toString());
    }
  }, 'Run arbitrary Javascript code and reply with the result. Will fail if execution time exceeds 10 seconds.');

  registerCommand('js-persist', ['jsp', '>'], 'raw', (api, argStr) => {
    var code = argStr;
    var match = '';

    // JS doesn't support dot matching newline
    if(match = code.match(/```\w*\n([\s\S]*?)\n```/i)) {
      code = match[1];
    } else if(match = code.match(/`(.*?)`/i)) {
      code = match[1];
    }

    try {
      api.reply(util.inspect(vm.runInContext(argStr, persistentContext, { timeout: 10000 })));
    } catch(e) {
      api.reply(e.toString());
    }
  }, 'Run arbitrary Javascript code in a persistent environment, and reply with the result. Will fail if execution time exceeds 10 seconds.');

  registerCommand('js-unpersist', ['jsup', '<'], '', (api) => {
    persistentContext = vm.createContext({});
    api.reply('Reset!');
  }, 'Resets the environment used by !js-persist to original state.');
};
