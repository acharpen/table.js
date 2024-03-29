import { ColumnWidthUnit, SortOrder, TableUtils } from './table-utils';
import { Column } from './column';
import { ColumnOptions } from './column-options';
import { DomUtils } from './dom-utils';
import { Node } from './node';
import { TableOptions } from './table-options';

export abstract class AbstractTable<T> {
  private static readonly VIRTUAL_SCROLL_PADDING: number = 2;

  protected readonly containerElt: HTMLElement;
  protected readonly contentElt: HTMLElement;
  protected readonly tableBodyElt: HTMLElement;
  protected readonly tableBodyRowElts: HTMLElement[];
  protected readonly tableElt: HTMLElement;
  protected readonly tableHeaderElt: HTMLElement;
  protected readonly tableHeaderRowElt: HTMLElement;
  protected readonly viewportElt: HTMLElement;

  protected readonly options: TableOptions<T>;
  protected readonly virtualNodesCount: number;

  protected dataColumns: Column<T>[];
  protected nodes: Node<T>[];
  protected visibleNodeIndexes: number[];

  private activeNodeIndexes: number[];
  private counter: number;
  private currFilter: { matcher: (value: T) => boolean } | null;
  private currSort: { column: Column<T>; sorter: (a: T, b: T) => number; sortOrder: SortOrder } | null;
  private currStartNode: number | null;
  private prevRangeStart: number | null;
  private rowActionsButtonCellWidth: number;
  private selectedNodeIds: number[];

  protected constructor(
    containerElt: HTMLElement,
    { columnOptions, tableOptions }: { columnOptions: ColumnOptions<T>[]; tableOptions: TableOptions<T> }
  ) {
    this.containerElt = containerElt;

    this.options = tableOptions;
    this.virtualNodesCount = this.options.visibleRowsCount + AbstractTable.VIRTUAL_SCROLL_PADDING;

    this.dataColumns = this.initColumnOptions(columnOptions);
    this.nodes = [];
    this.visibleNodeIndexes = [];

    this.activeNodeIndexes = [];
    this.counter = 0;
    this.currFilter = null;
    this.currSort = null;
    this.currStartNode = null;
    this.prevRangeStart = null;
    this.rowActionsButtonCellWidth = 0;
    this.selectedNodeIds = [];

    this.tableBodyRowElts = this.createTableBodyRowElts();
    this.tableBodyElt = this.createTableBodyElt();
    this.tableHeaderRowElt = this.createTableHeaderRowElt();
    this.tableHeaderElt = this.createTableHeaderElt();
    this.viewportElt = this.createViewportElt();
    this.contentElt = this.createContentElt();
    this.tableElt = this.createTableElt();
  }

  // ////////////////////////////////////////////////////////////////////////////

  public deleteNodes(nodeIds: number[]): void {
    this.runBlockingAction(() => {
      this.nodes = this.nodes.filter((node) => !nodeIds.includes(node.id));

      this.updateNodes({ forceTableRendering: true });
    });
  }

  public deselectNodes(nodeIds: number[]): void {
    this.runBlockingAction(() => {
      if (this.isSelectionEnabled()) {
        if (nodeIds.length > 0) {
          this.deselectNodesById(nodeIds);
        } else {
          this.nodes.forEach((node) => (node.isSelected = false));
          this.selectedNodeIds = [];
        }

        this.runSelectionPostProcess();

        this.updateVisibleNodes({ force: true });
      }
    });
  }

  public filter(matcher: (value: T) => boolean): void {
    this.runBlockingAction(() => {
      this.currFilter = { matcher };

      this.updateNodes({ forceTableRendering: true, performFiltering: true });
    });
  }

  public replaceNodes(list: { newItem: T; nodeId: number }[]): void {
    this.runBlockingAction(() => {
      const listToUpdate = list
        .map((elt) => ({ newItem: elt.newItem, node: this.nodes.find((node) => node.id === elt.nodeId) }))
        .filter(({ node }) => node != null);

      listToUpdate.forEach(({ newItem, node }) => {
        (node as Node<T>).value = newItem;
      });

      if (listToUpdate.length > 0) {
        this.updateNodes({ forceTableRendering: true });
      }
    });
  }

