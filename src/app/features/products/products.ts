import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Product } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';  
import { SeoService } from '../../core/services/seo.service';
import { optimizeImageUrl } from '../../core/utils/image.utils';
import { WishListService } from '../../core/services/wishlist.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class Products implements OnInit {
  currencySymbol = environment.currencySymbol;

  selectedCategory = signal('');
  selectedSort = signal('default');
  searchQuery = signal('');
  priceRange = signal(50000);
  viewMode = signal<'grid' | 'list'> ('grid');
  isLoading = signal(true);
  error = signal('');
  inStockOnly = signal(false);
  selectedBadges = signal<string[]>([]);
  selectedBadge = signal('');
  allProducts = signal<Product[]>([]);

   categories = [
    { name: 'All Categories', slug: '' },
    { name: 'Kitchenware', slug: 'kitchenware' },
    { name: 'Aluminium', slug: 'aluminium' },
    { name: 'Plastic', slug: 'plastic' },
    { name: 'Gift Items', slug: 'gift-items' },
    { name: 'Umbrellas', slug: 'umbrellas' },
    { name: 'Lighting', slug: 'lighting' },
    { name: 'General', slug: 'general' },
  ];

  sortOptions = [
    { label: 'Default', value: 'default' },
    { label: 'Price: Low to High', value: 'price-asc' },
    { label: 'Price: High to Low', value: 'price-desc' },
    { label: 'Newest First', value: 'newest' },
    { label: 'Best Seller', value: 'best' },
  ];

  

  constructor(private route: ActivatedRoute, private ProductService: ProductService, private cartService: CartService, private seo: SeoService, public wishlistService: WishListService, public authService: AuthService) {}

  ngOnInit() {
    this.seo.updateMeta({
    title: 'All Products',
    description: 'Browse all products at Ghanim Enterprises — kitchenware, aluminium, plastic, gift items, umbrellas and lighting.',
    keywords: 'buy household products Sri Lanka, kitchenware, aluminium, plastic'
    });
  this.route.queryParams.subscribe(params => {
  const category = params['category'] || '';
  const badge = params['badge'] || '';
  this.selectedCategory.set(category);
  this.selectedBadge.set(badge);
});

this.loadProducts();
  }

  loadProducts(category?:string) {
    this.isLoading.set(true);
    this.error.set('');

    this.ProductService.getAllProducts().subscribe({
      next: (products) => {
        this.allProducts.set(products);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load products. Please try again');
        this.isLoading.set(false);
      }
    })
  }
 

  get productList() {
    let products = [...this.allProducts()];

    if (this.selectedCategory()) {
      products = products.filter(p => 
        p.categorySlug === this.selectedCategory()
      )
    }

    if (this.selectedBadge()) {
      products = products.filter(p => 
        p.badge === this.selectedBadge()
      );
    }

    if (this.searchQuery()) {
      const q = this.searchQuery().toLowerCase();
      products = products.filter(p => p.name.toLowerCase().includes(q));
    }

    //price filter

    products = products.filter(p => p.price <= this.priceRange());


    // in stock filter
    if (this.inStockOnly()) {
      products = products.filter(p => p.inStock);
    }

    // badge filter
    if (this.selectedBadges().length > 0) {
      products = products.filter(p => 
        p.badge && this.selectedBadges().includes(p.badge)
      );
    }

    //sort
    switch(this.selectedSort()) {
      case 'price-asc': products.sort((a,b) => a.price - b.price); break;
      case 'price-desc': products.sort((a, b) => b.price - a.price); break;
      case 'best': products.sort((a, b) => b.stock - a.stock); break;
      }
       return products;
  }

  setCategory(slug: string) { 
    this.selectedCategory.set(slug);
  }

  setSort(event: Event) {
    this.selectedSort.set((event.target as HTMLInputElement).value);
  }

  setSearch(event: Event) {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  setPriceRange(event: Event) {
    this.priceRange.set(+(event.target as HTMLInputElement).value);
  }

  setViewMode(mode: 'grid' | 'list') { this. viewMode.set(mode);}
  
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

  toggleInStock(event: Event) {
    this.inStockOnly.set(
      (event.target as HTMLInputElement).checked
    )
  }

  toggleBadge(badge: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedBadges.update(badges => [...badges, badge]);
    } else {
      this.selectedBadges.update(badges => 
        badges.filter(b => b!== badge)
      );
    }
  }

   clearAllFilters() {
  this.selectedCategory.set('');
  this.selectedBadge.set('');
  this.searchQuery.set('');
  this.priceRange.set(50000);
  this.inStockOnly.set(false);
  this.selectedBadges.set([]);
  this.selectedSort.set('default');
}

  optimizeImage(url: string | null, width: number = 400): string {
    return optimizeImageUrl(url, width);
  }

  toggleWishlist(product: Product) {
    this.wishlistService.toggleWishList(product);
  }

}
