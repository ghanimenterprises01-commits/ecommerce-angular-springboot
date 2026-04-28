import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { getItem } from '../utils/storage.utils';

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = getItem('token');
  const role = getItem('role');

  if (!token) {
    router.navigate(['/auth/login']);
    return false;
  }

  const requiredRole = route.data['role'];

  if (requiredRole && role !== requiredRole) {
    router.navigate(['/']);
    return false;
  }

  return true;
};
