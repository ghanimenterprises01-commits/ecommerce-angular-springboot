export interface OrderItem {
  productId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: number;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  status: string;
  priceType: string;
  createdAt: string;
}

export interface OrderResponse {
  id: number;
  customerName: string;
  customerEmail: string;
  items: OrderItemResponse[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  promoCode: string;
  status: string;
  priceType: string;
  recipientName: string;
  recipientPhone: string;
  province: string;
  district: string;
  cityTown: string;
  postalCode?: string;
  streetAddress: string;
  deliveryNotes?: string;
  createdAt: string;
}

export interface OrderItemResponse {
  productId: number;
  productName: string;
  productEmoji: string;
  productImageUrl?: string;   
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}
 