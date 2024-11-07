// src/app/services/modal.service.ts
import { Injectable } from '@angular/core';
import { ModalController, IonRouterOutlet } from '@ionic/angular';
import { SettingsPage} from "../../app/settings/settings.page";
import { SearchPage} from "../../app/search/search.page";

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  constructor(private modalCtrl: ModalController) {}

  async openUserSearch(routerOutlet: IonRouterOutlet) {
    const modal = await this.modalCtrl.create({
      component: SearchPage,
      presentingElement: routerOutlet.nativeEl,
    });
    return await modal.present();
  }

  async openSettings(routerOutlet: IonRouterOutlet) {
    const modal = await this.modalCtrl.create({
      component: SettingsPage,
      presentingElement: routerOutlet.nativeEl,
    });
    return await modal.present();
  }
}
