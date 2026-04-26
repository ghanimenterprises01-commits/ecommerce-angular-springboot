import { Injectable, signal } from "@angular/core";
import { ApiService } from "./api.service";
import { Observable } from "rxjs";
import { AdminProduct, Product, ProductRequest } from "../models/product.model";
import { Category } from "../models/category.model";


@Injectable({
    providedIn: 'root'
})

export class ProductService {
    isLoading = signal(false);

    constructor(private api: ApiService) {}

    getAllProducts(): Observable<Product[]> {
        return this.api.get<Product[]>('/products')
    }

    getProductById(id: number): Observable<Product> {
        return this.api.get<Product>(`/products/${id}`);
    }

    getProductsByCategory(slug: string): Observable<Product[]> {
        return this.api.get<Product[]>(`/products/category/${slug}`);
    }

    searchProducts(query: string): Observable<Product[]> {
        return this.api.get<Product[]>('/products/search', {query});
    }

    createProduct(request: ProductRequest): Observable<Product> {
        return this.api.post<Product>('/products', request);
    }

    updateProduct(id: number, request: ProductRequest): Observable<Product> {
        return this.api.put<Product>(`/products/${id}`, request);
    }

    deleteProduct(id: number): Observable<void> {{
        return this.api.delete<void>(`/products/${id}`);
    }}

    getAllCategories(): Observable<Category[]> {
        return this.api.get<Category[]>('/categories');
    }

    getAdminProducts(): Observable<AdminProduct[]> {
  return this.api.get<AdminProduct[]>('/admin/products');
}
}