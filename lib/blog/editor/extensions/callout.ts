import { Node, mergeAttributes } from "@tiptap/core";

export type CalloutVariant = "info" | "success" | "warning" | "danger";
export const CALLOUT_VARIANTS: CalloutVariant[] = ["info", "success", "warning", "danger"];

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    callout: {
      setCallout: (variant?: CalloutVariant) => ReturnType;
    };
  }
}

/**
 * Framework-agnostic node schema — editing controls (variant swap) live in
 * the editor's bubble-menu components, not here, so this file (and the
 * public renderer, which shares the same HTML shape) never needs React.
 */
export const Callout = Node.create({
  name: "callout",
  group: "block",
  content: "block+",
  defining: true,

  addAttributes() {
    return {
      variant: {
        default: "info",
        parseHTML: (element) => element.getAttribute("data-variant") ?? "info",
        renderHTML: (attributes) => ({ "data-variant": attributes.variant }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="callout"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "callout", class: "blog-callout" }),
      0,
    ];
  },

  addCommands() {
    return {
      setCallout:
        (variant: CalloutVariant = "info") =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: { variant },
            content: [{ type: "paragraph" }],
          }),
    };
  },
});
