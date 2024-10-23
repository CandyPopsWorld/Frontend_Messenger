import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

interface Message {
  isSender: boolean;
  avatar?: string;
  type: 'text' | 'image';
  body: string;
  timestamp: string;
}

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
  @ViewChild('scrollContent', { static: false }) private scrollContent: ElementRef | undefined;
  @ViewChild('scrollWrapper', { static: false }) private scrollWrapper: ElementRef | undefined;


  chat: Chat | undefined;
  displayedMessages: Message[] = [];
  messagesPerPage = 10;
  isLoadingMore = false;
  canLoadMore = true; // <-- Add this property to track if more messages can be loaded
  messageInput: string | undefined;
  isFocus: boolean | undefined;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    const chatId = +this.route.snapshot.paramMap.get('idchat')!;
    this.getChatData(chatId);
    this.loadMoreMessages();

    // Плавная прокрутка до самого низа при инициализации
    setTimeout(() => {
      this.scrollAllToBottom();
    }, 500);
  }

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
        { isSender: false, avatar: 'assets/img/avatars/5.jpg', type: 'text', body: 'Как дела?', timestamp: '6 Октября, 2023 2:40' },
        { isSender: true, type: 'text', body: 'Как дела?', timestamp: '6 Октября, 2023 2:41' },
        { isSender: false, avatar: 'assets/img/avatars/5.jpg', type: 'text', body: 'Как дела?', timestamp: '6 Октября, 2023 2:42' },
        { isSender: true, type: 'text', body: 'Как дела?', timestamp: '6 Октября, 2023 2:43' },
        { isSender: false, avatar: 'assets/img/avatars/5.jpg', type: 'text', body: 'Как дела?', timestamp: '6 Октября, 2023 2:44' },
        { isSender: true, type: 'text', body: 'Как дела?', timestamp: '6 Октября, 2023 2:45' },

      ]
    };
    this.updateCanLoadMore(); // Update the `canLoadMore` when chat data is loaded
  }

  loadMoreMessages(event?: any) {
    if (this.chat && this.displayedMessages.length < this.chat.messages.length) {
      const nextMessages = this.chat.messages.slice(
        this.displayedMessages.length,
        this.displayedMessages.length + this.messagesPerPage
      );

      this.displayedMessages = [...this.displayedMessages, ...nextMessages];
      this.updateCanLoadMore(); // Update the `canLoadMore` flag

      if (event) {
        event.target.complete();
      }
    }
  }

  onScroll(event: any) {
    if (!this.isLoadingMore && this.canLoadMore) {
      this.isLoadingMore = true;
      this.loadMoreMessages(event);
      this.isLoadingMore = false;
    }
  }

  nl2br(text: string): string {
    return text ? text.replace(/\n/g, '<br>') : '';
  }

  toggleFocus(isFocus: boolean) {
    this.isFocus = isFocus;
  }

  private scrollAllToBottom() {
      const elements1 = document.querySelectorAll('*');

      elements1.forEach((element: any) => {
        const computedStyle = getComputedStyle(element);
        const overflowY = computedStyle.overflowY;

        // Проверяем, включена ли прокрутка (scroll или auto) и может ли элемент скроллиться
        if ((overflowY === 'scroll' || overflowY === 'auto') && element.scrollHeight > element.clientHeight) {
          element.scroll({
            top: element.scrollHeight, // Прокрутить до конца
            behavior: 'smooth' // Плавная анимация
          });
        }
      });

  }


  // Helper method to update the `canLoadMore` flag
  private updateCanLoadMore() {
    if (this.chat && this.displayedMessages.length >= this.chat.messages.length) {
      this.canLoadMore = false; // No more messages to load
    }
  }

  // Функция для отправки нового сообщения
  sendMessage() {
    if (this.messageInput && this.messageInput.trim() !== '') {
      const newMessage: Message = {
        isSender: true,
        type: 'text',
        body: this.messageInput.trim(),
        timestamp: new Date().toLocaleString()
      };

      if (this.chat) {
        this.chat.messages.push(newMessage);
        this.displayedMessages.push(newMessage);
        this.messageInput = '';

        this.saveMessageToDatabase(newMessage);

        // Прокручиваем до последнего сообщения
        setTimeout(() => {
          this.scrollAllToBottom();
        }, 100);
      }
    }
  }


  // Функция для сохранения сообщения в базу данных (фиктивная)
  saveMessageToDatabase(message: Message) {
    console.log('Сообщение сохранено в базу данных: ', message);
    // Здесь можно сделать настоящий запрос к вашему серверу или Firebase, например.
  }
}
