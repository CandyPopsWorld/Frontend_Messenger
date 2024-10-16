import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { ChatsListPage } from './chatsList.page';

describe('Tab1Page', () => {
  let component: ChatsListPage;
  let fixture: ComponentFixture<ChatsListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ChatsListPage],
      imports: [IonicModule.forRoot(), ExploreContainerComponentModule]
    }).compileComponents();

    fixture = TestBed.createComponent(ChatsListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
