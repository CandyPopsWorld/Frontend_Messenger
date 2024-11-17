import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {UsersPage} from "./users.page";
import {UsersPageRoutingModule} from "./users-routing.module";

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    UsersPageRoutingModule
  ],
  declarations: [UsersPage]
})
export class UsersPageModule {}
