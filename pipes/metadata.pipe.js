const logger = require('../utils/logger');

const defaultMaxAttemptsToGetDone = 10;

const metadata = context => {
  context.meta = {
    user: process.env.github_username,
    githubTravisToken: process.env.github_travis_bot_access_token,
    githubDangerToken: process.env.github_danger_bot_access_token,
    travisToken: process.env.travisci_api_token,
    maxAttemptsToGetDone:
      process.env.maxAttemptsToGetDone || defaultMaxAttemptsToGetDone,
    delay: process.env.delay ? Number(process.env.delay) : 0,
  };

  logger.log('Metadata created', metadata, context);

  return context;
};

module.exports = metadata;
