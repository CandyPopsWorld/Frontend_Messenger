import { Component } from '@angular/core';
import { ModalController, IonRouterOutlet } from '@ionic/angular';
import { SettingsPage } from '../settings/settings.page';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { UserProfileService } from '../../services/user-profile.service';
import {SearchPage} from "../search/search.page"; // Импорт сервиса

// Интерфейс для чатов
interface Chat {
  id: number;
  name: string;
  lastMessage: string;
  time: string;
  avatar: string;
}

@Component({
  selector: 'app-chatsList',
  templateUrl: 'chatsList.page.html',
  styleUrls: ['chatsList.page.scss']
})
export class ChatsListPage {
  searchTerm: string = '';  // Для хранения значения поиска
  chats: Chat[] = [];  // Полный список чатов с типом Chat
  filteredChats: Chat[] = [];  // Отфильтрованный список чатов

  constructor(public modalCtrl: ModalController, private routerOutlet: IonRouterOutlet, private http: HttpClient, private router: Router,     private userProfileService: UserProfileService // Инжектируем сервис
  ) { }

  ngOnInit() {
    // Создаем фиктивные данные чатов
    this.chats = [
      { id: 1, name: 'Андрей', lastMessage: 'Привет!', time: '13:00', avatar: 'assets/img/avatars/1.jpg' },
      { id: 2, name: 'Сергей', lastMessage: 'Как дела?', time: '12:45', avatar: 'assets/img/avatars/2.jpg' },
      { id: 3, name: 'Ольга', lastMessage: 'Увидимся позже', time: '11:30', avatar: 'assets/img/avatars/3.jpg' },
      { id: 4, name: 'Мария', lastMessage: 'Отлично!', time: '10:15', avatar: 'assets/img/avatars/4.jpg' },
      { id: 5, name: 'Дмитрий', lastMessage: 'Как успехи?', time: '09:50', avatar: 'assets/img/avatars/5.jpg' }
    ];

    this.filteredChats = [...this.chats];  // Изначально показываем все чаты

    // Проверяем наличие токена и вызываем fetchUserProfile
    const token = localStorage.getItem('authToken');
    if (token) {
      this.fetchUserProfile(token);
    }
  }

  // Фильтрация списка чатов по имени пользователя
  filterChats(event: any) {
    const searchTerm = event.target.value.toLowerCase();  // Получаем введенное значение

    // Фильтруем чаты по имени пользователя
    if (searchTerm && searchTerm.trim() !== '') {
      this.filteredChats = this.chats.filter(chat => chat.name.toLowerCase().includes(searchTerm));
    } else {
      this.filteredChats = [...this.chats];  // Если поле пустое, показываем все чаты
    }
  }

  // Открытие страницы настроек
  async openSettings() {
    const modal = await this.modalCtrl.create({
      component: SettingsPage,
      presentingElement: this.routerOutlet.nativeEl,
    });
    return await modal.present();
  }

  // Метод для получения данных профиля
  fetchUserProfile(token: string) {
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    this.http.get(`${environment.apiUrl}/profile`, { headers }).subscribe({
      next: (profileData: any) => {
        this.userProfileService.setProfileData(profileData); // Сохраняем данные профиля в сервис
        console.log(this.userProfileService.getProfileData());
      },
      error: (error) => {
        console.error('Ошибка при получении профиля:', error);
      },
    });
  }


  async openUserSearch() {
    const modal = await this.modalCtrl.create({
      component: SearchPage,
      presentingElement: this.routerOutlet.nativeEl,
    });
    return await modal.present();
  }

}
