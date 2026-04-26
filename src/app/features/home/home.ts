import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';
import { Product } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';
import { ProductService } from '../../core/services/product.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit, OnDestroy {
  currencySymbol = environment.currencySymbol;

  // Banner slider
  currentBanner = signal(0);
  private bannerInterval: any;
  featuredProducts = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  isLoadingProducts = signal(true);

  constructor(private productService: ProductService) {}

  banners = [
    {
      title: "Fresh Arrivals in Kitchenware",
      subtitle: "Upgrade your kitchen with premium tools",
      btn: "Shop Kitchenware",
      slug: "kitchenware",
      bg: "#f0f7ee",
      accent: "#2d7a4f",
      emoji: "🍳"
    },
    {
      title: "Gift Items for Every Occasion",
      subtitle: "Find the perfect gift for your loved ones",
      btn: "Shop Gift Items",
      slug: "gift-items",
      bg: "#fef9ee",
      accent: "#92702a",
      emoji: "🎁"
    },
    {
      title: "Lighting Solutions for Your Home",
      subtitle: "Brighten every corner beautifully",
      btn: "Shop Lighting",
      slug: "lighting",
      bg: "#eef4ff",
      accent: "#1a56db",
      emoji: "💡"
    },
    {
      title: "Quality Umbrellas for Every Season",
      subtitle: "Stay dry and stylish all year round",
      btn: "Shop Umbrellas",
      slug: "umbrellas",
      bg: "#fdf2f8",
      accent: "#9333ea",
      emoji: "☂️"
    }
  ];

  widgets: any[] = [];


  ngOnInit() {
    this.startBannerSlide();
    this.loadProducts();
    this.loadCategories();
    this.loadWidgets();
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
    this.bannerInterval = setInterval(() => {
      this.currentBanner.set(
        (this.currentBanner() + 1) % this.banners.length
      );
    }, 4000)
  }

  loadWidgets() {
    const slugs = ['kitchenware', 'gift-items', 'lighting', 'aluminium'];
    const titles = [
      'Top in Kitchenware',
      'Popular Gift Items',
      'Lighting Solutions',
      'Aluminium Products'
    ];

    this.widgets = [];

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
    clearInterval(this.bannerInterval);
  }   

  setBanner(index: number) {
    this.currentBanner.set(index);
  }

  addToCart(product: any) {
    console.log('Added to cart:', product);
  }
}