import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { OrderResponse } from '../../core/models/order.model';


type StatusFilter = 'ALL' | 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

@Component({
  selector: 'app-orders',
  imports: [CommonModule, RouterLink],
  templateUrl: './orders.html',
  styleUrl: './orders.scss',
})
export class Orders implements OnInit{
  private orderService = inject(OrderService);
 
  orders = signal<OrderResponse[]>([]);
  selectedOrder = signal<OrderResponse | null>(null);
  isLoading = signal(true);
  error = signal('');
  activeFilter = signal<StatusFilter>('ALL');
 
  readonly filters: { label: string; value: StatusFilter }[] = [
    { label: 'All', value: 'ALL' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Processing', value: 'PROCESSING' },
    { label: 'Shipped', value: 'SHIPPED' },
    { label: 'Delivered', value: 'DELIVERED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];
 
  ngOnInit() {
    this.orderService.getMyOrders().subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load orders.');
        this.isLoading.set(false);
      }
    });
  }
 
  get filteredOrders(): OrderResponse[] {
    const filter = this.activeFilter();
    return filter === 'ALL'
      ? this.orders()
      : this.orders().filter(o => o.status === filter);
  }
 
  setFilter(filter: StatusFilter) {
    this.activeFilter.set(filter);
  }
 
  openDetail(order: OrderResponse) {
    this.selectedOrder.set(order);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
 
  closeDetail() {
    this.selectedOrder.set(null);
  }
 
  statusClass(status: string): string {
    return 'status--' + status.toLowerCase();
  }
 
  canCancel(status: string): boolean {
    return status === 'PENDING' || status === 'PROCESSING';
  }
}
