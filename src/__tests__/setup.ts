export interface TestObject {
  col1?: string;
  col2?: string;
  col3?: string;
  col4?: string;
}

// ////////////////////////////////////////////////////////////////////////////

export const updateTextElt = (
  field: keyof TestObject
): ((elt: HTMLElement, { getItem }: { getItem: () => TestObject }) => void) => {
  return (elt: HTMLElement, { getItem }: { getItem: () => TestObject }): void => {
    elt.textContent = getItem()[field] ?? '';
  };
};
