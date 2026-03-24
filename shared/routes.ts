import { z } from "zod";
import {
  insertCreatorSchema,
  insertBookingSchema,
  updateBookingStatusSchema,
  updateCreatorSchema,
  creators,
  bookings,
} from "./schema";

export const errorSchemas = {
  notFound: z.object({ message: z.string() }),
  unauthorized: z.object({ message: z.string() }),
  badRequest: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export const api = {
  auth: {
    sync: {
      method: "POST" as const,
      path: "/api/auth/sync" as const,
    },
  },

  creators: {
    list: {
      method: "GET" as const,
      path: "/api/creators" as const,
      input: z
        .object({
          search: z.string().optional(),
          platform: z.string().optional(),
        })
        .optional(),
      responses: {
        200: z.array(z.custom<typeof creators.$inferSelect>()),
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/creators/:id" as const,
      responses: {
        200: z.custom<typeof creators.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/creators" as const,
      input: insertCreatorSchema,
      responses: {
        201: z.custom<typeof creators.$inferSelect>(),
        400: errorSchemas.badRequest,
      },
    },
  },

  me: {
    creator: {
      method: "GET" as const,
      path: "/api/me/creator" as const,
      responses: {
        200: z.custom<typeof creators.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    updateCreator: {
      method: "PATCH" as const,
      path: "/api/me/creator" as const,
      input: updateCreatorSchema,
      responses: {
        200: z.custom<typeof creators.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    bookings: {
      method: "GET" as const,
      path: "/api/me/bookings" as const,
    },
    requests: {
      method: "GET" as const,
      path: "/api/me/requests" as const,
    },
    earnings: {
      method: "GET" as const,
      path: "/api/me/earnings" as const,
    },
  },

  bookings: {
    create: {
      method: "POST" as const,
      path: "/api/bookings" as const,
      input: insertBookingSchema,
      responses: {
        201: z.custom<typeof bookings.$inferSelect>(),
        400: errorSchemas.badRequest,
      },
    },
    updateStatus: {
      method: "PATCH" as const,
      path: "/api/bookings/:id/status" as const,
      input: updateBookingStatusSchema,
    },
  },

  rooms: {
    get: {
      method: "GET" as const,
      path: "/api/rooms/:roomId" as const,
    },
  },

  upload: {
    method: "POST" as const,
    path: "/api/upload" as const,
  },
};

export function buildUrl(
  path: string,
  params?: Record<string, string | number>,
): string {
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
