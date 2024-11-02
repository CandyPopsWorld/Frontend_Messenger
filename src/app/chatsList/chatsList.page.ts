// import { Component } from '@angular/core';
// import { ModalController, IonRouterOutlet } from '@ionic/angular';
// import { SettingsPage } from '../settings/settings.page';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { Router } from '@angular/router';
// import { environment } from '../../environments/environment';
// import { UserProfileService } from '../../services/user-profile.service';
// import {SearchPage} from "../search/search.page"; // Импорт сервиса
//
// // Интерфейс для чатов
// interface Chat {
//   id: number;
//   name: string;
//   lastMessage: string;
//   time: string;
//   avatar: string;
// }
//
// @Component({
//   selector: 'app-chatsList',
//   templateUrl: 'chatsList.page.html',
//   styleUrls: ['chatsList.page.scss']
// })
// export class ChatsListPage {
//   searchTerm: string = '';  // Для хранения значения поиска
//   chats: Chat[] = [];  // Полный список чатов с типом Chat
//   filteredChats: Chat[] = [];  // Отфильтрованный список чатов
//
//   constructor(public modalCtrl: ModalController, private routerOutlet: IonRouterOutlet, private http: HttpClient, private router: Router,     private userProfileService: UserProfileService // Инжектируем сервис
//   ) { }
//
//   ngOnInit() {
//     this.chats = [];
//
//     this.filteredChats = [...this.chats];  // Изначально показываем все чаты
//
//     // Проверяем наличие токена и вызываем fetchUserProfile
//     const token = localStorage.getItem('authToken');
//     if (token) {
//       this.fetchUserProfile(token);
//       this.fetchChats(token);
//     }
//   }
//
//   // Фильтрация списка чатов по имени пользователя
//   filterChats(event: any) {
//     const searchTerm = event.target.value.toLowerCase();  // Получаем введенное значение
//
//     // Фильтруем чаты по имени пользователя
//     if (searchTerm && searchTerm.trim() !== '') {
//       this.filteredChats = this.chats.filter(chat => chat.name.toLowerCase().includes(searchTerm));
//     } else {
//       this.filteredChats = [...this.chats];  // Если поле пустое, показываем все чаты
//     }
//   }
//
//   // Открытие страницы настроек
//   async openSettings() {
//     const modal = await this.modalCtrl.create({
//       component: SettingsPage,
//       presentingElement: this.routerOutlet.nativeEl,
//     });
//     return await modal.present();
//   }
//
//   // Метод для получения данных профиля
//   fetchUserProfile(token: string) {
//     const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
//     this.http.get(`${environment.apiUrl}/profile`, { headers }).subscribe({
//       next: (profileData: any) => {
//         this.userProfileService.setProfileData(profileData); // Сохраняем данные профиля в сервис
//         console.log(this.userProfileService.getProfileData());
//       },
//       error: (error) => {
//         console.error('Ошибка при получении профиля:', error);
//       },
//     });
//   }
//
//
//   async openUserSearch() {
//     const modal = await this.modalCtrl.create({
//       component: SearchPage,
//       presentingElement: this.routerOutlet.nativeEl,
//     });
//     return await modal.present();
//   }
//
//   // Метод для получения списка чатов
//   fetchChats(token: string) {
//     const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
//     this.http.get<any[]>(`${environment.apiUrl}/chats`, { headers }).subscribe({
//       next: (chats) => {
//         // Преобразуем данные, чтобы соответствовать интерфейсу Chat
//         this.chats = chats.map(chat => ({
//           id: chat.id,
//           name: chat.name,
//           lastMessage: 'Сообщение не загружено', // Временное значение для lastMessage
//           time: new Date(chat.created_at).toLocaleTimeString(), // Форматируем время
//           avatar: '../assets/img/avatars/1.jpg' // Временное значение для avatar
//         }));
//         this.filteredChats = [...this.chats];
//       },
//       error: (error) => {
//         console.error('Ошибка при получении списка чатов:', error);
//       },
//     });
//
//   }
//
// }

import { Component } from '@angular/core';
import { ModalController, IonRouterOutlet } from '@ionic/angular';
import { SettingsPage } from '../settings/settings.page';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { UserProfileService } from '../../services/user-profile.service';
import { SearchPage } from "../search/search.page";

// Интерфейс для чатов
interface Chat {
  id: number;
  name: string;
  lastMessage: string;
  time: string;
  avatar: string;
}

// Интерфейс для группировки чатов
interface ChatGroup {
  name: string;
  chats: Chat[];
  isOpen: boolean; // Для отслеживания состояния раскрытия группы
}

