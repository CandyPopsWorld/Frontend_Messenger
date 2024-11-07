import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { UserProfileService } from '../../services/user-profile.service';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular'; // Импортируем ToastController
import {ProfileService} from "../../services/Routes/profile/profile.service";


@Component({
  selector: 'search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage {
  searchTerm: string = ''; // Значение поиска
  foundUser: any = null; // Объект для найденного пользователя
  searchPerformed: boolean = false; // Флаг, чтобы отслеживать, был ли выполнен поиск

  constructor(private modalCtrl: ModalController, private http: HttpClient, private userProfileService: UserProfileService, private router: Router, private toastController: ToastController, private profileService: ProfileService) {}

  // Закрытие модального окна
  closeModal() {
    this.modalCtrl.dismiss();
  }

  searchUser() {
    if (!this.searchTerm) return;

    this.profileService.searchUserByName(this.searchTerm).subscribe({
      next: (userData: any) => {
        this.foundUser = userData; // Сохраняем данные найденного пользователя
        this.searchPerformed = true;
      },
      error: () => {
        this.foundUser = null; // Если пользователь не найден, сбрасываем результат
        this.searchPerformed = true;
      }
    });
  }

  // Функция для создания чата с пользователем
  async startChatWithUser() {
    if (this.foundUser) {
      const currentUserId = this.userProfileService.getID();
      const foundUserId = this.foundUser.id;

      // Проверка на совпадение ID
      if (currentUserId === foundUserId) {
        const toast = await this.toastController.create({
          message: 'Нельзя создать чат с самим собой.',
          duration: 2000,
          color: 'danger',
          position: 'top'
        });
        await toast.present();
        return; // Прерываем выполнение функции, если ID совпадают
      }

      const chatData = {
        name: this.userProfileService.getUsername() + "_" + this.foundUser.username, // Имя чата - имя найденного пользователя
        participants: [currentUserId, foundUserId] // Массив с UUID текущего пользователя и найденного пользователя
      };

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
      });

      this.http.post(`${environment.apiUrl}/chats`, chatData, { headers }).subscribe({
        next: (response: any) => {
          console.log('Чат успешно создан:', response.chat);
          this.closeModal();
          this.router.navigateByUrl(`/chat/${response.chat.id}`);
        },
        error: (error) => {
          console.error('Ошибка при создании чата:', error);
        }
      });
    }
  }
}
