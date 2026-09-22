import { Pipe, PipeTransform } from '@angular/core';

/** "CURRENT-ACCOUNT" -> "Current account" */
@Pipe({ name: 'accountType' })
export class AccountTypePipe implements PipeTransform {
  transform(value: string | undefined | null): string {
    if (!value) return 'Unknown';
    const text = value.replace(/[-_]+/g, ' ').toLowerCase();
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
}

export function isSaving(type: string | undefined | null): boolean {
  return !!type && type.toUpperCase().includes('SAVING');
}
