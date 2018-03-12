const request = require('supertest');
const app = require('../app');
const samplePayload = require('./../sample-payloads/payload2.json');
const GitHub = require('github-api');
const utils = require('../utils/utils');


describe('api', () => {
  describe('POST /', () => {
    it('should return HTTP status 200 and ok message', (done) => {
      request(app)
        .post('/')
        .send({ payload: JSON.stringify(samplePayload) })
        .expect(200)
        .expect({ err: false })
        .end((err) => {
          if (err) return done(err);
          done();
        });
    }).timeout(10000);
  });

  describe('GET /status', () => {
    it('should be running and return HTTP status 200', (done) => {
      request(app)
        .get('/status')
        .expect(200)
        .expect({ state: 'running' })
        .end((err) => {
          if (err) return done(err);
          done();
        });
    });
  });

  // describe('GET /test', () => {
  //   it('should return HTTP status 200', (done) => {
  //     request(app)
  //       .get('/test/node_js/295503460')
  //       .expect(200)
  //       .end((err) => {
  //         if (err) return done(err);
  //         done();
  //       });
  //   }).timeout(10000);
  // });
});

describe('site', () => {
  describe('GET /', () => {
    it('should return HTML and status 200', (done) => {
      request(app)
        .get('/')
        .expect(200)
        .expect('Content-Type', /html/)
        .end((err) => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe('GET /getting-started', () => {
    it('should return HTML and status 200', (done) => {
      request(app)
        .get('/getting-started')
        .expect(200)
        .expect('Content-Type', /html/)
        .end((err) => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe('GET /contact-us', () => {
    it('should return HTML and status 200', (done) => {
      request(app)
        .get('/contact-us')
        .expect(200)
        .expect('Content-Type', /html/)
        .end((err) => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe('GET /dashboard', () => {
    it('should return HTML and status 200', (done) => {
      request(app)
        .get('/dashboard')
        .expect(200)
        .expect('Content-Type', /html/)
        .end((err) => {
          if (err) return done(err);
          done();
        });
    });
  });
});
