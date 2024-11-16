export function loadChatSettingsToLocalStorage(chatBackground: string, messageBackground: string) {
  // Попробуем получить сохраненные настройки из localStorage
  const savedSettings = localStorage.getItem('chatSettings');
  let settings = savedSettings ? JSON.parse(savedSettings) : {};

  // Обновляем значения параметров
  settings.theme = chatBackground;
  settings.message_color = messageBackground;

  // Сохраняем новые настройки обратно в localStorage
  localStorage.setItem('chatSettings', JSON.stringify(settings));
}

export function getChatSettings(): { chatBackground: string, messageBackground: string } {
  // Получаем настройки из localStorage
  const savedSettings = localStorage.getItem('chatSettings');

  // Если настройки есть, парсим их и возвращаем, иначе возвращаем объект с дефолтными значениями
  if (savedSettings) {
    return JSON.parse(savedSettings);
  }

  // Возвращаем объект с дефолтными значениями, если нет сохраненных настроек
  return {
    chatBackground: '#121212',
    messageBackground: '#32cd32'
  };
}
