const axios = require('axios');
const GitHub = require('better-github-api');
const logger = require('../utils/logger');

const listenUserRerunComment = async context => {
  // https://developer.github.com/v3/gists/comments/#list-comments-on-a-gist
  const gh = new GitHub({
    token: context.meta.githubDangerToken,
  });
  const issues = gh.getIssues(context.owner, context.repo);

  if (
    context.action === 'created' &&
    (context.comment.toLowerCase() === '/rerun' ||
      context.comment.toLowerCase().startsWith('/approve') ||
      context.comment.toLowerCase().startsWith('/reject')) &&
    Math.floor((Date.now() - Date.parse(context.commentUpdateAt)) / 1000) < 10 // less than 10s
  ) {
    // https://nodejs.dev/learn/make-an-http-post-request-using-nodejs
    // https://docs.travis-ci.com/user/notifications/#webhooks-delivery-format
    // https://developer.travis-ci.com/resource/build#restart

    if (
      context.comment.toLowerCase() === '/rerun' ||
      context.meta.teachingStaffGithubUsernames.includes(context.commentAuthor)
    ) {
      const headers = {
        'Content-Type': 'application/json',
        'Travis-API-Version': 3,
        Authorization: `token ${context.meta.travisToken}`,
      };

      axios
        .post(
          `https://api.travis-ci.com/build/${
            context.travisBuildNumber
          }/restart`,
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

      // Add a response comment
      await issues.createIssueComment(
        context.pullRequestNumber,
        'Your request has been accepted by the bot. Please wait, it can take up to 10 min to process the request.',
      );

      logger.log(
        'Restart last Jenkins build',
        { buildId: context.buildNumber },
        context,
      );
    } else {
      // Add a response comment
      await issues.createIssueComment(
        context.pullRequestNumber,
        'Student is not allowed to use the `/approve [UUID]`, `/reject [UUID]` command. Please use `/dispute [UUID]` or `/rerun` commands instead.',
      );
    }
  }

  return context;
};

module.exports = listenUserRerunComment;
