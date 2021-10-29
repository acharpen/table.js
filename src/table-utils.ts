export type ColumnWidthUnit = 'px' | '%';

export type SortOrder = 'asc' | 'default' | 'desc';

export class TableUtils {
  public static readonly VENDOR_CLS = 'oo-table';

  public static readonly ACTIVE_CLS = `${TableUtils.VENDOR_CLS}-active`;
  public static readonly BLOCKING_CLS = `${TableUtils.VENDOR_CLS}-blocking`;
  public static readonly CHECKBOX_CLS = `${TableUtils.VENDOR_CLS}-checkbox`;
  public static readonly CONDENSED_CLS = `${TableUtils.VENDOR_CLS}-condensed`;
  public static readonly DISABLED_CLS = `${TableUtils.VENDOR_CLS}-disabled`;
  public static readonly EXPAND_TOGGLER_CLS = `${TableUtils.VENDOR_CLS}-expand-toggler`;
  public static readonly HIDDEN_CLS = `${TableUtils.VENDOR_CLS}-hidden`;
  public static readonly LIST_DIVIDER_CLS = `${TableUtils.VENDOR_CLS}-list-divider`;
  public static readonly LIST_ITEM_CLS = `${TableUtils.VENDOR_CLS}-list-item`;
  public static readonly MENU_BUTTON_CLS = `${TableUtils.VENDOR_CLS}-menu-btn`;
  public static readonly OVERLAY_CLS = `${TableUtils.VENDOR_CLS}-overlay`;
  public static readonly PARTIALLY_SELECTED_CLS = `${TableUtils.VENDOR_CLS}-partially-selected`;
  public static readonly RADIO_CLS = `${TableUtils.VENDOR_CLS}-radio`;
  public static readonly REGULAR_CLS = `${TableUtils.VENDOR_CLS}-regular`;
  public static readonly RELAXED_CLS = `${TableUtils.VENDOR_CLS}-relaxed`;
  public static readonly RESIZE_HANDLE_CLS = `${TableUtils.VENDOR_CLS}-resize-handle`;
  public static readonly SELECTED_CLS = `${TableUtils.VENDOR_CLS}-selected`;
  public static readonly SORT_BUTTON_ASC_CLS = `${TableUtils.VENDOR_CLS}-sort-btn-asc`;
  public static readonly SORT_BUTTON_DESC_CLS = `${TableUtils.VENDOR_CLS}-sort-btn-desc`;
  public static readonly SORT_BUTTONS_CLS = `${TableUtils.VENDOR_CLS}-sort-btns`;
  public static readonly SPACER_CLS = `${TableUtils.VENDOR_CLS}-spacer`;
  public static readonly SPINNER_BOUNCE1_CLS = `${TableUtils.VENDOR_CLS}-spinner-bounce1`;
  public static readonly SPINNER_BOUNCE2_CLS = `${TableUtils.VENDOR_CLS}-spinner-bounce2`;
  public static readonly SPINNER_CLS = `${TableUtils.VENDOR_CLS}-spinner`;
  public static readonly STICKY_CLS = `${TableUtils.VENDOR_CLS}-sticky`;
  public static readonly STICKY_LEFTMOST_CLS = `${TableUtils.VENDOR_CLS}-sticky-leftmost`;
  public static readonly STICKY_RIGHTMOST_CLS = `${TableUtils.VENDOR_CLS}-sticky-rightmost`;
  public static readonly TABLE_BODY_CLS = `${TableUtils.VENDOR_CLS}-body`;
  public static readonly TABLE_CELL_CLS = `${TableUtils.VENDOR_CLS}-cell`;
  public static readonly TABLE_CELL_CONTENT_CLS = `${TableUtils.VENDOR_CLS}-cell-content`;
  public static readonly TABLE_CLS = TableUtils.VENDOR_CLS;
  public static readonly TABLE_HEADER_CLS = `${TableUtils.VENDOR_CLS}-header`;
  public static readonly TABLE_HEADER_TITLE_CLS = `${TableUtils.VENDOR_CLS}-header-title`;
  public static readonly TABLE_ROW_CONTEXT_MENU_CLS = `${TableUtils.VENDOR_CLS}-row-context-menu`;
  public static readonly TABLE_ROW_HEIGHT_OPTS_CLS = `${TableUtils.VENDOR_CLS}-row-height-opts`;
  public static readonly TABLE_ROW_CLS = `${TableUtils.VENDOR_CLS}-row`;
  public static readonly TICKBOX_CLS = `${TableUtils.VENDOR_CLS}-tickbox`;
  public static readonly TOOLTIP_CLS = `${TableUtils.VENDOR_CLS}-tooltip`;
  public static readonly UNSELECTABLE_CLS = `${TableUtils.VENDOR_CLS}-unselectable`;

  public static getTextAlignCls(align: string): string {
    return `${TableUtils.VENDOR_CLS}-text-${align}`;
  }
}
