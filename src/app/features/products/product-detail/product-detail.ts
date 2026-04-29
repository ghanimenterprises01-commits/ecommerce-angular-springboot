import { CommonModule, ViewportScroller } from '@angular/common';
import { Component, ElementRef, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { Product } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { SeoService } from '../../../core/services/seo.service';
import { optimizeImageUrl } from '../../../core/utils/image.utils';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetail implements OnInit{
  currencySymbol = environment.currencySymbol;

  product = signal<any>(null);
  relatedProducts = signal<Product[]>([])
  quantity = signal(1);
  selectedTab = signal('description');
  isLoading = signal(true);
  error = signal('');
  activeImageIndex = signal(0);
  isZoomed = signal(false);
  zoomPosition = signal({x: 50, y: 50});

  @ViewChild('relatedTrack')
  relatedTrack!: ElementRef;


  constructor(private route: ActivatedRoute, private productService: ProductService, private cartService: CartService, private seo: SeoService) {}

  ngOnInit(){
    this.route.params.subscribe(params => {
      const id = +params['id'];
      this.loadProduct(id);
    });
  }

  loadProduct(id: number) {
    this.isLoading.set(true);
    this.error.set('');

    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.product.set(product);
        this.isLoading.set(false);
        this.loadRelated(product.categorySlug, id);

        this.seo.updateProductMeta({
             name: product.name,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl,
        categoryName: product.categoryName
        });
      },
      error: () => {
        this.error.set('Product not found');
        this.isLoading.set(false);
      }
    });
  }

  loadRelated(slug: string, currentId: number) {
    this.productService.getProductsByCategory(slug).subscribe({
      next: (products) => {
        this.relatedProducts.set(
          products.filter(p => p.id !== currentId).slice(0,4)
        );
      },
      error: () => {}
    });
  }

  // get discountPercent() {
  //   const p = this.product();
  //   if (!p || !p.originalPrice) return null;
  //   return Math.round((1-p.price / p.originalPrice) * 100);
  // }

  increaseQty() {
    this.quantity.set(this.quantity() + 1);
  }

  decreaseQty() {
    if(this.quantity() > 1) this.quantity.set(this.quantity() - 1);
  }

  addToCart() {
    const product = this.product();
    if (!product) return;

    this.cartService.addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: this.quantity(),
      emoji: product.emoji,
      category: product.categoryName
    })
  }

  setTab(tab: string) {
    this.selectedTab.set(tab);
  }

 get parsedSpecs() {
  const product = this.product();
  if (!product || !product.specifications) return [];

  return product.specifications
    .split('\n')
    .filter((line: String) => line.trim())
    .map((line: string) => {
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) {
        return { label: line.trim(), value: '' };
      }
      return {
        label: line.substring(0, colonIndex).trim(),
        value: line.substring(colonIndex + 1).trim()
      };
    });
}

 get carouselImages() {
      const product = this.product();
      if (!product) return [];

      const images = [];
      if (product.imageUrl) {
        images.push({type: 'image', src: product.imageUrl});
      }
      images.push({type: 'emoji', src: product.emoji});
      return images;
 }

 get descriptionPoints(): string[] {
  const desc = this.product()?.description;
  if (!desc) return [];

  // if contains bullet points
  if (desc.includes('•')) {
    return desc.split('•')
    .map((line: string) => line.trim())
    .filter((line: string) => line.length > 0);
  }

  // otherwise split by newline
  if (desc.includes('\n')) {
    return desc.split('\n')
    .map((line: string) => line.trim())
    .filter((line: string) => line.length > 0);
  }

  return [desc];
 }

 get allImages(): string[] {
  const product = this.product();
  if (!product) return [];


  // use imageurls array if available
  if (product.imageUrls && product.imageUrls.length > 0) {
     return product.imageUrls.filter((u: string) => u && u.trim() !== '');
  }

  // fall back to single imageurl
  if (product.imageUrl) {
    return [product.imageUrl];
  }

  return [];
  
 }

 get activeImage(): string | null {
  const images = this.allImages;
  if (images.length === 0) return null;
  return images[this.activeImageIndex()] || null;
 }

 nextImage() {
  const max = this.allImages.length - 1;
  this.activeImageIndex.set(
    this.activeImageIndex() >= max ? 0: this.activeImageIndex() + 1
  );
 }


 prevImage() {
  const max = this.allImages.length - 1; 
  this.activeImageIndex.set(
    this.activeImageIndex() <= 0 ? max : this.activeImageIndex() - 1
  );
 }

 setActiveImage(index: number){
  this.activeImageIndex.set(index);
 }

 onMouseMove(event: MouseEvent) {
  const rect = (event.target as HTMLElement) .getBoundingClientRect();
  const x = ((event.clientX - rect.left)/ rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;
  this.zoomPosition.set({x, y});
  this.isZoomed.set(true);
 }

 onMouseLeave() {
  this.isZoomed.set(false);
 }

  optimizeImage(url: string | null, width: number = 800): string {
    return optimizeImageUrl(url, width);
  }

  scrollRelated(direction: number) {  // 👈 add here, with other methods
    const track = this.relatedTrack?.nativeElement;
    if (!track) return;
    track.scrollBy({
      left: direction * 280,
      behavior: 'smooth'
    });
  }
}
