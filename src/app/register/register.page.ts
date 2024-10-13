import {Component} from "@angular/core";
import {ToastController} from '@ionic/angular';  // Импортируем ToastController для уведомлений

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

  constructor(private toastController: ToastController) {}

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


  formValid(): boolean {
    return this.username.length >= 3 &&
      this.validateEmail(this.email) &&
      this.isEmailVerified &&  // Теперь учитываем, что почта должна быть подтверждена
      this.password.length >= 6;
  }

  // Подтвердить почту и показать поле для ввода кода
  confirmEmail() {
    if (this.validateEmail(this.email)) {
      this.showEmailCodeInput = true;
      this.updateProgress();
      this.isEmailVerified = false;  // на случай, если почта будет очищена
    }
  }

  // Подтвердить код, введенный пользователем
  confirmEmailCode() {
    if (this.emailCode === '1234') {
      console.log('Email подтвержден');
      this.isEmailVerified = true;  // Почта подтверждена
      this.showEmailCodeInput = false;  // Скрываем ввод кода и кнопку подтверждения
      this.updateProgress();  // Обновляем прогресс бар

      this.showToast('Почта успешно подтверждена!');

    } else {
      console.error('Неверный код');
      this.showToast('Неверный код подтверждения!', 'danger');
    }
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
  register() {
    if (this.formValid()) {
      // Proceed with registration logic
      console.log('Registered successfully:', {
        username: this.username,
        email: this.email,
        password: this.password,
      });
    }
  }
}
