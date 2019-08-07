import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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

  createChatId(userId) { return this.http.get('http://127.0.0.1:2000/api/createChatId?userId='+userId) };
  createUserId() { return this.http.get('http://127.0.0.1:2000/api/createUserId') };

  getChatMessages(data) { 
    return this.http.get('http://127.0.0.1:2000/api/getItem?userId='+data.userId+'&chatId='+data.chatId) 
  }
  pushMessageToChat(data) {
    return this.http.post('http://127.0.0.1:2000/api/pushMessageToChat?userId='+data.userId+'&chatId='+data.chatId, {message: data.message}, httpOptions);
  }

  getOnlineUsers() { return this.http.get('http://127.0.0.1:2000/api/getOnlineUsers') };
  getUserConnectedChats(userId) { return this.http.get('http://127.0.0.1:2000/api/getUserConnectedChats?userId='+userId) }

  addUserToChat(data) {return this.http.get('http://127.0.0.1:2000/api/addUserToChat?userId='+data.userId+'&chatId='+data.chatId) }

  updateUser(data) {
    return this.http.post('http://127.0.0.1:2000/api/updateUser?userId='+data.userId, {userName: data.userName}, httpOptions);
  }

  removeUserFromChat(data) {
    return this.http.get('http://127.0.0.1:2000/api/removeUserFromChat?userId='+data.userId+'&chatId='+data.chatId);
  }
}
