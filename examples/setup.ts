export type ExampleObject = {
  col1: string;
  col2: string;
  col3: string;
  col4: string;
};

// ////////////////////////////////////////////////////////////////////////////

const createLinkElt = ({ getItem }: { getItem: () => ExampleObject }): DocumentFragment => {
  const elt = document.createElement('a');
  elt.addEventListener('mouseup', (event) => {
    event.stopPropagation();

    console.log(getItem());
  });

  const fragment = document.createDocumentFragment();
  fragment.appendChild(elt);

  return fragment;
};

const updateLinkElt = (
  field: keyof ExampleObject
): ((elt: Element, { item, prevItem }: { item: ExampleObject; prevItem: ExampleObject | null }) => void) => {
  return (elt: Element, { item, prevItem }: { item: ExampleObject; prevItem: ExampleObject | null }): void => {
    const displayedValue = item[field];
    const prevDisplayedValue = prevItem?.[field];

    if (displayedValue !== prevDisplayedValue) elt.firstElementChild.textContent = displayedValue;
  };
};

const updateTextElt = (
  field: keyof ExampleObject
): ((elt: Element, { item, prevItem }: { item: ExampleObject; prevItem: ExampleObject | null }) => void) => {
  return (elt: Element, { item, prevItem }: { item: ExampleObject; prevItem: ExampleObject | null }): void => {
    const displayedValue = item[field];
    const prevDisplayedValue = prevItem?.[field];

    if (displayedValue !== prevDisplayedValue) elt.textContent = displayedValue;
  };
};

// ////////////////////////////////////////////////////////////////////////////

export const columnOptions = [
  {
    align: 'left' as const,
    formatter: { create: createLinkElt, update: updateLinkElt('col1') },
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
    formatter: { update: updateTextElt('col2') },
    id: 2,
    order: 2,
    resizable: true,
    sorter: (a: ExampleObject, b: ExampleObject): number => a.col2.localeCompare(b.col2),
    title: 'col2',
    width: { value: 500, unit: 'px' as const }
  },
  {
    align: 'left' as const,
    formatter: { update: updateTextElt('col3') },
    id: 3,
    order: 3,
    resizable: true,
    sorter: (a: ExampleObject, b: ExampleObject): number => a.col3.localeCompare(b.col3),
    title: 'col3',
    width: { value: 400, unit: 'px' as const }
  },
  {
    align: 'left' as const,
    formatter: { update: updateTextElt('col4') },
    id: 4,
    order: 4,
    resizable: true,
    sorter: (a: ExampleObject, b: ExampleObject): number => a.col4.localeCompare(b.col4),
    title: 'col4',
    width: { value: 200, unit: 'px' as const }
  }
];

export const tableOptions = {
  classList: ['oo-table-line-divisions'],
  columnMinWidth: 40,
  nodeHeight: 40,
  rowActions: [
    [{ callback: () => console.log('First Action'), label: 'First Action' }],
    [{ callback: () => console.log('Second Action'), label: 'Second Action' }]
  ],
  selectable: true,
  visibleNodes: 10
};
