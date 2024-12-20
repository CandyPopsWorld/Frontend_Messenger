import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AuthGuardInverse } from './auth-inverse.guard'; // Импорт нового guard

const routes: Routes = [
  {
    path: '',
    redirectTo: 'register',
    pathMatch: 'full'
  },
  {
    path: 'chat/:idChat',
    loadChildren: () => import('./chat/chat.module').then(m => m.ChatPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'register',
    loadChildren: () => import('./register/register.module').then(m => m.RegisterPageModule),
    canActivate: [AuthGuardInverse]  // Применение AuthGuardInverse
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule),
    canActivate: [AuthGuardInverse]  // Применение AuthGuardInverse
  },
  {
    path: 'chats/list',
    loadChildren: () => import('./chatsList/chatsList.module').then(m => m.Tab1PageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'chats/contacts',
    loadChildren: () => import('./tab2/tab2.module').then(m => m.Tab2PageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'chats',
    redirectTo: 'chats/list'
  },
  // {
  //   path: 'users',
  //   loadChildren: () => import('./allUsers/all-users.module').then(m => m.AllUsersPageModule),
  //   //canActivate: [AuthGuard]
  // }
  {
    path: 'users',
    loadChildren: () => import('./users/users.module').then(m => m.UsersPageModule),
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
