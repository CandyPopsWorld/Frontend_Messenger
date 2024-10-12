import {Component} from "@angular/core";

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  username: string = '';
  email: string = '';
  password: string = '';
  progress: number = 0;  // Прогресс бар от 0 до 1

  constructor() {}

  // Функция, обновляющая прогресс по мере заполнения полей
  updateProgress() {
    const totalFields = 3;  // Количество обязательных полей (username, email, password)
    let filledFields = 0;

    if (this.username && this.username.length >= 3) filledFields++;
    if (this.email && this.validateEmail(this.email)) filledFields++;
    if (this.password && this.password.length >= 6) filledFields++;

    this.progress = filledFields / totalFields;  // Обновляем прогресс
  }


  // Simple email validation
  validateEmail(email: string): boolean {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  }

  // Check if form is valid
  formValid(): boolean {
    return this.username.length >= 3 && this.validateEmail(this.email) && this.password.length >= 6;
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
