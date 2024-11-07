// src/app/services/validation.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ValidationService {
  validateEmail(email: string): boolean {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  }

  validateUsername(username: string): boolean {
    return !!(username && username.length >= 3);
  }

  validatePassword(password: string): boolean {
    return !!(password && password.length >= 6);
  }
}
