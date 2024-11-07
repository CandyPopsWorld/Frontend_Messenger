import { Component } from '@angular/core';
import { ToastController } from '@ionic/angular'; // Импорт для уведомлений
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import {Topic} from "../../interfaces/login.interfaces";
import {topics} from "../../utils/data/topics";
import { ToastService} from "../../services/Notification/Toast.service";
import {AuthService} from "../../services/Routes/auth/auth.service";


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
  topics: Topic[] = topics;

  // Указываем, что randomTopics будет массивом типа Topic
  randomTopics: Topic[] = [];

  constructor(
    private toastService: ToastService,
    private toastController: ToastController,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,

  ) {
    this.getRandomTopics();
  }

  login() {
    if (this.formValid()) {
      this.authService.login(this.username, this.password);
    }
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
}
