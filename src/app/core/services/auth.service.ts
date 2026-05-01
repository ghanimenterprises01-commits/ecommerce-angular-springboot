import { inject, Injectable, PLATFORM_ID, signal } from "@angular/core";
import { Router } from "@angular/router";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { AuthResponse, LoginRequest, RegisterRequest } from "../models/auth.model";
import { Observable, tap } from "rxjs";
import { isPlatformBrowser } from "@angular/common";
import { getItem, removeItem, setItem } from "../utils/storage.utils";




export interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: 'RETAIL' | 'WHOLESALE' | 'ADMIN';
}

@Injectable({
    providedIn: 'root'
})

export class AuthService {

    private apiUrl = environment.apiUrl;

    currentUser = signal<User | null> (null);
    isLoggedIn = signal(false);

    constructor(private router: Router, private http: HttpClient) {
        this.loadFromStorage();
    }

    private loadFromStorage() {  
        const token = getItem('token');
        const userStr = getItem('user');
        if (token && userStr) {
            try {
                const user = JSON.parse(userStr);
                this.currentUser.set(user);
                this.isLoggedIn.set(true);
            } catch {
                this.logout();
            }
        }   
    }

    login(request: LoginRequest) : Observable<AuthResponse> {
        let mockUser: User | null = null;

        return this.http.post<AuthResponse>(
            `${this.apiUrl}/auth/login`, 
            request
        ).pipe(
            tap(response => {
                setItem('token', response.token);
                setItem('role', response.role);
                setItem('user', JSON.stringify({
                    firstName: response.firstName,
                    lastName: response.lastName,
                    email: response.email,
                    role: response.role
                }));
                
                this.currentUser.set({
                    id: 0,
                    firstName: response.firstName,
                    lastName: response.lastName,
                    email: response.email,
                    role: response.role as any
                });
                this.isLoggedIn.set(true);
            })
        )
     }

     register(request: RegisterRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(
            `${this.apiUrl}/auth/register`,
            request
        );
     }

     

     logout() {
        removeItem('token');
        removeItem('role');
        removeItem('user');
        removeItem('cart');
        removeItem('wishlist');
        this.currentUser.set(null);
        this.isLoggedIn.set(false);
        this.router.navigate(['/']);
     }

     get role(): string {
        return getItem('role') || '';
     }

     get isAdmin(): boolean {
        return this.role === 'ADMIN';
     }

     get isWholesale(): boolean {
        return this.role === 'WHOLESALE';
     }

     get isRetail(): boolean {
        return this.role === 'RETAIL';
     }
}