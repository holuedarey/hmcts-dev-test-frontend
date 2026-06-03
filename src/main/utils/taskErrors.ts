import { TaskApiError } from '../types/taskApiError';

export interface ErrorViewModel {
  message: string;
  errors?: string[];
}

export function toErrorViewModel(error: unknown): ErrorViewModel {
  if (error instanceof TaskApiError) {
    return {
      message: error.message,
      errors: error.errors,
    };
  }

  return { message: 'An unexpected error occurred' };
}

export function isTaskApiError(error: unknown): error is TaskApiError {
  return error instanceof TaskApiError;
}

export function toErrorSummaryList(error: ErrorViewModel): { text: string }[] {
  if (error.errors?.length) {
    return error.errors.map(text => ({ text }));
  }

  return [{ text: error.message }];
}
