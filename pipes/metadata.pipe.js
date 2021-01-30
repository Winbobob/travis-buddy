const logger = require('../utils/logger');

const defaultMaxAttemptsToGetDone = 10;

const metadata = context => {
  context.meta = {
    user: process.env.github_username,
    githubTravisToken: process.env.github_travis_bot_access_token,
    githubDangerToken: process.env.github_danger_bot_access_token,
    travisToken: process.env.travisci_api_token,
    expertizaDevEmailAddr: process.env.expertiza_dev_email_addr,
    expertizaDevEmailPsw: process.env.expertiza_dev_email_psw,
    instructorGithubUsername: process.env.instructor_github_username,
    maintainerGithubUsername: process.env.maintainer_github_username,
    teachingAssistant1GithubUsername:
      process.env.teaching_assistant1_github_username,
    teachingAssistant2GithubUsername:
      process.env.teaching_assistant2_github_username,
    teachingStaffGithubUsernames: [
      process.env.instructor_github_username,
      process.env.maintainer_github_username,
      process.env.teaching_assistant1_github_username,
      process.env.teaching_assistant2_github_username,
    ],
    // emailList: process.env.maintainer_email_addr,
    emailList:
      process.env.instructor_email_addr +
      ', ' +
      process.env.maintainer_email_addr +
      ', ' +
      process.env.teaching_assistant1_email_addr +
      ', ' +
      process.env.teaching_assistant2_email_addr,
    maxAttemptsToGetDone:
      process.env.maxAttemptsToGetDone || defaultMaxAttemptsToGetDone,
    delay: process.env.delay ? Number(process.env.delay) : 0,
  };

  logger.log('Metadata created', metadata, context);

  return context;
};

module.exports = metadata;
