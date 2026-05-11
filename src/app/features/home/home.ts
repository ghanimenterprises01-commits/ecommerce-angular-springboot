import { Component, signal, OnInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';
import { Product } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';
import { ProductService } from '../../core/services/product.service';
import { SeoService } from '../../core/services/seo.service';
import { optimizeImageUrl } from '../../core/utils/image.utils';
import { LucideAngularModule, ChefHat, Gift, Lightbulb, Umbrella, Package, Grid2x2, CookingPot } from 'lucide-angular';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule, LucideAngularModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  currencySymbol = environment.currencySymbol;

  // Banner slider
  currentBanner = signal(0);
  private bannerInterval: any;
  featuredProducts = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  isLoadingProducts = signal(true);

  constructor(private productService: ProductService, private seo: SeoService) {}

  banners = [
      {
      title: "Welcome to Ghanim Enterprises",
      subtitle: "Quality household products for every home in Sri Lanka",
      fullBleed: true,
      imageOnly: true, 
      btn: "Shop Now",
      slug: "",
      bg: "#f0f4f8",
      accent: "#131921",
      emoji: "🏪",
      imageUrl: "https://res.cloudinary.com/dbet3dqvh/image/upload/v1778491073/home_big_banner_ijgslz.webp"
    },
    {
      title: "Fresh Arrivals in Kitchenware",
      subtitle: "Upgrade your kitchen with premium tools",
      fullBleed: true,
       imageOnly: true, 
      btn: "Shop Kitchenware",
      slug: "kitchenware",
      bg: "#f0f7ee",
      accent: "#2d7a4f",
      emoji: "🍳",
       imageUrl: "https://res.cloudinary.com/dbet3dqvh/image/upload/v1778490273/large_kitchen_banner_sljxd1.png"
    },
    {
      title: "Gift Items for Every Occasion",
      subtitle: "Find the perfect gift for your loved ones",
      fullBleed: true,
       imageOnly: true, 
      btn: "Shop Gift Items",
      slug: "gift-items",
      bg: "#fef9ee",
      accent: "#92702a",
      emoji: "🎁",
       imageUrl: "https://res.cloudinary.com/dbet3dqvh/image/upload/v1778490519/gitt_big_banner_wuhavy.webp"
    },
    {
      title: "Lighting Solutions for Your Home",
      subtitle: "Brighten every corner beautifully",
      fullBleed: true,
      imageOnly: true,
      btn: "Shop Lighting",
      slug: "lighting",
      bg: "#eef4ff",
      accent: "#1a56db",
      emoji: "💡",
       imageUrl: "https://res.cloudinary.com/dbet3dqvh/image/upload/v1778490724/led_big_banner_phdzep.webp"
    },
    {
      title: "Quality Umbrellas for Every Season",
      subtitle: "Stay dry and stylish all year round",
      fullBleed: true,
      imageOnly: true,
      btn: "Shop Umbrellas",
      slug: "umbrellas",
      bg: "#fdf2f8",
      accent: "#9333ea",
      emoji: "☂️",
       imageUrl: "https://res.cloudinary.com/dbet3dqvh/image/upload/v1778490840/umbrella_big_image_lzzkkr.webp"
    }
  ];

  readonly icons = {
    ChefHat,
    Gift,
    Lightbulb,
    Umbrella,
    Package,
    Grid2x2,
    CookingPot
  };

  getCategoryIcon(slug: string) {
    switch(slug) {
      case 'kitchenware':
        return this.icons.ChefHat;

      case 'gift-items':
        return this.icons.Gift;

      case 'lighting':
        return this.icons.Lightbulb;

      case 'umbrellas':
        return this.icons.Umbrella;

      case 'plastic':
        return this.icons.Package;

      case 'aluminium':
        return this.icons.CookingPot;

      default:
        return this.icons.Grid2x2;
    }
  }

  widgets: any[] = [];


  ngOnInit() {
    // SEO runs on both server and browser
    // This is what makes SSR valuable for SEO
    this.seo.updateMeta({
      title: 'Quality Home Products in Sri Lanka',
      description: 'Shop kitchenware, aluminium, plastic, gift items, umbrellas and lighting at best prices in Sri Lanka. Free delivery over Rs. 5000.',
      keywords: 'kitchenware Sri Lanka, aluminium products, gift items, umbrellas, lighting, wholesale retail'
    });

    // Banner slider only in browser
    // setInterval causes SSR stabilization timeout
    if (isPlatformBrowser(this.platformId)) {
      this.startBannerSlide();
    }

    // Widget structure initializes on both server and browser
    // But API calls only in browser
    this.loadWidgets();

    // Products and categories only in browser
    if (isPlatformBrowser(this.platformId)) {
      this.loadProducts();
      this.loadCategories();
    }
  }
  loadProducts() {
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.featuredProducts.set(products.slice(0,10));
        this.isLoadingProducts.set(false);
      },
      error: () => {
        this.isLoadingProducts.set(false);
      }
    })
  }

  loadCategories() {
    this.productService.getAllCategories().subscribe({
      next: (cats) => this.categories.set(cats),
      error: () => {}
    });
  }

  private startBannerSlide() {
    const delay = this.currentBanner() === 0 ? 8000 : 4000; 

    this.bannerInterval = setTimeout(() => {
      this.currentBanner.set(
        (this.currentBanner() + 1) % this.banners.length
      );
      this.startBannerSlide();  // reschedule with new delay
    }, delay);
  }

  loadWidgets() {
    const slugs = ['kitchenware', 'gift-items', 'lighting', 'aluminium'];
    const titles = [
      'Top in Kitchenware',
      'Popular Gift Items',
      'Lighting Solutions',
      'Aluminium Products'
    ];

    // Initialize with safe empty objects first — not empty array
    this.widgets = slugs.map((slug, index) => ({
      title: titles[index],
      slug: slug,
      products: [],
      previewImage: null
    }));

      // Skip API calls during SSR
  if (!isPlatformBrowser(this.platformId)) return;

    slugs.forEach((slug, index) => {
      this.productService.getProductsByCategory(slug).subscribe({
        next: (products) => {
          this.widgets[index] = {
            title: titles[index],
            slug: slug,
            products: products.slice(0,4).map(p => ({
              id: p.id,
              name: p.name,
              price: p.price,
              emoji: p.emoji,
              imageUrl: p.imageUrl
            })),
            previewImage: products[0]?.imageUrl || null
          }
        },
        error: () => {}
      })
    })
  }

  ngOnDestroy() {
    clearTimeout(this.bannerInterval);
  }   

  setBanner(index: number) {
    this.currentBanner.set(index);
  }

  getBannerQueryParams(banner: any): Record<string, string> {
    if (banner.slug === 'deals') return { badge: 'SALE' };
    if (banner.slug) return { category: banner.slug };
    return {};
  }

  addToCart(product: any) {
    console.log('Added to cart:', product);
  }

   optimizeImage(url: string | null, width: number = 400): string {
    return optimizeImageUrl(url, width);
  }

}