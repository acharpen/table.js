import { ColumnWidthUnit } from './table-utils';

export type ColumnOptions<T> = {
  align: 'center' | 'left' | 'right';
  formatter: {
    create?: ({ getItem }: { getItem: () => T }) => DocumentFragment;
    update: (elt: HTMLElement, { item, prevItem }: { item: T; prevItem: T | null }) => void;
  };
  id: number;
  order: number;

  cellClassList?: (item: T, rowIndex: number) => string[];
  pinned?: 'left' | 'right';
  resizable?: boolean;
  sorter?: (a: T, b: T) => number;
  title?: string;
  width?: { value: number; unit: ColumnWidthUnit };
};
