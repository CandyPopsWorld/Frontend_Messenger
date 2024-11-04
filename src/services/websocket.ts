// // websocket.ts
//
// import { environment } from 'src/environments/environment';
//
// export function connectWebSocket(token: string) {
//   const socket = new WebSocket(`${environment.webSocketUrl}/ws?token=${token}`);
//
//   socket.onopen = () => {
//     console.log('WebSocket-соединение установлено.');
//   };
//
//   socket.onmessage = (event) => {
//     console.log('Получено сообщение от сервера:', event.data);
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
//   return socket; // Возвращаем WebSocket объект, чтобы им можно было управлять
// }

// websocket.ts

import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

export function connectWebSocket(token: string, router: Router, showToast: (message: string, chatId: string) => void) {
  const socket = new WebSocket(`${environment.webSocketUrl}/ws?token=${token}`);

  socket.onopen = () => {
    console.log('WebSocket-соединение установлено.');
  };

  socket.onmessage = (event) => {
    const messageData = JSON.parse(event.data);
    const { chat_id, content } = messageData;

    // Проверяем текущий маршрут
    const currentChatId = router.url.split('/').pop();
    if (`/chat/${chat_id}` !== router.url) {
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
