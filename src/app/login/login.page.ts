import { Component } from '@angular/core';
import { ToastController } from '@ionic/angular'; // Импорт для уведомлений
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

// Тип для тем
interface Topic {
  text: string;
  icon: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  username: string = '';
  password: string = '';
  progress: number = 0;

  // Массив тем для разговора
  topics: Topic[] = [
    { text: 'Как прошли выходные? 🏖️', icon: 'sunny' },
    { text: 'Что нового на работе? 💼', icon: 'briefcase' },
    { text: 'Какой фильм недавно смотрели? 🎥', icon: 'film' },
    { text: 'Планы на отпуск? ✈️', icon: 'airplane' },
    { text: 'Любимые хобби? 🎨', icon: 'color-palette' },
    { text: 'Какие книги читали недавно? 📚', icon: 'book' },
    { text: 'Какая ваша любимая музыка? 🎵', icon: 'musical-notes' },
    { text: 'Чем занимаетесь на выходных? ⛷️', icon: 'walk' },
    { text: 'Ваши любимые блюда? 🍕', icon: 'pizza' },
  ];

  // Указываем, что randomTopics будет массивом типа Topic
  randomTopics: Topic[] = [];

  constructor(
    private toastController: ToastController,
    private http: HttpClient,
    private router: Router
  ) {
    this.getRandomTopics();
  }

  // Функция для получения 3 случайных тем
  getRandomTopics() {
    this.randomTopics = this.topics
      .sort(() => Math.random() - 0.5)  // Перемешиваем массив
      .slice(0, 3);  // Выбираем 3 темы
  }

  updateProgress() {
    const totalFields = 2;
    let filledFields = 0;

    if (this.username && this.username.length >= 3) filledFields++;
    if (this.password && this.password.length >= 6) filledFields++;

    this.progress = filledFields / totalFields;
  }

  formValid(): boolean {
    return this.username.length >= 3 && this.password.length >= 6;
  }

  async showToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: color,
      position: 'top'
    });
    await toast.present();
  }

  login() {
    if (this.formValid()) {
      const data = {
        username: this.username,
        password: this.password
      };

      // Отправка POST-запроса на сервер для аутентификации
      // this.http.post(`${environment.apiUrl}/login`, data).subscribe({
      //   next: (response: any) => {
      //     if (response.UUID) {
      //       // Сохранение authToken в localStorage
      //       localStorage.setItem('authToken', 'true');
      //
      //       // Показ уведомления о успешном входе
      //       this.showToast('Вы успешно вошли!');
      //
      //       // Перенаправление на страницу чатов
      //       this.router.navigate(['/chats']);
      //     } else {
      //       console.error('Не удалось получить UUID');
      //       this.showToast('Ошибка при входе!', 'danger');
      //     }
      //   },
      //   error: (error) => {
      //     console.error('Ошибка при входе:', error);
      //     this.showToast('Ошибка при входе!', 'danger');
      //   },
      // });

      if (data) {
        // Сохранение authToken в localStorage
        localStorage.setItem('authToken', 'true');

        // Показ уведомления о успешном входе
        this.showToast('Вы успешно вошли!');

        // Перенаправление на страницу чатов
        this.router.navigate(['/chats']);
      } else {
        console.error('Не удалось получить UUID');
        this.showToast('Ошибка при входе!', 'danger');
      }

    }
  }
}
