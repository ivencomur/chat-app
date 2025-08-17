const mockIndexedDB = {
  open: () => Promise.resolve({}),
  deleteDatabase: () => Promise.resolve(),
  databases: () => Promise.resolve([]),
};

module.exports = mockIndexedDB;
module.exports.default = mockIndexedDB;
module.exports.openDB = () => Promise.resolve({});
module.exports.deleteDB = () => Promise.resolve();
module.exports.wrap = (val) => val;
module.exports.unwrap = (val) => val;
