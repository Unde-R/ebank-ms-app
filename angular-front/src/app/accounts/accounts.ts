import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { CURRENCY } from '../core/config';
import { AccountTypePipe, isSaving } from '../shared/format';
import { AccountService } from './account.service';
import { Account } from './model/account.model';

type SortKey = 'id' | 'balance' | 'createdAt' | 'customerId';

@Component({
  imports: [CurrencyPipe, DatePipe, AccountTypePipe],
  selector: 'app-accounts',
  styleUrl: './accounts.css',
  templateUrl: './accounts.html',
})
export class Accounts {
  protected readonly service = inject(AccountService);
  protected readonly currency = CURRENCY;
  protected readonly isSaving = isSaving;

  protected readonly search = signal('');
  protected readonly typeFilter = signal('ALL');
  protected readonly sortKey = signal<SortKey>('createdAt');
  protected readonly sortDesc = signal(true);

  protected readonly types = computed(() => this.service.byType().map((t) => t.type));

  protected readonly rows = computed(() => {
    const query = this.search().trim().toLowerCase();
    const type = this.typeFilter();
    const key = this.sortKey();
    const dir = this.sortDesc() ? -1 : 1;

    return this.service
      .accounts()
      .filter((a) => type === 'ALL' || a.type === type)
      .filter(
        (a) =>
          !query ||
          a.id.toLowerCase().includes(query) ||
          String(a.customerId ?? '').includes(query) ||
          (a.type ?? '').toLowerCase().includes(query),
      )
      .sort((a, b) => dir * this.compare(a, b, key));
  });

  protected readonly filteredTotal = computed(() =>
    this.rows().reduce((sum, a) => sum + (a.balance ?? 0), 0),
  );

  constructor() {
    this.service.ensureLoaded();
  }

  protected sortBy(key: SortKey) {
    if (this.sortKey() === key) {
      this.sortDesc.update((d) => !d);
    } else {
      this.sortKey.set(key);
      this.sortDesc.set(key !== 'id' && key !== 'customerId');
    }
  }

  protected ariaSort(key: SortKey): 'ascending' | 'descending' | 'none' {
    if (this.sortKey() !== key) return 'none';
    return this.sortDesc() ? 'descending' : 'ascending';
  }

  protected clearFilters() {
    this.search.set('');
    this.typeFilter.set('ALL');
  }

  private compare(a: Account, b: Account, key: SortKey): number {
    const x = a[key] ?? '';
    const y = b[key] ?? '';
    if (typeof x === 'number' && typeof y === 'number') return x - y;
    return String(x).localeCompare(String(y));
  }
}
