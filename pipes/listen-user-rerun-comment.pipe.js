const axios = require('axios');
const logger = require('../utils/logger');

const listenUserRerunComment = async context => {
  // https://developer.github.com/v3/gists/comments/#list-comments-on-a-gist
  const userComments = context.comments
    .filter(comment => comment.user.login === 'Winbobob')
    .sort(function(a, b) {
      dateA = new Date(a.updated_at);
      dateB = new Date(b.updated_at);
      return dateB - dateA;
    });

  const latestComment = userComments[0];

  if (
    latestComment.body.toLowerCase() === '/rerun' &&
    Math.floor((Date.now() - latestComment.updated_at) / 1000) < 5 // less than 5s
  ) {
    // https://nodejs.dev/learn/make-an-http-post-request-using-nodejs
    // https://docs.travis-ci.com/user/notifications/#webhooks-delivery-format
    // https://developer.travis-ci.com/resource/build#restart

    const headers = {
      'Content-Type': 'application/json',
      'Travis-API-Version': 3,
      Authorization: `token ${context.meta.travisToken}`,
    };

    axios
      .post(
        `https://api.travis-ci.org/build/${context.buildNumber}/restart`,
        {},
        {
          headers: headers,
        },
      )
      .then(res => {
        logger.log(`Status code: ${res.statusCode}`, res, context);
        logger.log(`Response: ${res}`, res, context);
      })
      .catch(error => {
        logger.error(error, context);
      });

    logger.log(
      'Rerun Jenkins build',
      { buildId: context.buildNumber },
      context,
    );
  }

  return context;
};

module.exports = listenUserRerunComment;