  public selectNodes(nodeIds: number[]): void {
    this.runBlockingAction(() => {
      if (this.isSelectionEnabled()) {
        const get = (): Node<T>[] => {
          const nodes = this.getNodesById(nodeIds);

          return this.options.selectableCheck
            ? nodes.filter((node) => (this.options.selectableCheck as (item: T) => boolean)(node.value))
            : nodes;
        };
        const select = (node: Node<T>): void => {
          node.isSelected = true;
          this.selectedNodeIds.push(node.id);
        };

        if (this.options.selectable === true) {
          (nodeIds.length > 0 ? get() : this.nodes).forEach(select);
        } else {
          // I: the number of input nodes that can be selected according to 'selectableCheck' predicate
          // N: the number of selectable nodes as defined in table options
          // S: the number of selected nodes
          // M: the number of nodes that can be selected; M = N - S

          const selectable = this.options.selectable as number;

          if (nodeIds.length > 0) {
            const nodes = get();
            const nodesCount = nodes.length;

            if (this.options.selectableRollingSelection ?? false) {
              // A: the number of nodes to select; A <= N
              // Deselect the first (A - M) nodes and select A input nodes
              const selectingNodes = nodes.slice(Math.max(0, nodesCount - selectable));
              const deselectingNodesCount = Math.max(
                0,
                selectingNodes.length - (selectable - this.selectedNodeIds.length)
              );

              this.deselectNodesById(this.selectedNodeIds.slice(0, deselectingNodesCount));

              selectingNodes.forEach(select);
            } else {
              // B: the number of nodes to select; B = min(I, M)
              // Select the first B input nodes
              nodes.slice(0, Math.min(nodesCount, selectable - this.selectedNodeIds.length)).forEach(select);
            }
          } else {
            if (this.options.selectableRollingSelection ?? false) {
              // Deselect all and select the last N nodes
              this.deselectNodesById(this.selectedNodeIds);

              let i = this.nodes.length - 1;
              let remainingNodesCount = selectable;

              do {
                const node = this.nodes[i];

                if (!this.options.selectableCheck || this.options.selectableCheck(node.value)) {
                  select(node);
                  remainingNodesCount--;
                }

                i--;
              } while (remainingNodesCount > 0 && i >= 0);
            } else {
              // Select the first M nodes
              const allNodesCount = this.nodes.length;
              let i = 0;
              let remainingNodesCount = selectable - this.selectedNodeIds.length;

              while (remainingNodesCount > 0 && i < allNodesCount) {
                const node = this.nodes[i];

                if (!this.options.selectableCheck || this.options.selectableCheck(node.value)) {
                  select(node);
                  remainingNodesCount--;
                }

                i++;
              }
            }
          }
        }

        // Remove duplicates
        this.selectedNodeIds = [...new Set<number>(this.selectedNodeIds)];

        this.runSelectionPostProcess();

        this.updateVisibleNodes({ force: true });
      }
    });
  }

  public sort(columnId: number, sortOrder: SortOrder): void {
    this.runBlockingAction(() => {
      const targetColumn = this.dataColumns.find((column) => column.id === columnId);

      if (targetColumn?.sorter) {
        this.currSort =
          sortOrder === 'default' ? null : { sortOrder, column: targetColumn, sorter: targetColumn.sorter };

        this.updateNodes({ performSorting: true });
      }
    });
  }

  // ////////////////////////////////////////////////////////////////////////////

  protected createTableBodyCellElt(column: Column<T>, ctx: { nodeIndex: number }): HTMLElement {
    const elt = DomUtils.createElt('div', TableUtils.TABLE_CELL_CLS, TableUtils.getTextAlignCls(column.align));

    if (column.pinned) {
      const targetColumnIndex = this.dataColumns.findIndex((_column) => _column.id === column.id);

      elt.classList.add(TableUtils.STICKY_CLS);

      if (column.pinned === 'left') {
        if (this.dataColumns.slice(targetColumnIndex + 1).every((_column) => _column.pinned !== 'left')) {
          elt.classList.add(TableUtils.STICKY_RIGHTMOST_CLS);
        }
      } else {
        if (this.dataColumns.slice(0, targetColumnIndex).every((_column) => _column.pinned !== 'right')) {
          elt.classList.add(TableUtils.STICKY_LEFTMOST_CLS);
        }
      }
    }

    elt.appendChild(this.createTableBodyCellContentElt(column, ctx));

    return elt;
  }

  protected generateId(): number {
    return this.counter++;
  }

  protected getDataCellElts(tableRowElt: HTMLElement): HTMLElement[] {
    const elts = [];
    const startIndex = this.isSelectionEnabled() ? 1 : 0;
    const tableRowChildElts = tableRowElt.children;
    const endIndex = this.options.rowActions ? tableRowChildElts.length - 1 : tableRowChildElts.length;

    for (let i = startIndex, len = endIndex; i < len; i++) {
      elts.push(tableRowChildElts.item(i) as HTMLElement);
    }

    return elts;
  }

  protected getNodeByIndex(index: number): Node<T> {
    return this.nodes[this.visibleNodeIndexes[index]];
  }

  protected init(): void {
    this.setColumnsWidth();

    this.containerElt.appendChild(this.tableElt);

    this.rowActionsButtonCellWidth = this.computeRowActionsButtonCellWidth();

    this.setStickyColumnsPosition();
  }

