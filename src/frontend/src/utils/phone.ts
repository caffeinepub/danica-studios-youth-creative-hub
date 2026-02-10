export const DEFAULT_COUNTRY_CODE = '+263';

export function prefillPhoneIfEmpty(currentValue: string): string {
  if (!currentValue || currentValue.trim() === '') {
    return DEFAULT_COUNTRY_CODE + ' ';
  }
  return currentValue;
}

export function getPhonePlaceholder(): string {
  return `${DEFAULT_COUNTRY_CODE} XX XXX XXXX`;
}
