import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// Интерфейс сообщения
interface Message {
  isSender: boolean;
  avatar?: string;
  type: 'text' | 'image';
  body: string;
  timestamp: string;
}

// Интерфейс чата
interface Chat {
  id: number;
  name: string;
  avatar: string;
  messages: Message[];
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
  chat: Chat | undefined;
  displayedMessages: Message[] = [];
  messagesPerPage = 10; // Количество сообщений, которые будем отображать за раз
  isLoadingMore = false; // Флаг, чтобы предотвратить многократную загрузку при прокрутке


  messageInput: string | undefined;
  isFocus: boolean | undefined;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    const chatId = +this.route.snapshot.paramMap.get('idchat')!;
    this.getChatData(chatId);
    this.loadMoreMessages();

    // Плавная прокрутка до самого низа при инициализации
    setTimeout(() => {
      const content = document.querySelector('ion-content');
      content?.scrollToBottom(300); // Плавная прокрутка до низа
    }, 100);
  }


  // Функция для получения данных чата (фиктивно)
  getChatData(id: number) {
    this.chat = {
      id: id,
      name: 'Имя друга',
      avatar: 'assets/img/avatars/5.jpg',
      messages: [
        { isSender: false, avatar: 'assets/img/avatars/5.jpg', type: 'text', body: 'Привет!', timestamp: '6 Октября, 2023 2:25' },
        { isSender: true, type: 'text', body: 'привет', timestamp: '6 Октября, 2023 2:27' },
        { isSender: true, type: 'text', body: 'Как дела?', timestamp: '6 Октября, 2023 2:30' },
        { isSender: true, type: 'text', body: 'привет', timestamp: '6 Октября, 2023 2:37' },
        { isSender: true, type: 'text', body: 'Как дела?', timestamp: '6 Октября, 2023 2:40' },
        { isSender: false, avatar: 'assets/img/avatars/5.jpg', type: 'text', body: 'Скоро буду', timestamp: '6 Октября, 2023 2:41' },
        // Добавьте больше фиктивных сообщений...
      ]
    };
  }

  // Функция для загрузки сообщений по частям
  loadMoreMessages(event?: any) {
    if (this.chat && this.displayedMessages.length < this.chat.messages.length) {
      const nextMessages = this.chat.messages.slice(
        this.displayedMessages.length, // Загружаем сообщения сверху (следующие по порядку)
        this.displayedMessages.length + this.messagesPerPage
      );

      // Мы добавляем сообщения в конец массива
      this.displayedMessages = [...this.displayedMessages, ...nextMessages];

      if (event) {
        event.target.complete();
      }
    }
  }


  // Функция для обработки прокрутки
  onScroll(event: any) {
    if (!this.isLoadingMore && this.displayedMessages.length < this.chat?.messages.length!) {
      this.isLoadingMore = true;
      this.loadMoreMessages(event);
      this.isLoadingMore = false;
    }
  }

  // Функция для замены новых строк на <br>
  nl2br(text: string): string {
    return text ? text.replace(/\n/g, '<br>') : '';
  }

  toggleFocus(isFocus: boolean) {
    this.isFocus = isFocus;
  }
}
