import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute,Router } from '@angular/router';
import { ToastController} from "@ionic/angular";
import { environment } from '../../environments/environment';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { UserProfileService } from '../../services/user-profile.service';
import {connectWebSocket} from "../../services/websocket";


interface Message {
  isSender: boolean;
  avatar?: string;
  body: string;
  timestamp: string;
  files?: File[];
  type: 'text' | 'image' | 'file'
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
  maxImageFileSize = 5 * 1024 * 1024; // 5 MB
  token: any
  chatId: any
  private socket: WebSocket | null = null;

  constructor(private route: ActivatedRoute, private router: Router, private toastController: ToastController,     private http: HttpClient, private userProfileService: UserProfileService) {}

  addMessageToChat(message: Message) {
    console.log("fdf");
    message.isSender = message.isSender == this.userProfileService.getID();
    this.displayedMessages.push(message);
    setTimeout(() => this.scrollAllToBottom(), 100);
  }

  ngOnDestroy() {
    if (this.socket) {
      this.socket.close();
      console.log('WebSocket-соединение закрыто при уничтожении компонента.');
    }
  }

  ngOnInit() {
    // this.chatId = +this.route.snapshot.paramMap.get('idChat')!;
    // this.token = localStorage.getItem('authToken');
    //
    // console.log(this.chatId);
    // console.log(this.token);
    //
    // if(this.token){
    //   this.getChatData(this.chatId, this.token);
    // }
    // this.loadMoreMessages();
    //
    // // Плавная прокрутка до самого низа при инициализации
    // setTimeout(() => {
    //   this.scrollAllToBottom();
    // }, 500);

    this.chatId = +this.route.snapshot.paramMap.get('idChat')!;
    this.token = localStorage.getItem('authToken');

    if (this.token) {
      this.socket = connectWebSocket(
        this.token,
        this.router,
        this.showToast.bind(this),
        this.addMessageToChat.bind(this)
      );
    }

    this.getChatData(this.chatId, this.token);
    this.loadMoreMessages();
    setTimeout(() => {
      this.scrollAllToBottom();
    }, 500);
  }

  displayImageInChat(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const newMessage: Message = {
        isSender: true,
        type: 'image',
        body: reader.result as string, // Base64 URL изображения
        timestamp: new Date().toLocaleString()
      };
      this.displayedMessages.push(newMessage);
      setTimeout(() => this.scrollAllToBottom(), 100);
    };
    reader.readAsDataURL(file);
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

  sendMessage() {
    if (this.messageInput?.trim() !== '' || this.selectedFiles.length > 0) {
      const newMessage: Message = {
        isSender: true,
        type: this.selectedFiles.length > 0 ? 'file' : 'text',
        body: this.messageInput?.trim() || '',
        timestamp: new Date().toLocaleString(),
        files: this.selectedFiles.length > 0 ? [...this.selectedFiles] : undefined
      };

      //this.chat.messages.push(newMessage);
      //this.displayedMessages.push(newMessage);
      this.messageInput = '';
      this.selectedFiles = []; // Очищаем список файлов после отправки

      // Отправка POST-запроса на сервер
      const headers = new HttpHeaders({ 'Authorization': `Bearer ${this.token}` }); // Замените `this.token` на актуальный токен
      //const body = newMessage.body;
      const body = { content: newMessage.body };

      this.http.post(`${environment.apiUrl}/chats/${this.chatId}/messages`, body, { headers })
        .subscribe({
          next: () => {
            console.log('Сообщение успешно отправлено на сервер.');
          },
          error: (error) => {
            this.showToast('Ошибка при отправке сообщения на сервер.');
            console.error('Ошибка при отправке:', error);
          }
        });

      // Прокрутить чат вниз
      setTimeout(() => {
        this.scrollAllToBottom();
      }, 100);
    }
  }

  //РАБОТА С ФАЙЛАМИ
  openFilePicker() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  allowedFileTypes = ['image/*', 'video/*', 'text/*', 'application/zip', 'application/pdf'];
  maxFileSize = 1024 * 1024 * 1024; // 1 GB

