// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment} from "../../../environments/environment";
import { ToastService} from "../../Notification/Toast.service";// Импортируем ToastService

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private http: HttpClient,
    private router: Router,
    private toastService: ToastService
  ) {}

  verifyEmail(data: { username: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${environment.apiUrl}/verify-email`, data);
  }

  registerUser(data: { code: string; UUID: string }): Observable<any> {
    return this.http.post(`${environment.apiUrl}/register`, data);
  }

  login(username: string, password: string) {
    const data = { username, password };

    this.http.post(`${environment.apiUrl}/login`, data).subscribe({
      next: (response: any) => {
        if (response.token) {
          // Сохранение authToken в localStorage
          localStorage.setItem('authToken', response.token);

          // Показ уведомления о успешном входе
          this.toastService.showToast('Вы успешно вошли!');

          // Перенаправление на страницу чатов
          this.router.navigate(['/chats']);
        } else {
          console.error('Не удалось получить UUID');
          this.toastService.showToast('Ошибка при входе!', 'danger');
        }
      },
      error: () => {
        this.toastService.showToast('Ошибка при входе!', 'danger');
      },
    });
  }
}
