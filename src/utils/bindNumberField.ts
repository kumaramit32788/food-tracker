import type { ChangeEvent } from 'react';
import type { ControllerRenderProps, FieldValues, Path } from 'react-hook-form';

export type NumberFormValue = number | '';

export function toNumberInputValue(value: number | NumberFormValue | undefined): string | number {
  return value === '' || value === undefined ? '' : value;
}

export function parseNumberInputValue(raw: string): NumberFormValue {
  if (raw === '') {
    return '';
  }
  const parsed = Number(raw);
  return Number.isNaN(parsed) ? '' : parsed;
}

export function coerceNumberValue(value: NumberFormValue, fallback = 0): number {
  return value === '' ? fallback : value;
}

export function isPositiveNumber(value: NumberFormValue): value is number {
  return typeof value === 'number' && value > 0;
}

export function bindNumberInputState(
  value: NumberFormValue,
  onChange: (value: NumberFormValue) => void,
) {
  return {
    type: 'number' as const,
    value: toNumberInputValue(value),
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange(parseNumberInputValue(event.target.value));
    },
  };
}

export function bindNumberField<T extends FieldValues>(
  field: ControllerRenderProps<T, Path<T>>,
) {
  return {
    ...field,
    type: 'number' as const,
    value: toNumberInputValue(field.value as number | NumberFormValue | undefined),
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      field.onChange(parseNumberInputValue(event.target.value));
    },
  };
}
