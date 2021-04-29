import { ColumnWidthUnit } from './table-utils';

export interface ColumnOptions<T> {
  align: 'center' | 'left' | 'right';
  formatter: {
    create?: ({ getItem }: { getItem: () => T }) => HTMLElement;
    update: (elt: HTMLElement, { getItem }: { getItem: () => T }) => void;
  };
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
