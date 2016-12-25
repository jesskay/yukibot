'use strict';

class Module {
  constructor(root) {
    this.dependencies = [...arguments];
    this.root = root;
  }
  
  initialize() {
    // no-op
  } // jscs: ignore disallowEmptyBlocks
}

module.exports = Module;
