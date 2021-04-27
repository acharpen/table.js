import { ColumnOptions } from './column-options';
import { SortOrder } from './table-utils';

export interface Column<T> extends ColumnOptions<T> {
  cache: { displayedValues: Map<number, string> };
  sortOrder: SortOrder;
}

export type ColumnView<T> = Pick<Column<T>, 'id' | 'sortOrder'>;
