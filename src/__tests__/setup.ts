export interface TestObject {
  col1?: string;
  col2?: string;
  col3?: string;
  col4?: string;
}

// ////////////////////////////////////////////////////////////////////////////

export const updateTextElt = (
  field: keyof TestObject
): ((elt: HTMLElement, { item }: { item: TestObject }) => void) => {
  return (elt: HTMLElement, { item }: { item: TestObject }): void => {
    elt.textContent = item[field] ?? '';
  };
};