  onFileSelected(event: any) {
    const files = event.target.files as FileList;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Проверяем, если файл уже добавлен
      if (this.selectedFiles.some(f => f.name === file.name && f.size === file.size)) {
        this.showToast('Этот файл уже добавлен.');
        continue;
      }

      // Проверяем размер файла
      if (file.size > this.maxFileSize) {
        this.showToast('Файл слишком большой. Максимальный размер — 1 ГБ.');
        continue;
      }

      // Проверяем тип файла
      const isAllowedType = this.allowedFileTypes.some(type => file.type.match(type));
      if (!isAllowedType) {
        this.showToast('Недопустимый тип файла. Загрузка этого файла запрещена.');
        continue;
      }

      // Фиктивная проверка на наличие вредоносного содержимого
      if (this.isFileDangerous(file)) {
        this.showToast('Файл может содержать вредоносный код. Загрузка запрещена.');
        continue;
      }

      // Фиктивная проверка на безопасность (реально нужно использовать библиотеку)
      this.uploadFile(file);

      setTimeout(() => {
        this.scrollAllToBottom();
      }, 100);
    }
  }

  readFileContent(file: File) {
    const reader = new FileReader();

    reader.onload = () => {
      const fileContent = reader.result as string;
      // Проверяем содержимое на SQL-инъекции или подозрительные паттерны
      if (this.containsSQLInjection(fileContent)) {
        this.showToast('Файл может содержать SQL-инъекции. Загрузка запрещена.');
        return;
      }

      // Здесь можно продолжить обработку файла, если он безопасен
      this.uploadFile(file);
    };

    reader.readAsText(file);
  }

  containsSQLInjection(content: string): boolean {
    const sqlPatterns = [
      /SELECT .* FROM/i,
      /INSERT INTO/i,
      /DROP TABLE/i,
      /UNION SELECT/i,
      /--/g, // SQL комментарии
    ];

    return sqlPatterns.some(pattern => pattern.test(content));
  }

  // Функция для фиктивной проверки файлов (реализовать реальную логику позже)
  isFileDangerous(file: File): boolean {
    // Здесь можно реализовать проверки на вирусы или инъекции SQL
    // Например, интеграция с антивирусным API
    return false; // Пока что всегда возвращаем false, так как проверка фиктивная
  }

  uploadFile(file: File) {
    console.log('Файл загружен: ', file);
    // Здесь будет загрузка файла в настоящую базу данных
    this.displaySelectedFile(file); // Отображаем информацию о файле
  }


  selectedFiles: File[] = [];

  displaySelectedFile(file: File) {
    this.selectedFiles.push(file);
  }

  removeFile(file: File) {
    this.selectedFiles = this.selectedFiles.filter(f => f !== file);
  }

  getFileIcon(file: File) {
    if (file.type.startsWith('image/')) {
      return 'image';
    } else if (file.type.startsWith('video/')) {
      return 'videocam';
    } else if (file.type.startsWith('text/')) {
      return 'document';
    } else {
      return 'document-attach';
    }
  }



  async showToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'top',
      color: "danger"
    });
    toast.present();
  }



  isDragging = false;

  // Обработчик события, когда файл перетаскивается в область
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
    this.toggleWrapperAnimation(true);
  }

  // Обработчик события, когда файл покидает область
  onDragLeave(event: DragEvent) {
    this.isDragging = false;
    this.toggleWrapperAnimation(false);
  }

  // Обработчик события, когда файл сбрасывается в область
  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    this.toggleWrapperAnimation(false);

    const files = event.dataTransfer?.files;
    if (files) {
      this.handleFileDrop(files);
    }
  }

  // Обработчик для файлов
  handleFileDrop(files: FileList) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Проверяем, если файл уже добавлен
      if (this.selectedFiles.some(f => f.name === file.name && f.size === file.size)) {
        this.showToast('Этот файл уже добавлен.');
        continue;
      }

      if (this.isFileAllowed(file)) {
        this.uploadFile(file);
      } else {
        this.showToast('Неподдерживаемый тип файла.');
      }
    }
  }

  // Проверка на допустимость типа файла
  isFileAllowed(file: File): boolean {
    const allowedTypes = ['image/*', 'video/*', 'application/pdf'];
    return allowedTypes.some(type => file.type.match(type));
  }

  toggleWrapperAnimation(isDragging: boolean) {
    const wrapper = document.querySelector('.chat_wrapper');
    if (isDragging) {
      wrapper?.classList.add('dragging');
    } else {
      wrapper?.classList.remove('dragging');
    }
  }


  getChatData(id: number, token: any) {
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get<{ messages: any[] | null }>(`${environment.apiUrl}/chats/${id}/messages`, { headers }).subscribe({
      next: (response) => {
        if (response.messages) {
          this.displayedMessages = response.messages.map(msg => ({
            isSender: msg.user_id == this.userProfileService.getID(),
            //avatar: 'assets/img/avatars/5.jpg',
            body: msg.content,
            timestamp: new Date(msg.created_at).toLocaleString(),
            type: 'text'
          }));
        } else {
          this.displayedMessages = [];
        }
        this.scrollAllToBottom();
      },
      error: (error) => {
        this.showToast('Ошибка при загрузке сообщений.');
        console.error(error);
      }
    });
  }

}
