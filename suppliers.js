// ─────────────────────────────────────────────────────────────────────────────
// SUPPLIERS CONFIG
// Pour ajouter un fournisseur : copier un bloc et adapter.
// taskId = ID de la task Apify (visible dans l'URL de la task)
// ─────────────────────────────────────────────────────────────────────────────

module.exports = {

  vws: {
    name: 'Vintage Wholesale Supply',
    taskId: 'zYM43vAB2qnEpHKoM',
    currency: 'GBP',
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
    currency: 'EUR',
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
        category:   (() => { const c = this.categoryMap[rawCat] || rawCat || null; return c && /^\d+$/.test(String(c).trim()) ? null : c; })(),
        tags:       normalizeTags(p.tags),
      };
    },
  },

  syed: {
    name: 'Syed Vintage',
    taskId: 'mPv93rYqvbzipEwCT',
    currency: 'GBP',
    mapProduct: (p) => ({
      title:      p.title || null,
      url:        p.source?.canonicalUrl || null,
      price:      p.variants?.[0]?.price?.current != null ? p.variants[0].price.current / 100 : null,
      image_url:  p.medias?.[0]?.url || null,
      category:   p.categories?.[0] || null,
      tags:       normalizeTags(p.tags),
    }),
  },

  ivw: {
    name: 'Italian Vintage Wholesale',
    taskId: 'b7DfqVgdCHLDz3beJ',
    currency: 'EUR',
    mapProduct: (p) => ({
      title:      p.title || null,
      url:        p.source?.canonicalUrl || null,
      price:      p.variants?.[0]?.price?.current != null ? p.variants[0].price.current / 100 : null,
      image_url:  p.medias?.[0]?.url || null,
      category:   p.categories?.[0] || null,
      tags:       normalizeTags(p.tags),
    }),
  },

  tvw: {
    name: 'TVW Vintage Wholesale',
    taskId: 'tonysiks~terranova-vintage-wholesale',
    currency: 'USD',
    mapProduct: (p) => ({
      title:      p.title || null,
      url:        p.source?.canonicalUrl || null,
      price:      p.variants?.[0]?.price?.current != null ? p.variants[0].price.current / 100 : null,
      image_url:  p.medias?.[0]?.url || null,
      category:   p.categories?.[0] || null,
      tags:       normalizeTags(p.tags),
    }),
  },

  vs1989: {
    name: 'Vintage Suppliers 1989',
    taskId: 'bzXhLalqv5UTFyJSB',
    currency: 'EUR',
    mapProduct: (p) => ({
      title:      p.title || null,
      url:        p.source?.canonicalUrl || null,
      price:      p.variants?.[0]?.price?.current != null ? p.variants[0].price.current / 100 : null,
      image_url:  p.medias?.[0]?.url || null,
      category:   p.categories?.[0] || null,
      tags:       normalizeTags(p.tags),
    }),
  },

  unitedvintage: {
    name: 'United Vintage',
    taskId: 'LxceDObj8RyvS5I0b',
    currency: 'EUR',
    mapProduct: (p) => {
      return {
      title:      p.title || null,
      url:        p.source?.canonicalUrl || null,
      price:      p.variants?.[0]?.price?.current != null ? p.variants[0].price.current / 100 : null,
      image_url:  p.medias?.[0]?.url || null,
      category:   p.categories?.[0] || null,
      tags:       normalizeTags(p.tags),
      };
    },
  },

  tagz: {
    name: 'TAGZ',
    taskId: 'VcGcp2dhCTW0w2VUN',
    currency: 'EUR',
    mapProduct: (p) => ({
      title:      p.title || null,
      url:        p.source?.canonicalUrl || null,
      price:      p.variants?.[0]?.price?.current ? p.variants[0].price.current / 100 : null,
      image_url:  p.medias?.[0]?.url || null,
      category:   p.categories?.[0] || null,
      fournisseur: 'TAGZ',
      tags:       normalizeTags(p.tags),
    }),
  },

  boxwholesale: {
    name: 'Box Wholesale France',
    taskId: 'tonysiks~box-wholesale-france',
    currency: 'EUR',
    mapProduct: (p) => ({
      title:      p.title || null,
      url:        p.source?.canonicalUrl || null,
      price:      p.variants?.[0]?.price?.current != null ? p.variants[0].price.current / 100 : null,
      image_url:  p.medias?.[0]?.url || null,
      category:   p.categories?.[0] || null,
      tags:       normalizeTags(p.tags),
    }),
  },

  notanotherwholesale: {
    name: 'Not Another Wholesale',
    taskId: 'H9CXs9yMJcwVZln4b',
    currency: 'EUR',
    mapProduct: (p) => ({
      title:      p.title || null,
      url:        p.source?.canonicalUrl || null,
      price:      p.variants?.[0]?.price?.current != null ? p.variants[0].price.current / 100 : null,
      image_url:  p.medias?.[0]?.url || null,
      category:   p.categories?.[0] || null,
      tags:       normalizeTags(p.tags),
    }),
  },

  vintagewholesaleeurope: {
    name: 'Vintage Wholesale Europe',
    taskId: 've45qjTMf2dNvg9Lg',
    currency: 'EUR',
    mapProduct: (p) => ({
      title:      p.title || null,
      url:        p.source?.canonicalUrl || null,
      price:      p.variants?.[0]?.price?.current ? p.variants[0].price.current / 100 : null,
      image_url:  p.medias?.[0]?.url || null,
      category:   p.categories?.[0] || null,
      tags:       normalizeTags(p.tags),
    }),
  },

  vinqa: {
    name: 'Vinqa',
    taskId: 'tonysiks~vinqa-grossiste',
    currency: 'EUR',
    mapProduct: (p) => ({
      title:      p.title || null,
      url:        p.source?.canonicalUrl || null,
      price:      p.variants?.[0]?.price?.current ? p.variants[0].price.current / 100 : null,
      image_url:  p.medias?.[0]?.url || null,
      category:   p.categories?.[0] || null,
      tags:       normalizeTags(p.tags),
    }),
  },

  placewholesale: {
    name: 'PlaceWholesale',
    taskId: 'tonysiks~place-wholesale',
    currency: 'EUR',
    mapProduct: (p) => ({
      title:      p.title || null,
      url:        p.source?.canonicalUrl || null,
      price:      p.variants?.[0]?.price?.current ? p.variants[0].price.current / 100 : null,
      image_url:  p.medias?.[0]?.url || null,
      category:   p.categories?.[0] || null,
      tags:       normalizeTags(p.tags),
    }),
  },

  vintagewholesalespain: {
    name: 'Vintage Wholesale Spain',
    taskId: 'tonysiks~vintage-wholesale-spain',
    currency: 'EUR',
    mapProduct: (p) => ({
      title:      p.title || null,
      url:        p.source?.canonicalUrl || null,
      price:      p.variants?.[0]?.price?.current ? p.variants[0].price.current / 100 : null,
      image_url:  p.medias?.[0]?.url || null,
      category:   p.categories?.[0] || null,
      tags:       normalizeTags(p.tags),
    }),
  },

  vintageboxmarket: {
    name: 'Vintage Box Market',
    taskId: 'tonysiks~vintage-box-market',
    currency: 'EUR',
    mapProduct: (p) => ({
      title:      p.title || null,
      url:        p.source?.canonicalUrl || null,
      price:      p.variants?.[0]?.price?.current ? p.variants[0].price.current / 100 : null,
      image_url:  p.medias?.[0]?.url || null,
      category:   p.categories?.[0] || null,
      tags:       normalizeTags(p.tags),
    }),
  },

  skullwholesale: {
    name: 'Skull Wholesale',
    taskId: 'tonysiks~skull-wholesale',
    currency: 'EUR',
    mapProduct: (p) => ({
      title:      p.title || null,
      url:        p.source?.canonicalUrl || null,
      price:      p.variants?.[0]?.price?.current ? p.variants[0].price.current / 100 : null,
      image_url:  p.medias?.[0]?.url || null,
      category:   p.categories?.[0] || null,
      tags:       normalizeTags(p.tags),
    }),
  },

  vesuvius: {
    name: 'Vesuvius',
    taskId: 'tonysiks~vesuvius-vintage-wholesale',
    currency: 'USD',
    mapProduct: (p) => ({
      title:      p.title || null,
      url:        p.source?.canonicalUrl || null,
      price:      p.variants?.[0]?.price?.current ? p.variants[0].price.current / 100 : null,
      image_url:  p.medias?.[0]?.url || null,
      category:   p.categories?.[0] || null,
      tags:       normalizeTags(p.tags),
    }),
  },

  raes: {
    name: 'RAES',
    taskId: 'tonysiks~raes-vintage-wholesale',
    currency: 'USD',
    mapProduct: (p) => ({
      title:      p.title || null,
      url:        p.source?.canonicalUrl || null,
      price:      p.variants?.[0]?.price?.current ? p.variants[0].price.current / 100 : null,
      image_url:  p.medias?.[0]?.url || null,
      category:   p.categories?.[0] || null,
      tags:       normalizeTags(p.tags),
    }),
  },

  usfripe: {
    name: 'USFripe',
    taskId: 'tonysiks~us-fripe',
    currency: 'EUR',
    mapProduct: (p) => ({
      title:      p.title || null,
      url:        p.source?.canonicalUrl || null,
      price:      p.variants?.[0]?.price?.current ? p.variants[0].price.current / 100 : null,
      image_url:  p.medias?.[0]?.url || null,
      category:   p.categories?.[0] || null,
      tags:       normalizeTags(p.tags),
    }),
  },

  laprovidence: {
    name: 'La Providence Wholesale',
    taskId: 'tonysiks~la-providence-wholesale',
    currency: 'EUR',
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
