// src/app/services/chats.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {environment} from "../../../environments/environment";
@Injectable({
  providedIn: 'root'
})
export class FilesService {
  constructor(
    private http: HttpClient,
  ) {}

  getFileInfo(content: string, token: any) {
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.get<{ file_info: any }>(`${environment.apiUrl}/files/${content}/info`, { headers }).toPromise();
  }
}
