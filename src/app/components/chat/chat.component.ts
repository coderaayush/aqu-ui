import { Component, OnInit } from '@angular/core';
import { ChatService} from './../../_services/chat.service';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { filter, map, mergeMap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Socket } from 'ngx-socket-io';
import { JsonpInterceptor } from '@angular/common/http';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  public chatInitiated;
  public userInitiated;
  public userChatData:any = {};
  public draftChatMessage;
  public onlineUsers;
  public firstTimeUser;

  constructor(
    private chatService: ChatService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private socket: Socket
  ) {
    this.chatInitiated = false;
    this.userInitiated = false;
    this.firstTimeUser = true;

    this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      console.log(this.route);
      console.log('change change ###');
      this.route.queryParams.subscribe( route => {
        let chatId = route.chatId;
        if (chatId) {
          this.userChatData.chatData.chatId = chatId
        }
        
        let data:any = {};
        data.chatId = chatId ? chatId : this.userChatData.chatData ? this.userChatData.chatData.chatId : null ;
        if (!data.chatId) {
          return;
        }
        data.userId = localStorage.getItem('userId');
        this.getItem(data);
      });
    });
  }

  ngOnInit() {

    //check if values on localstorage already exists
    if (localStorage.getItem('userId')) {
      this.userChatData.userData = {
        userId: JSON.parse(localStorage.getItem('userId'))
      }
      this.userInitiated = true;
    } else {
      return;
    }

    if (localStorage.getItem('chatId')) {
      this.userChatData.chatData = {
        chatId: JSON.parse(localStorage.getItem('chatId'))
      }
      this.chatInitiated = true;
    }

    this.chatService.getOnlineUsers()
      .subscribe(result => {
        let usersData:any = Object.assign({}, result);
        this.onlineUsers = usersData.data;
      },
      error => {
        console.log('something went wrong while creating chat');
        console.log(error);
      }
    );

    this.socket.fromEvent("online-user-updated").subscribe(result => {
      let usersData:any = Object.assign({}, result);
      this.onlineUsers = usersData.data;
      console.log(this.onlineUsers);
      this.refreshItems();
    });

    this.socket.fromEvent("chat-item-updated").subscribe(results => {
      let chatData:any = results;
      if (chatData.chatId == this.userChatData.chatData.chatId) {
        console.log('refreshing items');
        this.refreshItems();
      }
    });

    this.socket.fromEvent("user-connected-chat-updated").subscribe(result => {
      let chatData:any = Object.assign({}, result);
      this.chatInitiated = true;
      this.userChatData.chatItem = chatData.items;
    });

    this.socket.fromEvent("user-chat-disconnected").subscribe(result => {
      let chatData:any = Object.assign({}, result);
      if (this.userChatData.chatData.chatId == chatData.items.chatId) {
        console.log('refreshing items');
        this.refreshItems();
      }
    });

  }

  startChat() {
    this.chatService.createChatId(this.userChatData.userData.userId)
      .subscribe(result => {
        this.chatInitiated = true;
        //store chat id to local storage
        let chatData:any = Object.assign({}, result);
        
        //store user id to local storage
        this.saveDataToLocalStorage(chatData.data);
        this.userChatData.chatData = chatData.data;
      },
      error => {
        console.log('something went wrong while creating chat');
        console.log(error);
      }
    )
  };

  reconnectUser() {
    this.chatService.createUserId()
      .subscribe(result => {
        this.userInitiated = true;
        let userData:any = Object.assign({}, result);
        
        //store user id to local storage
        this.saveDataToLocalStorage(userData.data);
        this.userChatData.userData = userData.data;

      },
      error => {
        console.log('something went wrong while creating chat');
        console.log(error);
      }
    )
  }

  refreshItems() {
    let data = {
      userId: this.userChatData.userData.userId,
      chatId: this.userChatData.chatData.chatId
    }
    this.getItem(data);
  }

  getItem(data) {
    this.chatService.getChatMessages(data)
      .subscribe(result => {
        this.userInitiated = true;
        let chatMessages:any = Object.assign({}, result);
        if (chatMessages.err == 141) {
          console.log('No chat data');
          if (this.firstTimeUser) {
            return;
          } else {
            this.chatInitiated = false;
          }
          this.toastr.error('User not found in this chat');
        } 
        this.userChatData.chatItem = chatMessages.data;
        this.firstTimeUser = false;
      },
      error => {
        console.log('something went wrong while creating chat');
        console.log(error);
      }
    )
  }

  pushMessageToChat() {
    let data = {
      userId: this.userChatData.userData.userId,
      chatId: this.userChatData.chatData.chatId,
      message: this.draftChatMessage
    };

    this.chatService.pushMessageToChat(data)
      .subscribe(result => {
        this.draftChatMessage = '';
        let chatMessages:any = Object.assign({}, result);
        this.userChatData.messages = chatMessages.data;

        //refresh chat items
        this.refreshItems();
      },
      error => {
        console.log('something went wrong while fetching messages');
        console.log(error);
      }
    )
  }

  saveDataToLocalStorage(data) {
    data.userId ? localStorage.setItem('userId', data.userId) : null;
    data.chatId ? localStorage.setItem('chatId', data.chatId) : null;
  }

  getUserName(userId) {
    if (this.onlineUsers) {
      console.log('userId : ', this.onlineUsers.find(x => x.userId == userId).userName);      
      return this.onlineUsers.find(x => x.userId == userId).userName;
    }
  }

  disconnectUser() {
    let data:any = {};
    data.userId = this.userChatData.userData.userId;
    data.chatId = this.userChatData.chatData.chatId;
    let localChatId = localStorage.getItem('chatId');

    this.chatService.removeUserFromChat(data)
      .subscribe(result => {
        let usersData:any = Object.assign({}, result);
        console.log(usersData);
        if (usersData.err == 0) {
          if (data.chatId == localChatId) {
            localStorage.removeItem('chatId');
            this.chatInitiated = false;
          }
          this.toastr.success('User removed from chat');
        } else if (usersData.err == 121) {
          this.toastr.error('User already not found in this chat');
        }
        this.router.navigate(['/']);
      },
      error => {
        console.log('something went wrong while fetching messages');
        console.log(error);
        this.toastr.error('something went wrong');
      }
    )
  }

}
