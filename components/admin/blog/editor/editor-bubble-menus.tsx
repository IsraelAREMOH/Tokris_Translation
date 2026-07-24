"use client";

import type { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Highlighter,
  Italic,
  Maximize2,
  RefreshCw,
  Strikethrough,
  Type,
  Underline,
} from "lucide-react";
import { useState } from "react";

import { CALLOUT_VARIANT_META } from "@/components/admin/blog/editor/callout-variant-meta";
import { LinkPopover } from "@/components/admin/blog/editor/link-popover";
import { ToolbarButton } from "@/components/admin/blog/editor/toolbar-primitives";
import { MediaPickerDialog } from "@/components/admin/media/media-picker-dialog";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { CALLOUT_VARIANTS, type CalloutVariant } from "@/lib/blog/editor/extensions/callout";
import type { ImageAlign } from "@/lib/blog/editor/extensions/image";

const IMAGE_ALIGN_OPTIONS: { value: ImageAlign; icon: typeof AlignLeft; label: string }[] = [
  { value: "left", icon: AlignLeft, label: "Align left" },
  { value: "center", icon: AlignCenter, label: "Align center" },
  { value: "right", icon: AlignRight, label: "Align right" },
  { value: "full", icon: Maximize2, label: "Full width" },
];

function TextBubbleMenu({ editor }: { editor: Editor }) {
  return (
    <BubbleMenu
      editor={editor}
      pluginKey="textBubbleMenu"
      shouldShow={({ editor, from, to }) =>
        from !== to && !editor.isActive("image") && editor.isEditable
      }
      className="flex items-center gap-0.5 rounded-xl border border-border bg-floating p-1 shadow-floating"
    >
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
      <ToolbarButton
        icon={Code}
        label="Inline code"
        active={editor.isActive("code")}
        onClick={() => editor.chain().focus().toggleCode().run()}
      />
      <ToolbarButton
        icon={Highlighter}
        label="Highlight"
        active={editor.isActive("highlight")}
        onClick={() => editor.chain().focus().toggleHighlight().run()}
      />
      <LinkPopover editor={editor} />
    </BubbleMenu>
  );
}

function AltTextPopover({ editor }: { editor: Editor }) {
  const [value, setValue] = useState<string>(editor.getAttributes("image").alt ?? "");

  return (
    <DropdownMenu
      trigger={({ toggle }) => (
        <ToolbarButton
          icon={Type}
          label="Edit alt text"
          onClick={() => {
            setValue(editor.getAttributes("image").alt ?? "");
            toggle();
          }}
        />
      )}
    >
      {(close) => (
        <form
          className="flex w-64 flex-col gap-2 p-1.5"
          onSubmit={(event) => {
            event.preventDefault();
            editor.chain().focus().updateAttributes("image", { alt: value }).run();
            close();
          }}
        >
          <textarea
            value={value}
            onChange={(event) => setValue(event.target.value)}
            rows={2}
            autoFocus
            placeholder="Describe this image…"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
          />
          <button
            type="submit"
            className="self-end rounded-full bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-transform duration-200 ease-spring hover:-translate-y-0.5 hover:bg-brand-700 active:translate-y-0"
          >
            Save
          </button>
        </form>
      )}
    </DropdownMenu>
  );
}

function ImageBubbleMenu({ editor }: { editor: Editor }) {
  return (
    <BubbleMenu
      editor={editor}
      pluginKey="imageBubbleMenu"
      shouldShow={({ editor }) => editor.isActive("image")}
      className="flex items-center gap-0.5 rounded-xl border border-border bg-floating p-1 shadow-floating"
    >
      {IMAGE_ALIGN_OPTIONS.map((option) => (
        <ToolbarButton
          key={option.value}
          icon={option.icon}
          label={option.label}
          active={editor.getAttributes("image").align === option.value}
          onClick={() =>
            editor.chain().focus().updateAttributes("image", { align: option.value }).run()
          }
        />
      ))}
      <AltTextPopover editor={editor} />
      <MediaPickerDialog
        restrictToType="image"
        onSelect={(asset) =>
          editor
            .chain()
            .focus()
            .updateAttributes("image", { src: asset.url, alt: asset.alt_text ?? "" })
            .run()
        }
        trigger={<ToolbarButton icon={RefreshCw} label="Replace image" />}
      />
    </BubbleMenu>
  );
}

function CalloutBubbleMenu({ editor }: { editor: Editor }) {
  return (
    <BubbleMenu
      editor={editor}
      pluginKey="calloutBubbleMenu"
      shouldShow={({ editor }) => editor.isActive("callout")}
      className="flex items-center gap-0.5 rounded-xl border border-border bg-floating p-1 shadow-floating"
    >
      {CALLOUT_VARIANTS.map((variant: CalloutVariant) => {
        const meta = CALLOUT_VARIANT_META[variant];
        return (
          <ToolbarButton
            key={variant}
            icon={meta.icon}
            label={meta.label}
            active={editor.getAttributes("callout").variant === variant}
            onClick={() => editor.chain().focus().updateAttributes("callout", { variant }).run()}
          />
        );
      })}
    </BubbleMenu>
  );
}

function CtaButtonBubbleMenu({ editor }: { editor: Editor }) {
  const [href, setHref] = useState("");

  return (
    <BubbleMenu
      editor={editor}
      pluginKey="ctaButtonBubbleMenu"
      shouldShow={({ editor }) => editor.isActive("ctaButton")}
      className="flex items-center gap-2 rounded-xl border border-border bg-floating p-1.5 shadow-floating"
    >
      <div className="flex overflow-hidden rounded-lg border border-border">
        {(["primary", "secondary"] as const).map((variant) => (
          <button
            key={variant}
            type="button"
            onClick={() => editor.chain().focus().updateAttributes("ctaButton", { variant }).run()}
            className={`px-2.5 py-1.5 text-xs font-medium capitalize transition-colors ${
              editor.getAttributes("ctaButton").variant === variant
                ? "bg-brand-600 text-white"
                : "bg-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {variant}
          </button>
        ))}
      </div>
      <input
        type="url"
        defaultValue={editor.getAttributes("ctaButton").href ?? ""}
        onFocus={(event) => setHref(event.target.value)}
        onChange={(event) => setHref(event.target.value)}
        onBlur={() => editor.chain().focus().updateAttributes("ctaButton", { href }).run()}
        placeholder="https://…"
        className="w-40 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
      />
    </BubbleMenu>
  );
}

/** Every floating contextual menu the editor uses, mounted together. */
export function EditorBubbleMenus({ editor }: { editor: Editor }) {
  return (
    <>
      <TextBubbleMenu editor={editor} />
      <ImageBubbleMenu editor={editor} />
      <CalloutBubbleMenu editor={editor} />
      <CtaButtonBubbleMenu editor={editor} />
    </>
  );
}
