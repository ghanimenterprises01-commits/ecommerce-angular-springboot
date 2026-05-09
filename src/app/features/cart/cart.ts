import { Component, signal, computed, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { optimizeImageUrl } from '../../core/utils/image.utils';
import { CheckoutFormData, CheckoutModal } from '../checkout-modal/checkout-modal';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, CommonModule, CheckoutModal],
  templateUrl: './cart.html',
  styleUrl: './cart.scss'
})
export class Cart {
  currencySymbol = environment.currencySymbol;

  promoCode = signal('');
  promoApplied = signal(false);
  promoDiscount = signal(0);
  
  showCheckoutModal = signal(false);

  constructor(
    public cartService: CartService,
    public authService: AuthService,
    private toast: ToastService
  ) {
    effect(() => {
      if (this.cartService.orderSuccess()) {
        this.showCheckoutModal.set(false);
      }
    });

    effect(() => {
      if (this.cartService.orderError()) {
        this.showCheckoutModal.set(false);
      }
    })
  }

  get subtotal() { return this.cartService.subtotal(); }
  get totalItems() { return this.cartService.totalItems(); }
  get deliveryFee() { return this.cartService.deliveryFee(); }
  get total() {
    return this.subtotal - this.promoDiscount() + this.deliveryFee;
  }

  increaseQty(id: number) {
    const item = this.cartService.cartItems()
      .find(i => i.id === id);
    if (item) {
      this.cartService.updateQuantity(id, item.quantity + 1);
    }
  }

  decreaseQty(id: number) {
    const item = this.cartService.cartItems()
      .find(i => i.id === id);
    if (item && item.quantity > 1) {
      this.cartService.updateQuantity(id, item.quantity - 1);
    }
  }

  removeItem(id: number) {
    this.cartService.removeFromCart(id);
  }

  onPromoInput(event: Event) {
    this.promoCode.set(
      (event.target as HTMLInputElement).value
    );
  }

  applyPromo() {
    const code = this.promoCode().trim().toUpperCase();
    if (code === 'SAVE10') {
      this.promoDiscount.set(
        Math.round(this.subtotal * 0.1)
      );
      this.promoApplied.set(true);
    } else if (code === 'FLAT500') {
      this.promoDiscount.set(500);
      this.promoApplied.set(true);
    } else {
      this.promoApplied.set(false);
      this.promoDiscount.set(0);
      this.toast.error('Invalid promo code. Try SAVE10 or FLAT500');
    }
  }

  removePromo() {
    this.promoCode.set('');
    this.promoApplied.set(false);
    this.promoDiscount.set(0);
  }

  clearCart() {
    this.cartService.clearCart();
  }

  checkout() {
    if (!this.authService.isLoggedIn()) {
      this.cartService.placeOrder();
      return;
    }
    this.showCheckoutModal.set(true);
  }

  onModalClosed(){
    this.showCheckoutModal.set(false);
  }

  onOrderSubmitted(formData: CheckoutFormData) {
    const deliveryAddress = [
      formData.streetAddress,
      formData.landmark,
      formData.city,
      formData.district,
      formData.province,
      formData.postalCode ? `(${formData.postalCode})` : '',
    ]
      .filter(Boolean)
      .join(', ');
 
    const notes = [
      `Contact: +94${formData.phone} (${formData.fullName})`,
      `Label: ${formData.addressLabel}`,
      formData.notes,
    ]
      .filter(Boolean)
      .join(' | ');
 
    this.cartService.placeOrder(
      this.promoApplied() ? this.promoCode() : undefined,
      deliveryAddress,
      notes
    );
  }

  optimizeImage(
    url: string | null | undefined,
    width: number = 150
  ): string {
    return optimizeImageUrl(url, width);
  }
}