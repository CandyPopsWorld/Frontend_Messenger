import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardInverse implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const isAuthenticated = localStorage.getItem('authToken') === 'true';

    if (isAuthenticated) {
      // Если пользователь авторизован, перенаправляем его на страницу /chats
      this.router.navigate(['/chats']);
      return false;
    }
    return true;
  }
}
