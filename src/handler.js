const AWS = require('aws-sdk');
const { getNotification } = require('./justwatch');

const notificationEmail = process.env.NOTIFICATION_EMAIL;
const token = process.env.TOKEN_JUSTWATCH;

const sendEmail = (notifications, callback) => {
  const params = {
    Destination: {
      ToAddresses: [notificationEmail],
    },
    Message: {
      Body: {
        Text: {
          Data: JSON.stringify(notifications),
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: 'JustWatch notification',
      },
    },
    Source: notificationEmail,
  };
  const ses = new AWS.SES({ region: process.env.AWS_REGION });
  ses.sendEmail(params, (err) => {
    if (err) {
      callback(err);
    } else {
      callback(null, true);
    }
  });
};

module.exports.newRelease = (event, context, callback) => {
  getNotification(token)
    .then((notifications) => {
      if (notifications && notifications.length > 0) {
        sendEmail(notifications, callback);
      } else {
        callback(null, false);
      }
    })
    .catch((err) => {
      callback(err);
    });
};
