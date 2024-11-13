export interface Message {
  isSender: boolean;
  avatar?: string;
  body: string;
  timestamp: string;
  files?: File[];
  filesId?: string[];
  fileInfo?: {
    FileType: string;
    ID: string;
    Name: string;
    Size: number;
    //Uploaded: ;
  }
  type: 'text' | 'image' | 'file',
  id?: number
}

export interface Chat {
  id: number;
  name: string;
  avatar: string;
  messages: Message[];
}
