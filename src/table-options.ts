export type TableOptions<T> = {
  columnMinWidth: number;
  visibleNodes: number;

  classList?: string[];
  rowActions?: { callback: (item: T) => void; label: string }[][];
  rowClassList?: (item: T, rowIndex: number) => string[];
  selectable?: boolean | number;
  selectableCheck?: (item: T) => boolean;
  selectableRollingSelection?: boolean;
};

export type ListTableOptions<T> = TableOptions<T>;

export type TreeTableOptions<T> = TableOptions<T> & { childNodeOffset: number };
