"use client";

import { useActionState, useEffect, useRef, type ReactNode } from "react";
import { toast } from "sonner";

import { DialogTrigger } from "@/components/ui/dialog-trigger";
import { TextField } from "@/components/ui/text-field";
import { createTag, updateTag, type TagActionState } from "@/lib/blog/tags/actions";
import type { BlogTag } from "@/lib/blog/types";

const initialState: TagActionState = {};

export function TagFormDialog({
  tag,
  trigger,
}: {
  tag?: BlogTag;
  trigger: ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const action = tag ? updateTag : createTag;
  const [state, formAction, pending] = useActionState(action, initialState);
  const fieldId = tag?.id ?? "new";

  useEffect(() => {
    if (state.success) {
      dialogRef.current?.close();
      toast.success(tag ? "Tag updated." : "Tag created.");
    }
  }, [state.success, tag]);

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
        className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-xl border border-border bg-floating p-0 text-foreground shadow-floating backdrop:bg-foreground/40 backdrop:backdrop-blur-sm"
      >
        <form action={formAction} className="flex flex-col gap-4 p-6">
          <h2 className="font-display text-lg font-semibold tracking-[-0.01em] text-foreground">
            {tag ? "Edit tag" : "New tag"}
          </h2>

          {tag ? <input type="hidden" name="id" value={tag.id} /> : null}

          <TextField
            label="Name"
            id={`tag-name-${fieldId}`}
            name="name"
            defaultValue={tag?.name}
            required
            maxLength={60}
          />
          <TextField
            label="Slug (optional — generated from the name if left blank)"
            id={`tag-slug-${fieldId}`}
            name="slug"
            defaultValue={tag?.slug}
            maxLength={60}
          />

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
              {pending ? "Saving…" : tag ? "Save changes" : "Create tag"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
