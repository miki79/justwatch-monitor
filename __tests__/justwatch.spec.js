const nock = require('nock');
const fs = require('fs');
const { getNotification } = require('../src/justwatch');

console.info = jest.fn();

describe('Get Notifications from Justwatch', () => {
  afterEach(() => {
    nock.cleanAll();
  });
  test('Get 1 notification', () => {
    const token = '1234';
    nock('https://apis.justwatch.com')
      .get('/content/titles/en_GB/new/single_provider')
      .query(actualQueryObject => !!actualQueryObject.body.match(/nfx/))
      .reply(200, fs.readFileSync(`${__dirname}/stub/nfx.json`));
    nock('https://apis.justwatch.com')
      .get('/content/titles/en_GB/new/single_provider')
      .query(actualQueryObject => !!actualQueryObject.body.match(/amz/))
      .reply(200, fs.readFileSync(`${__dirname}/stub/amz-large.json`));
    nock('https://apis.justwatch.com')
      .get('/content/titles/en_GB/new/single_provider')
      .query(actualQueryObject => !!actualQueryObject.body.match(/amz/))
      .reply(200, fs.readFileSync(`${__dirname}/stub/amz-large.json`));
    nock('https://apis.justwatch.com')
      .get('/content/titles/en_GB/new/single_provider')
      .query(actualQueryObject => !!actualQueryObject.body.match(/skg/))
      .reply(200, fs.readFileSync(`${__dirname}/stub/skg.json`));
    nock('https://userapi.justwatch.com')
      .get('/store')
      .reply(200, fs.readFileSync(`${__dirname}/stub/one-watchlist.json`));
    return getNotification(token).then(notifications => expect(notifications).toMatchSnapshot());
  });
  test('Get no notification', () => {
    const token = '1234';
    nock('https://apis.justwatch.com')
      .get('/content/titles/en_GB/new/single_provider')
      .query(actualQueryObject => !!actualQueryObject.body.match(/nfx/))
      .reply(200, fs.readFileSync(`${__dirname}/stub/nfx.json`));
    nock('https://apis.justwatch.com')
      .get('/content/titles/en_GB/new/single_provider')
      .query(actualQueryObject => !!actualQueryObject.body.match(/amz/))
      .reply(200, fs.readFileSync(`${__dirname}/stub/amz.json`));
    nock('https://apis.justwatch.com')
      .get('/content/titles/en_GB/new/single_provider')
      .query(actualQueryObject => !!actualQueryObject.body.match(/skg/))
      .reply(200, fs.readFileSync(`${__dirname}/stub/skg.json`));
    nock('https://userapi.justwatch.com')
      .get('/store')
      .reply(200, fs.readFileSync(`${__dirname}/stub/no-watchlist.json`));
    return getNotification(token).then(notifications => expect(notifications).toMatchSnapshot());
  });
  test('Get 3 notifications', () => {
    const token = '1234';
    nock('https://apis.justwatch.com')
      .get('/content/titles/en_GB/new/single_provider')
      .query(actualQueryObject => !!actualQueryObject.body.match(/nfx/))
      .reply(200, fs.readFileSync(`${__dirname}/stub/nfx.json`));
    nock('https://apis.justwatch.com')
      .get('/content/titles/en_GB/new/single_provider')
      .query(actualQueryObject => !!actualQueryObject.body.match(/amz/))
      .reply(200, fs.readFileSync(`${__dirname}/stub/amz.json`));
    nock('https://apis.justwatch.com')
      .get('/content/titles/en_GB/new/single_provider')
      .query(actualQueryObject => !!actualQueryObject.body.match(/skg/))
      .reply(200, fs.readFileSync(`${__dirname}/stub/skg.json`));
    nock('https://userapi.justwatch.com')
      .get('/store')
      .reply(200, fs.readFileSync(`${__dirname}/stub/three-watchlist.json`));
    return getNotification(token).then(notifications => expect(notifications).toMatchSnapshot());
  });
  test('Get Error watchlist', () => {
    const token = '1234';
    nock('https://apis.justwatch.com')
      .get('/content/titles/en_GB/new/single_provider')
      .query(actualQueryObject => !!actualQueryObject.body.match(/nfx/))
      .reply(200, fs.readFileSync(`${__dirname}/stub/nfx.json`));
    nock('https://apis.justwatch.com')
      .get('/content/titles/en_GB/new/single_provider')
      .query(actualQueryObject => !!actualQueryObject.body.match(/amz/))
      .reply(200, fs.readFileSync(`${__dirname}/stub/amz.json`));
    nock('https://apis.justwatch.com')
      .get('/content/titles/en_GB/new/single_provider')
      .query(actualQueryObject => !!actualQueryObject.body.match(/skg/))
      .reply(200, fs.readFileSync(`${__dirname}/stub/skg.json`));
    nock('https://userapi.justwatch.com')
      .get('/store')
      .reply(500, '');
    return getNotification(token).catch(error =>
      expect(error.message).toBe('No body from Watchlist'));
  });
  test('Get Error new release', () => {
    const token = '1234';
    nock('https://apis.justwatch.com')
      .get('/content/titles/en_GB/new/single_provider')
      .query(actualQueryObject => !!actualQueryObject.body.match(/nfx/))
      .reply(200, fs.readFileSync(`${__dirname}/stub/nfx.json`));
    nock('https://apis.justwatch.com')
      .get('/content/titles/en_GB/new/single_provider')
      .query(actualQueryObject => !!actualQueryObject.body.match(/amz/))
      .reply(200, fs.readFileSync(`${__dirname}/stub/amz.json`));
    nock('https://apis.justwatch.com')
      .get('/content/titles/en_GB/new/single_provider')
      .query(actualQueryObject => !!actualQueryObject.body.match(/skg/))
      .reply(200, fs.readFileSync(`${__dirname}/stub/skg.json`));
    nock('https://userapi.justwatch.com')
      .get('/store')
      .reply(200, fs.readFileSync(`${__dirname}/stub/three-watchlist.json`));
    return getNotification(token).catch(error =>
      expect(error.message).toBe('No body from new release'));
  });
});
