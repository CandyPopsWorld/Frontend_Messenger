// src/app/services/profile.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserProfileService } from '../../user-profile.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  constructor(
    private http: HttpClient,
    private userProfileService: UserProfileService
  ) {}

  fetchUserProfile(token: string): Observable<any> {
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.get<any>(`${environment.apiUrl}/profile`, { headers }).pipe(
      catchError((error) => {
        console.error('Ошибка при получении профиля:', error);
        throw error;  // Пробрасываем ошибку дальше
      })
    );
  }

  setUserProfile(profileData: any) {
    this.userProfileService.setProfileData(profileData);
    console.log(this.userProfileService.getProfileData());
  }
}
