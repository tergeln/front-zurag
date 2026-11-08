// The studio menu lives in the site header (one bar). Each studio page checks requireApprovedPhotographer() itself.
export default function StudioLayout({ children }: LayoutProps<"/[locale]/photographer">) {
  return children;
}
