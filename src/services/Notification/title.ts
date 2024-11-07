// titleUtils.ts

/*export function updateTitleWithBlink(
  originalTitle: string,
  newMessagesCount: number,
  duration: number = 10000,
  interval: number = 500
) {
  let titleBlinkInterval: any;

  if (titleBlinkInterval) clearInterval(titleBlinkInterval); // Сбрасываем предыдущее мигание

  const blinkTitle = () => {
    document.title = document.title === originalTitle
      ? `У вас ${newMessagesCount} ${newMessagesCount === 1 ? 'новое сообщение' : 'новых сообщения'}`
      : originalTitle;
  };

  // Начинаем мигание
  titleBlinkInterval = setInterval(blinkTitle, interval);

  // Останавливаем мигание через указанное время
  setTimeout(() => {
    clearInterval(titleBlinkInterval);
    document.title = originalTitle;
  }, duration);
}*/

// src/app/utils/titleBlinker.ts
export class TitleBlinker {
  private originalTitle: string;
  private blinkIntervalId: any;
  private durationTimeoutId: any;

  constructor(private duration: number = 10000, private interval: number = 500) {
    this.originalTitle = document.title;
  }

  startBlink(newMessagesCount: number) {
    if (this.blinkIntervalId) clearInterval(this.blinkIntervalId);
    if (this.durationTimeoutId) clearTimeout(this.durationTimeoutId);

    const blinkTitle = () => {
      document.title = document.title === this.originalTitle
        ? `У вас ${newMessagesCount} ${newMessagesCount === 1 ? 'новое сообщение' : 'новых сообщения'}`
        : this.originalTitle;
    };

    this.blinkIntervalId = setInterval(blinkTitle, this.interval);

    this.durationTimeoutId = setTimeout(() => this.stopBlink(), this.duration);
  }

  stopBlink() {
    if (this.blinkIntervalId) clearInterval(this.blinkIntervalId);
    document.title = this.originalTitle;
  }
}
