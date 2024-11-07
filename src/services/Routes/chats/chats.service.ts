// src/app/services/chats.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { UserProfileService } from '../../user-profile.service';
import { Chat, ChatGroup } from '../../../interfaces/chat.interfaces';

@Injectable({
  providedIn: 'root'
})
export class ChatsService {
  constructor(
    private http: HttpClient,
    private userProfileService: UserProfileService
  ) {}

  fetchChats(token: string): Observable<ChatGroup[]> {
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return new Observable<ChatGroup[]>((observer) => {
      this.http.get<any[]>(`${environment.apiUrl}/chats`, { headers }).subscribe({
        next: (chats) => {
          const currentUsername = this.userProfileService.getProfileData()?.username;
          const groupsMap: { [key: string]: Chat[] } = {};

          chats.forEach(chat => {
            const chatName = chat.name;
            const [username1, username2] = chatName.split('_');
            let displayName;

            if (username1 === currentUsername) {
              displayName = username2;
            } else if (username2 === currentUsername) {
              displayName = username1;
            } else {
              displayName = chatName;
            }

            if (!groupsMap[displayName]) {
              groupsMap[displayName] = [];
            }
            groupsMap[displayName].push({
              id: chat.id,
              name: displayName,
              lastMessage: 'Сообщение не загружено',
              time: new Date(chat.created_at).toLocaleTimeString(),
              avatar: '../assets/img/avatars/1.jpg'
            });
          });

          const chatGroups = Object.keys(groupsMap).map(name => ({
            name: name,
            chats: groupsMap[name],
            isOpen: false
          }));

          observer.next(chatGroups);
          observer.complete();
        },
        error: (error) => {
          console.error('Ошибка при получении списка чатов:', error);
          observer.error(error);
        }
      });
    });
  }
}
