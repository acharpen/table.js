import { ColumnWidthUnit } from './table-utils';

type ColumnFormatter<T> =
  | { type: 'link'; formatter: (item: T) => string; cache: boolean; callback: (item: T) => void }
  | { type: 'text'; formatter: (item: T) => string; cache: boolean }
  | { type: 'html'; formatter: (item: T) => DocumentFragment };

export interface ColumnOptions<T> {
  align: 'center' | 'left' | 'right';
  formatFeature: ColumnFormatter<T>;
  id: number;
  order: number;

  cellColor?: (item: T) => { backgroundColor?: string; color?: string } | null;
  classList?: string[];
  pinned?: 'left' | 'right';
  resizable?: boolean;
  sorter?: (a: T, b: T) => number;
  title?: string;
  width?: { value: number; unit: ColumnWidthUnit };
}
