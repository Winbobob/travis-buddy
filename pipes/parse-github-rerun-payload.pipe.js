const axios = require('axios');
const logger = require('../utils/logger');

const getTravisBuildNumber = async (travisToken, pullRequestNumber) => {
  const headers = {
    'Content-Type': 'application/json',
    'Travis-API-Version': 3,
    Authorization: `token ${travisToken}`,
  };

  var round = 0;
  var found = false;
  var buildId = null;
  // Traverse all Travis CI builds and find the one with current pull request number
  while (true) {
    offset = round * 100;

    await axios
      .get(
        `https://api.travis-ci.org/repo/expertiza%2Fexpertiza/builds?limit=100&sort_by=updated_at:desc&offset=${offset}`,
        {
          headers: headers,
        },
      )
      .then(res => {
        builds = res.data.builds;
        for (i = 0; i < 100; i++) {
          currentBuildId = builds[i].id;
          currentPullRequestNumber = builds[i].pull_request_number;
          logger.log(
            `Build id: ${currentBuildId}, update at: ${
              builds[i].updated_at
            }, pull request number: ${currentPullRequestNumber}`,
          );
          if (currentPullRequestNumber === pullRequestNumber) {
            buildId = currentBuildId;
            found = true;
            break;
          }
        }
      })
      .catch(error => {
        logger.error(error);
      });

    round += 1;
    if (found || round >= 10) {
      break;
    }
  }

  return buildId;
};

const parseGithubRerunPayload = async ({
  payload,
  meta,
  ...restOfContext
}) => ({
  owner: payload.repository.owner.login,
  repo: payload.repository.name,
  pullRequestNumber: payload.issue.number,
  comment: payload.comment.body,
  commentAuthor: payload.comment.user.login,
  commentUpdateAt: payload.comment.updated_at,

  payload,
  meta,
  ...restOfContext,

  travisBuildNumber: await getTravisBuildNumber(
    meta.travisToken,
    payload.issue.number,
  ),
});

module.exports = parseGithubRerunPayload;
