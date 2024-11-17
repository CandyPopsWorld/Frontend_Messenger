import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import {ChatsService} from "../../services/Routes/chats/chats.service";

@Component({
  selector: 'app-users',
  templateUrl: 'users.page.html',
  styleUrls: ['users.page.scss'],
})
export class UsersPage implements OnInit {
  users: any[] = [];
  displayedUsers: any[] = [];
  currentPage: number = 1;
  pageSize: number = 50;
  totalPages: number = 0;
  token: any;
  isModalOpen: boolean = false;
  selectedUser: any = null;

  constructor(private http: HttpClient, private chatsService: ChatsService) {}

  ngOnInit() {
    this.token = localStorage.getItem('authToken');
    this.loadAllUsers();
    console.log('fuck');
  }

  loadAllUsers() {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`
    });

    this.http.get<{ users: any[] }>(`${environment.apiUrl}/users`, { headers })
      .subscribe(response => {
        this.users = response.users;
        this.totalPages = Math.ceil(this.users.length / this.pageSize);
        this.updateDisplayedUsers();
      });
  }

  updateDisplayedUsers() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.displayedUsers = this.users.slice(startIndex, startIndex + this.pageSize);
  }

  goToPreviousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateDisplayedUsers();
    }
  }

  goToNextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateDisplayedUsers();
    }
  }

  transformBase64Photo(photo: string): string {
    return `data:image/jpeg;base64,${photo}`;
  }

  openAboutModal(user: any) {
    this.selectedUser = user;
    this.isModalOpen = true;
  }

  closeAboutModal() {
    this.isModalOpen = false;
    this.selectedUser = null;
  }

  createChatWithFoundUser(user: any) {
    this.chatsService.createChat(user);
  }
}
