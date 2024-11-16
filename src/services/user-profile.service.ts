// src/app/services/user-profile.service.ts
import { Injectable } from '@angular/core';
import {transformBase64Photo} from "../utils/user/user";

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private profileData: any = null;

  constructor() {
    // Инициализация из localStorage, если данные уже сохранены
    const storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
      this.profileData = JSON.parse(storedProfile);
    }
  }

  // Метод для обновления данных профиля
  setProfileData(profileData: any) {
    this.profileData = profileData;
    localStorage.setItem('userProfile', JSON.stringify(profileData)); // Сохранение в localStorage
  }

  // Метод для получения данных профиля
  getProfileData() {
    return this.profileData;
  }

  // Separate methods to get individual fields
  getAbout() {
    return this.profileData ? this.profileData.about : null;
  }

  getEmail() {
    return this.profileData ? this.profileData.email : null;
  }

  /* getPhoto() {
    return this.profileData ? this.profileData.photo : null;
  } */

  getPhoto() {
    if (!this.profileData || !this.profileData.photo) {
      return null;
    }

    let photo = transformBase64Photo(this.profileData.photo);
    return photo;
  }


  getUsername() {
    return this.profileData ? this.profileData.username : null;
  }

  getUUID() {
    return this.profileData ? this.profileData.uuid : null;
  }

  getID() {
    return this.profileData ? this.profileData.id : null;
  }

  setAbout(about: string) {
    if (this.profileData) {
      this.profileData.about = about;
      localStorage.setItem('userProfile', JSON.stringify(this.profileData));
    }
  }

  setEmail(email: string) {
    if (this.profileData) {
      this.profileData.email = email;
      localStorage.setItem('userProfile', JSON.stringify(this.profileData));
    }
  }

  setPhoto(photo: string) {
    if (this.profileData) {
      this.profileData.photo = photo;
      localStorage.setItem('userProfile', JSON.stringify(this.profileData));
    }
  }

  setUsername(username: string) {
    if (this.profileData) {
      this.profileData.username = username;
      localStorage.setItem('userProfile', JSON.stringify(this.profileData));
    }
  }
}
