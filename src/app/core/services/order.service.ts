import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  emoji: string;
  category: string;
  imageUrl: string | null;
}

export interface OrderRequest {
  items: { productId: number; quantity: number }[];
  promoCode?: string;
  deliveryAddress?: string;
  notes?: string;
}

export interface OrderResponse {
  id: number;
  customerName: string;
  customerEmail: string;
  items: {
    productId: number;
    productName: string;
    productEmoji: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  promoCode: string;
  status: string;
  priceType: string;
  deliveryAddress: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private api: ApiService) {}

  placeOrder(request: OrderRequest): Observable<OrderResponse> {
    return this.api.post<OrderResponse>('/orders', request);
  }

  getMyOrders(): Observable<OrderResponse[]> {
    return this.api.get<OrderResponse[]>('/orders/my');
  }

  getOrderById(id: number): Observable<OrderResponse> {
    return this.api.get<OrderResponse>(`/orders/${id}`);
  }
}