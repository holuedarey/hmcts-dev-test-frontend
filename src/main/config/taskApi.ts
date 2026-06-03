import config from 'config';

const TASK_API_BASE_URL = config.get<string>('taskApi.baseUrl');

export const taskApi = {
  baseUrl: TASK_API_BASE_URL,
  tasks: `${TASK_API_BASE_URL}/tasks`,
  taskById: (id: string): string => `${TASK_API_BASE_URL}/tasks/${id}`,
  taskStatus: (id: string): string => `${TASK_API_BASE_URL}/tasks/${id}/status`,
};
