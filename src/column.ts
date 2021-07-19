import { ColumnOptions } from './column-options';
import { SortOrder } from './table-utils';

export type Column<T> = ColumnOptions<T> & { sortOrder: SortOrder };

export type ColumnView<T> = Pick<Column<T>, 'id' | 'sortOrder'>;
