/**
 * Centralized route configuration for the application
 * This file defines all route paths and their access requirements
 */

export const ROUTE_PATHS = {
  // Public routes
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",

  // Protected routes (require authentication)
  PROFILE: "/profile",
  ACTIVITIES: "/activities",
  AGENCES: "/agences",
  EVENEMENTS: "/evenements",
  CONVENTIONS: "/conventions",

  // Admin/Responsible routes
  RESPONSABLE: "/responsable",

  // Confirmation routes
  WAITING_CONFIRMATION: "/waitingforconfirmation",
  DENIED_CONFIRMATION: "/deniedforconfirmation",
} as const;

export const ROUTE_CONFIG = {
  // Routes that require authentication
  protected: [
    ROUTE_PATHS.PROFILE,
    ROUTE_PATHS.ACTIVITIES,
    ROUTE_PATHS.AGENCES,
    ROUTE_PATHS.EVENEMENTS,
    ROUTE_PATHS.CONVENTIONS,
    ROUTE_PATHS.RESPONSABLE,
  ],

  // Routes accessible only when not authenticated
  publicOnly: [
    ROUTE_PATHS.LOGIN,
    ROUTE_PATHS.SIGNUP,
  ],

  // Routes for users awaiting confirmation
  confirmation: [
    ROUTE_PATHS.WAITING_CONFIRMATION,
    ROUTE_PATHS.DENIED_CONFIRMATION,
  ],

  // Routes requiring specific roles
  roleSpecific: {
    responsable: [ROUTE_PATHS.RESPONSABLE],
  },
} as const;

export type RoutePath = typeof ROUTE_PATHS[keyof typeof ROUTE_PATHS];
