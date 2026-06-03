import { HTTPError } from '../HttpError';
import { TASK_STATUS_LABELS, TASK_STATUS_OPTIONS } from '../constants/taskStatuses';
import { taskService } from '../services/taskService';
import { CreateTaskRequest, Task, TaskStatus } from '../types/task';
import { isTaskApiError, toErrorSummaryList, toErrorViewModel } from '../utils/taskErrors';

import { Application, NextFunction, Request, Response } from 'express';

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function toDetailView(task: Task) {
  return {
    ...task,
    statusLabel: TASK_STATUS_LABELS[task.status],
    dueDateTimeFormatted: formatDateTime(task.dueDateTime),
    createdAtFormatted: formatDateTime(task.createdAt),
    updatedAtFormatted: formatDateTime(task.updatedAt),
  };
}

export default function (app: Application): void {
  app.get('/tasks', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tasks = await taskService.getAll();

      res.render('tasks/list', {
        tableRows: tasks.map(task => [
          { text: task.title },
          { text: TASK_STATUS_LABELS[task.status] },
          { text: formatDateTime(task.dueDateTime) },
          { html: `<a class="govuk-link" href="/tasks/${task.id}">View</a>` },
        ]),
      });
    } catch (error) {
      if (isTaskApiError(error) && error.status >= 500) {
        next(new HTTPError(error.message, error.status));
        return;
      }

      res.render('tasks/list', {
        tableRows: [],
        error: toErrorViewModel(error),
      });
    }
  });

  app.get('/tasks/new', (req: Request, res: Response) => {
    res.render('tasks/create', {
      statusOptions: TASK_STATUS_OPTIONS,
      form: {
        title: '',
        description: '',
        status: 'PENDING' as TaskStatus,
        dueDateTime: '',
      },
    });
  });

  app.post('/tasks', async (req: Request, res: Response, next: NextFunction) => {
    const form = {
      title: (req.body.title as string | undefined)?.trim() ?? '',
      description: (req.body.description as string | undefined)?.trim() ?? '',
      status: (req.body.status as TaskStatus | undefined) ?? 'PENDING',
      dueDateTime: (req.body.dueDateTime as string | undefined)?.trim() ?? '',
    };

    const payload: CreateTaskRequest = {
      title: form.title,
      dueDateTime: form.dueDateTime,
    };

    if (form.description) {
      payload.description = form.description;
    }

    if (form.status) {
      payload.status = form.status;
    }

    try {
      const task = await taskService.create(payload);
      res.redirect(`/tasks/${task.id}`);
    } catch (error) {
      if (isTaskApiError(error) && error.status === 400) {
        res.render('tasks/create', {
          statusOptions: TASK_STATUS_OPTIONS,
          form,
          error: toErrorViewModel(error),
          errorSummary: toErrorSummaryList(toErrorViewModel(error)),
        });
        return;
      }

      if (isTaskApiError(error) && error.status >= 500) {
        next(new HTTPError(error.message, error.status));
        return;
      }

      res.render('tasks/create', {
        statusOptions: TASK_STATUS_OPTIONS,
        form,
        error: toErrorViewModel(error),
        errorSummary: toErrorSummaryList(toErrorViewModel(error)),
      });
    }
  });

  app.get('/tasks/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const task = await taskService.getById(req.params.id);

      res.render('tasks/detail', {
        task: toDetailView(task),
        statusOptions: TASK_STATUS_OPTIONS,
      });
    } catch (error) {
      if (isTaskApiError(error) && error.status === 404) {
        res.status(404).render('tasks/not-found');
        return;
      }

      if (isTaskApiError(error) && error.status >= 500) {
        next(new HTTPError(error.message, error.status));
        return;
      }

      next(new HTTPError(toErrorViewModel(error).message, 500));
    }
  });

  app.patch('/tasks/:id/status', async (req: Request, res: Response, next: NextFunction) => {
    const status = req.body.status as TaskStatus;

    try {
      await taskService.updateStatus(req.params.id, { status });
      res.redirect(`/tasks/${req.params.id}`);
    } catch (error) {
      if (isTaskApiError(error) && error.status === 404) {
        res.status(404).render('tasks/not-found');
        return;
      }

      if (isTaskApiError(error) && error.status === 400) {
        try {
          const task = await taskService.getById(req.params.id);

          res.render('tasks/detail', {
            task: toDetailView(task),
            statusOptions: TASK_STATUS_OPTIONS,
            error: toErrorViewModel(error),
            errorSummary: toErrorSummaryList(toErrorViewModel(error)),
          });
        } catch (detailError) {
          if (isTaskApiError(detailError) && detailError.status === 404) {
            res.status(404).render('tasks/not-found');
            return;
          }

          next(new HTTPError(toErrorViewModel(detailError).message, 500));
        }
        return;
      }

      if (isTaskApiError(error) && error.status >= 500) {
        next(new HTTPError(error.message, error.status));
        return;
      }

      next(new HTTPError(toErrorViewModel(error).message, 500));
    }
  });

  app.delete('/tasks/:id/delete', async (req: Request, res: Response, next: NextFunction) => {
    try {
      await taskService.delete(req.params.id);
      res.redirect('/tasks');
    } catch (error) {
      if (isTaskApiError(error) && error.status === 404) {
        res.status(404).render('tasks/not-found');
        return;
      }

      if (isTaskApiError(error) && error.status >= 500) {
        next(new HTTPError(error.message, error.status));
        return;
      }

      next(new HTTPError(toErrorViewModel(error).message, 500));
    }
  });
}
