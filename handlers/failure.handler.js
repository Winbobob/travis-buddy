const GitHub = require('github-api');
const path = require('path');
const logger = require('../utils/logger');
const utils = require('../utils/utils');
const resolver = require('../resolvers/simple.resolver');
const messageFormatter = require('../utils/message-formatter');

module.exports = (data) => {
    return new Promise((resolve, reject) => {
        const resolverPromises = data.jobs.map(jobId => 
            utils.requestLog(jobId, data)
                .then(log => resolver(log, data))
        );

        Promise.all(resolverPromises)
            .then(logs => {
                const gh = new GitHub({
                    token: utils.getGithubAccessToken(),
                });

                const contents = messageFormatter.failure(logs, data.author);

                logger.log(`Attempting to create failure comment in PR`, data);

                const issues = gh.getIssues(data.owner, data.repo);
                issues.createIssueComment(data.pullRequest, contents)
                    .then(result => {
                        data.commentContent = contents;
                        logger.log(`Comment created successfuly`, data);
                        resolve();
                    })
                    .catch(e => {
                        logger.error(`Could not create comment`, data);
                        logger.error(e.toString());
                    });
            })
            .catch(reject);
    });
}
