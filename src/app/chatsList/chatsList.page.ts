import { Component } from '@angular/core';
import { ModalController, IonRouterOutlet } from '@ionic/angular';
import { SettingsPage } from '../settings/settings.page';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { UserProfileService } from '../../services/user-profile.service';
import { SearchPage } from "../search/search.page";
import { connectWebSocket } from '../../services/websocket';



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
  private originalTitle = document.title;
  private newMessagesCount = 0;
  private titleBlinkInterval: any;

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

      console.log(token);

      const socket = connectWebSocket(token, this.router, (message, chatId) => {
        this.showToast(message, chatId, this.chatGroups);
      });

    }
  }

  /*showToast(message: string, chatId: string, chatGroups: ChatGroup[]) {
    // Находим чат с нужным chatId
    let chatName = "Chat";
    let chatAvatar = "";

    for (const group of chatGroups) {
      const chat = group.chats.find(c => c.id === +chatId); // Преобразуем chatId к числу
      if (chat) {
        chatName = chat.name;
        chatAvatar = chat.avatar;
        break;
      }
    }

    const shortenedMessage = message.length > 30 ? message.slice(0, 30) + '...' : message;

    // Создаем toast-элемент с аватаром и названием чата
    const toastElement = document.createElement('div');
    toastElement.classList.add('toast');
    toastElement.innerHTML = `
    <img src="${chatAvatar}" alt="${chatName}" class="toast-avatar" />
    <div class="toast-content">
      <div class="toast-title">${chatName}</div>
      <div class="toast-message">${shortenedMessage}</div>
    </div>
    <button class="toast-close" style="display: none;">&times;</button>
  `;

    // Общие стили для уведомления
    toastElement.style.position = 'fixed';
    toastElement.style.bottom = '20px';
    toastElement.style.right = '20px';
    toastElement.style.background = '#333';
    toastElement.style.color = '#fff';
    toastElement.style.padding = '15px';
    toastElement.style.borderRadius = '5px';
    toastElement.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
    toastElement.style.zIndex = '1000';
    toastElement.style.cursor = 'pointer';
    toastElement.style.maxWidth = '300px';
    toastElement.style.display = 'flex';
    toastElement.style.alignItems = 'center';

    // Стили для аватарки
    const avatarElement = toastElement.querySelector('.toast-avatar') as HTMLElement;
    avatarElement.style.width = '40px';
    avatarElement.style.height = '40px';
    avatarElement.style.borderRadius = '50%';
    avatarElement.style.marginRight = '10px';

    // Стили крестика
    const closeButton = toastElement.querySelector('.toast-close') as HTMLElement;
    closeButton.style.position = 'absolute';
    closeButton.style.top = '5px';
    closeButton.style.right = '8px';
    closeButton.style.color = '#fff';
    closeButton.style.background = 'transparent';
    closeButton.style.border = 'none';
    closeButton.style.fontSize = '16px';
    closeButton.style.cursor = 'pointer';

    // Обработчик наведения для отображения крестика
    toastElement.addEventListener('mouseenter', () => {
      closeButton.style.display = 'block';
    });
    toastElement.addEventListener('mouseleave', () => {
      closeButton.style.display = 'none';
    });

    // Обработчики событий для закрытия и перехода
    closeButton.addEventListener('click', (event) => {
      event.stopPropagation();
      toastElement.remove();
    });

    toastElement.addEventListener('click', () => {
      toastElement.remove();
      this.router.navigate([`/chat/${chatId}`]);
    });

    // Добавляем элемент toast в DOM
    document.body.appendChild(toastElement);

    // Удаляем уведомление через 10 секунд
    setTimeout(() => {
      toastElement.remove();
    }, 10000);
  }*/

  // Функция для обновления и мигания title
  updateTitleWithBlink() {
    if (this.titleBlinkInterval) clearInterval(this.titleBlinkInterval); // Сбрасываем предыдущее мигание

    const blinkTitle = () => {
      document.title = document.title === this.originalTitle
        ? `У вас ${this.newMessagesCount} ${this.newMessagesCount === 1 ? 'новое сообщение' : 'новых сообщения'}`
        : this.originalTitle;
    };

    this.titleBlinkInterval = setInterval(blinkTitle, 500);

    // Останавливаем мигание через 5 секунд и возвращаем исходный title
    setTimeout(() => {
      clearInterval(this.titleBlinkInterval);
      document.title = this.originalTitle;
      this.newMessagesCount = 0; // Сбрасываем счетчик новых сообщений после мигания
    }, 10000);
  }

  showToast(message: string, chatId: string, chatGroups: ChatGroup[]) {

    // Обновляем количество новых сообщений
    this.newMessagesCount++;

    // Вызываем обновление и мигание title
    this.updateTitleWithBlink();

    // Находим чат с нужным chatId
    let chatName = "Chat";
    let chatAvatar = "";

    for (const group of chatGroups) {
      const chat = group.chats.find(c => c.id === +chatId); // Преобразуем chatId к числу
      if (chat) {
        chatName = chat.name;
        chatAvatar = chat.avatar;
        break;
      }
    }

    const shortenedMessage = message.length > 30 ? message.slice(0, 30) + '...' : message;

    // Создаем и настраиваем аудиофайл для звукового уведомления
    const audio = new Audio('../../assets/sound/notification/hond_goose.mp3');
    audio.play().catch(error => console.warn("Ошибка воспроизведения звука:", error));

    // Создаем toast-элемент с аватаром и названием чата
    const toastElement = document.createElement('div');
    toastElement.classList.add('toast');
    toastElement.innerHTML = `
    <img src="${chatAvatar}" alt="${chatName}" class="toast-avatar" />
    <div class="toast-content">
      <div class="toast-title">${chatName}</div>
      <div class="toast-message">${shortenedMessage}</div>
    </div>
    <button class="toast-close" style="display: none;">&times;</button>
  `;

// Поиск существующих уведомлений от этого чата
    const existingToasts = Array.from(document.querySelectorAll('.toast'))
      .filter((toast) => {
        // Приведение типа и проверка, является ли toast элементом HTMLElement
        if (toast instanceof HTMLElement) {
          return toast.querySelector('.toast-title')?.textContent === chatName;
        }
        return false;
      }) as HTMLElement[];


    // Устанавливаем стили для нового уведомления
    toastElement.style.position = 'fixed';
    toastElement.style.right = '20px';
    toastElement.style.background = '#333';
    toastElement.style.color = '#fff';
    toastElement.style.padding = '15px';
    toastElement.style.borderRadius = '5px';
    toastElement.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
    toastElement.style.zIndex = '1000';
    toastElement.style.cursor = 'pointer';
    toastElement.style.maxWidth = '300px';
    toastElement.style.display = 'flex';
    toastElement.style.alignItems = 'center';

    // Стили для аватарки
    const avatarElement = toastElement.querySelector('.toast-avatar') as HTMLElement;
    avatarElement.style.width = '40px';
    avatarElement.style.height = '40px';
    avatarElement.style.borderRadius = '50%';
    avatarElement.style.marginRight = '10px';

    // Стили крестика
    const closeButton = toastElement.querySelector('.toast-close') as HTMLElement;
    closeButton.style.position = 'absolute';
    closeButton.style.top = '5px';
    closeButton.style.right = '8px';
    closeButton.style.color = '#fff';
    closeButton.style.background = 'transparent';
    closeButton.style.border = 'none';
    closeButton.style.fontSize = '16px';
    closeButton.style.cursor = 'pointer';

    // Определяем позицию toast'а
    const baseBottomPosition = 20;
    if (existingToasts.length > 0) {
      // Если уведомления от этого чата уже есть, располагаем его на том же уровне
      toastElement.style.bottom = existingToasts[0].style.bottom;
    } else {
      // Если уведомление от другого чата, добавляем выше
      toastElement.style.bottom = `${baseBottomPosition + document.querySelectorAll('.toast').length * 80}px`;
    }

    // Обработчик наведения для отображения крестика
    toastElement.addEventListener('mouseenter', () => {
      closeButton.style.display = 'block';
    });
    toastElement.addEventListener('mouseleave', () => {
      closeButton.style.display = 'none';
    });

    // Обработчики событий для закрытия и перехода
    closeButton.addEventListener('click', (event) => {
      event.stopPropagation();
      toastElement.remove();
    });

    toastElement.addEventListener('click', () => {
      toastElement.remove();
      this.router.navigate([`/chat/${chatId}`]);
    });

    // Добавляем элемент toast в DOM
    document.body.appendChild(toastElement);

    // Удаляем уведомление через 10 секунд
    setTimeout(() => {
      toastElement.remove();
    }, 10000);
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
