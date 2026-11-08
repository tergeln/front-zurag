"use client";

import type { ButtonHTMLAttributes } from "react";

/** A submit button that asks "are you sure?" first. Cancelling stops the submit. */
export function ConfirmButton({ message, onClick, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { message: string }) {
  return (
    <button
      type="submit"
      {...props}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
        else onClick?.(e);
      }}
    />
  );
}
