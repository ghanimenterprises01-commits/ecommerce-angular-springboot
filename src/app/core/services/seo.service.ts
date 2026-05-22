import { Injectable, Inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SeoService {

  constructor(
    private meta: Meta,
    private title: Title,
    @Inject(DOCUMENT) private doc: Document
  ) {}

  setCanonical(path: string = '') {
    const url = `${environment.siteUrl}${path}`;
    let link = this.doc.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  updateTitle(title: string) {
    this.title.setTitle(`${title} | Ghanim Enterprises`);
  }

  updateMeta(config: {
    title: string;
    description: string;
    image?: string;
    canonicalPath?: string;
    keywords?: string;
  }) {
    this.title.setTitle(`${config.title} | Ghanim Enterprises`);

    this.meta.updateTag({ name: 'description', content: config.description });

    if (config.keywords) {
      this.meta.updateTag({ name: 'keywords', content: config.keywords });
    }

    const canonicalUrl = `${environment.siteUrl}${config.canonicalPath ?? ''}`;

    this.setCanonical(config.canonicalPath ?? '');

    // Open Graph
    this.meta.updateTag({ property: 'og:title', content: config.title });
    this.meta.updateTag({ property: 'og:description', content: config.description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: canonicalUrl });
    if (config.image) {
      this.meta.updateTag({ property: 'og:image', content: config.image });
    }

    // Twitter card
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: config.title });
    this.meta.updateTag({ name: 'twitter:description', content: config.description });
  }

  updateProductMeta(product: {
    name: string;
    description: string | null;
    price: number;
    imageUrl: string | null;
    categoryName: string;
    id?: number;
  }) {
    const canonicalPath = product.id ? `/products/${product.id}` : '/products';

    this.updateMeta({
      title: product.name,
      description: product.description ||
        `Buy ${product.name} at Rs. ${product.price} from Ghanim Enterprises Sri Lanka`,
      image: product.imageUrl || undefined,
      canonicalPath,
      keywords: `${product.name}, ${product.categoryName}, Sri Lanka, buy online`
    });

    this.meta.updateTag({ name: 'product:price:amount', content: product.price.toString() });
    this.meta.updateTag({ name: 'product:price:currency', content: 'LKR' });
  }

  updateProductStructuredData(product: any) {
    let script = this.doc.getElementById('product-ld');
    if (!script) {
      script = this.doc.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('id', 'product-ld');
      this.doc.head.appendChild(script);
    }
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      'name': product.name,
      'description': product.description,
      'image': product.imageUrl,
      'offers': {
        '@type': 'Offer',
        'price': product.price,
        'priceCurrency': 'LKR',
        'availability': product.inStock
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        'seller': {
          '@type': 'Organization',
          'name': 'Ghanim Enterprises'
        }
      }
    });
  }
}