/**
 * Page routes
 *
 * Custom routes are defined BEFORE the core routes so they take priority.
 * This avoids conflicts with :id params catching "tree" or "by-path".
 */

import { factories } from '@strapi/strapi';

// Core CRUD routes
const coreRoutes = factories.createCoreRouter('api::page.page');

// Custom routes
const customRoutes = {
  routes: [
    {
      method: 'GET',
      path: '/pages/tree',
      handler: 'api::page.page.tree',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/pages/by-path/*',
      handler: 'api::page.page.findByPath',
      config: {
        auth: false,
      },
    },
  ],
};

export default {
  routes: [
    ...customRoutes.routes,
    // @ts-ignore — Strapi core router returns an object with routes array
    ...(coreRoutes as any).routes,
  ],
};
