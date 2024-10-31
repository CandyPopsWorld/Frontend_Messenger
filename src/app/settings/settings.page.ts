import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { UserProfileService } from '../../services/user-profile.service'; // Импорт сервиса


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

  constructor(private modalCtrl: ModalController, private userProfileService: UserProfileService) {}

  ngOnInit() {
    this.loadChatSettings();
    this.loadUserProfile();  // Загрузка профиля пользователя
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
  }

}
