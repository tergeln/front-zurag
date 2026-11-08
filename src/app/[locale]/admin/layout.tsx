// The admin menu lives in the site header (one bar). Each admin page checks requireRole('admin') itself.
export default function AdminLayout({ children }: LayoutProps<"/[locale]/admin">) {
  return children;
}
