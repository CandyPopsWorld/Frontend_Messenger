// // websocket.ts
//
// import { environment } from 'src/environments/environment';
// import { Router } from '@angular/router';
//
// export function connectWebSocket(token: string, router: Router, showToast: (message: string, chatId: string) => void) {
//   const socket = new WebSocket(`${environment.webSocketUrl}/ws?token=${token}`);
//
//   socket.onopen = () => {
//     console.log('WebSocket-соединение установлено.');
//   };
//
//   socket.onmessage = (event) => {
//     const messageData = JSON.parse(event.data);
//     console.log(messageData);
//     const { chat_id, content, created_at } = messageData;
//
//     // Проверяем текущий маршрут
//     const currentChatId = router.url.split('/').pop();
//     if (`/chat/${chat_id}` !== router.url) {
//       // Если пользователь не на странице чата, показываем уведомление
//       showToast(content, chat_id);
//     }
//   };
//
//   socket.onerror = (error) => {
//     console.error('Ошибка WebSocket-соединения:', error);
//   };
//
//   socket.onclose = (event) => {
//     console.log('WebSocket-соединение закрыто:', event);
//   };
//
//   return socket;
// }

// websocket.ts

import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

export function connectWebSocket(
  token: string,
  router: Router,
  showToast: (message: string, chatId: string) => void,
  addMessageToChat: (message: any) => void = () => {}
) {
  const socket = new WebSocket(`${environment.webSocketUrl}/ws?token=${token}`);

  socket.onopen = () => {
    console.log('WebSocket-соединение установлено.');
  };

  socket.onmessage = (event) => {
    const messageData = JSON.parse(event.data);
    console.log(messageData);
    const { chat_id, content, created_at, user_id } = messageData;

    // Проверяем текущий маршрут
    const currentChatId = router.url.split('/').pop();

    if (`/chat/${chat_id}` === router.url) {
      // Если это сообщение для текущего чата, добавляем его в displayedMessages
      addMessageToChat({
        isSender: user_id,
        body: content,
        timestamp: new Date(created_at).toLocaleString(),
        type: 'text'
      });
    } else {
      // Если пользователь не на странице чата, показываем уведомление
      showToast(content, chat_id);
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