  protected runBlockingAction(callback: () => void): void {
    const overlayElt = DomUtils.createElt('div', TableUtils.BLOCKING_CLS);
    const spinnerElt = DomUtils.createElt('div', TableUtils.SPINNER_CLS);

    spinnerElt.appendChild(DomUtils.createElt('div', TableUtils.SPINNER_BOUNCE1_CLS));
    spinnerElt.appendChild(DomUtils.createElt('div', TableUtils.SPINNER_BOUNCE2_CLS));
    spinnerElt.appendChild(DomUtils.createElt('div'));

    overlayElt.style.height = DomUtils.withPx(this.tableElt.offsetHeight);
    overlayElt.style.width = DomUtils.withPx(this.tableElt.offsetWidth);
    overlayElt.appendChild(spinnerElt);

    // 1. Show overlay
    this.containerElt.appendChild(overlayElt);

    // 2. Run
    callback();

    // 3. Hide overlay
    this.containerElt.removeChild(overlayElt);
  }

  protected setNodes(nodes: Node<T>[]): void {
    this.currFilter = null;
    this.currSort = null;
    this.nodes = nodes;

    this.resetColumnSortButtons();
    this.setRowHeight();

    this.updateNodes({ forceTableRendering: true });
  }

  protected updateNodes(options?: {
    forceTableRendering?: boolean;
    performFiltering?: boolean;
    performSorting?: boolean;
  }): void {
    if (options?.performFiltering ?? false) {
      this.handleFilter();
    }
    if (options?.performSorting ?? false) {
      this.nodes = this.handleSort();
    }

    if (options?.forceTableRendering ?? false) {
      this.setActiveNodeIndexes();
    }

    this.updateVisibleNodes({ force: true });
  }

  protected updateVisibleNodes({ force }: { force: boolean } = { force: false }): void {
    const startNode = Math.floor(this.tableElt.scrollTop / this.options.rowHeight);

    if (force || startNode !== this.currStartNode) {
      this.prevRangeStart = force ? null : this.currStartNode;
      this.currStartNode = startNode;
      this.visibleNodeIndexes = [];

      const visibleNodesCount = Math.min(startNode + this.virtualNodesCount, this.activeNodeIndexes.length);

      for (let i = startNode, len = visibleNodesCount; i < len; i++) {
        this.visibleNodeIndexes.push(this.activeNodeIndexes[i]);
      }

      for (let i = this.visibleNodeIndexes.length, len = this.tableBodyRowElts.length; i < len; i++) {
        this.tableBodyRowElts[i].classList.add(TableUtils.HIDDEN_CLS);
      }

      this.populateVisibleNodes();

      this.tableBodyElt.style.transform = `translateY(${startNode * this.options.rowHeight}px)`;
    }
  }

  // ////////////////////////////////////////////////////////////////////////////

  private addTooltip(elt: HTMLElement, textContent: string): void {
    elt.addEventListener('mouseenter', () => {
      const { bottom, left } = elt.getBoundingClientRect();

      const tooltipElt = DomUtils.createElt('div', TableUtils.TOOLTIP_CLS);
      tooltipElt.textContent = textContent;
      tooltipElt.style.left = DomUtils.withPx(left);
      tooltipElt.style.top = DomUtils.withPx(bottom);

      this.containerElt.appendChild(tooltipElt);
    });

    elt.addEventListener('mouseleave', () => {
      this.containerElt.removeChild(this.containerElt.lastChild as ChildNode);
    });
  }

  private computeRowActionsButtonCellWidth(): number {
    let rowActionsButtonCellWidth = 0;

    if (this.options.rowActions) {
      if (this.tableHeaderRowElt.lastElementChild?.classList.contains(TableUtils.STICKY_CLS) ?? false) {
        rowActionsButtonCellWidth = DomUtils.getComputedWidth(this.tableHeaderRowElt.lastElementChild as Element);
      }
    }

    return rowActionsButtonCellWidth;
  }

  private convertToPixel({ value, unit }: { value: number; unit: ColumnWidthUnit }): number {
    switch (unit) {
      case '%':
        return DomUtils.getComputedWidth(this.containerElt) * (value / 100);

      default:
        return value;
    }
  }

  private createContentElt(): HTMLElement {
    const elt = DomUtils.createElt('div');

    elt.appendChild(this.viewportElt);

    return elt;
  }

  private createOverlayElt({ classList, onClose }: { classList?: string[]; onClose?: () => void } = {}): HTMLElement {
    const overlayElt = DomUtils.createElt('div', TableUtils.OVERLAY_CLS, ...(classList ?? []));

    const listener = (event: Event): void => {
      this.containerElt.removeChild(overlayElt);
      this.containerElt.removeEventListener('mouseup', listener, { capture: true });
      this.containerElt.removeEventListener('scroll', listener, { capture: true });

      onClose?.();

      if (event.target && !(event.target as HTMLElement).closest(`.${TableUtils.OVERLAY_CLS}`)) {
        event.stopPropagation();
      }
    };

    this.containerElt.addEventListener('mouseup', listener, { capture: true });
    this.containerElt.addEventListener('scroll', listener, { capture: true });

    return overlayElt;
  }

