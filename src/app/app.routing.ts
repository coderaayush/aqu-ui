import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';

const appRoutes: Routes = [
    // { path: '/',      component: AppComponent }
    // { path: '**', component: PageNotFoundComponent }
  ];
  
  @NgModule({
    imports: [
      RouterModule.forRoot(
        appRoutes,
        { enableTracing: false } // <-- debugging purposes only
      )
      // other imports here
    ],
    exports: [
        RouterModule
      ]
  })
  export class AppRoutingModule { }