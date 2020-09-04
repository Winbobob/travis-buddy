const paipu = require('paipu');
const parseTravisPayload = require('./parse-travis-payload.pipe');
const parseGithubRerunPayload = require('./parse-github-rerun-payload.pipe');

const parse = async context => {
  module.exports = paipu.pipeIf(
    context.path === '/',
    'travis parser',
    parseTravisPayload,
  );

  module.exports = paipu.pipeIf(
    context.path === '/rerun',
    'github pull request review comments (rerun) payload parser',
    parseGithubRerunPayload,
  );
};
