import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatsListPage } from './chatsList.page';
import { SettingsPageModule } from '../settings/settings.module';

import { Tab1PageRoutingModule } from './chatsList-routing.module';
import {SearchPageModule} from "../search/search.module";

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    Tab1PageRoutingModule,
    SettingsPageModule,
    //SearchPageModule
  ],
  declarations: [ChatsListPage]
})
export class Tab1PageModule {}
