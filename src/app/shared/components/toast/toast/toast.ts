import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
  emoji: string;
}


@Component({
  selector: 'app-toast',
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
})
export class Toast {
  toasts = signal<ToastMessage[]>([]);
  private counter = 0;

  show(
    message: string,
    type: 'success' | 'error' | 'info' = 'success',
    emoji: string = '✅'
  ) {
    const id = ++this.counter;
    const toast: ToastMessage = {
      id, message, type, emoji
    };

    this.toasts.update(t => [...t, toast]);

    // auto remove after 3 sec
    setTimeout(() => {
      this.remove(id);
    }, 3000);
  }

  remove(id: number) {
    this.toasts.update(t => 
      t.filter(toast => toast.id !== id)
    );
  }
}