  private createResizeHandleElt(ctx: { columnIndex: number }): HTMLElement {
    const elt = DomUtils.createElt('div', TableUtils.RESIZE_HANDLE_CLS);

    elt.addEventListener('mousedown', (event) => {
      event.stopPropagation();
      this.onResizeColumn(ctx.columnIndex, event);
    });

    return elt;
  }

  private createSortButtonElt(sortOrder: 'asc' | 'desc', ctx: { columnIndex: number }): HTMLElement {
    const elt = DomUtils.createElt(
      'div',
      sortOrder === 'asc' ? TableUtils.SORT_BUTTON_ASC_CLS : TableUtils.SORT_BUTTON_DESC_CLS
    );

    elt.addEventListener('mouseup', (event) => {
      event.stopPropagation();
      this.onSortTable(ctx.columnIndex, sortOrder);
    });

    elt.appendChild(DomUtils.createElt('i'));

    return elt;
  }

  private createSortButtonsElt(ctx: { columnIndex: number }): HTMLElement {
    const elt = DomUtils.createElt('div', TableUtils.SORT_BUTTONS_CLS);

    elt.appendChild(this.createSortButtonElt('asc', ctx));
    elt.appendChild(this.createSortButtonElt('desc', ctx));

    return elt;
  }

  private createTableBodyCellContentElt(column: Column<T>, ctx: { nodeIndex: number }): HTMLElement {
    const elt = DomUtils.createElt('div', TableUtils.TABLE_CELL_CONTENT_CLS);

    if (column.formatter.create) {
      elt.appendChild(column.formatter.create({ getItem: () => this.getNodeByIndex(ctx.nodeIndex).value }));
    }

    return elt;
  }

  private createTableBodyElt(): HTMLElement {
    const elt = DomUtils.createElt('div', TableUtils.TABLE_BODY_CLS);

    this.tableBodyRowElts.forEach((tableBodyRowElt) => elt.appendChild(tableBodyRowElt));

    return elt;
  }

  private createTableBodyMenuButtonElt(ctx: { nodeIndex: number }): HTMLElement {
    const elt = DomUtils.createElt('div', TableUtils.MENU_BUTTON_CLS);

    elt.addEventListener(
      'mouseup',
      (event) => {
        event.stopPropagation();
        this.onClickTableBodyRowActionsButton(ctx.nodeIndex, event);
      },
      false
    );

    elt.appendChild(DomUtils.createElt('i'));
    elt.appendChild(DomUtils.createElt('i'));
    elt.appendChild(DomUtils.createElt('i'));

    return elt;
  }

  private createTableBodyRowContextMenuElt(ctx: { nodeIndex: number }): HTMLElement {
    const elt = DomUtils.createElt('div', TableUtils.TABLE_CELL_CLS, TableUtils.TABLE_ROW_CONTEXT_MENU_CLS);

    if (this.dataColumns.every((column) => column.pinned !== 'right')) {
      elt.classList.add(TableUtils.STICKY_CLS, TableUtils.STICKY_LEFTMOST_CLS);
    }

    elt.appendChild(this.createTableBodyMenuButtonElt(ctx));

    return elt;
  }

  private createTableBodyRowElt(ctx: { nodeIndex: number }): HTMLElement {
    const elt = DomUtils.createElt('div', TableUtils.TABLE_ROW_CLS);

    elt.addEventListener('mouseup', () => this.onClickTableBodyRow(ctx.nodeIndex), false);

    if (this.isSelectionEnabled()) {
      elt.appendChild(this.createTableTickElt());
    }

    this.dataColumns.forEach((column) => elt.appendChild(this.createTableBodyCellElt(column, ctx)));

    if (this.options.rowActions) {
      elt.appendChild(this.createTableBodyRowContextMenuElt(ctx));
    }

    return elt;
  }

  private createTableBodyRowElts(): HTMLElement[] {
    return [...Array(this.virtualNodesCount).keys()].map((_, i) => this.createTableBodyRowElt({ nodeIndex: i }));
  }

  private createTableElt(): HTMLElement {
    const elt = DomUtils.createElt('div', TableUtils.TABLE_CLS);

    elt.addEventListener('scroll', () => requestAnimationFrame(() => this.updateVisibleNodes()));

    if (this.dataColumns.some((column) => column.title != null && column.title !== '')) {
      elt.appendChild(this.tableHeaderElt);
    }
    elt.appendChild(this.contentElt);

    return elt;
  }

