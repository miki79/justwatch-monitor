const AWS = require('aws-sdk');
const { getNotification } = require('./justwatch');

const ses = new AWS.SES({ region: process.env.AWS_REGION });
const notificationEmail = process.env.NOTIFICATION_EMAIL;
const token = process.env.TOKEN_JUSTWATCH;

module.exports.newRelease = (event, context, callback) => {
  getNotification(token).then((notifications) => {
    if (notifications.length > 0) {
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
      console.info(notifications);
      return ses.sendEmail(params).promise();
    }
    return null;
  }).then(() => {
    callback(null, true);
  }).catch((err) => {
    callback(err);
  });
};
