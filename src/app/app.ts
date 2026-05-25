import { Component, inject, PLATFORM_ID, signal, ViewContainerRef } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Navbar } from './shared/components/navbar/navbar';
import { Footer } from './shared/components/footer/footer';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { filter } from 'rxjs';
import { Chatbot } from './shared/components/chatbot/chatbot';
import { AuthService } from './core/services/auth.service';
import { AnalyticsService } from './core/services/analytics.service';
import { ToastService } from './core/services/toast.service';

@Component({
  selector: 'app-root',
  standalone:true, 
  imports: [RouterOutlet, Navbar, Footer, CommonModule, Chatbot, RouterLink, RouterLinkActive],
  template: `
  <app-navbar *ngIf="showLayout()" />
  <main>
    <router-outlet />
  </main>
  <app-footer *ngIf="showLayout()" />
  <app-chatbot *ngIf="showLayout()" />
    <!-- WhatsApp floating button -->
  <a *ngIf="showLayout()"
     href="https://wa.me/94719025444?text=Hello%20Ghanim%20Enterprises%2C%20I%20would%20like%20to%20inquire%20about%20your%20products."
     target="_blank"
     rel="noopener noreferrer"
     class="whatsapp-float">
    <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  </a>
   <!-- Floating admin button — only for admin on shop pages -->
    <a routerLink="/admin"
       class="admin-float-btn"
       *ngIf="showLayout() && authService.isAdmin">
      ⚙️ Admin
    </a>

  <!-- Mobile bottom navigation -->
  <nav class="bottom-nav" *ngIf="showLayout()">
    <a routerLink="/" routerLinkActive="bottom-nav__item--active" [routerLinkActiveOptions]="{exact:true}" class="bottom-nav__item">
      <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
      <span>Home</span>
    </a>
    <a routerLink="/products" routerLinkActive="bottom-nav__item--active" class="bottom-nav__item">
      <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
      <span>Shop</span>
    </a>
    <a href="https://wa.me/94719025444?text=Hello%20Ghanim%20Enterprises%2C%20I%20would%20like%20to%20inquire%20about%20your%20products."
       target="_blank" rel="noopener noreferrer" class="bottom-nav__item bottom-nav__item--wa">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
      <span>WhatsApp</span>
    </a>
    <a routerLink="/cart" routerLinkActive="bottom-nav__item--active" class="bottom-nav__item">
      <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 001.98 1.61h9.72a2 2 0 001.98-1.61L23 6H6"/>
      </svg>
      <span>Cart</span>
    </a>
    <a routerLink="/auth/login" routerLinkActive="bottom-nav__item--active" class="bottom-nav__item">
      <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
      <span>Account</span>
    </a>
  </nav>`,
  
  styles: [`
    main {
      min-height: calc(100vh - 70px);
      background: var(--surface-2);

      @media (max-width: 768px) {
        padding-bottom: 68px;
      }
    }

    .whatsapp-float {
      position: fixed;
      bottom: 160px;
      right: 24px;
      width: 52px;
      height: 52px;
      background: #25D366;
      border-radius: 50%;
      display: none;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 16px rgba(37,211,102,0.4);
      z-index: 2100;
      transition: all 0.3s ease;
      text-decoration: none;

      @media (min-width: 769px) {
        display: flex;
      }

      &:hover {
        transform: scale(1.1) translateY(-2px);
        box-shadow: 0 6px 24px rgba(37,211,102,0.5);
        background: #20ba5a;
      }
    }

    .admin-float-btn {
      position: fixed;
      bottom: 100px;
      right: 24px;
      background: #112040;
      color: #c9a84c;
      padding: 10px 16px;
      border-radius: 100px;
      font-size: 0.82rem;
      font-weight: 700;
      text-decoration: none;
      font-family: 'Inter', sans-serif;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      z-index: 2100;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;

      @media (max-width: 768px) {
        bottom: 76px;
        right: 16px;
      }

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0,0,0,0.3);
        background: #1a2535;
      }
    }

    // ─── Mobile bottom navigation ────────────────────────────────────────────
    .bottom-nav {
      display: none;

      @media (max-width: 768px) {
        display: flex;
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 64px;
        background: white;
        border-top: 1px solid #e8e8e8;
        z-index: 1500;
        align-items: center;
        justify-content: space-around;
        padding: 0 4px;
        box-shadow: 0 -2px 12px rgba(0,0,0,0.08);
      }

      &__item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 3px;
        flex: 1;
        text-decoration: none;
        color: #999;
        font-size: 0.65rem;
        font-weight: 500;
        font-family: 'Inter', sans-serif;
        padding: 6px 0;
        transition: color 0.2s;
        cursor: pointer;

        span {
          line-height: 1;
        }

        &--active {
          color: var(--primary);
          font-weight: 700;

          svg {
            stroke: var(--accent);
          }
        }

        &--wa {
          color: #25D366;

          svg {
            fill: #25D366;
          }

          &.bottom-nav__item--active {
            color: #25D366;
          }
        }
      }
    }
  `]
})
export class App {
  showLayout = signal(true);

  private authRoutes = ['/auth/login', '/auth/register', '/admin'];

  private platformId = inject(PLATFORM_ID);

  constructor(private router: Router, public authService: AuthService,  private analytics: AnalyticsService, private toastService: ToastService, private vcr: ViewContainerRef) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const isAuthRoute = this.authRoutes.some(route => 
        event.urlAfterRedirects.startsWith(route)
      );
      this.showLayout.set(!isAuthRoute);

       // Scroll to top on every navigation
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
    })
  }

  ngOnInit() {
    this.toastService.init(this.vcr);
  }
}