  private createTableHeaderCellElt(column: Column<T>, ctx: { columnIndex: number }): HTMLElement {
    const elt = DomUtils.createElt('div', TableUtils.TABLE_CELL_CLS, TableUtils.getTextAlignCls(column.align));

    elt.addEventListener('mouseup', () => this.onClickTableHeaderCell(ctx.columnIndex), false);

    if (column.pinned) {
      elt.classList.add(TableUtils.STICKY_CLS);
    }

    elt.appendChild(this.createTableHeaderCellContentElt(column));

    if (column.sorter) {
      elt.appendChild(this.createSortButtonsElt(ctx));
    }

    if (column.resizable ?? false) {
      elt.appendChild(this.createResizeHandleElt(ctx));
    }

    return elt;
  }

  private createTableHeaderCellContentElt(column: Column<T>): HTMLElement {
    const elt = DomUtils.createElt('div', TableUtils.TABLE_CELL_CONTENT_CLS);

    elt.appendChild(this.createTableHeaderTitleElt(column));

    return elt;
  }

  private createTableHeaderElt(): HTMLElement {
    const elt = DomUtils.createElt('div', TableUtils.TABLE_HEADER_CLS, TableUtils.STICKY_CLS);

    elt.appendChild(this.tableHeaderRowElt);

    return elt;
  }

  private createTableHeaderRowElt(): HTMLElement {
    const elt = DomUtils.createElt('div', TableUtils.TABLE_ROW_CLS);

    if (this.isSelectionEnabled()) {
      const tickElt = this.createTableTickElt();

      if (this.options.selectable === true) {
        tickElt.addEventListener('mouseup', () => this.onClickTableHeaderTick());
      } else {
        tickElt.classList.add(TableUtils.DISABLED_CLS);
      }

      elt.appendChild(tickElt);
    }

    this.dataColumns.forEach((column, i) => elt.appendChild(this.createTableHeaderCellElt(column, { columnIndex: i })));

    if (this.options.rowActions) {
      const rowActionsButtonElt = DomUtils.createElt(
        'div',
        TableUtils.TABLE_CELL_CLS,
        TableUtils.TABLE_ROW_CONTEXT_MENU_CLS
      );

      if (this.dataColumns.every((column) => column.pinned !== 'right')) {
        rowActionsButtonElt.classList.add(TableUtils.STICKY_CLS, TableUtils.STICKY_LEFTMOST_CLS);
      }

      elt.appendChild(rowActionsButtonElt);
    }

    return elt;
  }

  private createTableHeaderTitleElt(column: Column<T>): HTMLElement {
    const elt = DomUtils.createElt('span', TableUtils.TABLE_HEADER_TITLE_CLS);
    elt.textContent = column.title ?? '';

    this.addTooltip(elt, elt.textContent);

    return elt;
  }

  private createTableTickElt(): HTMLElement {
    const elt = DomUtils.createElt('div', TableUtils.TABLE_CELL_CLS, TableUtils.TICKBOX_CLS);

    elt.appendChild(
      DomUtils.createElt('i', this.options.selectable === 1 ? TableUtils.RADIO_CLS : TableUtils.CHECKBOX_CLS)
    );

    return elt;
  }

  private createViewportElt(): HTMLElement {
    const elt = DomUtils.createElt('div');

    elt.appendChild(this.tableBodyElt);

    return elt;
  }

  private deselectNodesById(nodeIds: number[]): void {
    const nodeIdSet = new Set<number>(nodeIds);

    this.getNodesById(nodeIds).forEach((node) => (node.isSelected = false));

    this.selectedNodeIds = this.selectedNodeIds.filter((nodeId) => !nodeIdSet.has(nodeId));
  }

  private getColumnSortButtons(headerCellElt: HTMLElement): { sortAscElt: Element; sortDescElt: Element } {
    const sortButtonsElt = headerCellElt.getElementsByClassName(TableUtils.SORT_BUTTONS_CLS).item(0) as Element;

    return {
      sortAscElt: sortButtonsElt.firstElementChild as Element,
      sortDescElt: sortButtonsElt.lastElementChild as Element
    };
  }

  private getNodesById(ids: number[]): Node<T>[] {
    const idsCount = ids.length;
    const nodes = [];
    const nodesCount = this.nodes.length;

    for (let i = 0; i < nodesCount; i++) {
      const node = this.nodes[i];
      let j = 0;

      while (j < idsCount) {
        if (ids[j] === node.id) {
          nodes.push(node);
          break;
        }

        j++;
      }
    }

    return nodes;
  }

  private handleFilter(): void {
    if (this.currFilter) {
      const nodesLength = this.nodes.length;

      for (let i = nodesLength - 1; i >= 0; i--) {
        const node = this.nodes[i];

        node.isMatching = this.currFilter.matcher(node.value);

        if (!node.isMatching && !node.isLeaf) {
          let nextnodeIndex = i + 1;

          while (nextnodeIndex < nodesLength && this.nodes[nextnodeIndex].level > node.level) {
            if (this.nodes[nextnodeIndex].isMatching) {
              node.isMatching = true;
              break;
            }

            nextnodeIndex++;
          }
        }
      }
    }
  }

