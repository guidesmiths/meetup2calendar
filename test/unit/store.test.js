const store = require('../../lib/store');

describe('store', () => {
  console.log(store);
  test("Create a store for log created events", () => {
    store.createStore();
  });
})
