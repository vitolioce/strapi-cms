/**
 * Page controller
 *
 * Custom endpoints:
 *   GET /api/pages/tree        → full page tree (for navigation/sitemap)
 *   GET /api/pages/by-path/:path  → resolve a page by its full_path
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::page.page', ({ strapi }) => ({
  // ── GET /api/pages/tree ──────────────────────────────────────────
  async tree(ctx) {
    // Fetch all published pages with parent relation
    const pages = await strapi.documents('api::page.page').findMany({
      fields: ['title', 'slug', 'full_path', 'order', 'seo_title'],
      populate: {
        parent: { fields: ['documentId'] },
      },
      sort: [{ order: 'asc' }, { title: 'asc' }],
      status: 'published',
      limit: -1,
    });

    // Build tree structure
    const tree = buildTree(pages);

    ctx.body = { data: tree };
  },

  // ── GET /api/pages/by-path/:path ──────────────────────────────────
  async findByPath(ctx) {
    const requestedPath = ctx.params['*'] || ctx.params.path;
    const fullPath = requestedPath.startsWith('/')
      ? requestedPath
      : `/${requestedPath}`;

    const pages = await strapi.documents('api::page.page').findMany({
      filters: { full_path: { $eq: fullPath } },
      populate: {
        content: { populate: '*' },
        parent: { fields: ['documentId', 'title', 'slug', 'full_path'] },
        children: {
          fields: ['documentId', 'title', 'slug', 'full_path', 'order'],
          sort: [{ order: 'asc' }, { title: 'asc' }],
        },
      },
      status: 'published',
      limit: 1,
    });

    const page = pages?.[0];

    if (!page) {
      return ctx.notFound('Page not found');
    }

    // Build breadcrumb from hierarchy
    const breadcrumbs = await buildBreadcrumbs(strapi, page);

    ctx.body = {
      data: {
        ...page,
        breadcrumbs,
      },
    };
  },

  // ── Override default find to include hierarchy info ────────────────
  async find(ctx) {
    // Add default populate for parent/children/content if not specified
    if (!ctx.query.populate) {
      ctx.query.populate = {
        parent: { fields: ['documentId', 'title', 'slug', 'full_path'] },
        children: {
          fields: ['documentId', 'title', 'slug', 'full_path', 'order'],
          sort: [{ order: 'asc' }, { title: 'asc' }],
        },
        content: { populate: '*' },
      };
    }

    const { data, meta } = await super.find(ctx);
    return { data, meta };
  },
}));

// ── Helper: build a tree from a flat list of pages ────────────────────
function buildTree(pages: any[]) {
  const map = new Map<string, any>();
  const roots: any[] = [];

  // Index all pages by documentId
  for (const page of pages) {
    map.set(page.documentId, {
      documentId: page.documentId,
      title: page.title,
      slug: page.slug,
      full_path: page.full_path,
      order: page.order,
      seo_title: page.seo_title,
      children: [],
    });
  }

  // Build parent-child relationships
  for (const page of pages) {
    const node = map.get(page.documentId);
    const parentId = page.parent?.documentId;

    if (parentId && map.has(parentId)) {
      map.get(parentId).children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

// ── Helper: build breadcrumbs walking up the hierarchy ────────────────
async function buildBreadcrumbs(strapi: any, page: any) {
  const crumbs: Array<{ title: string; slug: string; full_path: string }> = [];
  let current = page;

  // Walk up the tree
  while (current) {
    crumbs.unshift({
      title: current.title,
      slug: current.slug,
      full_path: current.full_path,
    });

    if (current.parent?.documentId) {
      current = await strapi.documents('api::page.page').findOne({
        documentId: current.parent.documentId,
        fields: ['title', 'slug', 'full_path'],
        populate: { parent: { fields: ['documentId'] } },
      });
    } else {
      break;
    }
  }

  return crumbs;
}
