import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
let host = 'http://127.0.0.1:2000';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json',
    // 'Authorization': 'my-auth-token'
  })
};

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(
    private http: HttpClient,
    ) {
    console.log('chat server AI');
  }

  createChatId(userId) { return this.http.get(host + '/api/createChatId?userId='+userId) };
  createUserId() { return this.http.get(host + '/api/createUserId') };

  getChatMessages(data) { 
    return this.http.get(host + '/api/getItem?userId='+data.userId+'&chatId='+data.chatId) 
  }
  pushMessageToChat(data) {
    return this.http.post(host + '/api/pushMessageToChat?userId='+data.userId+'&chatId='+data.chatId, {message: data.message}, httpOptions);
  }

  getOnlineUsers() { return this.http.get(host + '/api/getOnlineUsers') };
  getUserConnectedChats(userId) { return this.http.get(host + '/api/getUserConnectedChats?userId='+userId) }

  addUserToChat(data) {return this.http.get(host + '/api/addUserToChat?userId='+data.userId+'&chatId='+data.chatId) }

  updateUser(data) {
    return this.http.post(host + '/api/updateUser?userId='+data.userId, {userName: data.userName}, httpOptions);
  }

  removeUserFromChat(data) {
    return this.http.get(host + '/api/removeUserFromChat?userId='+data.userId+'&chatId='+data.chatId);
  }
}
