import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AccountService } from '../accounts/account.service';
import { CURRENCY } from '../core/config';
import { AccountTypePipe, isSaving } from '../shared/format';

@Component({
  imports: [CurrencyPipe, DatePipe, RouterLink, AccountTypePipe],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  protected readonly service = inject(AccountService);
  protected readonly currency = CURRENCY;
  protected readonly isSaving = isSaving;

  protected readonly recent = computed(() =>
    [...this.service.accounts()]
      .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
      .slice(0, 5),
  );

  protected readonly maxTypeTotal = computed(() =>
    Math.max(1, ...this.service.byType().map((t) => t.total)),
  );

  constructor() {
    this.service.ensureLoaded();
  }
}
