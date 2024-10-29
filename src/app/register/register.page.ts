import {Component, NgModule} from "@angular/core";
import {ToastController} from '@ionic/angular';  // Импортируем ToastController для уведомлений
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';


@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  username: string = '';
  email: string = '';
  password: string = '';
  emailCode: string = '';
  progress: number = 0;  // Прогресс бар от 0 до 1
  isEmailVerified: boolean = false;  // Флаг для статуса верификации почты
  showEmailCodeInput: boolean = false;  // Показывать или скрывать поле для ввода кода и кнопку подтверждения
  emailConfirmed: boolean = false;
  UUID: string = '';  // Переменная для хранения UUID


  constructor(private toastController: ToastController, private http: HttpClient, private router: Router) {}

  // Функция для обновления прогресса
  updateProgress() {
    const totalFields = this.isEmailVerified ? 4 : 3;  // Если почта подтверждена, считаем 4 шага
    let filledFields = 0;

    if (this.username && this.username.length >= 3) filledFields++;
    if (this.email && this.validateEmail(this.email)) filledFields++;
    if (this.isEmailVerified) filledFields++;
    if (this.password && this.password.length >= 6) filledFields++;

    this.progress = filledFields / totalFields;
  }

  validateEmail(email: string): boolean {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  }

  validateUsername(username: string): boolean {
    return !!(this.username && this.username.length >= 3);
  }

  validatePassword(password: string): boolean {
    return !!(this.password && this.password.length >= 6);
  }

  formValid(): boolean {
    return this.username.length >= 3 &&
      this.validateEmail(this.email) &&
      this.isEmailVerified &&  // Теперь учитываем, что почта должна быть подтверждена
      this.password.length >= 6;
  }

  confirmEmail() {
    if (this.validateEmail(this.email) && this.validateUsername(this.username) && this.validatePassword(this.password)) {
      const data = {
        username: this.username,
        email: this.email,
        password: this.password,
      };

      // Отправка запроса на сервер
      this.http.post(`${environment.apiUrl}/verify-email`, data).subscribe({
        next: (response: any) => {
          if (response.UUID) {
            console.log('UUID:', response.UUID);
            this.UUID = response.UUID;  // Сохраняем UUID
            this.showEmailCodeInput = true;
            this.isEmailVerified = false;
            this.updateProgress();
          } else {
            console.error('Не удалось получить UUID');
          }
        },
        error: (error) => {
          console.error('Ошибка при подтверждении почты:', error);
          this.showToast('Ошибка при подтверждении почты!', 'danger');
        },
      });
    } else {
      this.showEmailCodeInput = false;
    }
  }

  // Подтвердить код, введенный пользователем
  // confirmEmailCode() {
  //   if (this.emailCode === '1234') {
  //     console.log('Email подтвержден');
  //     this.isEmailVerified = true;  // Почта подтверждена
  //     this.showEmailCodeInput = false;  // Скрываем ввод кода и кнопку подтверждения
  //     this.updateProgress();  // Обновляем прогресс бар
  //
  //     this.showToast('Почта успешно подтверждена!');
  //
  //     // Блокируем поле ввода почты, чтобы его нельзя было изменить
  //     this.emailConfirmed = true;
  //
  //   } else {
  //     console.error('Неверный код');
  //     this.showToast('Неверный код подтверждения!', 'danger');
  //   }
  // }

  confirmEmailCode() {
    const data = {
      code: this.emailCode,
      UUID: this.UUID,  // Используем сохраненный UUID
    };

    this.http.post(`${environment.apiUrl}/register`, data).subscribe({
      next: (response: any) => {
        if (response.message === "User registered successfully") {
          console.log('Email подтвержден');
          this.isEmailVerified = true;
          this.showEmailCodeInput = false;
          this.updateProgress();
          this.showToast('Почта успешно подтверждена!');
          this.emailConfirmed = true;
        } else {
          console.error('Ошибка при регистрации');
          this.showToast('Ошибка при регистрации!', 'danger');
        }
      },
      error: (error) => {
        console.error('Неверный код или ошибка на сервере:', error);
        this.showToast('Неверный код подтверждения!', 'danger');
      },
    });
  }

  // Функция для показа уведомления
  async showToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: color,
      position: 'top'
    });
    await toast.present();
  }

  // Submit registration
  async register() {
    if (this.formValid()) {            // Показ уведомления о успешной регистрации
      const toast = await this.showToast("Регистрация успешна!");
      this.router.navigate(['/login']);  // Переход на страницу логина
    }
  }
}
