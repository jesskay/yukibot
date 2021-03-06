'use strict';

var jsonfile = require('jsonfile');

class ModuleStorage {
  constructor(moduleName) {
    this._moduleName = moduleName;
    this._fileName = './storage/storage_' + moduleName + '.json';
    this._loadData();
  }

  _loadData() {
    try {
      this._data = jsonfile.readFileSync(this._fileName);
    } catch(e) {
      console.log('warning: couldn\'t load storage for \'' + this._moduleName + '\'');
      this._data = {};
    }

    this.length = Object.keys(this).length;
  }

  _saveData() {
    try {
      jsonfile.writeFileSync(this._fileName, this._data);
    } catch(e) {
      console.log('warning: couldn\'t save storage for \'' + this._moduleName + '\':');
      console.log(e);
    }
  }

  key(n) {
    return Object.keys(this._data)[n];
  }

  keys() {
    return Object.keys(this._data);
  }

  getItem(k) {
    return this._data[k] || null;
  }

  setItem(k, v) {
    this._data[k] = v;
    this._saveData();
  }

  removeItem(k) {
    delete this._data[k];
    this._saveData();
  }

  exists(k) {
    return this._data.hasOwnProperty(k);
  }

  clear() {
    this._data = {};
    this._saveData();
  }
}

module.exports = ModuleStorage;
