import { Component, signal, computed, effect } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
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
    private toast: ToastService,
    private router: Router,
    private location: Location
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

  goBack() { this.location.back(); }

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
    this.router.navigate(['/auth/login'], {
      queryParams: { returnUrl: '/cart' }
    });
    return;
  }
  this.showCheckoutModal.set(true);
}

  onModalClosed(){
    this.showCheckoutModal.set(false);
  }

  onOrderSubmitted(formData: CheckoutFormData) {
    this.cartService.placeOrder(
      {
        recipientName: formData.fullName,
        recipientPhone: formData.phone,
        province: formData.province,
        district: formData.district,
        landmark: formData.landmark,
        cityTown: formData.city,
        postalCode: formData.postalCode || undefined,
        streetAddress: formData.streetAddress,
        deliveryNotes: formData.notes || undefined,
      },
      this.promoApplied() ? this.promoCode() : undefined
    );
  }

  optimizeImage(
    url: string | null | undefined,
    width: number = 150
  ): string {
    return optimizeImageUrl(url, width);
  }
}