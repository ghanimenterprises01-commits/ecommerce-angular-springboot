import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, DecimalPipe } from '@angular/common';
import { WishListService } from '../../core/services/wishlist.service';
import { CartService } from '../../core/services/cart.service';
import { Product } from '../../core/models/product.model';
import { environment } from '../../../environments/environment';
import { optimizeImageUrl } from '../../core/utils/image.utils';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [RouterLink, CommonModule, DecimalPipe],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.scss'
})
export class Wishlist {
  currencySymbol = environment.currencySymbol;

  constructor(
    public wishlistService: WishListService,
    private cartService: CartService
  ) {}

  optimizeImage(
    url: string | null,
    width: number = 300
  ): string {
    return optimizeImageUrl(url, width);
  }

  moveToCart(product: Product) {
    this.cartService.addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      emoji: product.emoji,
      category: product.categoryName,
      imageUrl: product.imageUrl
    });
    this.wishlistService.removeFromWishlist(product.id);
  }

  removeFromWishlist(productId: number) {
    this.wishlistService.removeFromWishlist(productId);
  }
}