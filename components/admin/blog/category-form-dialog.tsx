"use client";

import { useActionState, useEffect, useRef, type ReactNode } from "react";
import { toast } from "sonner";

import { DialogTrigger } from "@/components/ui/dialog-trigger";
import { TextField } from "@/components/ui/text-field";
import {
  createCategory,
  updateCategory,
  type CategoryActionState,
} from "@/lib/blog/categories/actions";
import type { BlogCategory } from "@/lib/blog/types";

const initialState: CategoryActionState = {};

export function CategoryFormDialog({
  category,
  trigger,
}: {
  category?: BlogCategory;
  trigger: ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const action = category ? updateCategory : createCategory;
  const [state, formAction, pending] = useActionState(action, initialState);
  const fieldId = category?.id ?? "new";

  useEffect(() => {
    if (state.success) {
      dialogRef.current?.close();
      toast.success(category ? "Category updated." : "Category created.");
    }
  }, [state.success, category]);

  return (
    <>
      <DialogTrigger onOpen={() => dialogRef.current?.showModal()}>
        {trigger}
      </DialogTrigger>
      <dialog
        ref={dialogRef}
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current?.close();
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-border bg-floating p-0 text-foreground shadow-floating backdrop:bg-foreground/40 backdrop:backdrop-blur-sm"
      >
        <form action={formAction} className="flex flex-col gap-4 p-6">
          <h2 className="font-display text-lg font-semibold tracking-[-0.01em] text-foreground">
            {category ? "Edit category" : "New category"}
          </h2>

          {category ? <input type="hidden" name="id" value={category.id} /> : null}

          <TextField
            label="Name"
            id={`category-name-${fieldId}`}
            name="name"
            defaultValue={category?.name}
            required
            maxLength={80}
          />
          <TextField
            label="Slug (optional — generated from the name if left blank)"
            id={`category-slug-${fieldId}`}
            name="slug"
            defaultValue={category?.slug}
            maxLength={80}
          />
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={`category-description-${fieldId}`}
              className="text-sm font-medium text-foreground"
            >
              Description
            </label>
            <textarea
              id={`category-description-${fieldId}`}
              name="description"
              defaultValue={category?.description ?? ""}
              rows={3}
              maxLength={300}
              className="rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
            />
          </div>

          {state.error ? (
            <p
              role="alert"
              className="rounded-lg border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger"
            >
              {state.error}
            </p>
          ) : null}

          <div className="flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-transform duration-200 ease-spring hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-brand transition-transform duration-200 ease-spring hover:-translate-y-0.5 hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
            >
              {pending ? "Saving…" : category ? "Save changes" : "Create category"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
