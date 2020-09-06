const axios = require('axios');
const logger = require('../utils/logger');

const listenUserRerunComment = async context => {
  // https://developer.github.com/v3/gists/comments/#list-comments-on-a-gist

  if (
    context.action === 'created' &&
    context.comment.toLowerCase() === '/rerun' &&
    context.commentAuthor === 'Winbobob' &&
    Math.floor((Date.now() - Date.parse(context.commentUpdateAt)) / 1000) < 60 // less than 60s
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
        `https://api.travis-ci.org/build/${context.travisBuildNumber}/restart`,
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
      'Restart last Jenkins build',
      { buildId: context.buildNumber },
      context,
    );
  }

  return context;
};

module.exports = listenUserRerunComment;
