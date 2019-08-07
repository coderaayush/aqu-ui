import { Component, OnInit } from '@angular/core';
import { ChatService} from './../../_services/chat.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Socket } from 'ngx-socket-io';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  public usersData;
  public connectedChats;
  public userProfile;

  constructor(
    private chatService: ChatService,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private socket: Socket,
    private router: Router
  ) { 
    this.connectedChats = [];
    this.usersData = [];
    this.userProfile = {};
  }

  ngOnInit() {
    
    let localUserId = localStorage.getItem('userId');
    if (localUserId) {
      this.chatService.getOnlineUsers()
        .subscribe(result => {
          let usersData:any = Object.assign({}, result);
          
          console.log(result);
          this.usersData = usersData.data;
          this.userProfile = JSON.parse(JSON.stringify(usersData.data)).find(x => x.userId == localUserId);

          //If user data is not present, reset localstorage
          if (usersData.data.length < 1)
            localStorage.clear();
            this.router.navigate(['/']);
        },
        error => {
          console.log('something went wrong while creating chat');
          console.log(error);
        }
      )

      this.chatService.getUserConnectedChats(localUserId)
        .subscribe(result => {
          let chatData:any = Object.assign({}, result);
          this.connectedChats = chatData.data;
        },
        error => {
          console.log('something went wrong while creating chat');
          console.log(error);
        }
      )
    } else {
        this.router.navigate(['/']);
    }

    this.socket.fromEvent("online-user-created").subscribe(result => {
      let localUserId = localStorage.getItem('userId');
      let usersData:any = Object.assign({}, result);
      console.log('user created');
      console.log(usersData);
      this.userProfile = usersData.data;
      this.usersData = usersData.onlineUsers;
    });

    this.socket.fromEvent("online-user-updated").subscribe(result => {
      let localUserId = localStorage.getItem('userId');
      let usersData:any = Object.assign({}, result);
      console.log('user updated');
      console.log(usersData);
      this.usersData = usersData.data;
      this.userProfile = JSON.parse(JSON.stringify(usersData.data)).find(x => x.userId == localUserId);
    });

    this.socket.fromEvent("user-connected-chat-updated").subscribe(result => {
      let localUserId = localStorage.getItem('userId');
      console.log('user-connected-chat-updated');
      let chatData:any = Object.assign({}, result);
      console.log(chatData);
      if (localUserId == chatData.userId)
        this.connectedChats = chatData.connectedChats;
    });

    this.socket.fromEvent("user-chat-disconnected").subscribe(result => {
      let localUserId = localStorage.getItem('userId');
      console.log('user-chat-disconnected');
      let chatData:any = Object.assign({}, result);
      console.log(chatData);
      if (localUserId == chatData.userId)
        this.connectedChats = chatData.connectedChats;
    });
    
  }

  addUserToChat(userId) {
    let data:any = {}
    data.chatId =  this.route.snapshot.queryParamMap.get('chatId') ? this.route.snapshot.queryParamMap.get('chatId') : localStorage.getItem('chatId');
    data.userId = userId;
    console.log(data.chatId);
    this.chatService.addUserToChat(data).subscribe(result => {
        let itemData:any = Object.assign({}, result);
        console.log(itemData);
        if (itemData.err == 0) {
          this.toastr.success('User added to chat');
        } else if (itemData.err == 111) {
          this.toastr.error('User already connected to this chat');
        }
      },
      error => {
        console.log('something went wrong while creating chat');
        console.log(error);
      }
    )
  }

  updateUser() {
    let data:any = {};
    data.userId = localStorage.getItem('userId');
    data.userName = this.userProfile.userName;
    console.log(data);
    this.chatService.updateUser(data).subscribe(result => {
      let itemData:any = Object.assign({}, result);
      console.log(itemData);
      if (itemData.err == 0) {
        this.toastr.success('User name updated');
      } else if (itemData.err == 210) {
        this.toastr.error('unable to find user');
      }
    },
    error => {
      console.log('something went wrong while creating chat');
      console.log(error);
    }
  )
    
  }

}