@Component({
  selector: 'app-chatsList',
  templateUrl: 'chatsList.page.html',
  styleUrls: ['chatsList.page.scss']
})
export class ChatsListPage {
  searchTerm: string = ''; // Для хранения значения поиска
  chatGroups: ChatGroup[] = []; // Список групп чатов
  filteredChatGroups: ChatGroup[] = []; // Отфильтрованный список групп чатов

  constructor(
    public modalCtrl: ModalController,
    private routerOutlet: IonRouterOutlet,
    private http: HttpClient,
    private router: Router,
    private userProfileService: UserProfileService
  ) {}

  ngOnInit() {
    this.chatGroups = [];
    this.filteredChatGroups = [...this.chatGroups]; // Изначально показываем все группы чатов

    // Проверяем наличие токена и вызываем fetchUserProfile
    const token = localStorage.getItem('authToken');
    if (token) {
      this.fetchUserProfile(token);
      this.fetchChats(token);
    }
  }

  // Фильтрация списка групп чатов по имени
  filterChats(event: any) {
    const searchTerm = event.target.value.toLowerCase(); // Получаем введенное значение

    // Фильтруем группы чатов по имени
    if (searchTerm && searchTerm.trim() !== '') {
      this.filteredChatGroups = this.chatGroups
        .map(group => ({
          ...group,
          chats: group.chats.filter(chat => chat.name.toLowerCase().includes(searchTerm))
        }))
        .filter(group => group.chats.length > 0);
    } else {
      this.filteredChatGroups = [...this.chatGroups]; // Если поле пустое, показываем все группы
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

  // Метод для получения списка чатов
  // fetchChats(token: string) {
  //   const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  //   this.http.get<any[]>(`${environment.apiUrl}/chats`, { headers }).subscribe({
  //     next: (chats) => {
  //       // Группируем чаты по имени
  //       const groupsMap: { [key: string]: Chat[] } = {};
  //       chats.forEach(chat => {
  //         const chatName = chat.name;
  //         if (!groupsMap[chatName]) {
  //           groupsMap[chatName] = [];
  //         }
  //         groupsMap[chatName].push({
  //           id: chat.id,
  //           name: chat.name,
  //           lastMessage: 'Сообщение не загружено', // Временное значение для lastMessage
  //           time: new Date(chat.created_at).toLocaleTimeString(), // Форматируем время
  //           avatar: '../assets/img/avatars/1.jpg' // Временное значение для avatar
  //         });
  //       });
  //
  //       // Преобразуем объект в массив групп
  //       this.chatGroups = Object.keys(groupsMap).map(name => ({
  //         name: name,
  //         chats: groupsMap[name],
  //         isOpen: false // Изначально группы закрыты
  //       }));
  //
  //       this.filteredChatGroups = [...this.chatGroups]; // Обновляем отфильтрованные группы
  //     },
  //     error: (error) => {
  //       console.error('Ошибка при получении списка чатов:', error);
  //     },
  //   });
  // }

  fetchChats(token: string) {
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    this.http.get<any[]>(`${environment.apiUrl}/chats`, { headers }).subscribe({
      next: (chats) => {
        // Получаем имя текущего пользователя из профиля
        const currentUsername = this.userProfileService.getProfileData()?.username;

        // Группируем чаты по имени
        const groupsMap: { [key: string]: Chat[] } = {};
        chats.forEach(chat => {
          const chatName = chat.name;

          // Парсим имя чата по нижнему подчеркиванию
          const [username1, username2] = chatName.split('_');

          // Определяем, какое из имен является текущим пользователем
          let displayName;
          if (username1 === currentUsername) {
            displayName = username2; // Оставляем имя другого пользователя
          } else if (username2 === currentUsername) {
            displayName = username1; // Оставляем имя другого пользователя
          } else {
            displayName = chatName; // Если имени текущего пользователя нет, оставляем оригинальное имя
          }

          if (!groupsMap[displayName]) {
            groupsMap[displayName] = [];
          }
          groupsMap[displayName].push({
            id: chat.id,
            name: displayName, // Используем имя другого пользователя
            lastMessage: 'Сообщение не загружено', // Временное значение для lastMessage
            time: new Date(chat.created_at).toLocaleTimeString(), // Форматируем время
            avatar: '../assets/img/avatars/1.jpg' // Временное значение для avatar
          });
        });

        // Преобразуем объект в массив групп
        this.chatGroups = Object.keys(groupsMap).map(name => ({
          name: name,
          chats: groupsMap[name],
          isOpen: false // Изначально группы закрыты
        }));

        this.filteredChatGroups = [...this.chatGroups]; // Обновляем отфильтрованные группы
      },
      error: (error) => {
        console.error('Ошибка при получении списка чатов:', error);
      },
    });
  }


  // Метод для переключения состояния группы
  toggleGroup(group: ChatGroup) {
    group.isOpen = !group.isOpen; // Переключаем состояние группы
  }
}
