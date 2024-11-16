// src/app/services/chats.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { UserProfileService } from '../../user-profile.service';
import { Chat, ChatGroup } from '../../../interfaces/chat.interfaces';
import {shreadNameFile} from "../../../utils/chats/chats.utils";
import {ProfileService} from "../profile/profile.service";
import {transformBase64Photo} from "../../../utils/user/user";

@Injectable({
  providedIn: 'root'
})
export class ChatsService {
  constructor(
    private http: HttpClient,
    private userProfileService: UserProfileService,
    private profileService: ProfileService
  ) {}

   fetchChats(token: string): Observable<ChatGroup[]> {
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    console.log(token);
    return new Observable<ChatGroup[]>((observer) => {
      this.http.get<any[]>(`${environment.apiUrl}/chats`, { headers }).subscribe({
        next: (chats) => {
          const currentUsername = this.userProfileService.getProfileData()?.username;
          const groupsMap: { [key: string]: Chat[] } = {};

          chats.forEach(chat => {
            console.log("lik",chat);
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

            let lastMessageText = "Сообщение не загружено";
            let lastMessageDate = new Date(chat.created_at).toLocaleTimeString();

            let otherUserId:any;
            let otherUserPhoto: any = null;
            this.fetchUsersInChat(chat.id, token).subscribe({next: users => {
              if(users[0] === this.userProfileService.getID()) {
                otherUserId = users[1];
              } else {
                otherUserId = users[0];
              }

                this.profileService.fetchUserById(token, otherUserId).subscribe({next: otherUserData => {
                    console.log(otherUserData);
                    otherUserPhoto = transformBase64Photo(otherUserData.photo);
                  }})
            }})


            setTimeout(() => {
              this.fetchLastMessage(chat.id, token).subscribe({
                next: (message) => {
                  console.log('Последнее сообщение:', message);
                  //Здесь можно обработать полученное сообщение
                  lastMessageText = message.content;
                  lastMessageDate = new Date(message.created_at).toLocaleTimeString();
                  groupsMap[displayName].push({
                    id: chat.id,
                    name: displayName,
                    lastMessage: message.type !== "file" ? lastMessageText : shreadNameFile(lastMessageText),
                    time: lastMessageDate,
                    avatar: otherUserPhoto ? otherUserPhoto : '../assets/img/avatars/7.jpg'
                  });
                },
                error: (error) => {
                  console.error('Ошибка при получении последнего сообщения:', error);
                }
              });

              console.log("tmsg:",lastMessageText);

            }, 100);

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

   fetchLastMessage(chatId: number, token: string): Observable<{ chat_id: number, content: string, created_at: string, message_id: number, type: string, user_id: string }> {
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    const url = `${environment.apiUrl}/chats/${chatId}/messages/last`;

    return this.http.get<{ chat_id: number, content: string, created_at: string, message_id: number, type: string, user_id: string }>(url, { headers });
  }

  fetchUsersInChat(chatId: number, token: string): Observable<number[]> {
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    const url = `${environment.apiUrl}/chats/${chatId}/users`;

    return new Observable<number[]>((observer) => {
      this.http.get<{ user_ids: { chat_id: number, user_id: number, joined_at: string }[] }>(url, { headers })
        .subscribe({
          next: (response) => {
            // Извлекаем только user_id для каждого пользователя в чате
            const userIds = response.user_ids.map(user => user.user_id);
            observer.next(userIds);
            observer.complete();
          },
          error: (error) => {
            console.error('Ошибка при получении пользователей чата:', error);
            observer.error(error);
          }
        });
    });
  }
}
