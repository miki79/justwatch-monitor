const nock = require('nock');
const fs = require('fs');
const { promisify } = require('util');
const path = require('path');
const awsMock = require('aws-sdk-mock');

process.env.AWS_REGION = 'eu-west-1';
process.env.NOTIFICATION_EMAIL = 'email@noemail.com';

const { newRelease } = require('../src/handler');

const handler = promisify(newRelease);
const context = {};
const event = {};

awsMock.setSDK(path.resolve(`${__dirname}/../node_modules/aws-sdk`));
console.info = jest.fn();

describe('Get Notifications from Justwatch', () => {
  afterEach(() => {
    nock.cleanAll();
    awsMock.restore();
  });
  test('Get 1 notification', () => {
    awsMock.mock('SES', 'sendEmail', (params, callback) => {
      expect(params.Message.Body.Text.Data).toMatchSnapshot();
      expect(params.Destination.ToAddresses[0]).toBe(process.env.NOTIFICATION_EMAIL);
      callback(null, {});
    });

    nock('https://apis.justwatch.com').get('/content/titles/en_GB/new/single_provider').query(actualQueryObject => (!!(actualQueryObject.body.match(/nfx/))))
      .reply(200, fs.readFileSync(`${__dirname}/stub/nfx.json`));
    nock('https://apis.justwatch.com').get('/content/titles/en_GB/new/single_provider').query(actualQueryObject => (!!(actualQueryObject.body.match(/amz/))))
      .reply(200, fs.readFileSync(`${__dirname}/stub/amz.json`));
    nock('https://apis.justwatch.com').get('/content/titles/en_GB/new/single_provider').query(actualQueryObject => (!!(actualQueryObject.body.match(/skg/))))
      .reply(200, fs.readFileSync(`${__dirname}/stub/skg.json`));
    nock('https://userapi.justwatch.com').get('/store').reply(200, fs.readFileSync(`${__dirname}/stub/one-watchlist.json`));

    return handler(event, context).then(result => expect(result).toBeTruthy());
  });
  test('Get 1 notification with error on sending email', () => {
    awsMock.mock('SES', 'sendEmail', (params, callback) => {
      callback(new Error('Error sent email'));
    });

    nock('https://apis.justwatch.com').get('/content/titles/en_GB/new/single_provider').query(actualQueryObject => (!!(actualQueryObject.body.match(/nfx/))))
      .reply(200, fs.readFileSync(`${__dirname}/stub/nfx.json`));
    nock('https://apis.justwatch.com').get('/content/titles/en_GB/new/single_provider').query(actualQueryObject => (!!(actualQueryObject.body.match(/amz/))))
      .reply(200, fs.readFileSync(`${__dirname}/stub/amz.json`));
    nock('https://apis.justwatch.com').get('/content/titles/en_GB/new/single_provider').query(actualQueryObject => (!!(actualQueryObject.body.match(/skg/))))
      .reply(200, fs.readFileSync(`${__dirname}/stub/skg.json`));
    nock('https://userapi.justwatch.com').get('/store').reply(200, fs.readFileSync(`${__dirname}/stub/one-watchlist.json`));

    return handler(event, context).catch(err => expect(err.message).toBe('Error sent email'));
  });
  test('Get no notification', () => {
    nock('https://apis.justwatch.com').get('/content/titles/en_GB/new/single_provider').query(actualQueryObject => (!!(actualQueryObject.body.match(/nfx/))))
      .reply(200, fs.readFileSync(`${__dirname}/stub/nfx.json`));
    nock('https://apis.justwatch.com').get('/content/titles/en_GB/new/single_provider').query(actualQueryObject => (!!(actualQueryObject.body.match(/amz/))))
      .reply(200, fs.readFileSync(`${__dirname}/stub/amz.json`));
    nock('https://apis.justwatch.com').get('/content/titles/en_GB/new/single_provider').query(actualQueryObject => (!!(actualQueryObject.body.match(/skg/))))
      .reply(200, fs.readFileSync(`${__dirname}/stub/skg.json`));
    nock('https://userapi.justwatch.com').get('/store').reply(200, fs.readFileSync(`${__dirname}/stub/no-watchlist.json`));
    return handler(event, context).then(result => expect(result).toBeFalsy());
  });
  test('Get Error Watchlist', () => {
    nock('https://apis.justwatch.com').get('/content/titles/en_GB/new/single_provider').query(actualQueryObject => (!!(actualQueryObject.body.match(/nfx/))))
      .reply(200, fs.readFileSync(`${__dirname}/stub/nfx.json`));
    nock('https://apis.justwatch.com').get('/content/titles/en_GB/new/single_provider').query(actualQueryObject => (!!(actualQueryObject.body.match(/amz/))))
      .reply(200, fs.readFileSync(`${__dirname}/stub/amz.json`));
    nock('https://apis.justwatch.com').get('/content/titles/en_GB/new/single_provider').query(actualQueryObject => (!!(actualQueryObject.body.match(/skg/))))
      .reply(200, fs.readFileSync(`${__dirname}/stub/skg.json`));
    nock('https://userapi.justwatch.com').get('/store').reply(500, '');
    return handler(event, context).catch(err => expect(err.message).toBe('No body from Watchlist'));
  });

  test('Get Error', () => {
    nock('https://apis.justwatch.com').get('/content/titles/en_GB/new/single_provider').query(actualQueryObject => (!!(actualQueryObject.body.match(/nfx/))))
      .reply(200, fs.readFileSync(`${__dirname}/stub/nfx.json`));
    nock('https://apis.justwatch.com').get('/content/titles/en_GB/new/single_provider').query(actualQueryObject => (!!(actualQueryObject.body.match(/amz/))))
      .reply(500, '');
    nock('https://apis.justwatch.com').get('/content/titles/en_GB/new/single_provider').query(actualQueryObject => (!!(actualQueryObject.body.match(/skg/))))
      .reply(200, fs.readFileSync(`${__dirname}/stub/skg.json`));
    nock('https://userapi.justwatch.com').get('/store').reply(200, fs.readFileSync(`${__dirname}/stub/three-watchlist.json`));
    return handler(event, context).catch(err => expect(err.message).toBe('No body from new release'));
  });
});

