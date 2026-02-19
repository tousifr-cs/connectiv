import { z } from 'zod';
import { insertCreatorSchema, creators } from './schema';

export const errorSchemas = {
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  creators: {
    list: {
      method: 'GET' as const,
      path: '/api/creators' as const,
      input: z.object({
        search: z.string().optional(),
        platform: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof creators.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/creators/:id' as const,
      responses: {
        200: z.custom<typeof creators.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
