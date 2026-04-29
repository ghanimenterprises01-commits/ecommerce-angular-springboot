import { Injectable, ViewContainerRef,
         ComponentRef } from '@angular/core';
import { Toast } from '../../shared/components/toast/toast/toast';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastRef: ComponentRef<Toast> | null = null;

  init(vcr: ViewContainerRef) {
    this.toastRef = vcr.createComponent(Toast);
  }

  success(message: string, emoji: string = '✅') {
    this.toastRef?.instance.show(message, 'success', emoji);
  }

  error(message: string, emoji: string = '❌') {
    this.toastRef?.instance.show(message, 'error', emoji);
  }

  info(message: string, emoji: string = 'ℹ️') {
    this.toastRef?.instance.show(message, 'info', emoji);
  }
}