  private handleSort(): Node<T>[] {
    let sortedNodes: Node<T>[] = [];

    this.resetColumnSortButtons();

    if (!this.currSort) {
      sortedNodes = this.nodes.sort((a, b) => a.initialPos - b.initialPos);
    } else {
      const currSort = this.currSort;
      const orderedSort = (a: T, b: T): number => currSort.sorter(a, b) * (currSort.sortOrder === 'asc' ? 1 : -1);
      const nodesLength = this.nodes.length;
      const rootNodes = [];
      const sortedChildrenByParentNodeId = new Map<number, Node<T>[]>();

      for (let i = 0; i < nodesLength; i++) {
        const node = this.nodes[i];
        const children = [];
        let nextnodeIndex = i + 1;

        while (nextnodeIndex < nodesLength && this.nodes[nextnodeIndex].level > node.level) {
          if (this.nodes[nextnodeIndex].level === node.level + 1) {
            children.push(this.nodes[nextnodeIndex]);
          }

          nextnodeIndex++;
        }

        sortedChildrenByParentNodeId.set(
          node.id,
          children.sort((a, b) => orderedSort(a.value, b.value) * -1)
        );

        if (node.level === 0) {
          rootNodes.push(node);
        }
      }

      const stack = rootNodes.sort((a, b) => orderedSort(a.value, b.value) * -1);

      while (stack.length > 0) {
        const node = stack.pop() as Node<T>;

        sortedNodes.push(node);
        Array.prototype.push.apply(stack, sortedChildrenByParentNodeId.get(node.id) as Node<T>[]);
      }

      this.setColumnSortOrder(currSort.column, currSort.sortOrder);
    }

    return sortedNodes;
  }

  private initColumnOptions(columnOptions: ColumnOptions<T>[]): Column<T>[] {
    return columnOptions
      .map((column) => ({ ...column, sortOrder: 'default' as const }))
      .sort((a, b) => {
        if (a.pinned === 'left' && b.pinned !== 'left') {
          return -1;
        } else if (b.pinned === 'left' && a.pinned !== 'left') {
          return 1;
        }

        return a.order - b.order;
      });
  }

  private isSelectionEnabled(): boolean {
    return (
      this.options.selectable != null &&
      ((typeof this.options.selectable === 'boolean' && this.options.selectable) ||
        (typeof this.options.selectable === 'number' && this.options.selectable > 0))
    );
  }

  private onClickTableBodyRow(nodeIndex: number): void {
    const node = this.getNodeByIndex(nodeIndex);

    if (node.isSelected) {
      this.deselectNodes([node.id]);
    } else {
      this.selectNodes([node.id]);
    }
  }

  private onClickTableBodyRowActionsButton(nodeIndex: number, event: Event): void {
    if (this.options.rowActions && this.options.rowActions.length > 0) {
      const eventTarget = event.target as HTMLElement | null;
      const refButtonElt = eventTarget?.closest(`.${TableUtils.MENU_BUTTON_CLS}`);

      if (refButtonElt) {
        const listElt = DomUtils.createElt('ul');
        const node = this.getNodeByIndex(nodeIndex);
        const overlayElt = this.createOverlayElt({
          onClose: () => refButtonElt.classList.remove(TableUtils.ACTIVE_CLS)
        });

        const createRowActionsGroup = (rowActions: { callback: (item: T) => void; label: string }[]): void => {
          for (let i = 0, len = rowActions.length; i < len; i++) {
            const rowAction = rowActions[i];
            const listItemElt = DomUtils.createElt('li', TableUtils.LIST_ITEM_CLS);
            listItemElt.appendChild(document.createTextNode(rowAction.label));
            listElt.appendChild(listItemElt);

            listItemElt.addEventListener('mouseup', () => rowAction.callback(node.value));
          }
        };

        // Create overlay content
        createRowActionsGroup(this.options.rowActions[0]);
        for (let i = 1, len = this.options.rowActions.length; i < len; i++) {
          const listItemElt = DomUtils.createElt('li', TableUtils.LIST_DIVIDER_CLS);
          listElt.appendChild(listItemElt);
          const group = this.options.rowActions[i];
          createRowActionsGroup(group);
        }
        overlayElt.appendChild(listElt);

        // Set overlay position and size
        const { height, width } = DomUtils.getRenderedSize(this.containerElt, overlayElt);
        const { bottom, left, top } = refButtonElt.getBoundingClientRect();

        overlayElt.style.maxHeight = DomUtils.withPx(window.innerHeight);
        overlayElt.style.left =
          width + left + this.rowActionsButtonCellWidth <= window.innerWidth
            ? DomUtils.withPx(left + this.rowActionsButtonCellWidth)
            : DomUtils.withPx(left - width);
        overlayElt.style.top =
          top + height <= window.innerHeight ? DomUtils.withPx(top) : DomUtils.withPx(bottom - height);

        // Append overlay
        this.containerElt.appendChild(overlayElt);
        refButtonElt.classList.add(TableUtils.ACTIVE_CLS);
      }
    }
  }

