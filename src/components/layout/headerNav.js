import {
  AreasPanel,
  BuyPanel,
  SellPanel,
} from "@/components/layout/HeaderMenus";

/** The one panel every menu fills, named so a trigger can point at it. */
export const PANEL_ID = "header-menu-panel";

/**
 * The nav, in the order a buyer or a seller meets it rather than the order the
 * routes are filed in. `matchPath` marks the trigger while a visitor is
 * somewhere under it.
 */
export const menus = [
  { key: "buy", label: "Buy", matchPath: "/listings", Panel: BuyPanel },
  { key: "sell", label: "Sell", Panel: SellPanel },
  { key: "areas", label: "Areas", matchPath: "/areas", Panel: AreasPanel },
];
