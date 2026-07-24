"use client";

import Image from "next/image";
import { useActionState, useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { MediaPickerDialog } from "@/components/admin/media/media-picker-dialog";
import { DialogTrigger } from "@/components/ui/dialog-trigger";
import { TextField } from "@/components/ui/text-field";
import { createAuthor, updateAuthor, type AuthorActionState } from "@/lib/blog/authors/actions";
import type { BlogAuthor } from "@/lib/blog/types";
import type { MediaAsset } from "@/lib/media/types";

const initialState: AuthorActionState = {};

export function AuthorFormDialog({
  author,
  trigger,
}: {
  author?: BlogAuthor;
  trigger: ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const action = author ? updateAuthor : createAuthor;
  const [state, formAction, pending] = useActionState(action, initialState);
  const [photo, setPhoto] = useState<MediaAsset | null>(author?.photo ?? null);
  const fieldId = author?.id ?? "new";

  useEffect(() => {
    if (state.success) {
      dialogRef.current?.close();
      toast.success(author ? "Author updated." : "Author created.");
    }
  }, [state.success, author]);

  function open() {
    setPhoto(author?.photo ?? null);
    dialogRef.current?.showModal();
  }

  return (
    <>
      <DialogTrigger onOpen={open}>{trigger}</DialogTrigger>
      <dialog
        ref={dialogRef}
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current?.close();
        }}
        className="m-auto h-[calc(100%-4rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-xl border border-border bg-floating p-0 text-foreground shadow-floating backdrop:bg-foreground/40 backdrop:backdrop-blur-sm"
      >
        <form action={formAction} className="flex flex-col gap-4 p-6">
          <h2 className="font-display text-lg font-semibold tracking-[-0.01em] text-foreground">
            {author ? "Edit author" : "New author"}
          </h2>

          {author ? <input type="hidden" name="id" value={author.id} /> : null}
          <input type="hidden" name="photoId" value={photo?.id ?? ""} />

          <div className="flex items-center gap-4">
            <span className="relative flex h-16 w-16 shrink-0 overflow-hidden rounded-full border border-border bg-background">
              {photo ? (
                <Image src={photo.url} alt="" fill sizes="64px" className="object-cover" />
              ) : null}
            </span>
            <MediaPickerDialog
              restrictToType="image"
              folder="authors"
              onSelect={setPhoto}
              trigger={
                <button
                  type="button"
                  className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-transform duration-200 ease-spring hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98]"
                >
                  {photo ? "Change photo" : "Choose photo"}
                </button>
              }
            />
          </div>

          <TextField
            label="Name"
            id={`author-name-${fieldId}`}
            name="name"
            defaultValue={author?.name}
            required
            maxLength={100}
          />
          <TextField
            label="Position"
            id={`author-position-${fieldId}`}
            name="position"
            defaultValue={author?.position ?? ""}
            maxLength={100}
          />
          <TextField
            label="Email (optional)"
            id={`author-email-${fieldId}`}
            name="email"
            type="email"
            defaultValue={author?.email ?? ""}
            maxLength={200}
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor={`author-bio-${fieldId}`} className="text-sm font-medium text-foreground">
              Bio
            </label>
            <textarea
              id={`author-bio-${fieldId}`}
              name="bio"
              defaultValue={author?.bio ?? ""}
              rows={4}
              maxLength={1000}
              className="rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <TextField
              label="Twitter/X URL"
              id={`author-twitter-${fieldId}`}
              name="social_twitter"
              defaultValue={author?.social_links?.twitter ?? ""}
              maxLength={300}
            />
            <TextField
              label="LinkedIn URL"
              id={`author-linkedin-${fieldId}`}
              name="social_linkedin"
              defaultValue={author?.social_links?.linkedin ?? ""}
              maxLength={300}
            />
            <TextField
              label="Website URL"
              id={`author-website-${fieldId}`}
              name="social_website"
              defaultValue={author?.social_links?.website ?? ""}
              maxLength={300}
            />
          </div>

          <label className="flex items-center gap-2.5 text-sm font-medium text-foreground">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={author?.featured ?? false}
              className="h-4 w-4 rounded border-border text-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
            />
            Featured author (highlighted profile)
          </label>

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
              {pending ? "Saving…" : author ? "Save changes" : "Create author"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
