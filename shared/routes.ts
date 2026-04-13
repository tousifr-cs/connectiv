import { z } from "zod";
import {
  insertProSchema,
  insertBookingSchema,
  updateBookingStatusSchema,
  updateProSchema,
  updateUserProfileSchema,
  insertConnectionRequestSchema,
  adminUpdateProSchema,
  adminRegisterSchema,
  adminSetUserRoleSchema,
  pros,
  bookings,
  connectionRequests,
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

  pros: {
    list: {
      method: "GET" as const,
      path: "/api/pros" as const,
      input: z
        .object({
          search: z.string().optional(),
          platform: z.string().optional(),
        })
        .optional(),
      responses: {
        200: z.array(z.custom<typeof pros.$inferSelect>()),
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/pros/:id" as const,
      responses: {
        200: z.custom<typeof pros.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/pros" as const,
      input: insertProSchema,
      responses: {
        201: z.custom<typeof pros.$inferSelect>(),
        400: errorSchemas.badRequest,
      },
    },
  },

  me: {
    profile: {
      method: "GET" as const,
      path: "/api/me/profile" as const,
    },
    updateProfile: {
      method: "PATCH" as const,
      path: "/api/me/profile" as const,
      input: updateUserProfileSchema,
    },
    pro: {
      method: "GET" as const,
      path: "/api/me/pro" as const,
      responses: {
        200: z.custom<typeof pros.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    updatePro: {
      method: "PATCH" as const,
      path: "/api/me/pro" as const,
      input: updateProSchema,
      responses: {
        200: z.custom<typeof pros.$inferSelect>(),
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

  connectionRequests: {
    create: {
      method: "POST" as const,
      path: "/api/connection-requests" as const,
      input: insertConnectionRequestSchema,
      responses: {
        201: z.custom<typeof connectionRequests.$inferSelect>(),
        400: errorSchemas.badRequest,
      },
    },
    list: {
      method: "GET" as const,
      path: "/api/me/connection-requests" as const,
    },
  },

  admin: {
    updatePro: {
      method: "PATCH" as const,
      path: "/api/admin/pros/:id" as const,
      input: adminUpdateProSchema,
      responses: {
        200: z.custom<typeof pros.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    register: {
      method: "POST" as const,
      path: "/api/admin/register" as const,
      input: adminRegisterSchema,
    },
    /** @deprecated Alias — POST /api/admin/register */
    bootstrap: {
      method: "POST" as const,
      path: "/api/admin/bootstrap" as const,
      input: adminRegisterSchema,
    },
    setUserRole: {
      method: "PATCH" as const,
      path: "/api/admin/users/:userId/role" as const,
      input: adminSetUserRoleSchema,
    },
    connectionRequests: {
      method: "GET" as const,
      path: "/api/admin/connection-requests" as const,
    },
    users: {
      method: "GET" as const,
      path: "/api/admin/users" as const,
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
