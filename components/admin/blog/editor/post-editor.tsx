"use client";

import type { Editor } from "@tiptap/react";
import { EditorContent, useEditor } from "@tiptap/react";
import { useEffect } from "react";
import { toast } from "sonner";

import { EditorBubbleMenus } from "@/components/admin/blog/editor/editor-bubble-menus";
import { EditorToolbar } from "@/components/admin/blog/editor/toolbar";
import { Skeleton } from "@/components/admin/skeleton";
import { createEditorExtensions } from "@/lib/blog/editor/extension-list";
import { uploadMediaFile } from "@/lib/media/actions";

/**
 * The Tiptap instance itself — dumb by design. The parent (PostForm) owns
 * the editor reference (via onReady) and reacts to changes (via onChange);
 * this component only wires the extensions, toolbar, bubble menus, and the
 * paste/drop-to-upload image flow.
 */
export function PostEditor({
  content,
  onReady,
  onChange,
}: {
  content: unknown;
  onReady: (editor: Editor) => void;
  onChange: () => void;
}) {
  const editor = useEditor({
    extensions: createEditorExtensions(),
    content: (content && typeof content === "object" ? content : {}) as object,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "blog-prose min-h-96 px-6 py-5 focus:outline-none",
      },
      handleDrop(view, event, _slice, moved) {
        if (moved) return false;
        const files = Array.from(event.dataTransfer?.files ?? []).filter((file) =>
          file.type.startsWith("image/"),
        );
        if (files.length === 0) return false;

        event.preventDefault();
        const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;
        files.forEach((file) => {
          void insertUploadedImage(file, pos);
        });
        return true;
      },
      handlePaste(_view, event) {
        const files = Array.from(event.clipboardData?.files ?? []).filter((file) =>
          file.type.startsWith("image/"),
        );
        if (files.length === 0) return false;

        event.preventDefault();
        files.forEach((file) => {
          void insertUploadedImage(file);
        });
        return true;
      },
    },
    onUpdate: () => onChange(),
  });

  async function insertUploadedImage(file: File, pos?: number) {
    if (!editor) return;
    const result = await uploadMediaFile(file, "posts");
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    const insertPos = pos ?? editor.state.selection.from;
    editor
      .chain()
      .focus()
      .insertContentAt(insertPos, { type: "image", attrs: { src: result.url } })
      .run();
  }

  useEffect(() => {
    if (editor) onReady(editor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  if (!editor) {
    return (
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-5">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <EditorToolbar editor={editor} />
      <div className="rounded-b-xl border border-border bg-background">
        <EditorContent editor={editor} />
      </div>
      <EditorBubbleMenus editor={editor} />
    </div>
  );
}
