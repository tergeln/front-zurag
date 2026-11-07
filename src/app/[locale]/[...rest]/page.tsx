import { notFound } from "next/navigation";

// Any unknown address under /mn/... or /en/... shows the site's own 404 page.
export default function CatchAll() {
  notFound();
}
