// websocket.ts

import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import {UserProfileService} from "./user-profile.service";
import {FilesService} from "./Routes/files/files.service";

export function connectWebSocket(
  filesService: FilesService,
  userProfileService: UserProfileService,
  token: string,
  router: Router,
  showToast: (message: string, chatId: string) => void,
  addMessageToChat: (message: any) => void = () => {},
  deleteWebsMessageFromChat: (messageId: number) => void = () => {},
  updateMessageWebs: (content: string, messageId: number) => void = () => {},
) {


  const socket = new WebSocket(`${environment.webSocketUrl}/ws?token=${token}`);

  socket.onopen = () => {
    console.log('WebSocket-соединение установлено.');
  };

  socket.onmessage = async (event) => {
    const messageData = JSON.parse(event.data);

    // Проверяем текущий маршрут
    const currentChatId = router.url.split('/').pop();
    const currentUserId = userProfileService.getID();


    /*if(messageData.message.userId === currentUserId) {
      return;
    }*/
    if(messageData.status == "send"){
      if (`/chat/${messageData.message.chat_id}` === router.url /*&& messageData.message.user_id !== currentUserId*/) {
        let fileInfo = null;
        let fileName = messageData.message.content;
        if(messageData.message.type === "file"){
            try {
              const fileResponse =  await filesService.getFileInfo(messageData.message.content, token);
              if(fileResponse){
                fileInfo = fileResponse.file_info;
              }
            } catch (error) {
              console.error('Ошибка при получении информации о файле:', error);
            }
        }
        // Если это сообщение для текущего чата, добавляем его в displayedMessages
        addMessageToChat({
          isSender: messageData.message.user_id,
          body: messageData.message.content,
          timestamp: new Date(messageData.message.created_at).toLocaleString(),
          type: messageData.message.type,
          id: messageData.message.id,
          fileInfo: fileInfo,
        });
      } else {
        // Если пользователь не на странице чата, показываем уведомление
        showToast(messageData.message.content, messageData.message.chat_id);
      }
    }

    if (messageData.status == "delete") {
      if (`/chat/${messageData.chat_id}` === router.url) {
        // Если это сообщение для текущего чата, удаляем его из displayedMessages
        deleteWebsMessageFromChat(messageData.message_id);
      }
    }

    if(messageData.status == "update"){
      if (`/chat/${messageData.chat_id}` === router.url) {
        updateMessageWebs(messageData.content, messageData.message_id);
      }
    }
  };

  socket.onerror = (error) => {
    console.error('Ошибка WebSocket-соединения:', error);
  };

  socket.onclose = (event) => {
    console.log('WebSocket-соединение закрыто:', event);
  };

  return socket;
}
