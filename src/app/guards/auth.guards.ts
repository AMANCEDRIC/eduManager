import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAdmin()) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};

export const teacherGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isTeacher() || auth.isAdmin()) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};

export const parentGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isParent() || auth.isAdmin()) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};
