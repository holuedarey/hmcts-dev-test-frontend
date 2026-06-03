import { taskService } from '../../../main/services/taskService';
import { Task } from '../../../main/types/task';

import config from 'config';
import nock from 'nock';

const baseUrl = config.get<string>('taskApi.baseUrl');

const sampleTask: Task = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  title: 'Review case file',
  description: 'Check documents before hearing',
  status: 'PENDING',
  dueDateTime: '2026-06-15T14:00:00',
  createdAt: '2026-06-01T09:00:00',
  updatedAt: '2026-06-01T09:00:00',
};

describe('taskService', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  test('getAll returns tasks from the API', async () => {
    nock(baseUrl).get('/tasks').reply(200, [sampleTask]);

    await expect(taskService.getAll()).resolves.toEqual([sampleTask]);
  });

  test('getById returns a single task', async () => {
    nock(baseUrl).get(`/tasks/${sampleTask.id}`).reply(200, sampleTask);

    await expect(taskService.getById(sampleTask.id)).resolves.toEqual(sampleTask);
  });

  test('create sends a POST request with the task payload', async () => {
    nock(baseUrl)
      .post('/tasks', {
        title: 'New task',
        dueDateTime: '2026-06-15T14:00:00',
      })
      .reply(201, sampleTask);

    await expect(
      taskService.create({
        title: 'New task',
        dueDateTime: '2026-06-15T14:00:00',
      })
    ).resolves.toEqual(sampleTask);
  });

  test('updateStatus sends a PATCH request', async () => {
    nock(baseUrl)
      .patch(`/tasks/${sampleTask.id}/status`, { status: 'COMPLETED' })
      .reply(200, { ...sampleTask, status: 'COMPLETED' });

    await expect(taskService.updateStatus(sampleTask.id, { status: 'COMPLETED' })).resolves.toEqual({
      ...sampleTask,
      status: 'COMPLETED',
    });
  });

  test('delete sends a DELETE request', async () => {
    nock(baseUrl).delete(`/tasks/${sampleTask.id}`).reply(204);

    await expect(taskService.delete(sampleTask.id)).resolves.toBeUndefined();
  });

  test('throws TaskApiError when the API returns an error response', async () => {
    nock(baseUrl)
      .get('/tasks')
      .reply(400, {
        message: 'Validation failed',
        errors: ['Title is required'],
      });

    await expect(taskService.getAll()).rejects.toMatchObject({
      message: 'Validation failed',
      status: 400,
      errors: ['Title is required'],
    });
  });
});
