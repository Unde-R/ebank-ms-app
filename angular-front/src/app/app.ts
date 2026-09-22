import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ThemeService } from './core/theme';
import { LoadingService } from './services/loading';

@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly theme = inject(ThemeService);
  protected readonly loading = inject(LoadingService);
  protected readonly menuOpen = signal(false);

  protected readonly links = [
    { path: '/', label: 'Overview', icon: 'bi-grid-1x2', exact: true },
    { path: '/accounts', label: 'Accounts', icon: 'bi-wallet2', exact: false },
    { path: '/bot', label: 'Assistant', icon: 'bi-stars', exact: false },
  ];
}
