import { ApiError } from '../types/task';
import { TaskApiError } from '../types/taskApiError';

import axios, { AxiosRequestConfig, isAxiosError } from 'axios';
import config from 'config';

export const httpClient = axios.create({
  baseURL: config.get<string>('taskApi.baseUrl'),
  headers: { 'Content-Type': 'application/json' },
});

export async function apiRequest<T>(url: string, options?: AxiosRequestConfig): Promise<T> {
  try {
    const response = await httpClient.request<T>({ url, ...options });

    if (response.status === 204) {
      return undefined as T;
    }

    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      const apiError = error.response.data as ApiError | undefined;

      throw new TaskApiError(apiError?.message ?? error.response.statusText, error.response.status, apiError?.errors);
    }

    throw new TaskApiError('An unexpected error occurred', 500);
  }
}
