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
    mapProduct: (p) => {
      let price = p.variants?.[0]?.price?.current != null ? p.variants[0].price.current / 100 : null;
      const desc = p.description || '';
      const m = desc.match(/£([\d.]+)\s*per piece.*?(\d+)\s*pieces?\s*per\s*bale/i);
      if (m) {
        price = Math.round(parseFloat(m[1]) * parseInt(m[2]) * 100) / 100;
      }
      return {
        title:      p.title || null,
        url:        p.source?.canonicalUrl || null,
        price,
        image_url:  p.medias?.[0]?.url || null,
        category:   p.categories?.[0] || null,
        tags:       normalizeTags(p.tags),
        stockStatus: p.variants?.[0]?.price?.stockStatus ||
                     p.variants?.[0]?.stockStatus ||
                     (p.available !== undefined ? (p.available ? 'InStock' : 'OutOfStock') : null),
      };
    },
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
        stockStatus: p.variants?.[0]?.price?.stockStatus ||
                     p.variants?.[0]?.stockStatus ||
                     (p.available !== undefined ? (p.available ? 'InStock' : 'OutOfStock') : null),
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
      stockStatus: p.variants?.[0]?.price?.stockStatus ||
                   p.variants?.[0]?.stockStatus ||
                   (p.available !== undefined ? (p.available ? 'InStock' : 'OutOfStock') : null),
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
      stockStatus: p.variants?.[0]?.price?.stockStatus ||
                   p.variants?.[0]?.stockStatus ||
                   (p.available !== undefined ? (p.available ? 'InStock' : 'OutOfStock') : null),
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
      stockStatus: p.variants?.[0]?.price?.stockStatus ||
                   p.variants?.[0]?.stockStatus ||
                   (p.available !== undefined ? (p.available ? 'InStock' : 'OutOfStock') : null),
    }),
  },

  vs1989: {
    name: 'Vintage Suppliers 1989',
    taskId: 'bzXhLalqv5UTFyJSB',
    currency: 'EUR',
    mapProduct: (p) => {
      let price = p.variants?.[0]?.price?.current != null ? p.variants[0].price.current / 100 : null;
      const mPrice = (p.description || '').match(/Starting from ([\d,\.]+)[£€$]\/Kg/i);
      const mKg    = (p.title || '').match(/(\d+)\s*KG/i);
      if (mPrice && mKg) {
        price = Math.round(parseFloat(mPrice[1].replace(',', '.')) * parseInt(mKg[1]) * 100) / 100;
      }
      return {
        title:      p.title || null,
        url:        p.source?.canonicalUrl || null,
        price,
        image_url:  p.medias?.[0]?.url || null,
        category:   p.categories?.[0] || null,
        tags:       normalizeTags(p.tags),
        stockStatus: p.variants?.[0]?.price?.stockStatus ||
                     p.variants?.[0]?.stockStatus ||
                     (p.available !== undefined ? (p.available ? 'InStock' : 'OutOfStock') : null),
      };
    },
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
      stockStatus: p.variants?.[0]?.price?.stockStatus ||
                   p.variants?.[0]?.stockStatus ||
                   (p.available !== undefined ? (p.available ? 'InStock' : 'OutOfStock') : null),
      };
    },
  },

  tagz: {
    name: 'TAGZ',
    taskId: 'VcGcp2dhCTW0w2VUN',
    currency: 'EUR',
    mapProduct: (p, tagzPrices) => ({
      title:      p.title || null,
      url:        p.source?.canonicalUrl || null,
      price:      tagzPrices?.[p.source?.canonicalUrl?.split('/products/')?.[1]] != null ? Math.round(tagzPrices[p.source.canonicalUrl.split('/products/')[1]] * 1.2 * 100) / 100 : (p.variants?.[0]?.price?.current ? p.variants[0].price.current / 100 : null),
      image_url:  p.medias?.[0]?.url || null,
      category:   p.categories?.[0] || null,
      fournisseur: 'TAGZ',
      tags:       normalizeTags(p.tags),
      stockStatus: p.variants?.[0]?.price?.stockStatus ||
                   p.variants?.[0]?.stockStatus ||
                   (p.available !== undefined ? (p.available ? 'InStock' : 'OutOfStock') : null),
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
      stockStatus: p.variants?.[0]?.price?.stockStatus ||
                   p.variants?.[0]?.stockStatus ||
                   (p.available !== undefined ? (p.available ? 'InStock' : 'OutOfStock') : null),
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
      stockStatus: p.variants?.[0]?.price?.stockStatus ||
                   p.variants?.[0]?.stockStatus ||
                   (p.available !== undefined ? (p.available ? 'InStock' : 'OutOfStock') : null),
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
      stockStatus: p.variants?.[0]?.price?.stockStatus ||
                   p.variants?.[0]?.stockStatus ||
                   (p.available !== undefined ? (p.available ? 'InStock' : 'OutOfStock') : null),
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
      stockStatus: p.variants?.[0]?.price?.stockStatus ||
                   p.variants?.[0]?.stockStatus ||
                   (p.available !== undefined ? (p.available ? 'InStock' : 'OutOfStock') : null),
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
      stockStatus: p.variants?.[0]?.price?.stockStatus ||
                   p.variants?.[0]?.stockStatus ||
                   (p.available !== undefined ? (p.available ? 'InStock' : 'OutOfStock') : null),
    }),
  },

  vintagewholesalespain: {
    name: 'Vintage Wholesale Spain',
    taskId: 'tonysiks~vintage-wholesale-spain',
    currency: 'EUR',
    mapProduct: (p) => ({
      title:      p.title || null,
      url:        p.source?.canonicalUrl || null,
      price:      p.variants?.[0]?.price?.current ? Math.round(p.variants[0].price.current / 100 * 1.16 * 100) / 100 : null,
      image_url:  p.medias?.[0]?.url || null,
      category:   p.categories?.[0] || null,
      tags:       normalizeTags(p.tags),
      stockStatus: p.variants?.[0]?.price?.stockStatus ||
                   p.variants?.[0]?.stockStatus ||
                   (p.available !== undefined ? (p.available ? 'InStock' : 'OutOfStock') : null),
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
      stockStatus: p.variants?.[0]?.price?.stockStatus ||
                   p.variants?.[0]?.stockStatus ||
                   (p.available !== undefined ? (p.available ? 'InStock' : 'OutOfStock') : null),
    }),
  },

  skullwholesale: {
    name: 'Skull Wholesale',
    taskId: 'tonysiks~skull-wholesale',
    currency: 'USD',
    mapProduct: (p) => ({
      title:      p.title || null,
      url:        p.source?.canonicalUrl || null,
      price:      p.variants?.[0]?.price?.current ? p.variants[0].price.current / 100 : null,
      image_url:  p.medias?.[0]?.url || null,
      category:   p.categories?.[0] || null,
      tags:       normalizeTags(p.tags),
      stockStatus: p.variants?.[0]?.price?.stockStatus ||
                   p.variants?.[0]?.stockStatus ||
                   (p.available !== undefined ? (p.available ? 'InStock' : 'OutOfStock') : null),
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
      stockStatus: p.variants?.[0]?.price?.stockStatus ||
                   p.variants?.[0]?.stockStatus ||
                   (p.available !== undefined ? (p.available ? 'InStock' : 'OutOfStock') : null),
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
      stockStatus: p.variants?.[0]?.price?.stockStatus ||
                   p.variants?.[0]?.stockStatus ||
                   (p.available !== undefined ? (p.available ? 'InStock' : 'OutOfStock') : null),
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
      stockStatus: p.variants?.[0]?.price?.stockStatus ||
                   p.variants?.[0]?.stockStatus ||
                   (p.available !== undefined ? (p.available ? 'InStock' : 'OutOfStock') : null),
    }),
  },

  hustlerags: {
    name: 'Hustlerags Wholesale',
    taskId: 'tonysiks~hustlerags-wholesale',
    currency: 'EUR',
    mapProduct: (p) => ({
      title:      p.title || null,
      url:        p.source?.canonicalUrl || null,
      price:      p.variants?.[0]?.price?.current != null ? p.variants[0].price.current / 100 : null,
      image_url:  p.medias?.[0]?.url || null,
      category:   p.categories?.[0] || null,
      tags:       normalizeTags(p.tags),
      stockStatus: p.variants?.[0]?.price?.stockStatus ||
                   p.variants?.[0]?.stockStatus ||
                   (p.available !== undefined ? (p.available ? 'InStock' : 'OutOfStock') : null),
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
      stockStatus: p.variants?.[0]?.price?.stockStatus ||
                   p.variants?.[0]?.stockStatus ||
                   (p.available !== undefined ? (p.available ? 'InStock' : 'OutOfStock') : null),
    }),
  },

  ausvintage: {
    name: 'Aus Vintage Wholesale',
    taskId: 'tonysiks~aus-vintage-wholesale',
    currency: 'USD',
    mapProduct: (p) => ({
      title:      p.title || null,
      url:        p.source?.canonicalUrl || null,
      price:      p.variants?.[0]?.price?.current != null ? p.variants[0].price.current / 100 : null,
      image_url:  p.medias?.[0]?.url || null,
      category:   p.categories?.[0] || null,
      tags:       normalizeTags(p.tags),
      stockStatus: p.variants?.[0]?.price?.stockStatus ||
                   p.variants?.[0]?.stockStatus ||
                   (p.available !== undefined ? (p.available ? 'InStock' : 'OutOfStock') : null),
    }),
  },

  lavintage: {
    name: 'LA Vintage',
    taskId: 'tonysiks~la-vintage',
    currency: 'USD',
    mapProduct: (p) => ({
      title:      p.title || null,
      url:        p.source?.canonicalUrl || null,
      price:      p.variants?.[0]?.price?.current != null ? p.variants[0].price.current / 100 : null,
      image_url:  p.medias?.[0]?.url || null,
      category:   p.categories?.[0] || null,
      tags:       normalizeTags(p.tags),
      stockStatus: p.variants?.[0]?.price?.stockStatus ||
                   p.variants?.[0]?.stockStatus ||
                   (p.available !== undefined ? (p.available ? 'InStock' : 'OutOfStock') : null),
    }),
  },

  vintagism: {
    name: 'Vintagism',
    taskId: 'tonysiks~vintagism',
    currency: 'EUR',
    mapProduct: (p) => ({
      title:      p.name || null,
      url:        p.url || null,
      price:      p.price || null,
      image_url:  p.featuredImage || null,
      category:   p.categories?.[0] || null,
      tags:       normalizeTags(p.tags),
      stockStatus: p.available ? 'InStock' : 'OutOfStock',
    }),
  },

  londonvintage: {
    name: 'London Vintage Wholesale',
    taskId: 'tonysiks~london-vintage-wholesale',
    currency: 'GBP',
    mapProduct: (p) => {
      const title = p.title || '';
      let price = p.variants?.[0]?.price?.current != null ? p.variants[0].price.current / 100 : null;
      const mKiloFwd = title.match(/£([\d.]+)\s*\/\s*[Kk]ilo.*?(\d+)\s*[Kk][Gg]/i);
      const mKiloRev = title.match(/(\d+)\s*[Kk][Gg].*?£([\d.]+)\s*\/\s*[Kk]ilo/i);
      const mPiece   = title.match(/£([\d.]+)\s*\/\s*[Pp]iece/i);
      if (mKiloFwd) {
        price = Math.round(parseFloat(mKiloFwd[1]) * parseInt(mKiloFwd[2]) * 100) / 100;
      } else if (mKiloRev) {
        price = Math.round(parseFloat(mKiloRev[2]) * parseInt(mKiloRev[1]) * 100) / 100;
      } else if (mPiece) {
        price = Math.round(parseFloat(mPiece[1]) * 100) / 100;
      }
      return {
        title:      title || null,
        url:        p.source?.canonicalUrl || null,
        price,
        image_url:  p.medias?.[0]?.url || null,
        category:   p.categories?.[0] || null,
        tags:       normalizeTags(p.tags),
        stockStatus: p.variants?.[0]?.price?.stockStatus ||
                     p.variants?.[0]?.stockStatus ||
                     (p.available !== undefined ? (p.available ? 'InStock' : 'OutOfStock') : null),
      };
    },
  },

  thriftvintage: {
    name: 'Thrift Vintage Fashion',
    taskId: 'tonysiks~thrift-vintage-fashion',
    currency: 'USD',
    mapProduct: (p) => ({
      title:      p.title || null,
      url:        p.source?.canonicalUrl || null,
      price:      p.variants?.[0]?.price?.current != null ? p.variants[0].price.current / 100 : null,
      image_url:  p.medias?.[0]?.url || null,
      category:   p.categories?.[0] || null,
      tags:       normalizeTags(p.tags),
      stockStatus: p.variants?.[0]?.price?.stockStatus ||
                   p.variants?.[0]?.stockStatus ||
                   (p.available !== undefined ? (p.available ? 'InStock' : 'OutOfStock') : null),
    }),
  },

  frenchpick: {
    name: 'French Pick',
    taskId: 'tonysiks~french-pick',
    currency: 'EUR',
    mapProduct: (p) => ({
      title:      p.title || null,
      url:        p.source?.canonicalUrl || null,
      price:      p.variants?.[0]?.price?.current != null ? p.variants[0].price.current / 100 : null,
      image_url:  p.medias?.[0]?.url || null,
      category:   p.categories?.[0] || null,
      tags:       normalizeTags(p.tags),
      stockStatus: p.variants?.[0]?.price?.stockStatus ||
                   p.variants?.[0]?.stockStatus ||
                   (p.available !== undefined ? (p.available ? 'InStock' : 'OutOfStock') : null),
    }),
  },

  bestvintage: {
    name: 'BestVintageWholesale',
    taskId: 'tonysiks~best-vintage-wholesale',
    currency: 'USD',
    mapProduct: (p) => ({
      title:      p.title || null,
      url:        p.source?.canonicalUrl || null,
      price:      p.variants?.[0]?.price?.current != null ? p.variants[0].price.current / 100 : null,
      image_url:  p.medias?.[0]?.url || null,
      category:   p.categories?.[0] || null,
      tags:       normalizeTags(p.tags),
      stockStatus: p.variants?.[0]?.price?.stockStatus ||
                   p.variants?.[0]?.stockStatus ||
                   (p.available !== undefined ? (p.available ? 'InStock' : 'OutOfStock') : null),
    }),
  },

  kzwholesale: {
    name: 'KZWholesale',
    taskId: 'tonysiks~kz-wholesale',
    currency: 'EUR',
    mapProduct: (p) => ({
      title:      p.title || null,
      url:        p.source?.canonicalUrl || null,
      price:      p.variants?.[0]?.price?.current != null ? p.variants[0].price.current / 100 : null,
      image_url:  p.medias?.[0]?.url || null,
      category:   p.categories?.[0] || null,
      tags:       normalizeTags(p.tags),
      stockStatus: p.variants?.[0]?.price?.stockStatus ||
                   p.variants?.[0]?.stockStatus ||
                   (p.available !== undefined ? (p.available ? 'InStock' : 'OutOfStock') : null),
    }),
  },

  cmretrowholesale: {
    name: 'CMRetroWholesale',
    taskId: 'tonysiks~cm-retro-wholesale',
    currency: 'USD',
    mapProduct: (p) => ({
      title:      p.title || null,
      url:        p.source?.canonicalUrl || null,
      price:      p.variants?.[0]?.price?.current != null ? p.variants[0].price.current / 100 : null,
      image_url:  p.medias?.[0]?.url || null,
      category:   p.categories?.[0] || null,
      tags:       normalizeTags(p.tags),
      stockStatus: p.variants?.[0]?.price?.stockStatus ||
                   p.variants?.[0]?.stockStatus ||
                   (p.available !== undefined ? (p.available ? 'InStock' : 'OutOfStock') : null),
    }),
  },

  thevintagewholesalecompany: {
    name: 'TheVintageWholesaleCompany',
    taskId: 'tonysiks~the-vintage-wholesale-company',
    currency: 'USD',
    mapProduct: (p) => ({
      title:      p.title || null,
      url:        p.source?.canonicalUrl || null,
      price:      p.variants?.[0]?.price?.current != null ? p.variants[0].price.current / 100 : null,
      image_url:  p.medias?.[0]?.url || null,
      category:   p.categories?.[0] || null,
      tags:       normalizeTags(p.tags),
      stockStatus: p.variants?.[0]?.price?.stockStatus ||
                   p.variants?.[0]?.stockStatus ||
                   (p.available !== undefined ? (p.available ? 'InStock' : 'OutOfStock') : null),
    }),
  },

  vintageloversrome: {
    name: 'VintageLoversRome',
    taskId: 'tonysiks~vintage-lovers-rome',
    currency: 'EUR',
    mapProduct: (p) => ({
      title:      p.title || null,
      url:        p.source?.canonicalUrl || null,
      price:      p.variants?.[0]?.price?.current != null ? p.variants[0].price.current / 100 : null,
      image_url:  p.medias?.[0]?.url || null,
      category:   p.categories?.[0] || null,
      tags:       normalizeTags(p.tags),
      stockStatus: p.variants?.[0]?.price?.stockStatus ||
                   p.variants?.[0]?.stockStatus ||
                   (p.available !== undefined ? (p.available ? 'InStock' : 'OutOfStock') : null),
    }),
  },

  boomvintagewholesale: {
    name: 'BoomVintageWholesale',
    taskId: 'tonysiks~boom-vintage-wholesale',
    currency: 'GBP',
    mapProduct: (p) => ({
      title:      p.title || null,
      url:        p.source?.canonicalUrl || null,
      price:      p.variants?.[0]?.price?.current != null ? p.variants[0].price.current / 100 : null,
      image_url:  p.medias?.[0]?.url || null,
      fournisseur: 'BoomVintageWholesale',
      stockStatus: p.variants?.[0]?.price?.stockStatus ||
                   p.variants?.[0]?.stockStatus ||
                   (p.available !== undefined ? (p.available ? 'InStock' : 'OutOfStock') : null),
    }),
  },

  premiumvintagewholesale: {
    name: 'PremiumVintageWholesale',
    taskId: 'tonysiks~premium-vintage-wholesale',
    currency: 'EUR',
    mapProduct: (p) => ({
      title:      p.title || null,
      url:        p.source?.canonicalUrl || null,
      price:      p.variants?.[0]?.price?.current != null ? p.variants[0].price.current / 100 : null,
      image_url:  p.medias?.[0]?.url || null,
      fournisseur: 'PremiumVintageWholesale',
      stockStatus: p.variants?.[0]?.price?.stockStatus ||
                   p.variants?.[0]?.stockStatus ||
                   (p.available !== undefined ? (p.available ? 'InStock' : 'OutOfStock') : null),
    }),
  },

  elpatronvintage: {
    name: 'ElPatronVintage',
    taskId: 'tonysiks~el-patron-vintage',
    currency: 'EUR',
    mapProduct: (p) => ({
      title:      p.name || null,
      url:        p.url || null,
      price:      p.price || null,
      image_url:  p.featuredImage || null,
      fournisseur: 'ElPatronVintage',
      stockStatus: p.available ? 'InStock' : 'OutOfStock',
    }),
  },

  thehubvintagewholesale: {
    name: 'TheHubVintageWholesale',
    taskId: 'tonysiks~the-hub-vintage-wholesale',
    currency: 'GBP',
    mapProduct: (p) => ({
      title:      p.title || null,
      url:        p.source?.canonicalUrl || null,
      price:      p.variants?.[0]?.price?.current != null ? p.variants[0].price.current / 100 : null,
      image_url:  p.medias?.[0]?.url || null,
      fournisseur: 'TheHubVintageWholesale',
      stockStatus: p.variants?.[0]?.price?.stockStatus ||
                   p.variants?.[0]?.stockStatus ||
                   (p.available !== undefined ? (p.available ? 'InStock' : 'OutOfStock') : null),
    }),
  },

  spvintagewholesale: {
    name: 'SPVintageWholesale',
    taskId: 'tonysiks~sp-vintage-wholesale',
    currency: 'USD',
    mapProduct: (p) => ({
      title:      p.title || null,
      url:        p.source?.canonicalUrl || null,
      price:      p.variants?.[0]?.price?.current != null ? p.variants[0].price.current / 100 : null,
      image_url:  p.medias?.[0]?.url || null,
      fournisseur: 'SPVintageWholesale',
      stockStatus: p.variants?.[0]?.price?.stockStatus ||
                   p.variants?.[0]?.stockStatus ||
                   (p.available !== undefined ? (p.available ? 'InStock' : 'OutOfStock') : null),
    }),
  },

  vintagewholesalestore: {
    name: 'VintageWholesaleStore',
    taskId: 'tonysiks~vintage-wholesale-store',
    currency: 'GBP',
    mapProduct: (p) => ({
      title:      p.title || null,
      url:        p.source?.canonicalUrl || null,
      price:      p.variants?.[0]?.price?.current != null ? Math.round(p.variants[0].price.current / 100 / 1.337 * 100) / 100 : null,
      image_url:  p.medias?.[0]?.url || null,
      fournisseur: 'VintageWholesaleStore',
      stockStatus: p.variants?.[0]?.price?.stockStatus ||
                   p.variants?.[0]?.stockStatus ||
                   (p.available !== undefined ? (p.available ? 'InStock' : 'OutOfStock') : null),
    }),
  },

  vintagebulk: {
    name: 'VintageBulk',
    taskId: 'tonysiks~vintage-bulk',
    currency: 'EUR',
    mapProduct: (p) => ({
      title:      p.title || null,
      url:        p.source?.canonicalUrl || null,
      price:      p.variants?.[0]?.price?.current != null ? p.variants[0].price.current / 100 : null,
      image_url:  p.medias?.[0]?.url || null,
      fournisseur: 'VintageBulk',
      stockStatus: p.variants?.[0]?.price?.stockStatus ||
                   p.variants?.[0]?.stockStatus ||
                   (p.available !== undefined ? (p.available ? 'InStock' : 'OutOfStock') : null),
    }),
  },

  gradedwholesale: {
    name: 'GradedWholesale',
    taskId: 'tonysiks~graded-wholesale',
    currency: 'GBP',
    mapProduct: (p) => ({
      title:      p.title || null,
      url:        p.source?.canonicalUrl || null,
      price:      p.variants?.[0]?.price?.current != null ? p.variants[0].price.current / 100 : null,
      image_url:  p.medias?.[0]?.url || null,
      fournisseur: 'GradedWholesale',
      stockStatus: p.variants?.[0]?.price?.stockStatus ||
                   p.variants?.[0]?.stockStatus ||
                   (p.available !== undefined ? (p.available ? 'InStock' : 'OutOfStock') : null),
    }),
  },

  onevintagewholesale: {
    name: 'OneVintageWholesale',
    taskId: 'tonysiks~one-vintage-wholesale',
    currency: 'EUR',
    mapProduct: (p) => ({
      title:      p.name || null,
      url:        p.url || null,
      price:      p.price || null,
      image_url:  p.featuredImage || null,
      fournisseur: 'OneVintageWholesale',
      stockStatus: p.available ? 'InStock' : 'OutOfStock',
    }),
  },

  vintagedepot: {
    name: 'VintageDepot',
    taskId: 'tonysiks~vintage-depot',
    currency: 'GBP',
    mapProduct: (p) => ({
      title:      p.title || null,
      url:        p.source?.canonicalUrl || null,
      price:      p.variants?.[0]?.price?.current != null ? p.variants[0].price.current / 100 : null,
      image_url:  p.medias?.[0]?.url || null,
      fournisseur: 'VintageDepot',
      stockStatus: p.variants?.[0]?.price?.stockStatus ||
                   p.variants?.[0]?.stockStatus ||
                   (p.available !== undefined ? (p.available ? 'InStock' : 'OutOfStock') : null),
    }),
  },

  vintagewholesaleuk: {
    name: 'VintageWholesaleUK',
    taskId: 'tonysiks~vintage-wholesale-uk',
    currency: 'USD',
    mapProduct: (p) => ({
      title:      p.title || null,
      url:        p.source?.canonicalUrl || null,
      price:      p.variants?.[0]?.price?.current != null ? p.variants[0].price.current / 100 : null,
      image_url:  p.medias?.[0]?.url || null,
      fournisseur: 'VintageWholesaleUK',
      stockStatus: p.variants?.[0]?.price?.stockStatus ||
                   p.variants?.[0]?.stockStatus ||
                   (p.available !== undefined ? (p.available ? 'InStock' : 'OutOfStock') : null),
    }),
  },

  dublinwholesalevintage: {
    name: 'DublinWholesaleVintage',
    taskId: 'tonysiks~dublin-wholesale-vintage',
    currency: 'EUR',
    mapProduct: (p) => ({
      title:      p.title || null,
      url:        p.source?.canonicalUrl || null,
      price:      p.variants?.[0]?.price?.current != null ? Math.round(p.variants[0].price.current / 100 * 1.2 * 100) / 100 : null,
      image_url:  p.medias?.[0]?.url || null,
      fournisseur: 'DublinWholesaleVintage',
      stockStatus: p.variants?.[0]?.price?.stockStatus ||
                   p.variants?.[0]?.stockStatus ||
                   (p.available !== undefined ? (p.available ? 'InStock' : 'OutOfStock') : null),
    }),
  },

  ventorbox: {
    name: 'VentorBox',
    taskId: 'tonysiks~ventor-box',
    currency: 'EUR',
    mapProduct: (p) => ({
      title:      p.title || null,
      url:        p.source?.canonicalUrl || null,
      price:      p.variants?.[0]?.price?.current != null ? p.variants[0].price.current / 100 : null,
      image_url:  p.medias?.[0]?.url || null,
      fournisseur: 'VentorBox',
      stockStatus: p.variants?.[0]?.price?.stockStatus ||
                   p.variants?.[0]?.stockStatus ||
                   (p.available !== undefined ? (p.available ? 'InStock' : 'OutOfStock') : null),
    }),
  },

  repeatvintagewholesale: {
    name: 'RepeatVintageWholesale',
    taskId: 'tonysiks~repeat-vintage-wholesale',
    currency: 'USD',
    mapProduct: (p) => ({
      title:      p.title || null,
      url:        p.source?.canonicalUrl || null,
      price:      p.variants?.[0]?.price?.current != null ? p.variants[0].price.current / 100 : null,
      image_url:  p.medias?.[0]?.url || null,
      fournisseur: 'RepeatVintageWholesale',
      stockStatus: p.variants?.[0]?.price?.stockStatus ||
                   p.variants?.[0]?.stockStatus ||
                   (p.available !== undefined ? (p.available ? 'InStock' : 'OutOfStock') : null),
    }),
  },

  tobewornagain: {
    name: 'ToBeWornAgain',
    taskId: 'tonysiks~to-be-worn-again',
    currency: 'GBP',
    mapProduct: (p) => ({
      title:      p.title || null,
      url:        p.source?.canonicalUrl || null,
      price:      p.variants?.[0]?.price?.current != null ? Math.round(p.variants[0].price.current / 100 * 1.023 * 100) / 100 : null,
      image_url:  p.medias?.[0]?.url || null,
      fournisseur: 'ToBeWornAgain',
      stockStatus: p.variants?.[0]?.price?.stockStatus ||
                   p.variants?.[0]?.stockStatus ||
                   (p.available !== undefined ? (p.available ? 'InStock' : 'OutOfStock') : null),
    }),
  },

  pickvintagewholesale: {
    name: 'PickVintageWholesale',
    taskId: 'tonysiks~pick-vintage-wholesale',
    currency: 'GBP',
    mapProduct: (p) => ({
      title:      p.title || null,
      url:        p.source?.canonicalUrl || null,
      price:      p.variants?.[0]?.price?.current != null ? p.variants[0].price.current / 100 : null,
      image_url:  p.medias?.[0]?.url || null,
      fournisseur: 'PickVintageWholesale',
      stockStatus: p.variants?.[0]?.price?.stockStatus ||
                   p.variants?.[0]?.stockStatus ||
                   (p.available !== undefined ? (p.available ? 'InStock' : 'OutOfStock') : null),
    }),
  },

  torgomvintage: {
    name: 'TorgomVintage',
    taskId: 'tonysiks~torgom-vintage',
    currency: 'USD',
    mapProduct: (p) => ({
      title:      p.title || null,
      url:        p.source?.canonicalUrl || null,
      price:      p.variants?.[0]?.price?.current != null ? p.variants[0].price.current / 100 : null,
      image_url:  p.medias?.[0]?.url || null,
      fournisseur: 'TorgomVintage',
      stockStatus: p.variants?.[0]?.price?.stockStatus ||
                   p.variants?.[0]?.stockStatus ||
                   (p.available !== undefined ? (p.available ? 'InStock' : 'OutOfStock') : null),
    }),
  },

  thriftbundlez: {
    name: 'ThriftBundlez',
    taskId: 'tonysiks~thrift-bundlez',
    currency: 'USD',
    mapProduct: (p) => ({
      title:      p.title || null,
      url:        p.source?.canonicalUrl || null,
      price:      p.variants?.[0]?.price?.current != null ? p.variants[0].price.current / 100 : null,
      image_url:  p.medias?.[0]?.url || null,
      fournisseur: 'ThriftBundlez',
      stockStatus: p.variants?.[0]?.price?.stockStatus ||
                   p.variants?.[0]?.stockStatus ||
                   (p.available !== undefined ? (p.available ? 'InStock' : 'OutOfStock') : null),
    }),
  },

  ggvintagewholesale: {
    name: 'GGVintageWholesale',
    taskId: 'tonysiks~gg-vintage-wholesale',
    currency: 'EUR',
    mapProduct: (p) => ({
      title:      p.title || null,
      url:        p.source?.canonicalUrl || null,
      price:      p.variants?.[0]?.price?.current != null ? Math.round(p.variants[0].price.current / 100 * 1.2 * 100) / 100 : null,
      image_url:  p.medias?.[0]?.url || null,
      fournisseur: 'GGVintageWholesale',
      stockStatus: p.variants?.[0]?.price?.stockStatus ||
                   p.variants?.[0]?.stockStatus ||
                   (p.available !== undefined ? (p.available ? 'InStock' : 'OutOfStock') : null),
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

  ironbale: {
    name: 'IronBale',
    taskId: 'tonysiks~iron-bale',
    currency: 'EUR',
    mapProduct: (p) => ({
      url:        p.source?.canonicalUrl || null,
      title:      p.title || null,
      price:      p.variants?.[0]?.price?.current != null ? p.variants[0].price.current / 100 : null,
      image_url:  p.medias?.[0]?.url || null,
      stockStatus: p.variants?.[0]?.stockStatus || null,
      fournisseur: 'IronBale',
    }),
  },

  theneweravintage: {
    name: 'TheNewEraVintage',
    taskId: 'tonysiks~the-new-era-vintage',
    currency: 'EUR',
    mapProduct: (p) => ({
      url:        p.source?.canonicalUrl || null,
      title:      p.title || null,
      price:      p.variants?.[0]?.price?.current != null ? p.variants[0].price.current / 100 : null,
      image_url:  p.medias?.[0]?.url || null,
      stockStatus: p.variants?.[0]?.stockStatus || null,
      fournisseur: 'TheNewEraVintage',
    }),
  },

  europewholesales: {
    name: 'EuropeWholesales',
    taskId: 'tonysiks~europe-wholesales',
    currency: 'EUR',
    mapProduct: (p) => ({
      url:        p.source?.canonicalUrl || null,
      title:      p.title || null,
      price:      p.variants?.[0]?.price?.current != null ? p.variants[0].price.current / 100 : null,
      image_url:  p.medias?.[0]?.url || null,
      stockStatus: p.variants?.[0]?.stockStatus || null,
      fournisseur: 'EuropeWholesales',
    }),
  },

  rvvintagewholesalebelgium: {
    name: 'RVVintageWholesaleBelgium',
    taskId: 'tonysiks~rv-vintage-wholesale-belgium',
    currency: 'EUR',
    mapProduct: (p) => ({
      url:        p.source?.canonicalUrl || null,
      title:      p.title || null,
      price:      p.variants?.[0]?.price?.current != null ? p.variants[0].price.current / 100 : null,
      image_url:  p.medias?.[0]?.url || null,
      stockStatus: p.variants?.[0]?.stockStatus || null,
      fournisseur: 'RVVintageWholesaleBelgium',
    }),
  },

  keskinvintage: {
    name: 'KeskinVintage',
    taskId: 'tonysiks~keskin-vintage',
    currency: 'EUR',
    mapProduct: (p) => ({
      url:        p.source?.canonicalUrl || null,
      title:      p.title || null,
      price:      p.variants?.[0]?.price?.current != null ? p.variants[0].price.current / 100 : null,
      image_url:  p.medias?.[0]?.url || null,
      stockStatus: p.variants?.[0]?.stockStatus || null,
      fournisseur: 'KeskinVintage',
    }),
  },

  vintagesupplyco: {
    name: 'VintageSupplyCo',
    taskId: 'tonysiks~vintage-supply-co',
    currency: 'GBP',
    mapProduct: (p) => ({
      url:        p.source?.canonicalUrl || null,
      title:      p.title || null,
      price:      p.variants?.[0]?.price?.current != null ? p.variants[0].price.current / 100 : null,
      image_url:  p.medias?.[0]?.url || null,
      stockStatus: p.variants?.[0]?.stockStatus || null,
      fournisseur: 'VintageSupplyCo',
    }),
  },

  vintagesupplier: {
    name: 'VintageSupplier',
    taskId: 'tonysiks~vintage-supplier',
    currency: 'EUR',
    mapProduct: (p) => ({
      url:        p.source?.canonicalUrl || null,
      title:      p.title || null,
      price:      p.variants?.[0]?.price?.current != null ? p.variants[0].price.current / 100 : null,
      image_url:  p.medias?.[0]?.url || null,
      stockStatus: p.variants?.[0]?.stockStatus || null,
      fournisseur: 'VintageSupplier',
    }),
  },

  xvintagewholesales: {
    name: 'XVintageWholesales',
    taskId: 'tonysiks~x-vintage-wholesales',
    currency: 'GBP',
    mapProduct: (p) => ({
      url:        p.source?.canonicalUrl || null,
      title:      p.title || null,
      price:      p.variants?.[0]?.price?.current != null ? p.variants[0].price.current / 100 : null,
      image_url:  p.medias?.[0]?.url || null,
      stockStatus: p.variants?.[0]?.stockStatus || null,
      fournisseur: 'XVintageWholesales',
    }),
  },

  vintageempirewholesale: {
    name: 'VintageEmpireWholesale',
    taskId: 'tonysiks~vintage-empire-wholesale',
    currency: 'GBP',
    mapProduct: (p) => ({
      url:        p.source?.canonicalUrl || null,
      title:      p.title || null,
      price:      p.variants?.[0]?.price?.current != null ? p.variants[0].price.current / 100 : null,
      image_url:  p.medias?.[0]?.url || null,
      stockStatus: p.variants?.[0]?.stockStatus || null,
      fournisseur: 'VintageEmpireWholesale',
    }),
  },

  bigskyvintagewholesale: {
    name: 'BigSkyVintageWholesale',
    taskId: 'tonysiks~big-sky-vintage-wholesale',
    currency: 'USD',
    mapProduct: (p) => ({
      url:        p.source?.canonicalUrl || null,
      title:      p.title || null,
      price:      p.variants?.[0]?.price?.current != null ? p.variants[0].price.current / 100 : null,
      image_url:  p.medias?.[0]?.url || null,
      stockStatus: p.variants?.[0]?.stockStatus || null,
      fournisseur: 'BigSkyVintageWholesale',
    }),
  },

  alpharags: {
    name: 'Alpha Rags 555',
    taskId: 'tonysiks~alpha-rags-555',
    currency: 'EUR',
    mapProduct: (p) => ({
      title:       p.name || null,
      url:         p.url || null,
      price:       p.price || null,
      image_url:   p.featuredImage || null,
      category:    p.categories?.[0] || null,
      tags:        normalizeTags(p.tags),
      stockStatus: p.available ? 'InStock' : 'OutOfStock',
    }),
  },

  addicting: {
    name: 'Addicting',
    taskId: 'tonysiks~addicting',
    currency: 'EUR',
    mapProduct: (p) => ({
      title:       p.name || null,
      url:         p.url || null,
      price:       p.price || null,
      image_url:   p.featuredImage || null,
      category:    p.categories?.[0] || null,
      tags:        normalizeTags(p.tags),
      stockStatus: p.available ? 'InStock' : 'OutOfStock',
    }),
  },

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
