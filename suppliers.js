// ─────────────────────────────────────────────────────────────────────────────
// SUPPLIERS CONFIG
// Pour ajouter un fournisseur : copier un bloc existant et adapter les champs.
// ─────────────────────────────────────────────────────────────────────────────

module.exports = {

  vws: {
    name: 'Vintage Wholesale Supply',
    mapProduct: (p) => ({
      title:      p.title || null,
      url:        p.url || p.handle || null,
      price:      parsePrice(p.price),
      image_url:  p.images?.[0] || p.featuredImage || null,
      category:   p.productType || p.type || p.category || null,
      tags:       normalizeTags(p.tags),
    }),
  },

  wing999: {
    name: 'Wing999',
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
      const rawCat = p.productType || p.type || p.category || null;
      return {
        title:      p.title || null,
        url:        p.url || p.handle || null,
        price:      parsePrice(p.price),
        image_url:  p.images?.[0] || p.featuredImage || null,
        category:   this.categoryMap[rawCat] || rawCat || null,
        tags:       normalizeTags(p.tags),
      };
    },
  },

  // ── Template pour ajouter un nouveau fournisseur ──────────────────────────
  // example_supplier: {
  //   name: 'Example Supplier',
  //   mapProduct: (p) => ({
  //     title:      p.name || p.title || null,
  //     url:        p.link || p.url || null,
  //     price:      parsePrice(p.price),
  //     image_url:  p.photo || p.images?.[0] || null,
  //     category:   p.type || null,
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
