// vim: tabstop=2 shiftwidth=2 expandtab

const supertest = require('supertest');
const app = require('../app');
const request = supertest(app);
const test = require('tape');

test('GET /', (assert) => {
  request
    .get('/')
    .expect(200)
    .end((err, res) => {
      if (err) {
        assert.fail(err)
        assert.end()
      }
      assert.ok(res.body, 'Response body is present')
      assert.end()
    })
})
