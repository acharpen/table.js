export interface ExampleObject {
  col1: string;
  col2: string;
  col3: string;
  col4: string;
}

// ////////////////////////////////////////////////////////////////////////////

const defaultFormatter = (field: keyof ExampleObject): ((obj: ExampleObject) => string) => {
  return (obj: ExampleObject): string => obj[field];
};

// ////////////////////////////////////////////////////////////////////////////

export const columnOptions = [
  {
    align: 'left' as const,
    formatFeature: { type: 'text' as const, formatter: defaultFormatter('col1'), cache: true },
    id: 1,
    order: 1,
    pinned: 'left' as const,
    resizable: true,
    sorter: (a: ExampleObject, b: ExampleObject): number => a.col1.localeCompare(b.col1),
    title: 'col1',
    width: { value: 300, unit: 'px' as const }
  },
  {
    align: 'right' as const,
    formatFeature: { type: 'text' as const, formatter: defaultFormatter('col2'), cache: true },
    id: 2,
    order: 2,
    resizable: true,
    sorter: (a: ExampleObject, b: ExampleObject): number => a.col2.localeCompare(b.col2),
    title: 'col2',
    width: { value: 500, unit: 'px' as const }
  },
  {
    align: 'left' as const,
    formatFeature: { type: 'text' as const, formatter: defaultFormatter('col3'), cache: true },
    id: 3,
    order: 3,
    resizable: true,
    sorter: (a: ExampleObject, b: ExampleObject): number => a.col3.localeCompare(b.col3),
    title: 'col3',
    width: { value: 400, unit: 'px' as const }
  },
  {
    align: 'left' as const,
    formatFeature: { type: 'text' as const, formatter: defaultFormatter('col4'), cache: true },
    id: 4,
    order: 4,
    resizable: true,
    sorter: (a: ExampleObject, b: ExampleObject): number => a.col4.localeCompare(b.col4),
    title: 'col4',
    width: { value: 200, unit: 'px' as const }
  }
];

export const tableOptions = {
  columnMinWidth: 40,
  nodeHeight: 40,
  rowActions: [
    [{ callback: () => console.log('First Action'), label: 'First Action' }],
    [{ callback: () => console.log('Second Action'), label: 'Second Action' }]
  ],
  selectable: true,
  visibleNodes: 10
};
