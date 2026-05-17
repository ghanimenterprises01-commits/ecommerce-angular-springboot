import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { OrderService } from '../../../../core/services/order.service';
import { OrderResponse } from '../../../../core/models/order.model';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-orders.html',
  styleUrl: './admin-orders.scss',
})
export class AdminOrders implements OnInit{

  private orderService = inject(OrderService);

  orders = signal<OrderResponse[]>([])
  isLoading = signal(true);
  error = signal('');
  selectedStatus = signal('All');


  statuses = ['All', 'Pending', 'Processing', 'Delivered', 'Cancelled'];

  get filteredOrders(): OrderResponse[] {
    const status = this.selectedStatus();
    return status === 'All'
      ? this.orders()
      : this.orders().filter(o => o.status === status);
  }

  ngOnInit() {
    this.orderService.getAllOrders().subscribe({
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

  setStatus(status: string) {
    this.selectedStatus.set(status);
  }

  updateStatus(orderId: number, status: string) {
    this.orderService.updateOrderStatus(orderId, status).subscribe({
      next: (updated) => {
        this.orders.update(orders =>
          orders.map(o => o.id === updated.id ? updated : o)
        );
      }
    });
  }

  getStatusClass(status: string): string {
    return 'status--' + status.toLowerCase();
  }

  getTypeClass(type: string): string {
    return type === 'WHOLESALE' ? 'type--wholesale' : 'type--retail';
  }
}

