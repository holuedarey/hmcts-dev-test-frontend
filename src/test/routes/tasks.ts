import { app } from '../../main/app';

import { expect } from 'chai';
import config from 'config';
import nock from 'nock';
import request from 'supertest';

const baseUrl = config.get<string>('taskApi.baseUrl');

const sampleTask = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  title: 'Review case file',
  description: 'Check documents before hearing',
  status: 'PENDING',
  dueDateTime: '2026-06-15T14:00:00',
  createdAt: '2026-06-01T09:00:00',
  updatedAt: '2026-06-01T09:00:00',
};

describe('Tasks routes', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  describe('GET /tasks', () => {
    test('should render the task list', async () => {
      nock(baseUrl).get('/tasks').reply(200, [sampleTask]);

      const response = await request(app).get('/tasks');

      expect(response.status).to.equal(200);
      expect(response.text).to.include('Review case file');
      expect(response.text).to.include('Pending');
    });
  });

  describe('GET /tasks/:id', () => {
    test('should render a task detail page', async () => {
      nock(baseUrl).get(`/tasks/${sampleTask.id}`).reply(200, sampleTask);

      const response = await request(app).get(`/tasks/${sampleTask.id}`);

      expect(response.status).to.equal(200);
      expect(response.text).to.include('Review case file');
    });

    test('should return 404 when the task is missing', async () => {
      nock(baseUrl).get(`/tasks/${sampleTask.id}`).reply(404, { message: 'Task not found' });

      const response = await request(app).get(`/tasks/${sampleTask.id}`);

      expect(response.status).to.equal(404);
      expect(response.text).to.include('Task not found');
    });
  });
});
