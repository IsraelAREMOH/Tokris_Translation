"use client";

import type { Editor } from "@tiptap/react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code2,
  Columns2,
  Italic,
  List,
  ListOrdered,
  ListTodo,
  Minus,
  MousePointerClick,
  Quote,
  Redo2,
  Rows3,
  Strikethrough,
  Table as TableIcon,
  Trash2,
  Underline,
  Undo2,
  Image as ImageIcon,
  Video as VideoIcon,
} from "lucide-react";

import { CalloutInsertPopover } from "@/components/admin/blog/editor/callout-insert-popover";
import { HighlightPicker, TextColorPicker } from "@/components/admin/blog/editor/color-swatch-picker";
import { LinkPopover } from "@/components/admin/blog/editor/link-popover";
import { ToolbarButton, ToolbarDivider } from "@/components/admin/blog/editor/toolbar-primitives";
import { YoutubePopover } from "@/components/admin/blog/editor/youtube-popover";
import { MediaPickerDialog } from "@/components/admin/media/media-picker-dialog";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";

const HEADING_LEVELS = [1, 2, 3, 4] as const;

export function EditorToolbar({ editor }: { editor: Editor }) {
  const activeHeading = HEADING_LEVELS.find((level) => editor.isActive("heading", { level }));

  return (
    <div className="flex flex-wrap items-center gap-0.5 rounded-t-xl border border-b-0 border-border bg-surface p-1.5">
      <DropdownMenu
        align="start"
        trigger={({ toggle }) => (
          <button
            type="button"
            onClick={toggle}
            className="inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-sm font-medium text-muted-foreground transition-transform duration-200 ease-spring hover:bg-background hover:text-foreground active:scale-95"
          >
            {activeHeading ? `Heading ${activeHeading}` : "Paragraph"}
          </button>
        )}
      >
        {(close) => (
          <div className="flex flex-col gap-0.5">
            <DropdownMenuItem
              onSelect={() => {
                editor.chain().focus().setParagraph().run();
                close();
              }}
            >
              Paragraph
            </DropdownMenuItem>
            {HEADING_LEVELS.map((level) => (
              <DropdownMenuItem
                key={level}
                onSelect={() => {
                  editor.chain().focus().toggleHeading({ level }).run();
                  close();
                }}
              >
                Heading {level}
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenu>

      <ToolbarDivider />

      <ToolbarButton
        icon={Bold}
        label="Bold"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      />
      <ToolbarButton
        icon={Italic}
        label="Italic"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      />
      <ToolbarButton
        icon={Underline}
        label="Underline"
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      />
      <ToolbarButton
        icon={Strikethrough}
        label="Strikethrough"
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      />
      <TextColorPicker editor={editor} />
      <HighlightPicker editor={editor} />

      <ToolbarDivider />

      <ToolbarButton
        icon={AlignLeft}
        label="Align left"
        active={editor.isActive({ textAlign: "left" })}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
      />
      <ToolbarButton
        icon={AlignCenter}
        label="Align center"
        active={editor.isActive({ textAlign: "center" })}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
      />
      <ToolbarButton
        icon={AlignRight}
        label="Align right"
        active={editor.isActive({ textAlign: "right" })}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
      />
      <ToolbarButton
        icon={AlignJustify}
        label="Justify"
        active={editor.isActive({ textAlign: "justify" })}
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
      />

      <ToolbarDivider />

      <ToolbarButton
        icon={List}
        label="Bullet list"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      />
      <ToolbarButton
        icon={ListOrdered}
        label="Numbered list"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      />
      <ToolbarButton
        icon={ListTodo}
        label="Task list"
        active={editor.isActive("taskList")}
        onClick={() => editor.chain().focus().toggleTaskList().run()}
      />
      <ToolbarButton
        icon={Quote}
        label="Quote"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      />
      <ToolbarButton
        icon={Minus}
        label="Horizontal rule"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      />
      <ToolbarButton
        icon={Code2}
        label="Code block"
        active={editor.isActive("codeBlock")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      />

      <ToolbarDivider />

      <LinkPopover editor={editor} />
      <MediaPickerDialog
        restrictToType="image"
        onSelect={(asset) =>
          editor
            .chain()
            .focus()
            .setImage({ src: asset.url, alt: asset.alt_text ?? "" })
            .run()
        }
        trigger={<ToolbarButton icon={ImageIcon} label="Insert image" />}
      />
      <MediaPickerDialog
        restrictToType="video"
        onSelect={(asset) => editor.chain().focus().setVideo({ src: asset.url }).run()}
        trigger={<ToolbarButton icon={VideoIcon} label="Insert video" />}
      />
      <YoutubePopover editor={editor} />

      <ToolbarDivider />

      <ToolbarButton
        icon={TableIcon}
        label="Insert table"
        onClick={() =>
          editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
        }
      />
      <CalloutInsertPopover editor={editor} />
      <ToolbarButton
        icon={MousePointerClick}
        label="Insert button"
        onClick={() => editor.chain().focus().setCtaButton().run()}
      />
      <ToolbarButton
        icon={Columns2}
        label="Two columns"
        onClick={() => editor.chain().focus().setColumns().run()}
      />

      {editor.isActive("table") ? (
        <>
          <ToolbarDivider />
          <ToolbarButton
            icon={Rows3}
            label="Add row after"
            onClick={() => editor.chain().focus().addRowAfter().run()}
          />
          <ToolbarButton
            icon={Columns2}
            label="Add column after"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
          />
          <ToolbarButton
            icon={Trash2}
            label="Delete table"
            onClick={() => editor.chain().focus().deleteTable().run()}
          />
        </>
      ) : null}

      <ToolbarDivider />

      <ToolbarButton
        icon={Undo2}
        label="Undo"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      />
      <ToolbarButton
        icon={Redo2}
        label="Redo"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      />
    </div>
  );
}
