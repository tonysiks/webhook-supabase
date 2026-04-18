// ─────────────────────────────────────────────────────────────────────────────
// SUPPLIERS CONFIG
// Pour ajouter un fournisseur : copier un bloc et adapter.
// taskId = ID de la task Apify (visible dans l'URL de la task)
// ─────────────────────────────────────────────────────────────────────────────

module.exports = {

  vws: {
    name: 'Vintage Wholesale Supply',
    taskId: 'zYM43vAB2qnEpHKoM',
    mapProduct: (p) => ({
      title:      p.title || null,
      url:        p.source?.canonicalUrl || null,
      price:      p.variants?.[0]?.price?.current != null ? p.variants[0].price.current / 100 : null,
      image_url:  p.medias?.[0]?.url || null,
      category:   p.categories?.[0] || null,
      tags:       normalizeTags(p.tags),
    }),
  },

  wing999: {
    name: 'Wing999',
    taskId: 'qzEAyYVmGFipzhxFz',
    categoryMap: {
      '100': 'Tops',
      '200': 'Bottoms',
      '300': 'Outerwear',
      '400': 'Dresses',
      '500': 'Accessories',
      '600': 'Footwear',
      '700': 'Sportswear',
      '800': 'Denim',
      '900': 'Knitwear',
    },
    mapProduct: function(p) {
      const rawCat = p.categories?.[0] || null;
      return {
        title:      p.title || null,
        url:        p.source?.canonicalUrl || null,
        price:      p.variants?.[0]?.price?.current != null ? p.variants[0].price.current / 100 : null,
        image_url:  p.medias?.[0]?.url || null,
        category:   this.categoryMap[rawCat] || rawCat || null,
        tags:       normalizeTags(p.tags),
      };
    },
  },

  syed: {
    name: 'Syed Vintage',
    taskId: 'mPv93rYqvbzipEwCT',
    mapProduct: (p) => ({
      title:      p.title || null,
      url:        p.source?.canonicalUrl || null,
      price:      p.variants?.[0]?.price?.current != null ? p.variants[0].price.current / 100 : null,
      image_url:  p.medias?.[0]?.url || null,
      category:   p.categories?.[0] || null,
      tags:       normalizeTags(p.tags),
    }),
  },

  // ── Template pour ajouter un nouveau fournisseur ──────────────────────────
  // new_supplier: {
  //   name: 'Nom du fournisseur',
  //   taskId: 'APIFY_TASK_ID',   ← ID visible dans l'URL de la task Apify
  //   mapProduct: (p) => ({
  //     title:      p.title || null,
  //     url:        p.source?.canonicalUrl || null,
  //     price:      p.variants?.[0]?.price?.current != null ? p.variants[0].price.current / 100 : null,
  //     image_url:  p.medias?.[0]?.url || null,
  //     category:   p.categories?.[0] || null,
  //     tags:       normalizeTags(p.tags),
  //   }),
  // },

};

// ── Helpers ───────────────────────────────────────────────────────────────────

function parsePrice(val) {
  if (!val) return null;
  const n = parseFloat(String(val).replace(/[^0-9.]/g, ''));
  return isNaN(n) ? null : n;
}

function normalizeTags(tags) {
  if (!tags) return null;
  if (Array.isArray(tags)) return tags.join(', ');
  return String(tags);
}
