// src/app/services/settings.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  constructor(private http: HttpClient) {}

  fetchUserSettings(token: string): Observable<any> {
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    const url = `${environment.apiUrl}/settings`;

    return this.http.get<any>(url, { headers });
  }

  // Функция для обновления настроек пользователя
  updateUserSettings(token: string, theme: string, messageColor: string): Observable<any> {
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    const url = `${environment.apiUrl}/settings`;

    const body = {
      theme: theme,
      message_color: messageColor
    };

    return this.http.put<any>(url, body, { headers });
  }
}
