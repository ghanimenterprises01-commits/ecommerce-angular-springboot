import { inject, Injectable, PLATFORM_ID, signal } from "@angular/core";
import { Product } from "../models/product.model";
import { ToastService } from "./toast.service";
import { isPlatformBrowser } from "@angular/common";
import { getItem, removeItem, setItem } from "../utils/storage.utils";
import { AuthService } from "./auth.service";
import { Router } from "@angular/router";




@Injectable({
    providedIn: 'root'
})

export class WishListService {
    private platfromId = inject(PLATFORM_ID);
    wishlistItems = signal<Product[]>([]);

    constructor(private toast: ToastService, private authService: AuthService, private router: Router) {

        if (isPlatformBrowser(this.platfromId)) {
            if (this.authService.isLoggedIn()) {
                this.loadFromStorage();
            }
        }
    }

    private loadFromStorage() {
        const saved = getItem('wishlist');
        if (saved) {

            try {
                this.wishlistItems.set(JSON.parse(saved));
            } catch {
                this.wishlistItems.set([]);
            }
        
        }
    }

    private saveToStorage() {
        setItem(
            'wishlist',
            JSON.stringify(this.wishlistItems())
        );
    }

    isInWishlist(productId: number): boolean {
        return this.wishlistItems()
        .some(p => p.id === productId);
    }

    toggleWishList(product: Product) {

        if (!this.authService.isLoggedIn()) {
            this.toast.info(
                'Please sign in to save items to your wishlist',
                '🔒'
            );
            this.router.navigate(['/auth/login'], {
                queryParams: {returnUrl: '/wishlist'}
            });
            return;
        }
        if (this.isInWishlist(product.id)) {
            this.removeFromWishlist(product.id);
            this.toast.info(
                `${product.name} removed from wishlist`,
                '💔'
            );
        } else {
            this.addToWishlist(product);
            this.toast.success(
                `${product.name} added to wishlist`,
                '❤️'
            )
        }
    }

    addToWishlist(product: Product) {
        if (!this.isInWishlist(product.id)) {
            this.wishlistItems.update(items => 
            [...items, product]
            );
            this.saveToStorage();
        }
    }

    removeFromWishlist(productId: number) {
        this.wishlistItems.update(items => 
            items.filter(p => p.id !== productId)
        );
        this.saveToStorage();
    }

    clearWishlist() {
        this.wishlistItems.set([]);
        removeItem('wishlist');
    }

    get count(): number {
        return this.wishlistItems().length;
    }
}