  private onClickTableHeaderCell(columnIndex: number): void {
    const column = this.dataColumns[columnIndex];
    const sortOrder =
      !this.currSort || this.currSort.column.id !== column.id
        ? 'asc'
        : this.currSort.sortOrder === 'asc'
        ? 'desc'
        : 'default';

    this.sort(column.id, sortOrder);
  }

  private onClickTableHeaderTick(): void {
    if (this.selectedNodeIds.length === this.nodes.length) {
      this.deselectNodes([]);
    } else {
      this.selectNodes([]);
    }
  }

  private onResizeColumn(columnIndex: number, startEvent: MouseEvent): void {
    const headerCellElt = this.getDataCellElts(this.tableHeaderRowElt)[columnIndex];
    const originalColumnWidth = DomUtils.getComputedWidth(headerCellElt);
    const originalPageX = startEvent.pageX;
    let eventPageX: number;
    let isTicking = false;

    const updateColumnSize = (): void => {
      isTicking = false;

      const columnWidth = Math.max(this.options.columnMinWidth, originalColumnWidth + (eventPageX - originalPageX));

      this.setColumnWidth(columnIndex, columnWidth);

      this.setStickyColumnsPosition();
    };

    const requestTick = (): void => {
      if (!isTicking) {
        requestAnimationFrame(updateColumnSize);
      }

      isTicking = true;
    };

    const resize = (event: MouseEvent): void => {
      eventPageX = event.pageX;

      requestTick();
    };

    const stopResize = (stopEvent: Event): void => {
      stopEvent.stopPropagation();

      window.removeEventListener('mouseup', stopResize, true);
      window.removeEventListener('mousemove', resize);
    };

    startEvent.preventDefault();

    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResize, true);
  }

  private onSortTable(columnIndex: number, sortOrder: SortOrder): void {
    this.sort(this.dataColumns[columnIndex].id, sortOrder === this.currSort?.sortOrder ? 'default' : sortOrder);
  }

  private populateCellContent(cellElt: HTMLElement, column: Column<T>, node: Node<T>, nodeIndex: number): void {
    column.formatter.update(cellElt.lastElementChild as HTMLElement, {
      item: node.value,
      prevItem: this.prevRangeStart != null ? this.nodes[this.prevRangeStart + nodeIndex]?.value : null
    });
  }

  private populateRowContent(node: Node<T>, nodeElt: HTMLElement, nodeIndex: number): void {
    const cellElts = this.getDataCellElts(nodeElt);

    this.tableBodyRowElts[nodeIndex].classList.remove(TableUtils.HIDDEN_CLS);

    for (let j = 0, len = this.dataColumns.length; j < len; j++) {
      const cellElt = cellElts[j];
      const column = this.dataColumns[j];

      this.populateCellContent(cellElt, column, node, nodeIndex);
    }
  }

  private populateVisibleNodes(): void {
    for (let i = 0, len = this.visibleNodeIndexes.length; i < len; i++) {
      const node = this.getNodeByIndex(i);
      const nodeElt = this.tableBodyRowElts[i];

      this.populateRowContent(node, nodeElt, i);

      // Update selection
      nodeElt.classList.remove(TableUtils.SELECTED_CLS, TableUtils.UNSELECTABLE_CLS);
      if (node.isSelected) {
        nodeElt.classList.add(TableUtils.SELECTED_CLS);
      }
      if (this.options.selectableCheck?.(node.value) === false) {
        nodeElt.classList.add(TableUtils.UNSELECTABLE_CLS);
      }
    }
  }

  private resetColumnSortButtons(): void {
    this.dataColumns.forEach((column, i) => {
      if (column.sorter) {
        const headerCellElt = this.getDataCellElts(this.tableHeaderRowElt)[i];
        const { sortAscElt, sortDescElt } = this.getColumnSortButtons(headerCellElt);
        sortAscElt.classList.remove(TableUtils.ACTIVE_CLS);
        sortDescElt.classList.remove(TableUtils.ACTIVE_CLS);
      }
    });
  }

  private runSelectionPostProcess(): void {
    const areAllRowsSelected = this.selectedNodeIds.length === this.nodes.length;
    const areSomeRowsSelected = !areAllRowsSelected && this.selectedNodeIds.length > 0;

    this.tableHeaderRowElt.classList.remove(TableUtils.PARTIALLY_SELECTED_CLS, TableUtils.SELECTED_CLS);
    if (areAllRowsSelected) {
      this.tableHeaderRowElt.classList.add(TableUtils.SELECTED_CLS);
    }
    if (areSomeRowsSelected) {
      this.tableHeaderRowElt.classList.add(TableUtils.PARTIALLY_SELECTED_CLS);
    }
  }

  private setActiveNodeIndexes(): void {
    this.activeNodeIndexes = [];

    this.nodes.forEach((node, i) => {
      if (node.isMatching && !node.isHidden) {
        this.activeNodeIndexes.push(i);
      }
    });

    this.updateTableElements();
  }

  private setColumnSortOrder(targetColumn: Column<T>, sortOrder: SortOrder): void {
    const targetColumnIndex = this.dataColumns.findIndex((column) => column.id === targetColumn.id);
    const headerCellElt = this.getDataCellElts(this.tableHeaderRowElt)[targetColumnIndex];
    const { sortAscElt, sortDescElt } = this.getColumnSortButtons(headerCellElt);

    targetColumn.sortOrder = sortOrder;

    if (sortOrder === 'asc') {
      sortAscElt.classList.add(TableUtils.ACTIVE_CLS);
    } else if (sortOrder === 'desc') {
      sortDescElt.classList.add(TableUtils.ACTIVE_CLS);
    }
  }

  private setColumnsWidth(): void {
    const columnsWidths: number[] = [];

    // Handle columns with explicit width
    this.dataColumns.forEach((column, i) => {
      if (column.width) {
        columnsWidths.splice(i, 0, this.convertToPixel(column.width));
      }
    });

    // Handle columns without explicit width
    const otherColumnsCount = this.dataColumns.filter((column) => !column.width).length;

    if (otherColumnsCount > 0) {
      const remainingWidth =
        DomUtils.getComputedWidth(this.containerElt) - columnsWidths.reduce((acc, x) => acc + x, 0);

      if (remainingWidth > 0) {
        const columnWidth = remainingWidth / otherColumnsCount;

        this.dataColumns.forEach((column, i) => {
          if (!column.width) {
            columnsWidths.splice(i, 0, columnWidth);
          }
        });
      }
    }

    columnsWidths.forEach((width, i) => this.setColumnWidth(i, width));
  }

  private setColumnWidth(columnIndex: number, width: number): void {
    const widthPx = DomUtils.withPx(width);

    this.getDataCellElts(this.tableHeaderRowElt)[columnIndex].style.width = widthPx;
    for (let i = 0, len = this.tableBodyRowElts.length; i < len; i++) {
      this.getDataCellElts(this.tableBodyRowElts[i])[columnIndex].style.width = widthPx;
    }
  }

  private setRowHeight(): void {
    const rowHeightPx = DomUtils.withPx(this.options.rowHeight);
    this.tableBodyRowElts.forEach((elt) => (elt.style.height = rowHeightPx));
  }

  private setStickyColumnsPosition(): void {
    const tableHeaderCellElts = this.getDataCellElts(this.tableHeaderRowElt);

    const stickyDataColumnsWidth = [];
    for (let i = 0, dataColumnsLen = this.dataColumns.length; i < dataColumnsLen; i++) {
      stickyDataColumnsWidth.push(this.dataColumns[i].pinned ? DomUtils.getWidth(tableHeaderCellElts[i]) : 0);
    }
    const stickyDataColumnsWidthLen = stickyDataColumnsWidth.length;

    for (let i = 0, tableHeaderCellEltsLen = tableHeaderCellElts.length; i < tableHeaderCellEltsLen; i++) {
      const column = this.dataColumns[i];
      const tableHeaderCellElt = tableHeaderCellElts[i];

      if (column.pinned === 'left') {
        let offset = 0;
        for (let j = 0; j < i; j++) {
          offset += stickyDataColumnsWidth[j];
        }
        const offsetPx = DomUtils.withPx(offset);

        tableHeaderCellElt.style.left = offsetPx;
        for (let j = 0, tableBodyRowEltsLen = this.tableBodyRowElts.length; j < tableBodyRowEltsLen; j++) {
          this.getDataCellElts(this.tableBodyRowElts[j])[i].style.left = offsetPx;
        }
      } else if (column.pinned === 'right') {
        let offset = this.rowActionsButtonCellWidth;
        for (let j = i + 1; j < stickyDataColumnsWidthLen; j++) {
          offset += stickyDataColumnsWidth[j];
        }
        const offsetPx = DomUtils.withPx(offset);

        tableHeaderCellElt.style.right = offsetPx;
        for (let j = 0, tableBodyRowEltsLen = this.tableBodyRowElts.length; j < tableBodyRowEltsLen; j++) {
          this.getDataCellElts(this.tableBodyRowElts[j])[i].style.right = offsetPx;
        }
      }
    }
  }

  private updateTableElements(): void {
    const rowHeight = this.options.rowHeight;

    const contentHeight = Math.min(this.activeNodeIndexes.length, this.options.visibleRowsCount) * rowHeight;
    this.contentElt.style.height = DomUtils.withPx(contentHeight);

    const viewportHeight = this.activeNodeIndexes.length * rowHeight;
    this.viewportElt.style.height = DomUtils.withPx(viewportHeight);
  }
}
