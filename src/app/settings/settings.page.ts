import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { UserProfileService } from '../../services/user-profile.service'; // Импорт сервиса
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {environment} from '../../environments/environment';
import {SettingsService} from "../../services/Routes/settings/settings.service";
import {getChatSettings} from "../../utils/settings";


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

  constructor(private modalCtrl: ModalController, private userProfileService: UserProfileService, private router: Router, private http: HttpClient, private  settingsService: SettingsService) {}

  chatPresets = [
    // Светлые пресеты
    { chatBackground: '#ffffff', messageBackground: '#d3d3d3' },
    { chatBackground: '#ffefd5', messageBackground: '#ffe4b5' },
    { chatBackground: '#ffebcd', messageBackground: '#4682b4' },
    { chatBackground: '#f0f8ff', messageBackground: '#b0e0e6' },
    { chatBackground: '#f5f5f5', messageBackground: '#ffa07a' },
    { chatBackground: '#e0ffff', messageBackground: '#00ced1' },
    { chatBackground: '#faf0e6', messageBackground: '#ff6347' },
    { chatBackground: '#ffe4c4', messageBackground: '#ff69b4' },
    { chatBackground: '#faebd7', messageBackground: '#b22222' },
    { chatBackground: '#fffaf0', messageBackground: '#8a2be2' },
    { chatBackground: '#f5deb3', messageBackground: '#ff4500' },
    { chatBackground: '#fffacd', messageBackground: '#20b2aa' },
    { chatBackground: '#fafad2', messageBackground: '#ffd700' },
    { chatBackground: '#fff0f5', messageBackground: '#db7093' },
    { chatBackground: '#f0fff0', messageBackground: '#32cd32' },
    { chatBackground: '#e6e6fa', messageBackground: '#dda0dd' },
    { chatBackground: '#dcdcdc', messageBackground: '#4682b4' },
    { chatBackground: '#fff5ee', messageBackground: '#cd5c5c' },
    { chatBackground: '#ffdab9', messageBackground: '#d2691e' },
    { chatBackground: '#add8e6', messageBackground: '#000080' },
    { chatBackground: '#fdf5e6', messageBackground: '#ff7f50' },

    // Темные пресеты
    { chatBackground: '#121212', messageBackground: '#32cd32' },
    { chatBackground: '#2f4f4f', messageBackground: '#87ceeb' },
    { chatBackground: '#1c1c1c', messageBackground: '#ff6347' },
    { chatBackground: '#2b2b2b', messageBackground: '#ff1493' },
    { chatBackground: '#363636', messageBackground: '#adff2f' },
    { chatBackground: '#4b0082', messageBackground: '#7fff00' },
    { chatBackground: '#2e2e2e', messageBackground: '#ffa500' },
    { chatBackground: '#3c3c3c', messageBackground: '#00ff7f' },
    { chatBackground: '#333333', messageBackground: '#ffd700' },
    { chatBackground: '#1a1a1a', messageBackground: '#ff69b4' },
    { chatBackground: '#000000', messageBackground: '#ff4500' },
    { chatBackground: '#191970', messageBackground: '#87cefa' },
    { chatBackground: '#2c2c2c', messageBackground: '#b22222' },
    { chatBackground: '#2b2d42', messageBackground: '#8b0000' },
    { chatBackground: '#202020', messageBackground: '#20b2aa' },
    { chatBackground: '#1f1f1f', messageBackground: '#f08080' },
    { chatBackground: '#2f2f2f', messageBackground: '#d8bfd8' },
    { chatBackground: '#222222', messageBackground: '#ff6347' },
    { chatBackground: '#2d2d2d', messageBackground: '#87ceeb' },
    { chatBackground: '#3b3b3b', messageBackground: '#daa520' },
    { chatBackground: '#1a1a1a', messageBackground: '#ff8c00' },
  ];
  selectedPresetIndex = 0;  // Индекс активного пресета

  selectPreset(index: number) {
     this.selectedPresetIndex = index;
     const selectedPreset = this.chatPresets[index];
     this.chatBackground = selectedPreset.chatBackground;
     this.messageBackground = selectedPreset.messageBackground;
     this.saveChatSettings();
     this.settingsService.updateUserSettings(this.token ? this.token : "",this.chatBackground, this.messageBackground).subscribe({next:(resp)=>{}})
  }

  getActivePresetIndex(): number {
    const settings = getChatSettings(); // Получаем текущие настройки чата

    // Проходим по массиву пресетов и находим индекс, который соответствует текущим настройкам
    return this.chatPresets.findIndex(preset =>
      preset.chatBackground === settings.chatBackground &&
      preset.messageBackground === settings.messageBackground
    );
  }


  ngOnInit() {
    this.loadChatSettings();
    this.loadUserProfile();  // Загрузка профиля пользователя
    this.initialAbout = this.userProfileService.getAbout();

    this.token = localStorage.getItem('authToken');
    this.userId = this.userProfileService.getID();
    //console.log("photo:",this.userProfileService.getPhoto());
    this.selectedPresetIndex = this.getActivePresetIndex();
  }

  onPhotoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedPhoto = file;
      this.photoUrl = URL.createObjectURL(file); // Для предварительного просмотра
    }
  }

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
