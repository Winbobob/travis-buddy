const axios = require('axios');
const GitHub = require('better-github-api');
const logger = require('../utils/logger');

const getAllComments = async (githubToken, owner, repo, pullRequestNumber) => {
  if (!githubToken) {
    logger.warn('No Github token, cannot fetch comments');
    return [];
  }

  const gh = new GitHub({
    token: githubToken,
  });

  const issues = gh.getIssues(owner, repo);
  const comments = [];
  let page = 1;
  let bulk;

  do {
    try {
      bulk = await issues.listIssueComments(pullRequestNumber, {
        page,
      });
    } catch (e) {
      break;
    }

    comments.push(...bulk.data);

    page += 1;
  } while (bulk.data.length > 0);

  return comments;
};

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

  payload,
  meta,
  ...restOfContext,

  comments:
    (await getAllComments(
      meta.githubToken,
      payload.repository.owner.login,
      payload.repository.name,
      payload.issue.number,
    )) || [],

  travisBuildNumber: await getTravisBuildNumber(
    meta.travisToken,
    payload.issue.number,
  ),
});

module.exports = parseGithubRerunPayload;
