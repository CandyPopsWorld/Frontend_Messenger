import { Component } from '@angular/core';

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

  constructor() {
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

  login() {
    if (this.formValid()) {
      console.log('Logged in successfully:', {
        username: this.username,
        password: this.password,
      });
    }
  }
}
