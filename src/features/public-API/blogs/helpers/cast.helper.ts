interface ToNumberOptions {
  default?: number;
  min?: number;
  max?: number;
}
interface ToArrayOptions {
  default?: string[];
}

export function toNumber(value: string, opts: ToNumberOptions = {}): number {
  let newValue: number = Number.parseInt(value || String(opts.default), 10);

  if (Number.isNaN(newValue)) {
    newValue = opts.default;
  }

  if (opts.min) {
    if (newValue < opts.min) {
      newValue = opts.min;
    }

    if (newValue > opts.max) {
      newValue = opts.max;
    }
  }

  return newValue;
}

export function toArray(
  value: string | string[],
  opts: ToArrayOptions,
): string[] {
  let newValue: string[];

  if (typeof value === 'string') newValue = [value];

  if (value === undefined) {
    newValue = opts.default;
  }

  return newValue;
}
