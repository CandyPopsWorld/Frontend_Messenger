import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'search',
  templateUrl: './search.page.html',
  //styleUrls: ['./user-search.page.scss'],
})
export class SearchPage {
  searchTerm: string = ''; // Значение поиска
  foundUser: any = null; // Объект для найденного пользователя
  searchPerformed: boolean = false; // Флаг, чтобы отслеживать, был ли выполнен поиск

  constructor(private modalCtrl: ModalController, private http: HttpClient) {}

  // Закрытие модального окна
  closeModal() {
    this.modalCtrl.dismiss();
  }

  // Метод для поиска пользователя по имени
  searchUser() {
    if (!this.searchTerm) return;

    const headers = new HttpHeaders({ 'Authorization': `Bearer ${localStorage.getItem('authToken')}` });
    this.http.get(`${environment.apiUrl}/check/${this.searchTerm}`, { headers }).subscribe({
      next: (userData: any) => {
        this.foundUser = userData; // Сохраняем данные найденного пользователя
        this.searchPerformed = true;
      },
      error: (error) => {
        console.error('Ошибка при поиске пользователя:', error);
        this.foundUser = null; // Если пользователь не найден, сбрасываем результат
        this.searchPerformed = true;
      }
    });
  }

  // Фиктивная функция для создания чата с пользователем
  startChatWithUser() {
    if (this.foundUser) {
      console.log(`Создаем чат с пользователем: ${this.foundUser.username}`);
      // Здесь можно добавить логику для создания чата
    }
  }
}
