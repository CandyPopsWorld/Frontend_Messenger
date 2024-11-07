export interface Message {
  isSender: boolean;
  avatar?: string;
  body: string;
  timestamp: string;
  files?: File[];
  type: 'text' | 'image' | 'file'
}

export interface Chat {
  id: number;
  name: string;
  avatar: string;
  messages: Message[];
}
