export type TableOptions<T> = {
  columnMinWidth: number;
  rowHeight: number;
  visibleRowsCount: number;

  rowActions?: { callback: (item: T) => void; label: string }[][];
  selectable?: boolean | number;
  selectableCheck?: (item: T) => boolean;
  selectableRollingSelection?: boolean;
};

export type ListTableOptions<T> = TableOptions<T>;

export type TreeTableOptions<T> = TableOptions<T> & { childNodeOffset: number };
