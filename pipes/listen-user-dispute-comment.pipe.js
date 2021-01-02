const GitHub = require('better-github-api');
const logger = require('../utils/logger');
const nodemailer = require('nodemailer');

const listenUserDisputeComment = async context => {
  const gh = new GitHub({
    token: context.meta.githubDangerToken,
  });

  if (
    context.action === 'created' &&
    context.comment.toLowerCase().startsWith('/dispute') &&
    Math.floor((Date.now() - Date.parse(context.commentUpdateAt)) / 1000) < 10 // less than 10s
  ) {
    const issues = gh.getIssues(context.owner, context.repo);

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
      to: context.meta.maintainerEmailAddr,
      subject:
        'One student just disputed the violations given by the Danger bot, please check!',
      text: 'Here is the pull request link: https://github.com/expertiza/expertiza/pull/'.concat(
        context.pullRequestNumber,
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
  }

  return context;
};

module.exports = listenUserDisputeComment;
