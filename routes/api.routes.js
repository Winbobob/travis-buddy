const express = require('express');
const paipu = require('paipu');
const logger = require('../utils/logger');
const uuid = require('uuid/v1');

const validation = require('../pipes/validation.pipe');
const wait = require('../pipes/wait.pipe');
const parseTravisPayload = require('../pipes/parse-travis-payload.pipe');
const parseGithubPayload = require('../pipes/parse-github-payload.pipe');
const rerun = require('../pipes/listen-user-rerun-comment.pipe');
const dispute = require('../pipes/listen-user-dispute-comment.pipe');
const metadata = require('../pipes/metadata.pipe');
const star = require('../pipes/star.pipe');
const fetchConfiguration = require('../pipes/fetch-configuration.pipe');
const searchStopComment = require('../pipes/search-stop-comment.pipe');
const formatMessage = require('../pipes/format-message.pipe');
const publish = require('../pipes/publish.pipe');
const finish = require('../pipes/finish.pipe');

const createApiRoutes = options => {
  const router = express.Router();

  router.get('/status', (req, res) => {
    res.send({ state: 'running' });
  });

  router.post('/', async (req, res) =>
    paipu
      .pipe('load payload', {
        startTime: new Date().getTime(),
        payload: JSON.parse(req.body.payload),
        path: req.path,
        query: req.query,
        requestId: uuid(),
      })
      .pipe('validate payload', validation)
      .pipe('get metadata', metadata)
      .pipe('wait', wait)
      .pipe('parse payload', parseTravisPayload)
      .pipe('star repo', star)
      .pipe('fetch configuration', fetchConfiguration)
      .pipe('search for a stop comment', searchStopComment)
      .pipe('format message', formatMessage)
      .pipeIf(options.isTest !== true, 'publish', publish)
      .pipe('finish', finish)
      .afterPipe((context, pipe) =>
        logger.log(
          `Pipe ${pipe} finished`,
          { logType: 'pipe-finished' },
          context,
        ),
      )
      .beforePipe((context, pipe) => {
        if (!context) context = {};
        context.currentPipe = pipe;
        return context;
      })
      .resolve()
      .then(context => ({
        ok: true,
        status: 201,
        context: options.returnRequestContext ? context : undefined,
      }))
      .catch(error => {
        logger.error(error);

        return {
          ok: false,
          error: error.message,
          status: error.status,
        };
      })
      .then(result => res.status(result.status || 500).send(result)),
  );

  router.post('/rerun', async (req, res) =>
    paipu
      .pipe('load payload', {
        startTime: new Date().getTime(),
        payload: JSON.parse(req.body.payload),
        path: req.path,
      })
      .pipe('get metadata', metadata)
      .pipe('wait', wait)
      .pipe('parse payload', parseGithubPayload)
      .pipe('format message', formatMessage)
      .pipe('rerun jenkins build', rerun)
      .pipe(
        'dispute system-specific guidelines provided by the Danger bot',
        dispute,
      )
      .afterPipe((context, pipe) =>
        logger.log(
          `Pipe ${pipe} finished`,
          { logType: 'pipe-finished' },
          context,
        ),
      )
      .beforePipe((context, pipe) => {
        if (!context) context = {};
        context.currentPipe = pipe;
        return context;
      })
      .resolve()
      .then(context => ({
        ok: true,
        status: 202,
        owner: context.owner,
        repo: context.repo,
        pullRequestNumber: context.pullRequestNumber,
        action: context.action,
        comment: context.comment,
        commentAuthor: context.commentAuthor,
        commentUpdateAt: context.commentUpdateAt,
        travisBuildNumber: context.travisBuildNumber,
      }))
      .catch(error => {
        logger.error(error);

        return {
          ok: false,
          error: error.message,
          status: error.status,
        };
      })
      .then(result => res.status(result.status || 500).send(result)),
  );

  return router;
};

module.exports = {
  createApiRoutes,
};
