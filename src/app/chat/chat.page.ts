import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { ActivatedRoute,Router } from '@angular/router';
import { ToastController} from "@ionic/angular";
import { environment } from '../../environments/environment';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { UserProfileService } from '../../services/user-profile.service';
import {connectWebSocket} from "../../services/websocket";
import {Message, Chat} from "../../interfaces/message.interface";
import {AlertController} from "@ionic/angular";

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
  selectedMessageIdForEdit: number | null = null; // ID редактируемого сообщения
  isEditingMessage: boolean = false; // Добавлен флаг для отслеживания состояния редактирования

  isFocus: boolean | undefined;
  maxImageFileSize = 5 * 1024 * 1024; // 5 MB
  token: any
  chatId: any
  private socket: WebSocket | null = null;
  selectedMessageIds: number[] = []; // Новый массив для хранения ID выбранных сообщений
  lastMessageId: number | undefined;
  isSettingsMenuOpen: boolean = false;


  constructor(private route: ActivatedRoute, private router: Router, private toastController: ToastController,     private http: HttpClient, private userProfileService: UserProfileService, private alertController: AlertController, private elementRef: ElementRef) {}


  async downloadFile(fileId: any) {
    const filename = fileId;
    try {
      // URL и начальные заголовки
      const url = `${environment.apiUrl}/files/download/${fileId}`;
      const headers = new Headers();
      headers.append("Authorization", `Bearer ${this.token}`);
      headers.append("Accept", "application/octet-stream");

      // Запрос на сервер для начала загрузки
      const response = await fetch(url, { method: "GET", headers });

      // Проверяем код состояния ответа
      if (!response.ok) {
        throw new Error(`Ошибка при загрузке файла: ${response.statusText}`);
      }

      // Определяем, нужно ли читать файл как целый или частями
      const contentLength = response.headers.get("Content-Length");
      const contentRange = response.headers.get("Content-Range");

      // Если есть частичный ответ, то обрабатываем его в режиме чанков
      if (contentRange && response.status === 206) {
        const contentDisposition = response.headers.get('Content-Disposition');
        const suggestedFilename = filename || (contentDisposition?.split('filename=')[1]?.replace(/['"]/g, '') || "downloaded-file");

        // Создаем поток для записи
        const writableStream = await this.createWritableFileStream(suggestedFilename);
        if (!response.body) throw new Error("Нет данных для загрузки");

        // Читаем поток с сервера и записываем на диск по частям
        const reader = response.body.getReader();
        let receivedLength = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          receivedLength += value.length;
          await writableStream.write(value);
        }
        await writableStream.close();
      } else {
        // Загрузка файла целиком
        const blob = await response.blob();
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(link.href);
      }
    } catch (error) {
      console.error("Ошибка при загрузке файла:", error);
    }
  }


// Вспомогательная функция для создания потока записи в файл
  async createWritableFileStream(filename: string) {
    // В браузере используем File System Access API, если доступно
    if ((window as any).showSaveFilePicker) {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: filename,
        types: [
          {
            description: "Файлы",
            accept: { "application/octet-stream": [".bin", ".dat", ".txt", ".file"] }
          }
        ]
      });
      return await handle.createWritable();
    } else {
      throw new Error("API доступа к файловой системе не поддерживается в этом браузере.");
    }
  }

  // downloadFile(file: any){
  //
  // }


  /*async displayImage(fileId: any, id: any) {
    const url = `${environment.apiUrl}/files/download/${fileId}`;
    const headers = new Headers();
    headers.append("Authorization", `Bearer ${this.token}`);
    //headers.append("Accept", "image/*");

    try {
      // Запрашиваем файл с сервера
      const response = await fetch(url, { method: "GET", headers });

      if (!response.ok) {
        throw new Error(`Ошибка при загрузке файла: ${response.statusText}`);
      }

      // Проверка размера файла и типа
      const contentType = response.headers.get("Content-Type") || "";
      const contentLength = parseInt(response.headers.get("Content-Length") || "0", 10);

      // Убедитесь, что файл изображение и не превышает 10 МБ
      if (contentLength <= 10 * 1024 * 1024) {
        // Чтение данных как Blob
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);

        // Создание и вставка элемента изображения
        const imgElement = document.createElement("img");
        console.log("blor");
        imgElement.src = imageUrl;
        imgElement.alt = "Загруженное изображение";
        imgElement.style.maxWidth = "80%";  // для адаптации к размеру чата

        // Добавление изображения на страницу
        const chatContainer = document.querySelector("#a" + `${id}`);
        console.log("chatContainer", chatContainer);
        chatContainer?.appendChild(imgElement);

        //console.log(chatContainer);

        // Очистка URL для освобождения памяти после отображения
        imgElement.onload = () => {
          URL.revokeObjectURL(imageUrl);
        };
      } else {
        throw new Error("Файл не является изображением или превышает 10 МБ.");
      }
    } catch (error) {
      console.error("Ошибка при отображении изображения:", error);
    }
  }*/

  /* async displayImage(fileId: any, id: any) {
    const url = `${environment.apiUrl}/files/download/${fileId}`;
    const headers = new Headers();
    headers.append("Authorization", `Bearer ${this.token}`);

    try {
      const response = await fetch(url, { method: "GET", headers });

      if (!response.ok) {
        throw new Error(`Ошибка при загрузке файла: ${response.statusText}`);
      }

      const contentType = response.headers.get("Content-Type") || "";
      const contentLength = parseInt(response.headers.get("Content-Length") || "0", 10);

      if (contentLength <= 10 * 1024 * 1024) {
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);

        // Настройка изображения
        const imgElement = document.createElement("img");
        imgElement.src = imageUrl;
        imgElement.alt = "Загруженное изображение";

        // Устанавливаем максимальные размеры
        imgElement.style.maxWidth = "300px";  // максимальная ширина
        imgElement.style.maxHeight = "300px"; // максимальная высота
        imgElement.style.width = "auto";      // автоматическая ширина для сохранения пропорций
        imgElement.style.height = "auto";     // автоматическая высота для сохранения пропорций

        const chatContainer = document.querySelector("#a" + `${id}`);
        chatContainer?.appendChild(imgElement);

        imgElement.onload = () => {
          URL.revokeObjectURL(imageUrl);
        };
      } else {
        throw new Error("Файл не является изображением или превышает 10 МБ.");
      }
    } catch (error) {
      console.error("Ошибка при отображении изображения:", error);
    }
  } */

  async displayImage(fileId: any, id: any) {
    const url = `${environment.apiUrl}/files/download/${fileId}`;
    const headers = new Headers();
    headers.append("Authorization", `Bearer ${this.token}`);

    try {
      const response = await fetch(url, { method: "GET", headers });
      if (!response.ok) throw new Error(`Ошибка при загрузке файла: ${response.statusText}`);

      const contentLength = parseInt(response.headers.get("Content-Length") || "0", 10);
      if (contentLength <= 10 * 1024 * 1024) {
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);

        const imgElement = document.createElement("img");
        imgElement.src = imageUrl;
        imgElement.alt = "Загруженное изображение";
        imgElement.style.maxWidth = "300px";
        imgElement.style.maxHeight = "300px";
        imgElement.style.cursor = "pointer";
        imgElement.onclick = () => this.openModal(imageUrl);

        const chatContainer = document.querySelector("#a" + `${id}`);
        chatContainer?.appendChild(imgElement);
      } else {
        throw new Error("Файл не является изображением или превышает 10 МБ.");
      }
    } catch (error) {
      console.error("Ошибка при отображении изображения:", error);
    }
  }

  // Функция для открытия модального окна
  openModal(imageUrl: string) {
    const modal = document.getElementById("imageModal")!;
    const modalImage = document.getElementById("modalImage") as HTMLImageElement;
    modalImage.src = imageUrl;
    modal.classList.add("show");
  }

