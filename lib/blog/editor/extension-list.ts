import { Color } from "@tiptap/extension-color";
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import { Highlight } from "@tiptap/extension-highlight";
import { Placeholder } from "@tiptap/extension-placeholder";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableRow } from "@tiptap/extension-table-row";
import { Table } from "@tiptap/extension-table";
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Youtube } from "@tiptap/extension-youtube";
import StarterKit from "@tiptap/starter-kit";
import { common, createLowlight } from "lowlight";

import { Callout } from "@/lib/blog/editor/extensions/callout";
import { ColumnSet, Column } from "@/lib/blog/editor/extensions/columns";
import { CtaButton } from "@/lib/blog/editor/extensions/cta-button";
import { Image } from "@/lib/blog/editor/extensions/image";
import { Video } from "@/lib/blog/editor/extensions/video";

const lowlight = createLowlight(common);

/**
 * The full extension set for the post-authoring editor — one array, so the
 * public preview/renderer and the editor itself always agree on what a
 * content_json doc can contain (see components/blog/post-view.tsx).
 */
export function createEditorExtensions() {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3, 4] },
      codeBlock: false, // replaced by CodeBlockLowlight below
      link: {
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer" },
      },
    }),
    CodeBlockLowlight.configure({ lowlight }),
    TaskList,
    TaskItem.configure({ nested: true }),
    Table.configure({ resizable: true }),
    TableRow,
    TableHeader,
    TableCell,
    Image,
    Youtube.configure({ nocookie: true }),
    Video,
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    TextStyle,
    Color,
    Highlight.configure({ multicolor: true }),
    Placeholder.configure({ placeholder: "Start writing your article…" }),
    Callout,
    CtaButton,
    ColumnSet,
    Column,
  ];
}
