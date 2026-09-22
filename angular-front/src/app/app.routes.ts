import { Routes } from '@angular/router';
import { Accounts } from './accounts/accounts';
import { BotUi } from './bot-ui/bot-ui';
import { Dashboard } from './dashboard/dashboard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: Dashboard, title: 'Overview · Ebank' },
  { path: 'accounts', component: Accounts, title: 'Accounts · Ebank' },
  { path: 'bot', component: BotUi, title: 'Assistant · Ebank' },
  { path: '**', redirectTo: '' },
];
