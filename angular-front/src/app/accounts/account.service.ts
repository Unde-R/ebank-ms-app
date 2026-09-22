import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { ACCOUNTS_URL } from '../core/config';
import { Account, AccountStatus } from './model/account.model';

export interface TypeBreakdown {
  type: string;
  count: number;
  total: number;
}

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly http = inject(HttpClient);

  readonly accounts = signal<Account[]>([]);
  readonly status = signal<AccountStatus>('idle');
  readonly error = signal('');

  readonly totalBalance = computed(() =>
    this.accounts().reduce((sum, a) => sum + (a.balance ?? 0), 0),
  );
  readonly averageBalance = computed(() => {
    const n = this.accounts().length;
    return n ? this.totalBalance() / n : 0;
  });
  readonly customerCount = computed(
    () => new Set(this.accounts().map((a) => a.customerId)).size,
  );
  readonly byType = computed<TypeBreakdown[]>(() => {
    const groups = new Map<string, TypeBreakdown>();
    for (const a of this.accounts()) {
      const type = a.type ?? 'UNKNOWN';
      const group = groups.get(type) ?? { type, count: 0, total: 0 };
      group.count += 1;
      group.total += a.balance ?? 0;
      groups.set(type, group);
    }
    return [...groups.values()].sort((a, b) => b.total - a.total);
  });

  load() {
    this.status.set('loading');
    this.error.set('');
    this.http.get<Account[]>(ACCOUNTS_URL).subscribe({
      next: (accounts) => {
        this.accounts.set(accounts);
        this.status.set('success');
      },
      error: (err) => {
        this.accounts.set([]);
        this.error.set(err?.statusText && err.statusText !== 'Unknown Error' ? err.statusText : 'The server could not be reached');
        this.status.set('error');
      },
    });
  }

  ensureLoaded() {
    if (this.status() === 'idle') this.load();
  }
}
