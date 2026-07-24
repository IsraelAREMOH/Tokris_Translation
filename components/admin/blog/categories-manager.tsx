"use client";

import { ArrowDown, ArrowUp, FolderTree, Pencil, Plus } from "lucide-react";

import { ActionButton } from "@/components/admin/action-button";
import { CategoryFormDialog } from "@/components/admin/blog/category-form-dialog";
import { DeleteButton } from "@/components/admin/delete-button";
import { EmptyState } from "@/components/admin/empty-state";
import { deleteCategory, moveCategory } from "@/lib/blog/categories/actions";
import type { BlogCategory } from "@/lib/blog/types";

const reorderButtonClass =
  "inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-transform duration-200 ease-spring hover:bg-background hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:scale-90 disabled:pointer-events-none disabled:opacity-30";

export function CategoriesManager({
  categories,
  hasQuery,
}: {
  categories: BlogCategory[];
  hasQuery: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <CategoryFormDialog
          trigger={
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-brand transition-transform duration-200 ease-spring hover:-translate-y-0.5 hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              New category
            </button>
          }
        />
      </div>

      {categories.length === 0 ? (
        <EmptyState
          icon={FolderTree}
          title={hasQuery ? "No categories match your search." : "No categories yet"}
          description={
            hasQuery
              ? "Try a different search term."
              : "Categories group related articles — e.g. Translation, Case Studies, Industry Insights."
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-elevated">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border">
                {["Order", "Name", "Slug", "Description", ""].map((heading) => (
                  <th
                    key={heading}
                    scope="col"
                    className="px-5 py-3.5 text-[11px] font-semibold tracking-[0.14em] uppercase text-muted-foreground"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map((category, index) => (
                <tr
                  key={category.id}
                  className="border-b border-border last:border-b-0 hover:bg-background"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-0.5">
                      <ActionButton
                        action={moveCategory}
                        fields={{ id: category.id, direction: "up" }}
                        ariaLabel={`Move ${category.name} up`}
                        disabled={index === 0}
                        className={reorderButtonClass}
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </ActionButton>
                      <ActionButton
                        action={moveCategory}
                        fields={{ id: category.id, direction: "down" }}
                        ariaLabel={`Move ${category.name} down`}
                        disabled={index === categories.length - 1}
                        className={reorderButtonClass}
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </ActionButton>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-foreground">
                    {category.name}
                  </td>
                  <td className="px-5 py-4 font-mono text-xs whitespace-nowrap text-muted-foreground">
                    /{category.slug}
                  </td>
                  <td className="max-w-xs px-5 py-4 text-sm text-muted-foreground">
                    <span className="line-clamp-1">{category.description || "—"}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <CategoryFormDialog
                        category={category}
                        trigger={
                          <button
                            type="button"
                            aria-label={`Edit ${category.name}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-transform duration-200 ease-spring hover:bg-background hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:scale-90"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        }
                      />
                      <DeleteButton
                        action={deleteCategory}
                        fields={{ id: category.id }}
                        confirmTitle={`Delete "${category.name}"?`}
                        confirmDescription="Posts in this category keep their content but become uncategorized. This can't be undone."
                        label={`Delete ${category.name}`}
                        successMessage="Category deleted."
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
