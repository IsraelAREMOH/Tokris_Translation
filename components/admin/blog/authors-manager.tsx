"use client";

import { Pencil, Plus, Star, UserRound } from "lucide-react";
import Image from "next/image";

import { AuthorFormDialog } from "@/components/admin/blog/author-form-dialog";
import { DeleteButton } from "@/components/admin/delete-button";
import { EmptyState } from "@/components/admin/empty-state";
import { deleteAuthor } from "@/lib/blog/authors/actions";
import type { BlogAuthor } from "@/lib/blog/types";

export function AuthorsManager({
  authors,
  hasQuery,
}: {
  authors: BlogAuthor[];
  hasQuery: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <AuthorFormDialog
          trigger={
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-brand transition-transform duration-200 ease-spring hover:-translate-y-0.5 hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              New author
            </button>
          }
        />
      </div>

      {authors.length === 0 ? (
        <EmptyState
          icon={UserRound}
          title={hasQuery ? "No authors match your search." : "No authors yet"}
          description={
            hasQuery
              ? "Try a different search term."
              : "Add at least one author before publishing — every post needs a byline."
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {authors.map((author) => (
            <div
              key={author.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5 shadow-elevated"
            >
              <div className="flex items-start gap-3">
                <span className="relative flex h-12 w-12 shrink-0 overflow-hidden rounded-full border border-border bg-background">
                  {author.photo ? (
                    <Image
                      src={author.photo.url}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <UserRound className="h-5 w-5" />
                    </span>
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-foreground">
                    {author.name}
                    {author.featured ? (
                      <Star className="h-3.5 w-3.5 shrink-0 fill-accent-500 text-accent-500" />
                    ) : null}
                  </p>
                  {author.position ? (
                    <p className="truncate text-xs text-muted-foreground">{author.position}</p>
                  ) : null}
                </div>
              </div>

              {author.bio ? (
                <p className="line-clamp-2 text-sm text-muted-foreground">{author.bio}</p>
              ) : null}

              <div className="mt-auto flex items-center justify-end gap-1 border-t border-border pt-3">
                <AuthorFormDialog
                  author={author}
                  trigger={
                    <button
                      type="button"
                      aria-label={`Edit ${author.name}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-transform duration-200 ease-spring hover:bg-background hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:scale-90"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  }
                />
                <DeleteButton
                  action={deleteAuthor}
                  fields={{ id: author.id }}
                  confirmTitle={`Delete "${author.name}"?`}
                  confirmDescription="Posts by this author keep their content but lose the byline. This can't be undone."
                  label={`Delete ${author.name}`}
                  successMessage="Author deleted."
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
