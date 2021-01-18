const GitHub = require('better-github-api');
const logger = require('../utils/logger');

const listenUserDisputeComment = async context => {
  const gh = new GitHub({
    token: context.meta.githubDangerToken,
  });
  const issues = gh.getIssues(context.owner, context.repo);

  if (
    context.action === 'created' &&
    context.comment.toLowerCase().startsWith('/help') &&
    Math.floor((Date.now() - Date.parse(context.commentUpdateAt)) / 1000) < 10 // less than 10s
  ) {
    if (
      context.meta.teachingStaffGithubUsernames.includes(context.commentAuthor)
    ) {
      // Add a response comment
      const commentResult = await issues.createIssueComment(
        context.pullRequestNumber,
        'Available commands:<br/>- `/rerun`<br/>- `/cancel [UUID]`<br/>- `/confirm [UUID]`',
      );

      context.commentId = commentResult.data.id;

      logger.log(
        'Comment created',
        { commentId: context.commentId, commentContents: context.message },
        context,
      );
    } else {
      // Add a response comment
      const commentResult = await issues.createIssueComment(
        context.pullRequestNumber,
        'Available commands:<br/>- `/rerun`<br/>- `/dispute [UUID]`',
      );

      context.commentId = commentResult.data.id;

      logger.log(
        'Comment created',
        { commentId: context.commentId, commentContents: context.message },
        context,
      );
    }
  }
  return context;
};

module.exports = listenUserDisputeComment;
