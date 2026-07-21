import type { InputHTMLAttributes } from "react";

type TextFieldProps = {
  label: string;
  id: string;
} & InputHTMLAttributes<HTMLInputElement>;

export function TextField({ label, id, ...props }: TextFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        id={id}
        className="rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
        {...props}
      />
    </div>
  );
}
