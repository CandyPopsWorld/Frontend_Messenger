// src/app/services/user-profile.service.ts
import { Injectable } from '@angular/core';

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

    // Преобразуем base64 строку в байтовый массив
    const binaryString = atob(this.profileData.photo);
    const byteNumbers = new Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      byteNumbers[i] = binaryString.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    // Создаем Blob и URL объекта для фото
    const blob = new Blob([byteArray], { type: 'image/jpeg' });  // Используем тип изображения
    return URL.createObjectURL(blob);
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
