// Интерфейс для чатов
export interface Chat {
  id: number;
  name: string;
  lastMessage: string;
  time: string;
  avatar: string;
}

// Интерфейс для группировки чатов
export interface ChatGroup {
  name: string;
  chats: Chat[];
  isOpen: boolean; // Для отслеживания состояния раскрытия группы
}
