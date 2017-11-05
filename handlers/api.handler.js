const GitHub = require('github-api');
const path = require('path');
const logger = require('../utils/logger');
const utils = require('../utils/utils');
const fs = require('fs');
const resolver = require('../resolvers/simple.resolver');

const githubAccessToken = process.env.githubAccessToken || (args => {
    const githubArg = args.find(arg => arg.startsWith('githubAccessToken='));
    if (githubArg) {
        return githubArg.replace('githubAccessToken=', '');
    }

    return null;
})(process.argv);

if (!githubAccessToken) throw new Error(`Invalid GitHub access token ${githubAccessToken}`);

logger.log(`Using GitHub token: ${githubAccessToken}`);

module.exports = (data) => {
    return new Promise((resolve, reject) => {
        utils.requestLog(data.jobId, data)
            .then(log => resolver(log, data))
            .then(message => {
                const gh = new GitHub({
                    token: process.env.githubAccessToken
                });

                message.author = data.author;
                const contents = utils.formatMessage(message);
                const issues = gh.getIssues(data.owner, data.repo);

                logger.log(`Attempting to create a comment in PR`, data);

                issues.createIssueComment(data.pullRequest, contents)
                    .then(result => {
                        data.commentContent = contents;
                        logger.log(`Comment created successfuly`, data);
                        resolve();
                    })
                    .catch(e => {
                        logger.error(`Could not create comment`, data);
                        logger.error(e.toString());
                    })
            })
            .catch(reject);
    });
}
