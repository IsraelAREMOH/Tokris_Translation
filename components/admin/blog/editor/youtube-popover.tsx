"use client";

import type { Editor } from "@tiptap/react";
import { Clapperboard } from "lucide-react";
import { useState } from "react";

import { ToolbarButton } from "@/components/admin/blog/editor/toolbar-primitives";
import { DropdownMenu } from "@/components/ui/dropdown-menu";

function YoutubeForm({ editor, onDone }: { editor: Editor; onDone: () => void }) {
  const [url, setUrl] = useState("");

  return (
    <form
      className="flex w-72 flex-col gap-2 p-1.5"
      onSubmit={(event) => {
        event.preventDefault();
        if (url.trim()) editor.chain().focus().setYoutubeVideo({ src: url.trim() }).run();
        onDone();
      }}
    >
      <input
        type="url"
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        placeholder="https://youtube.com/watch?v=…"
        autoFocus
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
      />
      <button
        type="submit"
        className="self-end rounded-full bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-transform duration-200 ease-spring hover:-translate-y-0.5 hover:bg-brand-700 active:translate-y-0"
      >
        Embed
      </button>
    </form>
  );
}

export function YoutubePopover({ editor }: { editor: Editor }) {
  return (
    <DropdownMenu
      trigger={({ toggle }) => (
        <ToolbarButton icon={Clapperboard} label="Embed YouTube video" onClick={toggle} />
      )}
    >
      {(close) => <YoutubeForm editor={editor} onDone={close} />}
    </DropdownMenu>
  );
}
