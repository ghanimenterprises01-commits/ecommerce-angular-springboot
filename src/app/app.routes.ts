import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role-guard';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => 
            import('./features/home/home').then(m => m.Home)
    },
    {   
        path: 'products',
        loadComponent: () => 
            import('./features/products/products').then(m => m.Products)
    },

    {
        path: 'products/:id',
        loadComponent: () => 
            import('./features/products/product-detail/product-detail').then(m => m.ProductDetail)
    }, 

    {
        path: 'cart',
        loadComponent: () => 
            import('./features/cart/cart').then(m => m.Cart)
    },

    {
        path: 'auth/login',
        loadComponent: () => 
        import('./features/auth/login/login').then(m => m.Login)   
     },

     {
        path: 'auth/register',
        loadComponent: () => 
            import('./features/auth/register/register').then(m => m.Register)
        
     },

     {
        path: 'admin',
        loadComponent: () => 
            import('./features/admin/admin').then(m => m.Admin),
        canActivate: [roleGuard],
        data: {role: 'ADMIN'}
     }, 

     {
        path: 'order-success/:id',
        loadComponent: () => 
            import('./features/order-success/order-success')
        .then(m => m.OrderSuccess),
        canActivate: [authGuard]
     },

     {
        path: 'search',
        loadComponent: () => 
            import('./features/search/search').then(m => m.Search)
     },

     {
        path: 'wishlist',
        title: 'My Wishlist — Ghanim Enterprises',
        loadComponent: () =>
            import('./features/wishlist/wishlist')
            .then(m => m.Wishlist),
        canActivate: [authGuard]
    },

    {
        path: "**",
        redirectTo: ''
    }
];
