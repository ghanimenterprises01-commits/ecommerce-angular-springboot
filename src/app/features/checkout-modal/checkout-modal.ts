import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CheckoutFormData {
  fullName: string;
  phone: string;
  province: string;
  district: string;
  city: string;
  postalCode: string;
  streetAddress: string;
  landmark: string;
  notes: string;
  addressLabel: 'HOME' | 'OFFICE';
}

@Component({
  selector: 'app-checkout-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkout-modal.html',
  styleUrl: './checkout-modal.scss',
})
export class CheckoutModal implements OnChanges {
  @Input() isOpen = false;
  @Input() isSubmitting = false;
  @Output() closed = new EventEmitter<void>();
  @Output() orderSubmitted = new EventEmitter<CheckoutFormData>();

 
  readonly districtsByProvince: Record<string, string[]> = {
    'Western Province': ['Colombo', 'Gampaha', 'Kalutara'],
    'Central Province': ['Kandy', 'Matale', 'Nuwara Eliya'],
    'Southern Province': ['Galle', 'Matara', 'Hambantota'],
    'Northern Province': ['Jaffna', 'Kilinochchi', 'Mannar', 'Mullaitivu', 'Vavuniya'],
    'Eastern Province': ['Ampara', 'Batticaloa', 'Trincomalee'],
    'North Western Province': ['Kurunegala', 'Puttalam'],
    'North Central Province': ['Anuradhapura', 'Polonnaruwa'],
    'Uva Province': ['Badulla', 'Monaragala'],
    'Sabaragamuwa Province': ['Kegalle', 'Ratnapura'],
  };

  get provinces(): string[] {
    return Object.keys(this.districtsByProvince);
  }

  get currentDistricts(): string[] {
    return this.form.province
      ? (this.districtsByProvince[this.form.province] ?? [])
      : [];
  }

  
  form: CheckoutFormData = this.emptyForm();
  errors: Record<string, string> = {};

  private emptyForm(): CheckoutFormData {
    return {
      fullName: '',
      phone: '',
      province: '',
      district: '',
      city: '',
      postalCode: '',
      streetAddress: '',
      landmark: '',
      notes: '',
      addressLabel: 'HOME',
    };
  }

  ngOnChanges(): void {
    if (this.isOpen) {
      // Reset when modal opens
      this.form = this.emptyForm();
      this.errors = {};
    }
  }


  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('checkout-overlay')) {
      this.close();
    }
  }

  onInput(field: keyof CheckoutFormData, event: Event): void {
    const value = (event.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).value;
    (this.form as any)[field] = value;
    // Clear error on edit
    if (this.errors[field]) {
      delete this.errors[field];
    }
  }

  onProvinceChange(event: Event): void {
    this.onInput('province', event);
    // Reset district when province changes
    this.form.district = '';
    delete this.errors['district'];
  }

  setLabel(label: 'HOME' | 'OFFICE'): void {
    this.form.addressLabel = label;
  }

  close(): void {
    this.closed.emit();
  }

  // ── Validation ────────────────────────────────────────────────────────────
  private validate(): boolean {
    this.errors = {};

    if (!this.form.fullName.trim()) {
      this.errors['fullName'] = 'Full name is required';
    }

    const phoneDigits = this.form.phone.replace(/\D/g, '');
    if (!phoneDigits) {
      this.errors['phone'] = 'Phone number is required';
    } else if (![9, 10, 11].includes(phoneDigits.length)) {
      this.errors['phone'] = 'Enter a valid Sri Lankan number (e.g. 0771234567)';
    }

    if (!this.form.province) {
      this.errors['province'] = 'Please select a province';
    }
    if (!this.form.district) {
      this.errors['district'] = 'Please select a district';
    }
    if (!this.form.city.trim()) {
      this.errors['city'] = 'City / town is required';
    }
    if (!this.form.streetAddress.trim()) {
      this.errors['streetAddress'] = 'Street address is required';
    }

    return Object.keys(this.errors).length === 0;
  }

  submit(): void {
    if (!this.validate()) return;
    this.orderSubmitted.emit({ ...this.form });
  }
}