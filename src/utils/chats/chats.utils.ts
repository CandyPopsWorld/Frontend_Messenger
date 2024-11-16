export function filterChatGroups(searchTerm: string, chatGroups: any[]): any[] {
  const searchValue = searchTerm.toLowerCase().trim();

  if (searchValue) {
    return chatGroups
      .map(group => ({
        ...group,
        chats: group.chats.filter((chat:any) => chat.name.toLowerCase().includes(searchValue))
      }))
      .filter(group => group.chats.length > 0);
  }

  return [...chatGroups]; // Если поле пустое, возвращаем все группы
}

export function shreadNameFile(filename: string){
  return filename.length > 37 ? filename.slice(37) : '';
}
