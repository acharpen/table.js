export type ColumnWidthUnit = 'px' | '%';

export type SortOrder = 'asc' | 'default' | 'desc';

export class TableUtils {
  public static readonly VENDOR_CLS: string = 'oo-table';

  public static readonly ACTIVE_CLS: string = `${TableUtils.VENDOR_CLS}-active`;
  public static readonly BLOCKING_CLS: string = `${TableUtils.VENDOR_CLS}-blocking`;
  public static readonly EXPAND_TOGGLER_CLS: string = `${TableUtils.VENDOR_CLS}-expand-toggler`;
  public static readonly HIDDEN_CLS: string = `${TableUtils.VENDOR_CLS}-hidden`;
  public static readonly LIST_DIVIDER_CLS: string = `${TableUtils.VENDOR_CLS}-list-divider`;
  public static readonly LIST_ITEM_CLS: string = `${TableUtils.VENDOR_CLS}-list-item`;
  public static readonly OVERLAY_CLS: string = `${TableUtils.VENDOR_CLS}-overlay`;
  public static readonly RESIZE_HANDLE_CLS: string = `${TableUtils.VENDOR_CLS}-resize-handle`;
  public static readonly SELECTED_CLS: string = `${TableUtils.VENDOR_CLS}-selected`;
  public static readonly SELECTION_ALL_CLS: string = `${TableUtils.VENDOR_CLS}-selection-all`;
  public static readonly SELECTION_MULTIPLE_CLS: string = `${TableUtils.VENDOR_CLS}-selection-multiple`;
  public static readonly SELECTION_SINGLE_CLS: string = `${TableUtils.VENDOR_CLS}-selection-single`;
  public static readonly SORT_ASC_HANDLE_CLS: string = `${TableUtils.VENDOR_CLS}-sort-asc-handle`;
  public static readonly SORT_DESC_HANDLE_CLS: string = `${TableUtils.VENDOR_CLS}-sort-desc-handle`;
  public static readonly SORT_HANDLE_CLS: string = `${TableUtils.VENDOR_CLS}-sort-handle`;
  public static readonly SPINNER_BOUNCE1_CLS: string = `${TableUtils.VENDOR_CLS}-spinner-bounce1`;
  public static readonly SPINNER_BOUNCE2_CLS: string = `${TableUtils.VENDOR_CLS}-spinner-bounce2`;
  public static readonly SPINNER_CLS: string = `${TableUtils.VENDOR_CLS}-spinner`;
  public static readonly STICKY_CLS: string = `${TableUtils.VENDOR_CLS}-sticky`;
  public static readonly STICKY_LEFTMOST_CLS: string = `${TableUtils.VENDOR_CLS}-sticky-leftmost`;
  public static readonly STICKY_RIGHTMOST_CLS: string = `${TableUtils.VENDOR_CLS}-sticky-rightmost`;
  public static readonly TABLE_BODY_CLS: string = `${TableUtils.VENDOR_CLS}-body`;
  public static readonly TABLE_CELL_CLS: string = `${TableUtils.VENDOR_CLS}-cell`;
  public static readonly TABLE_CELL_CONTENT_CLS: string = `${TableUtils.VENDOR_CLS}-cell-content`;
  public static readonly TABLE_CELL_TICK_CLS: string = `${TableUtils.VENDOR_CLS}-cell-tick`;
  public static readonly TABLE_CLS: string = TableUtils.VENDOR_CLS;
  public static readonly TABLE_HEADER_CLS: string = `${TableUtils.VENDOR_CLS}-header`;
  public static readonly TABLE_HEADER_TITLE_CLS: string = `${TableUtils.VENDOR_CLS}-header-title`;
  public static readonly TABLE_ROW_ACTIONS_HANDLE_CLS: string = `${TableUtils.VENDOR_CLS}-row-actions-handle`;
  public static readonly TABLE_ROW_CLS: string = `${TableUtils.VENDOR_CLS}-row`;
  public static readonly UNSELECTABLE_CLS: string = `${TableUtils.VENDOR_CLS}-unselectable`;
  public static readonly VIRTUAL_SCROLL_SPACER_CLS: string = `${TableUtils.VENDOR_CLS}-virtual-scroll-spacer`;

  public static getTextAlignCls(align: string): string {
    return `${TableUtils.VENDOR_CLS}-text-${align}`;
  }
}
