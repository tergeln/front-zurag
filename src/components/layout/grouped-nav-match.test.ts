import { describe, expect, it } from "vitest";
import { activeNav, type NavGroup } from "./grouped-nav-match";

const groups: NavGroup[] = [
  { label: "Overview", items: [{ href: "/mn/admin", label: "Overview" }] },
  { label: "Content", items: [{ href: "/mn/admin/events", label: "Events" }, { href: "/mn/admin/photos", label: "Photos" }] },
  { label: "Sales", items: [{ href: "/mn/admin/orders", label: "Orders" }] },
];

describe("activeNav", () => {
  it("highlights the overview only on the dashboard root", () => {
    expect(activeNav(groups, "/mn/admin").current.label).toBe("Overview");
    expect(activeNav(groups, "/mn/admin/photos").current.label).toBe("Content");
  });
  it("keeps the section highlighted on detail pages", () => {
    const nav = activeNav(groups, "/mn/admin/events/123");
    expect(nav.current.label).toBe("Content");
    expect(nav.isActive("/mn/admin/events")).toBe(true);
    expect(nav.isActive("/mn/admin/photos")).toBe(false);
    expect(activeNav(groups, "/mn/admin/orders/9").current.label).toBe("Sales");
  });
  it("does not confuse pages that only share a prefix", () => {
    expect(activeNav(groups, "/mn/admin/eventsx").current.label).toBe("Overview");
  });
});
