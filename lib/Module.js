// jscs:disable disallowEmptyBlocks
'use strict';

class Module {
  constructor(name, core) {
    this.name = name;
    this.core = core;
  }

  static get dependencies() {
    return [];
  }

  initialize() {
    // no-op
  }
}

module.exports = Module;
