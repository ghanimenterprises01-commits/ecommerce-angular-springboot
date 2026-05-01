import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService, CartItem, OrderRequest } from './order.service';
import { AuthService } from './auth.service';
import { getItem, removeItem, setItem } from '../utils/storage.utils';
import { AnalyticsService } from './analytics.service';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  cartItems = signal<CartItem[]>([]);
  isPlacingOrder = signal(false);
  orderSuccess = signal<number | null>(null);
  orderError = signal('');

  subtotal = computed(() =>
    this.cartItems().reduce(
      (sum, item) => sum + item.price * item.quantity, 0
    )
  );

  totalItems = computed(() =>
    this.cartItems().reduce(
      (sum, item) => sum + item.quantity, 0
    )
  );

  deliveryFee = computed(() =>
    this.subtotal() >= 5000 ? 0 : 350
  );

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router,
    private analytics: AnalyticsService,
    private toast: ToastService
  ) {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const saved = getItem('cart');
    if (saved) {
      try {
        this.cartItems.set(JSON.parse(saved));
      } catch {
        this.cartItems.set([]);
      }
    }
  }

  private saveToStorage() {
    setItem('cart', JSON.stringify(this.cartItems()));
  }

  addToCart(item: CartItem) {
    const existing = this.cartItems()
      .find(i => i.id === item.id);

    if (existing) {
      this.cartItems.update(items =>
        items.map(i =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        )
      );
    } else {
      this.cartItems.update(items => [...items, item]);
    }
    this.saveToStorage();

      // Show toast instead of alert
    this.toast.success(
      `${item.name} added to cart`,
      item.emoji || '🛒'
    );
     // Track the event
    this.analytics.trackAddToCart(item.name, item.price);

  }

  removeFromCart(id: number) {
    this.cartItems.update(items =>
      items.filter(i => i.id !== id)
    );
    this.saveToStorage();
  }

  updateQuantity(id: number, quantity: number) {
    if (quantity < 1) {
      this.removeFromCart(id);
      return;
    }
    this.cartItems.update(items =>
      items.map(i =>
        i.id === id ? { ...i, quantity } : i
      )
    );
    this.saveToStorage();
  }

  clearCart() {
    this.cartItems.set([]);
    removeItem('cart');
  }

  placeOrder(
    promoCode?: string,
    deliveryAddress?: string,
    notes?: string
  ) {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: '/cart' }
      });
      return;
    }

    if (this.cartItems().length === 0) return;

    this.isPlacingOrder.set(true);
    this.orderError.set('');
    this.orderSuccess.set(null);

    const request: OrderRequest = {
      items: this.cartItems().map(item => ({
        productId: item.id,
        quantity: item.quantity
      })),
      promoCode: promoCode || undefined,
      deliveryAddress: deliveryAddress || undefined,
      notes: notes || undefined
    };

    this.orderService.placeOrder(request).subscribe({
      next: (order) => {
        this.isPlacingOrder.set(false);
        this.orderSuccess.set(order.id);

        // Track purchase
        this.analytics.trackPurchase(order.id, order.total);

        this.router.navigate(['/order-success', order.id])
        .then(() => {
          this.clearCart();
        })
      },
      error: (err) => {
        this.isPlacingOrder.set(false);
        this.orderError.set(
          err.error?.message || 'Failed to place order. Please try again.'
        );
         this.toast.error(
          err.error?.message || 'Failed to place order'
        );
      }
    });
  }
}