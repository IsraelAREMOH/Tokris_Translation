"use client";

import type { Editor } from "@tiptap/react";
import { Link2 } from "lucide-react";
import { useState } from "react";

import { ToolbarButton } from "@/components/admin/blog/editor/toolbar-primitives";
import { DropdownMenu } from "@/components/ui/dropdown-menu";

function LinkForm({ editor, onDone }: { editor: Editor; onDone: () => void }) {
  const [href, setHref] = useState<string>(editor.getAttributes("link").href ?? "");
  const isLink = editor.isActive("link");

  return (
    <form
      className="flex w-64 flex-col gap-2 p-1.5"
      onSubmit={(event) => {
        event.preventDefault();
        if (href.trim()) {
          editor.chain().focus().extendMarkRange("link").setLink({ href: href.trim() }).run();
        } else {
          editor.chain().focus().extendMarkRange("link").unsetLink().run();
        }
        onDone();
      }}
    >
      <input
        type="url"
        value={href}
        onChange={(event) => setHref(event.target.value)}
        placeholder="https://…"
        autoFocus
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
      />
      <div className="flex items-center justify-end gap-2.5">
        {isLink ? (
          <button
            type="button"
            onClick={() => {
              editor.chain().focus().extendMarkRange("link").unsetLink().run();
              onDone();
            }}
            className="text-xs font-semibold text-danger transition-colors hover:text-danger/80"
          >
            Remove
          </button>
        ) : null}
        <button
          type="submit"
          className="rounded-full bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-transform duration-200 ease-spring hover:-translate-y-0.5 hover:bg-brand-700 active:translate-y-0"
        >
          Apply
        </button>
      </div>
    </form>
  );
}

export function LinkPopover({ editor }: { editor: Editor }) {
  return (
    <DropdownMenu
      align="start"
      trigger={({ toggle }) => (
        <ToolbarButton
          icon={Link2}
          label="Link"
          active={editor.isActive("link")}
          onClick={toggle}
        />
      )}
    >
      {(close) => <LinkForm editor={editor} onDone={close} />}
    </DropdownMenu>
  );
}
