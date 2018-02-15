const moment = require('moment');
const https = require('https');

const getQueryNewRelease = (provider, page, pageSize) => {
  const query = {
    age_certifications: null,
    content_types: null,
    date: moment().format('Y-MM-DD'),
    genres: null,
    languages: null,
    max_price: null,
    min_price: null,
    monetization_types: ['flatrate', 'rent', 'buy', 'free', 'ads'],
    page,
    page_size: pageSize,
    presentation_types: null,
    provider,
    providers: null,
    release_year_from: null,
    release_year_until: null,
    scoring_filter_types: null,
    timeline_type: null,
  };
  return JSON.stringify(query);
};

const getNewReleaseByProvider = (provider) => {
  const pageSize = 15;

  return new Promise((resolve, reject) => {
    let items = [];
    const getData = (page) => {
      const url = `https://apis.justwatch.com/content/titles/en_GB/new/single_provider?body=${getQueryNewRelease(
        provider,
        page,
        pageSize,
      )}`;
      https.get(url, (res) => {
        let body = '';
        res.on('data', (data) => {
          body += data;
        });
        res.on('error', (err) => {
          reject(err);
        });
        res.on('end', () => {
          try {
            body = JSON.parse(body);
          } catch (e) {
            reject(new Error('No body from new release'));
          }
          if (body.items) {
            items = items.concat(body.items);
            if (page * pageSize < body.total_results) {
              getData(page + 1);
            } else {
              resolve(items);
            }
          } else {
            reject(new Error('No body from new release'));
          }
        });
      });
    };
    getData(1);
  });
};

const getNewRelease = (providers) => {
  const promises = [];
  const list = {};
  Object.keys(providers).forEach((provider) => {
    promises.push(getNewReleaseByProvider(provider).then((items) => {
      items.forEach((item) => {
        list[item.id] = {
          provider: providers[provider],
          object_type: item.object_type,
          title: item.object_type === 'show_season' ? item.show_title : item.title,
          season: item.object_type === 'show_season' ? item.title : null,
        };
      });
    }));
  });

  return Promise.all(promises).then(() => list);
};

const getWatchList = token =>
  new Promise((resolve, reject) => {
    const options = {
      host: 'userapi.justwatch.com',
      path: '/store',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (data) => {
        body += data;
      });
      res.on('error', (err) => {
        reject(err);
      });
      res.on('end', () => {
        try {
          body = JSON.parse(body);
        } catch (e) {
          return reject(new Error('No body from Watchlist'));
        }
        const { watchlist: { uk: list = [] } } = body;
        return resolve(list);
      });
    });
    req.on('error', (err) => {
      reject(err);
    });
    req.end();
  });

const getProviders = () => ({
  nfx: 'Netflix',
  skg: 'Sky GO',
  amz: 'Amazon',
});

const getNotification = token =>
  Promise.all([getWatchList(token), getNewRelease(getProviders())]).then((data) => {
    const [watchList, newRelease] = data;
    const notifications = [];
    watchList.forEach((item) => {
      if (Object.prototype.hasOwnProperty.call(newRelease, item.id)) {
        notifications.push(newRelease[item.id]);
      }
    });
    return notifications;
  });

module.exports = { getNotification };
