import { CreateTaskRequest, Task, UpdateTaskStatusRequest } from '../types/task';

import { apiRequest } from './apiClient';

export const taskService = {
  getAll: (): Promise<Task[]> => apiRequest<Task[]>('/tasks'),

  getById: (id: string): Promise<Task> => apiRequest<Task>(`/tasks/${id}`),

  create: (body: CreateTaskRequest): Promise<Task> => apiRequest<Task>('/tasks', { method: 'POST', data: body }),

  updateStatus: (id: string, body: UpdateTaskStatusRequest): Promise<Task> =>
    apiRequest<Task>(`/tasks/${id}/status`, { method: 'PATCH', data: body }),

  delete: (id: string): Promise<void> => apiRequest<void>(`/tasks/${id}`, { method: 'DELETE' }),
};
