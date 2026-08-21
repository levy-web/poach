export type NavItem = {
  label: string;
  href: string;
  icon: string;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Overview", href: "/", icon: "dashboard" },
  { label: "Users", href: "/users", icon: "group" },
  { label: "Vendors", href: "/vendors", icon: "storefront" },
  { label: "Orders", href: "/orders", icon: "shopping_cart" },
  { label: "Runners", href: "/runners", icon: "delivery_dining" },
  { label: "Transactions", href: "/transactions", icon: "payments" },
];

export const FOOTER_NAV_ITEMS: NavItem[] = [
  { label: "Settings", href: "/settings", icon: "settings" },
  { label: "Logout", href: "/logout", icon: "logout" },
];
