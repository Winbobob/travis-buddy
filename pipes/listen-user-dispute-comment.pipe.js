const GitHub = require('better-github-api');
const logger = require('../utils/logger');

const listenUserDisputeComment = async context => {
  const gh = new GitHub({
    token: context.meta.githubDangerToken,
  });

  if (
    context.action === 'created' &&
    context.comment.toLowerCase().startsWith('/dispute') &&
    Math.floor((Date.now() - Date.parse(context.commentUpdateAt)) / 1000) < 60 // less than 60s
  ) {
    const issues = gh.getIssues('expertiza-travisci-bot', context.repo);

    const commentResult = await issues.createIssueComment(
      context.pullRequestNumber,
      context.message,
    );

    context.commentId = commentResult.data.id;

    logger.log(
      'Comment created',
      { commentId: context.commentId, commentContents: context.message },
      context,
    );
  }

  return context;
};

module.exports = listenUserDisputeComment;
