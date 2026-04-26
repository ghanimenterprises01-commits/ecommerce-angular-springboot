import { Component, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { Navbar } from './shared/components/navbar/navbar';
import { Footer } from './shared/components/footer/footer';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';
import { Chatbot } from './shared/components/chatbot/chatbot';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone:true, 
  imports: [RouterOutlet, Navbar, Footer, CommonModule, Chatbot, RouterLink],
  template: `
  <app-navbar *ngIf="showLayout()" />
  <main>
    <router-outlet />
  </main>
  <app-footer *ngIf="showLayout()" />
  <app-chatbot *ngIf="showLayout()" />
   <!-- Floating admin button — only for admin on shop pages -->
    <a routerLink="/admin"
       class="admin-float-btn"
       *ngIf="showLayout() && authService.isAdmin">
      ⚙️ Admin
    </a>`,
  
  styles: [`
    main {
    min-height: calc(100vh - 70px);
    background: var(--surface-2);}
    
    .admin-float-btn {
    position: fixed;
    bottom: 100px;
    right: 24px;
    background: #131921;
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

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.3);
      background: #1a2535;
    }
  }`]
})
export class App {
  showLayout = signal(true);

  private authRoutes = ['/auth/login', '/auth/register', '/admin'];

  constructor(private router: Router, public authService: AuthService) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const isAuthRoute = this.authRoutes.some(route => 
        event.urlAfterRedirects.startsWith(route)
      );
      this.showLayout.set(!isAuthRoute);
    })
  }
}
