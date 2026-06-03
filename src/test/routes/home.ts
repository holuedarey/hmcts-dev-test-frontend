import { app } from '../../main/app';

import { expect } from 'chai';
import nock from 'nock';
import request from 'supertest';

const exampleCase = {
  id: 'case-1',
  caseNumber: 'CASE-001',
  title: 'Example case',
  description: 'Sample description',
  status: 'Open',
  createdDate: '2026-06-01',
};

describe('Home page', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  describe('on GET', () => {
    test('should return the home page when the example API succeeds', async () => {
      nock('http://localhost:4000').get('/get-example-case').reply(200, exampleCase);

      const response = await request(app).get('/');

      expect(response.status).to.equal(200);
      expect(response.text).to.include('Welcome to your dev test!');
      expect(response.text).to.include('Example case');
    });

    test('should return the home page when the example API fails', async () => {
      nock('http://localhost:4000').get('/get-example-case').reply(500, {
        message: 'An unexpected error occurred',
      });

      const response = await request(app).get('/');

      expect(response.status).to.equal(200);
      expect(response.text).to.include('Welcome to your dev test!');
      expect(response.text).not.to.include('Example case');
    });
  });
});
