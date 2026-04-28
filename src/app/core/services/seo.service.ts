import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SeoService {

  constructor(
    private meta: Meta,
    private title: Title
  ) {}

  updateTitle(title: string) {
    this.title.setTitle(
      `${title} | Ghanim Enterprises`
    );
  }

  updateMeta(config: {
    title: string;
    description: string;
    image?: string;
    url?: string;
    keywords?: string;
  }) {
    this.title.setTitle(
      `${config.title} | Ghanim Enterprises`
    );

    // Standard meta
    this.meta.updateTag({
      name: 'description',
      content: config.description
    });

    if (config.keywords) {
      this.meta.updateTag({
        name: 'keywords',
        content: config.keywords
      });
    }

    // Open Graph (Facebook, WhatsApp preview)
    this.meta.updateTag({
      property: 'og:title',
      content: config.title
    });
    this.meta.updateTag({
      property: 'og:description',
      content: config.description
    });
    this.meta.updateTag({
      property: 'og:type',
      content: 'website'
    });
    if (config.image) {
      this.meta.updateTag({
        property: 'og:image',
        content: config.image
      });
    }
    if (config.url) {
      this.meta.updateTag({
        property: 'og:url',
        content: config.url
      });
    }

    // Twitter card
    this.meta.updateTag({
      name: 'twitter:card',
      content: 'summary_large_image'
    });
    this.meta.updateTag({
      name: 'twitter:title',
      content: config.title
    });
    this.meta.updateTag({
      name: 'twitter:description',
      content: config.description
    });
  }

  updateProductMeta(product: {
    name: string;
    description: string | null;
    price: number;
    imageUrl: string | null;
    categoryName: string;
  }) {
    this.updateMeta({
      title: product.name,
      description: product.description ||
        `Buy ${product.name} at Rs. ${product.price} from Ghanim Enterprises Sri Lanka`,
      image: product.imageUrl || undefined,
      keywords: `${product.name}, ${product.categoryName}, Sri Lanka, buy online`
    });

    // Product structured data
    this.meta.updateTag({
      name: 'product:price:amount',
      content: product.price.toString()
    });
    this.meta.updateTag({
      name: 'product:price:currency',
      content: 'LKR'
    });
  }

  updateProductStructuredData(product: any) {
    const script = document.getElementById('product-ld') ||
        document.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.setAttribute('id', 'product-ld');
    script.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "description": product.description,
        "image": product.imageUrl,
        "offers": {
        "@type": "Offer",
        "price": product.price,
        "priceCurrency": "LKR",
        "availability": product.inStock
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        "seller": {
            "@type": "Organization",
            "name": "Ghanim Enterprises"
        }
        }
    });
    document.head.appendChild(script);
    }
}