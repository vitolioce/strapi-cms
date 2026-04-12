/**
 * Page lifecycle hooks
 *
 * Automatically computes `full_path` from the page hierarchy.
 * When a page's slug or parent changes, the full_path of the page
 * AND all its descendants is recalculated.
 *
 * Note: In Strapi v5, `strapi` is available as a global instance.
 */

async function buildFullPath(
  slug: string,
  parentId: string | null
): Promise<string> {
  if (!parentId) {
    return `/${slug}`;
  }

  const parent = await strapi.documents('api::page.page').findOne({
    documentId: parentId,
    fields: ['slug', 'full_path'],
  });

  if (!parent) {
    return `/${slug}`;
  }

  const parentPath = parent.full_path || `/${parent.slug}`;
  return `${parentPath}/${slug}`;
}

async function updateChildrenPaths(documentId: string, parentFullPath: string) {
  const children = await strapi.documents('api::page.page').findMany({
    filters: { parent: { documentId: { $eq: documentId } } },
    fields: ['slug', 'full_path'],
  });

  for (const child of children) {
    const newFullPath = `${parentFullPath}/${child.slug}`;
    if (child.full_path !== newFullPath) {
      await strapi.documents('api::page.page').update({
        documentId: child.documentId,
        data: { full_path: newFullPath },
      });
      // Recursively update grandchildren
      await updateChildrenPaths(child.documentId, newFullPath);
    }
  }
}

/**
 * Extract parent documentId from various data formats.
 * Strapi v5 can send parent as:
 *  - { documentId: "abc" }  (object with documentId)
 *  - "abc"                  (string documentId directly)
 *  - { connect: [{ documentId: "abc" }] }  (relation connect format)
 *  - null / undefined
 */
function resolveParentId(parent: any): string | null {
  if (!parent) return null;
  if (typeof parent === 'string') return parent;
  if (parent.documentId) return parent.documentId;
  if (parent.connect?.[0]?.documentId) return parent.connect[0].documentId;
  // If disconnect is set, parent is being removed
  if (parent.disconnect?.length > 0) return null;
  return null;
}

export default {
  async beforeCreate(event: any) {
    const { data } = event.params;
    const slug = data.slug;
    const parentId = resolveParentId(data.parent);

    if (slug) {
      data.full_path = await buildFullPath(slug, parentId);
    }
  },

  async beforeUpdate(event: any) {
    const { data } = event.params;
    const documentId = event.params?.where?.documentId || event.params?.documentId;

    // Only recalculate if slug or parent changed
    if (data.slug !== undefined || data.parent !== undefined) {
      let slug = data.slug;
      let parentId = resolveParentId(data.parent);

      // If slug wasn't changed, fetch current slug
      if (!slug && documentId) {
        const current = await strapi.documents('api::page.page').findOne({
          documentId,
          fields: ['slug'],
        });
        slug = current?.slug;
      }

      if (slug) {
        data.full_path = await buildFullPath(slug, parentId);
      }
    }
  },

  async afterUpdate(event: any) {
    const { result } = event;

    // If full_path was updated, cascade to children
    if (result?.full_path && result?.documentId) {
      await updateChildrenPaths(result.documentId, result.full_path);
    }
  },
};
