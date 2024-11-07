import {Component, NgModule} from "@angular/core";
import {ToastController} from '@ionic/angular';  // Импортируем ToastController для уведомлений
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import {ValidationService} from "../../services/Validate/validation.service";
import {AuthService} from "../../services/Routes/auth/auth.service";
import {ToastService} from "../../services/Notification/Toast.service";

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


  constructor(private toastController: ToastController, private http: HttpClient, private router: Router, private validationService: ValidationService, private authService: AuthService, private toastService: ToastService) {}

  confirmEmail() {
    if (this.validateEmail(this.email) && this.validateUsername(this.username) && this.validatePassword(this.password)) {
      const data = {
        username: this.username,
        email: this.email,
        password: this.password,
      };

      this.authService.verifyEmail(data).subscribe({
        next: (response: any) => {
          if (response.UUID) {
            this.UUID = response.UUID;  // Сохраняем UUID
            this.showEmailCodeInput = true;
            this.isEmailVerified = false;
            this.updateProgress();
          } else {
            console.error('Не удалось получить UUID');
          }
        },
        error: (error) => {
          this.toastService.showToast('Ошибка при подтверждении почты!', 'danger');
        },
      });
    } else {
      this.showEmailCodeInput = false;
    }
  }

  confirmEmailCode() {
    const data = { code: this.emailCode, UUID: this.UUID };
    this.authService.registerUser(data).subscribe({
      next: (response: any) => {
        if (response.message === "User registered successfully") {
          this.isEmailVerified = true;
          this.showEmailCodeInput = false;
          this.updateProgress();
          this.toastService.showToast('Почта успешно подтверждена!');
          this.emailConfirmed = true;
        } else {
          this.toastService.showToast('Ошибка при регистрации!', 'danger');
        }
      },
      error: () => {
        this.toastService.showToast('Неверный код подтверждения!', 'danger');
      },
    });
  }

  // Submit registration
  async register() {
    if (this.formValid()) {            // Показ уведомления о успешной регистрации
      const toast = await this.toastService.showToast("Регистрация успешна!");
      this.router.navigate(['/login']);  // Переход на страницу логина
    }
  }

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
    return this.validationService.validateEmail(email);
  }

  validateUsername(username: string): boolean {
    return this.validationService.validateUsername(username);
  }

  validatePassword(password: string): boolean {
    return this.validationService.validatePassword(password);
  }

  formValid(): boolean {
    return this.username.length >= 3 &&
      this.validateEmail(this.email) &&
      this.isEmailVerified &&  // Теперь учитываем, что почта должна быть подтверждена
      this.password.length >= 6;
  }
}
