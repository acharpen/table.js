export interface TableOptions<T> {
  columnMinWidth: number;
  nodeHeight: number;
  visibleNodes: number;

  classList?: string[];
  rowActions?: { callback: (item: T) => void; label: string }[][];
  rowClassList?: (item: T, rowIndex: number) => string[];
  selectable?: boolean | number;
}

export type ListTableOptions<T> = TableOptions<T>;

export interface TreeTableOptions<T> extends TableOptions<T> {
  childNodeOffset: number;
}
