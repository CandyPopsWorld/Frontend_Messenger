// src/app/services/toast.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TitleBlinker} from "./title";
import {shreadNameFile} from "../../utils/chats/chats.utils";

@Injectable({
  providedIn: 'root'
})
export class MessageToastService {
  private newMessagesCount = 0;
  private originalTitle = document.title;
  private titleBlinker = new TitleBlinker();


  constructor(private router: Router) {}

  showToast(message: string, chatId: string, chatGroups: any[]) {
    if(message === '' || message === undefined || message === null) {return;}
    this.newMessagesCount++;

    // Логика мигания заголовка
    this.titleBlinker.startBlink(this.newMessagesCount);


    let chatName = 'Chat';
    let chatAvatar = '';
    let typeMsg = "text";

    for (const group of chatGroups) {
      const chat = group.chats.find((c:any) => c.id === +chatId);
      if (chat) {
        chatName = chat.name;
        chatAvatar = chat.avatar;
        typeMsg = chat.type;
        break;
      }
    }

    if(typeMsg === "file"){
      message = shreadNameFile(message);
    }

    const shortenedMessage = message.length > 30 ? message.slice(0, 30) + '...' : message;

    const audio = new Audio('../../assets/sound/notification/hond_goose.mp3');
    audio.play().catch(error => console.warn('Ошибка воспроизведения звука:', error));

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

    const existingToasts = Array.from(document.querySelectorAll('.toast'))
      .filter((toast) => toast instanceof HTMLElement && toast.querySelector('.toast-title')?.textContent === chatName) as HTMLElement[];

    this.setStyle(toastElement, existingToasts.length);

    const avatarElement = toastElement.querySelector('.toast-avatar') as HTMLElement;
    avatarElement.style.width = '40px';
    avatarElement.style.height = '40px';
    avatarElement.style.borderRadius = '50%';
    avatarElement.style.marginRight = '10px';

    const closeButton = toastElement.querySelector('.toast-close') as HTMLElement;
    closeButton.style.position = 'absolute';
    closeButton.style.top = '5px';
    closeButton.style.right = '8px';
    closeButton.style.color = '#fff';
    closeButton.style.background = 'transparent';
    closeButton.style.border = 'none';
    closeButton.style.fontSize = '16px';
    closeButton.style.cursor = 'pointer';

    toastElement.addEventListener('mouseenter', () => {
      closeButton.style.display = 'block';
    });
    toastElement.addEventListener('mouseleave', () => {
      closeButton.style.display = 'none';
    });

    closeButton.addEventListener('click', (event) => {
      event.stopPropagation();
      toastElement.remove();
    });

    toastElement.addEventListener('click', () => {
      toastElement.remove();
      this.router.navigate([`/chat/${chatId}`]);
    });

    document.body.appendChild(toastElement);

    setTimeout(() => {
      toastElement.remove();
      this.newMessagesCount-=1;
    }, 10000);
  }

  private setStyle(toastElement: HTMLElement, existingToastsCount: number) {
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

    const baseBottomPosition = 20;
    toastElement.style.bottom = `${baseBottomPosition + existingToastsCount * 80}px`;
  }
}
