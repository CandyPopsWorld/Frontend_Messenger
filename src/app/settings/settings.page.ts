import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { UserProfileService } from '../../services/user-profile.service'; // Импорт сервиса
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {environment} from '../../environments/environment';



@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  showChatSettings = false;  // Переключатель между табами
  chatBackground = 'light';
  messageBackground = 'white';
  username: string = '';
  photoUrl: string = 'assets/img/avatars/7.jpg';
  initialAbout: string = ''; // Сохранение начального значения about
  about: string = '';
  email: string = '';
  showSaveButton = false; // Отображение кнопки сохранения изменений
  selectedPhoto: File | null = null;


  token: string | null = null;
  userId: any;

  constructor(private modalCtrl: ModalController, private userProfileService: UserProfileService, private router: Router, private http: HttpClient) {}

  ngOnInit() {
    this.loadChatSettings();
    this.loadUserProfile();  // Загрузка профиля пользователя
    this.initialAbout = this.userProfileService.getAbout();

    this.token = localStorage.getItem('authToken');
    this.userId = this.userProfileService.getID();
    //console.log("photo:",this.userProfileService.getPhoto());
  }

  onPhotoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedPhoto = file;
      this.photoUrl = URL.createObjectURL(file); // Для предварительного просмотра
    }
  }

  /*savePhoto() {
    if (!this.selectedPhoto) return;

    const url = `${environment.apiUrl}/${this.userId}`;
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${this.token}` });
    const formData = new FormData();
    formData.append('photo', this.selectedPhoto);
    formData.append('about', this.initialAbout);

    this.http.put<any>(url, formData, { headers }).subscribe({
      next: (response) => {
        console.log(response.message);
      },
      error: (error) => {
        console.error('Ошибка при загрузке фото:', error);
      },
    });
  } */

  savePhoto() {
    if (!this.selectedPhoto) return;

    const reader = new FileReader();
    reader.onload = () => {
      const byteArray = new Uint8Array(reader.result as ArrayBuffer);
      const byteArrayBase64 = Array.from(byteArray).map(b => String.fromCharCode(b)).join('');
      const encodedPhoto = btoa(byteArrayBase64);

      const url = `${environment.apiUrl}/${this.userId}`;
      const headers = new HttpHeaders({ 'Authorization': `Bearer ${this.token}` });

      const payload = {
        photo: encodedPhoto,  // Массив байтов в формате base64
        about: this.initialAbout
      };

      this.http.put<any>(url, payload, { headers }).subscribe({
        next: (response) => {
          console.log(response.message);
          this.userProfileService.setPhoto(encodedPhoto);
        },
        error: (error) => {
          console.error('Ошибка при загрузке фото:', error);
        },
      });
    };
    reader.readAsArrayBuffer(this.selectedPhoto);
    this.selectedPhoto = null;
  }


  closeModal() {
    this.modalCtrl.dismiss();
  }

  openChatSettings() {
    this.showChatSettings = true;
  }

  goToMainSettings() {
    this.showChatSettings = false;
  }

  saveChatSettings() {
    const settings = {
      chatBackground: this.chatBackground,
      messageBackground: this.messageBackground
    };
    localStorage.setItem('chatSettings', JSON.stringify(settings));
  }

  loadChatSettings() {
    const savedSettings = localStorage.getItem('chatSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      this.chatBackground = settings.chatBackground || 'light';
      this.messageBackground = settings.messageBackground || 'white';
    }
  }

  // Метод для загрузки данных профиля пользователя
  loadUserProfile() {
    this.username = this.userProfileService.getUsername() || 'Моё имя';
    const photo = this.userProfileService.getPhoto();
    this.photoUrl = photo && photo.trim() !== '' ? photo : 'assets/img/avatars/7.jpg';
    this.email = this.userProfileService.getEmail() || '';
    this.about = this.userProfileService.getAbout() || '';
  }

  logout() {
    localStorage.clear();  // Очищаем локальное хранилище
    this.closeModal();
    this.router.navigate(['/login']);  // Перенаправляем на страницу логина
  }

  // Метод для отслеживания изменения about
  onAboutChange() {
    this.showSaveButton = this.about !== this.initialAbout; // Показать кнопку, если изменено
  }

  // Метод для сохранения изменений
  saveAboutChanges(token: any, userId:any) {
    const url = `${environment.apiUrl}/${userId}`;
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    const payload = {
      about: this.about,
      photo: null,
    };

    this.http.put<any>(url, payload, { headers }).subscribe({
      next: (response) => {
        console.log(response.message); // Вывод успешного сообщения
        this.initialAbout = this.about; // Обновление начального значения
        this.showSaveButton = false; // Скрытие кнопки
        this.userProfileService.setAbout(this.initialAbout);
      },
      error: (error) => {
        console.error('Ошибка при обновлении пользователя:', error);
      },
    });
  }

}
