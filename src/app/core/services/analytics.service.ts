import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

declare let gtag: Function;

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  private platformId = inject(PLATFORM_ID);

  constructor(private router: Router) {
    if (!isPlatformBrowser(this.platformId)) return;

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.trackPageView(event.urlAfterRedirects);
    });
  }

  trackPageView(url: string) {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      gtag('config', 'G-25NBPF0YTL', {
        page_path: url
      });
    } catch {}
  }

  trackEvent(
    action: string,
    category: string,
    label?: string,
    value?: number
  ) {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value
      });
    } catch {}
  }

  trackAddToCart(productName: string, price: number) {
    this.trackEvent(
      'add_to_cart',
      'ecommerce',
      productName,
      price
    );
  }

  trackPurchase(orderId: number, total: number) {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      gtag('event', 'purchase', {
        transaction_id: orderId.toString(),
        value: total,
        currency: 'LKR'
      });
    } catch {}
  }

  trackSearch(query: string) {
    this.trackEvent('search', 'engagement', query);
  }
}