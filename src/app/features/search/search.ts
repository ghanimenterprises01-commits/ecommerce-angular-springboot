import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Product } from '../../core/models/product.model';
import { ApiService } from '../../core/services/api.service';
import { CartService } from '../../core/services/cart.service';
import { optimizeImageUrl } from '../../core/utils/image.utils';
import { AnalyticsService } from '../../core/services/analytics.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [RouterLink, CommonModule, DecimalPipe],
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export class Search implements OnInit{
  currencySymbol = environment.currencySymbol;

  query = signal('');
  results = signal<Product[]>([]);
  isLoading = signal(false);
  error = signal('');

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private cartService: CartService,
    private analytics: AnalyticsService
  ) {}

  ngOnInit(){
    this.route.queryParams.subscribe(params => {
      const q = params['q'] || '';
      this.query.set(q);
      if (q) this.search(q);
    });
  }

  search(query: string) {
    this.analytics.trackSearch(query);
    this.isLoading.set(true);
    this.error.set('');
    this.results.set([]);

    this.api.get<Product[]>('/search', {query, limit: 20})
    .subscribe({
      next: (products) => {
        this.results.set(products);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set(
          'Search failed. Please try again.'
        );
        this.isLoading.set(false);
      }
    })
  }

  addToCart(product: Product) {
    this.cartService.addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      emoji: product.emoji,
      category: product.categoryName,
      imageUrl: product.imageUrl
    });
  }

  optimizeImage(url: string | null, width: number = 400): string {
    return optimizeImageUrl(url, width);
  }

}
