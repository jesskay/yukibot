module.exports = {
  *ipairs(arr) {
    for(let key of Object.keys(arr)) {
      yield([key, arr[key]]);
    }
  }
};
