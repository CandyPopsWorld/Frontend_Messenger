import { Component } from '@angular/core';
import { ModalController, IonRouterOutlet } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserProfileService } from '../../services/user-profile.service';
import { connectWebSocket } from '../../services/websocket';
import {MessageToastService} from "../../services/Notification/MessageToast.service";
import {Chat, ChatGroup} from "../../interfaces/chat.interfaces";
import {AuthTokenUtils} from "../../utils/authToken.utils";
import {ModalService} from "../../services/Modal/modal.service";
import {ProfileService} from "../../services/Routes/profile/profile.service";
import { ChatsService } from '../../services/Routes/chats/chats.service';
import { filterChatGroups } from '../../utils/chats/chats.utils';
import {SettingsService} from "../../services/Routes/settings/settings.service";
import {loadChatSettingsToLocalStorage} from "../../utils/settings";

@Component({
  selector: 'app-chatsList',
  templateUrl: 'chatsList.page.html',
  styleUrls: ['chatsList.page.scss']
})
export class ChatsListPage {
  searchTerm: string = ''; // Для хранения значения поиска
  chatGroups: ChatGroup[] = []; // Список групп чатов
  filteredChatGroups: ChatGroup[] = []; // Отфильтрованный список групп чатов
  private socket: WebSocket | null = null;
  userSettings: any;


  constructor(
    public modalCtrl: ModalController,
    private routerOutlet: IonRouterOutlet,
    private http: HttpClient,
    private router: Router,
    private userProfileService: UserProfileService,
    private messageToastService: MessageToastService,
    private modalService: ModalService,
    private profileService: ProfileService,
    private chatsService: ChatsService,
    private settingsService: SettingsService
) {}

  ngOnDestroy() {
    if (this.socket) {
      this.socket.close();
    }
  }

  ngOnInit() {
    this.chatGroups = [];
    this.filteredChatGroups = [...this.chatGroups]; // Изначально показываем все группы чатов

    // Проверяем наличие токена и вызываем fetchUserProfile
    const token = AuthTokenUtils.getToken();
    console.log(token);
    if (token) {
      this.fetchUserProfile(token);
      this.fetchChats(token);

      this.socket = connectWebSocket(this.userProfileService,token, this.router, (message, chatId) => {
        this.messageToastService.showToast(message, chatId, this.chatGroups);
      });

      this.getSettings(token);

    }
  }


  loadAvatar(){
    return this.userProfileService.getPhoto() || 'assets/img/avatars/7.jpg';
  }

  updateSettings(theme: string, messageColor: string, token: any): void {
      this.settingsService.updateUserSettings(token, theme, messageColor).subscribe({
        next: (response) => {
          console.log('Настройки успешно обновлены:', response);
        },
        error: (error) => {
          console.error('Ошибка при обновлении настроек:', error);
        }
      });
  }

  getSettings(token:string){
    this.settingsService.fetchUserSettings(token).subscribe({next: (settings) => {
      loadChatSettingsToLocalStorage(settings.theme, settings.message_color);
    }});
  }

  // Метод для получения данных профиля
  fetchUserProfile(token: string) {
    this.profileService.fetchUserProfile(token).subscribe({
      next: (profileData) => {
        this.profileService.setUserProfile(profileData);
        this.fetchChats(token); // Теперь получаем чаты после успешного получения профиля
      },
      error: (error) => {
        console.error('Ошибка при получении профиля:', error);
      }
    });
  }

  fetchChats(token: string) {
    this.chatsService.fetchChats(token).subscribe({
      next: (chatGroups) => {
        console.log(chatGroups);
        this.chatGroups = chatGroups;
        this.filteredChatGroups = [...this.chatGroups];
      },
      error: (error) => {
        console.error('Ошибка при получении чатов:', error);
      }
    });
  }

  // Фильтрация списка групп чатов по имени
  filterChats(event: any) {
    const searchTerm = event.target.value.toLowerCase(); // Получаем введенное значение
    this.filteredChatGroups = filterChatGroups(searchTerm, this.chatGroups); // Используем утилиту
  }

  // Метод для переключения состояния группы
  toggleGroup(group: ChatGroup) {
    group.isOpen = !group.isOpen; // Переключаем состояние группы
  }

  // Открытие страницы настроек
  async openSettings() {
    await this.modalService.openSettings(this.routerOutlet);
  }

  // Открытие страницы поиска
  async openUserSearch() {
    await this.modalService.openUserSearch(this.routerOutlet);
  }
}
