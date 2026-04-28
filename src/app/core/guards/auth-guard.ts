import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { getItem } from '../utils/storage.utils';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = getItem('token')

  if (token) {
    return true
  }
  
  router.navigate(['/auth/login'], {
    queryParams: {returnUrl: state.url}
  });
  return false;
};
