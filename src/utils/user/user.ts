export function transformBase64Photo(photo: any){
  // Преобразуем base64 строку в байтовый массив
  const binaryString = atob(photo);
  const byteNumbers = new Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    byteNumbers[i] = binaryString.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);

  // Создаем Blob и URL объекта для фото
  const blob = new Blob([byteArray], { type: 'image/jpeg' });  // Используем тип изображения
  return URL.createObjectURL(blob);
}
