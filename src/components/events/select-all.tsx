"use client";

/** Header checkbox that toggles every photo checkbox in the same form. */
export function SelectAll({ label }: { label: string }) {
  return (
    <input
      type="checkbox"
      aria-label={label}
      className="size-4 accent-zinc-900"
      onChange={(e) => {
        e.currentTarget.form?.querySelectorAll<HTMLInputElement>('input[name="photoIds"]').forEach((box) => {
          box.checked = e.currentTarget.checked;
        });
      }}
    />
  );
}
