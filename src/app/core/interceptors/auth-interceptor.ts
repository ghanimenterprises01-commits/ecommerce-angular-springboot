import { HttpInterceptorFn } from '@angular/common/http';
import { getItem } from '../utils/storage.utils';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = getItem('token');

  if (token) {
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(cloned);
  }
  return next(req);
};
