import { Component, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';  
import { CartService } from '../../../core/services/cart.service';  
import { filter } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar {
  shopName = environment.shopName;
  searchQuery = signal('');
  menuOpen = signal(false);
  currentUrl = signal('');
  currentQueryParams = signal<any>({});

  categories = [
    { name: 'All', slug: '' },
    { name: 'Kitchenware', slug: 'kitchenware' },
    { name: 'Aluminium', slug: 'aluminium' },
    { name: 'Plastic', slug: 'plastic' },
    { name: 'Gift Items', slug: 'gift-items' },
    { name: 'Umbrellas', slug: 'umbrellas' },
    { name: 'Lighting', slug: 'lighting' },
    { name: 'General', slug: 'general' },
    { name: "Today's Deals", slug: 'deals' },
  ];

  constructor(public authService: AuthService, public cartService: CartService, private router: Router) {

    // Track current URL and query params
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentUrl.set(event.urlAfterRedirects);
    });

    // Also read query params
    this.router.routerState.root.queryParams.subscribe(
      params => this.currentQueryParams.set(params)
    );
  }



  onSearch() {
    const query = this.searchQuery().trim();
    if (query) {
      this.router.navigate(['/search'],{
        queryParams: {q: query}
      });
      this.searchQuery.set('');
    }
  }


  onCategoryChange(event: Event) {
    const select = event.target as HTMLSelectElement;
  }

  onSearchInput(event: Event) {
    this.searchQuery.set(
      (event.target as HTMLInputElement).value
    )
  }

  toggleMenu() {
    this.menuOpen.set(!this.menuOpen());
  }

  isAllActive(): boolean {
    const url = this.currentUrl();
    const params = this.currentQueryParams();
    return url.startsWith('/products') && !params['category'] && !params['badge'];
  }

  isNavLinkActive(slug: string): boolean {
    const params = this.currentQueryParams();
    if (slug === 'deals') {
      return params['badge'] === 'SALE';
    }

    return params['category'] === slug;
  }

  logout() {this.authService.logout();}
}