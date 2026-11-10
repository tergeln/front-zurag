import type { ReactNode } from "react";

export function DesignIcon({
  name,
  size = 20,
}: {
  name: "arrow" | "camera" | "check" | "lock" | "search" | "sparkle" | "upload" | "x";
  size?: number;
}) {
  const paths: Record<string, ReactNode> = {
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),
    camera: (
      <>
        <path d="M14.5 4 16 7h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3l1.5-3h5Z" />
        <circle cx="12" cy="13" r="3" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    lock: (
      <>
        <rect width="14" height="11" x="5" y="10" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    sparkle: (
      <>
        <path d="m12 3-1.2 3.1a7 7 0 0 1-4 4L4 11.2l2.8 1.1a7 7 0 0 1 4 4L12 20l1.2-3.7a7 7 0 0 1 4-4l2.8-1.1-2.8-1.1a7 7 0 0 1-4-4L12 3Z" />
      </>
    ),
    upload: (
      <>
        <path d="M12 16V4" />
        <path d="m7 9 5-5 5 5" />
        <path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
      </>
    ),
    x: (
      <>
        <path d="m6 6 12 12" />
        <path d="m18 6-12 12" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