// Функция для закрытия модального окна
  closeModal() {
    const modal = document.getElementById("imageModal")!;
    modal.classList.remove("show");
  }





  // Отображение кнопки "Изменить", если выбрано одно сообщение
  get showEditButton(): boolean {
    return this.selectedMessageIds.length === 1;
  }

  // Обработка нажатия на кнопку "Изменить"
  onEditMessage() {
    if (this.selectedMessageIds.length === 1) {
      this.isEditingMessage = true;
      this.selectedMessageIdForEdit = this.selectedMessageIds[0];
      const messageToEdit = this.displayedMessages.find(
        (message) => message.id === this.selectedMessageIdForEdit
      );
      if (messageToEdit) {
        this.messageInput = messageToEdit.body;
      }
      // Заменяем кнопку "Отправить" на галочку
      this.clearSelection();
    }
  }

  // Отправка отредактированного сообщения или отмена редактирования
  onConfirmEdit() {
    this.isEditingMessage = false;
    if (this.selectedMessageIdForEdit !== null) {
      const messageToEdit = this.displayedMessages.find(
        (message) => message.id === this.selectedMessageIdForEdit
      );
      if (messageToEdit && messageToEdit.body !== this.messageInput) {
        // Вызов фиктивной функции для отправки обновленного текста
        this.updateMessage(this.messageInput!, this.selectedMessageIdForEdit);
      }
      // Очистка поля ввода и сброс флага редактирования
      this.messageInput = '';
      this.selectedMessageIdForEdit = null;
    }
  }

  // Фиктивная функция для обработки обновленного сообщения
  private updateMessage(newText: string, id: number) {
    console.log(`Новое содержимое сообщения: ${newText}`);

    const url = `${environment.apiUrl}/chats/${this.chatId}/messages/${id}`;
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${this.token}` });
    const body = { content: newText };

    // Отправляем PUT запрос
    this.http.put(url, body, { headers })
      .subscribe({
        next: () => {
          // Находим сообщение по ID и обновляем его текст
          const message = this.displayedMessages.find(msg => msg.id === id);
          if (message) {
            message.body = newText;
          }
          console.log(`Сообщение с ID ${id} обновлено успешно.`);
        },
        error: (err) => {
          console.error(`Ошибка при обновлении сообщения: ${err}`);
        }
      });
  }

  // Снятие выделения сообщений
  clearSelection() {
    this.selectedMessageIds = [];
  }

  openSettingsMenu(): void {
    this.isSettingsMenuOpen = !this.isSettingsMenuOpen;
  }

  async confirmDeleteChat() {
    const alert = await this.alertController.create({
      header: 'Удалить чат',
      message: 'Вы действительно уверены, что хотите удалить чат? Это действие нельзя будет отменить.',
      buttons: [
        {
          text: 'Нет',
          role: 'cancel'
        },
        {
          text: 'Да',
          handler: () => this.deleteChat()
        }
      ]
    });
    await alert.present();
  }

  deleteChat() {
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${this.token}` });
    const url = `${environment.apiUrl}/chats/${this.chatId}`;

    this.http.delete(url, { headers }).subscribe({
      next: async () => {
        const toast = await this.toastController.create({
          message: 'Чат успешно удален',
          duration: 2000,
          color: 'success'
        });
        await toast.present();
        this.router.navigate(['/chats']);
      },
      error: async (error) => {
        const toast = await this.toastController.create({
          message: 'Ошибка при удалении чата',
          duration: 2000,
          color: 'danger'
        });
        await toast.present();
        console.error('Ошибка при удалении:', error);
      }
    });
  }


  deleteWebsMessageFromChat(messageId: number) {
    console.log("fdfs");
    this.displayedMessages = this.displayedMessages.filter(
      (message: any) => message.id !== messageId
    );
    this.loadMoreMessages();
  }

  updateMessageWebs(newContent: string, messageId: number){
    const message = this.displayedMessages.find(msg => msg.id === messageId);
    if (message) {
      message.body = newContent;
    }
  }

  deleteSelectedMessages() {
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${this.token}` });

    const deleteRequests = this.selectedMessageIds.map((messageId) => {
      const url = `${environment.apiUrl}/chats/${this.chatId}/messages/${messageId}`;
      return this.http.delete(url, { headers }).toPromise(); // Добавляем headers в запрос
    });

    // Выполняем все запросы и обрабатываем результат после завершения всех запросов
    Promise.all(deleteRequests)
      .then(() => {
        // Успешно удалены все сообщения на сервере, обновляем отображение
        this.displayedMessages = this.displayedMessages.filter(
          (message: any) => !this.selectedMessageIds.includes(message.id)
        );
        this.selectedMessageIds = []; // Очищаем список выбранных сообщений после удаления
        console.log("Сообщения удалены");
      })
      .catch((error) => {
        console.error('Ошибка при удалении сообщений:', error);
        // Обработайте ошибку, например, покажите уведомление пользователю
      });
  }

  // Метод для выбора сообщения
  toggleMessageSelection(messageId: number, sender: boolean) {
    if(!sender){return}
    const index = this.selectedMessageIds.indexOf(messageId);
    if (index > -1) {
      this.selectedMessageIds.splice(index, 1);
    } else {
      this.selectedMessageIds.push(messageId);
    }
  }

  // Метод для проверки, выбрано ли сообщение
  isMessageSelected(messageId: number): boolean {
    return this.selectedMessageIds.includes(messageId);
  }

  addMessageToChat(message: any) {
    message.isSender = message.isSender == this.userProfileService.getID();
    message.id = this.lastMessageId;
    if(message.type == "file"){
      message.content = this.shreadNameFile(message.body);
    } else {
      message.content = message.body;
    }
    this.displayedMessages.push(message);
    setTimeout(() => this.scrollAllToBottom(), 100);
  }

  shreadNameFile(filename: string){
    return filename.length > 37 ? filename.slice(37) : '';
  }

  ngOnDestroy() {
    if (this.socket) {
      this.socket.close();
    }
  }

  ngOnInit() {
    this.chatId = +this.route.snapshot.paramMap.get('idChat')!;
    this.token = localStorage.getItem('authToken');

    if (this.token) {
      this.socket = connectWebSocket(
        this.userProfileService,
        this.token,
        this.router,
        this.showToast.bind(this),
        this.addMessageToChat.bind(this),
        this.deleteWebsMessageFromChat.bind(this),
        this.updateMessageWebs.bind(this),
      );
    }

    this.getChatData(this.chatId, this.token);
    this.loadMoreMessages();
    setTimeout(() => {
      this.scrollAllToBottom();

      this.displayedMessages.map(async msg => {
        if (msg.type == "file") {
          await this.displayImage(msg.fileInfo?.ID, msg.id);
        }
      })

    }, 500);

  }

  displayImageInChat(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const newMessage: Message = {
        isSender: true,
        type: 'image',
        body: reader.result as string, // Base64 URL изображения
        timestamp: new Date().toLocaleString(),
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

  async sendMessage() {
    const fileIds: string[] = []; // Массив для хранения file_id
    console.log(fileIds);

    // // Загружаем каждый файл и сохраняем file_id
    for (let file of this.selectedFiles) {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const headers = new HttpHeaders({ 'Authorization': `Bearer ${this.token}` });
        const uploadResponse: any = await this.http
          .post(`${environment.apiUrl}/files/upload/${this.chatId}`, formData, { headers })
          .toPromise();

        console.log("Файл успешно загружен!");
        // Добавляем полученный file_id в массив
        fileIds.push(uploadResponse.file_id);
      } catch (error) {
        console.error('Ошибка при загрузке файла:', error);
        this.showToast('Ошибка при загрузке файла.');
        return; // Прерываем отправку, если произошла ошибка при загрузке файла
      }
    }



    if (this.messageInput?.trim() !== '' || this.selectedFiles.length > 0) {
      const newMessage: Message = {
        isSender: true,
        type: this.selectedFiles.length > 0 ? 'file' : 'text',
        body: this.messageInput?.trim() || '',
        timestamp: new Date().toLocaleString(),
        files: this.selectedFiles.length > 0 ? [...this.selectedFiles] : undefined,
        filesId: fileIds
      };



      if(this.messageInput !== undefined){
        // Отправка POST-запроса на сервер
        const headers = new HttpHeaders({ 'Authorization': `Bearer ${this.token}` }); // Замените `this.token` на актуальный токен
        //const body = newMessage.body;
        const body = { content: newMessage.body };

        this.http.post(`${environment.apiUrl}/chats/${this.chatId}/messages`, body, { headers })
          .subscribe({
            next: (mes: any) => {
              console.log('Сообщение успешно отправлено на сервер.');
              console.log(mes);
              this.lastMessageId = mes.message.id;
            },
            error: (error) => {
              this.showToast('Ошибка при отправке сообщения на сервер.');
              console.error('Ошибка при отправке:', error);
            }
          });
      }

      this.messageInput = '';
      this.selectedFiles = []; // Очищаем список файлов после отправки

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

  getTextAfterLastDot(input: string): string {
    const lastDotIndex = input.lastIndexOf('.');
    return lastDotIndex !== -1 ? input.slice(lastDotIndex + 1) : '';
  }

  getFileIconContentMsg(message: string): string {
    const extension = this.getTextAfterLastDot(message).toLowerCase();

    switch (extension) {
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'bmp':
        return 'image'; // Иконка для изображений

      case 'mp4':
      case 'mov':
      case 'avi':
      case 'mkv':
        return 'videocam'; // Иконка для видеофайлов

      case 'txt':
      case 'doc':
      case 'docx':
      case 'pdf':
      case 'rtf':
        return 'document'; // Иконка для текстовых файлов

      default:
        return 'document-attach'; // Иконка для других файлов
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


  // getChatData(id: number, token: any) {
  //   const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  //
  //   this.http.get<{ messages: any[] | null }>(`${environment.apiUrl}/chats/${id}/messages`, { headers }).subscribe({
  //     next: (response) => {
  //       if (response.messages) {
  //         //console.log(response.messages[0]);
  //         this.displayedMessages = response.messages.map(msg => ({
  //           isSender: msg.user_id == this.userProfileService.getID(),
  //           //avatar: 'assets/img/avatars/5.jpg',
  //           body: msg.content,
  //           timestamp: new Date(msg.created_at).toLocaleString(),
  //           type: msg.type,
  //           id: msg.id,
  //           filesId: msg.filesId
  //         }));
  //         console.log(this.displayedMessages);
  //       } else {
  //         this.displayedMessages = [];
  //       }
  //       this.scrollAllToBottom();
  //     },
  //     error: (error) => {
  //       this.showToast('Ошибка при загрузке сообщений.');
  //       console.error(error);
  //     }
  //   });
  // }

  getFileInfo(content: string, token: any) {
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.get<{ file_info: any }>(`${environment.apiUrl}/files/${content}/info`, { headers }).toPromise();
  }


  getChatData(id: number, token: any) {
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    let msgContent = "";

    this.http.get<{ messages: any[] | null }>(`${environment.apiUrl}/chats/${id}/messages`, { headers }).subscribe({
      next: async (response) => {
        console.log("resp:",response);
        if (response.messages) {
          this.displayedMessages = await Promise.all(response.messages.map(async (msg) => {
            let fileInfo = null;
            let fileName = msg.content;
            if (msg.type === 'file') {
              try {
                const fileResponse = await this.getFileInfo(msg.content, token);
                if(fileResponse){
                  fileInfo = fileResponse.file_info;
                }
              } catch (error) {
                console.error('Ошибка при получении информации о файле:', error);
              }
            }

            if(msg.type == "file"){
              fileName = this.shreadNameFile(fileName);
            }


            return {
              isSender: msg.user_id === this.userProfileService.getID(),
              body: fileName,
              timestamp: new Date(msg.created_at).toLocaleString(),
              type: msg.type,
              id: msg.id,
              filesId: msg.filesId,
              fileInfo: fileInfo, // добавляем информацию о файле, если она есть
            };
          }));


          console.log(this.displayedMessages);
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
