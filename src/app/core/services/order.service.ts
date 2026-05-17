import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { OrderResponse } from '../models/order.model';

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
  recipientName: string;
  recipientPhone: string;
  province: string;
  district: string;
  landmark?: string;
  cityTown: string;
  postalCode?: string;
  streetAddress: string;
  deliveryNotes?: string;
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

  getAllOrders(): Observable<OrderResponse[]> {
  return this.api.get<OrderResponse[]>('/orders');
}

updateOrderStatus(id: number, status: string): Observable<OrderResponse> {
  return this.api.patch<OrderResponse>(`/orders/${id}/status?status=${status}`, null);
}

}