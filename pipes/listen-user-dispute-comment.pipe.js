const GitHub = require('better-github-api');
const logger = require('../utils/logger');
const nodemailer = require('nodemailer');

const listenUserDisputeComment = async context => {
  const gh = new GitHub({
    token: context.meta.githubDangerToken,
  });
  const issues = gh.getIssues(context.owner, context.repo);

  if (
    context.action === 'created' &&
    context.comment.toLowerCase().startsWith('/dispute') &&
    Math.floor((Date.now() - Date.parse(context.commentUpdateAt)) / 1000) < 10 // less than 10s
  ) {
    if (
      !context.meta.teachingStaffGithubUsernames.includes(context.commentAuthor)
    ) {
      // Add a response comment
      const commentResult = await issues.createIssueComment(
        context.pullRequestNumber,
        context.message,
      );

      context.commentId = commentResult.data.id;

      // Send emails to instructor, maintainer, and TAs
      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: context.meta.expertizaDevEmailAddr,
          pass: context.meta.expertizaDevEmailPsw,
        },
      });

      var mailOptions = {
        from: context.meta.expertizaDevEmailAddr,
        to: context.meta.emailList,
        subject:
          'One student just disputed the violations given by the Danger bot, please check!',
        text: 'Here is the link of pull request comment: '.concat(
          context.commentUrl,
        ),
      };

      transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });

      logger.log(
        'Comment created',
        { commentId: context.commentId, commentContents: context.message },
        context,
      );
    } else {
      // Add a response comment
      await issues.createIssueComment(
        context.pullRequestNumber,
        'Teaching staff is not allowed to use the `/dispute [UUID]` command. Please use<br/>- `/rerun`<br/>- `/cancel [UUID]`<br/>- `/confirm [UUID]`',
      );
    }
  }
  return context;
};

module.exports = listenUserDisputeComment;
