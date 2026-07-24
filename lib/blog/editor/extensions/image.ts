import TiptapImage from "@tiptap/extension-image";

export type ImageAlign = "left" | "center" | "right" | "full";

/**
 * Extends the base Image node with an `align` attribute (rendered as a CSS
 * class the public prose styles key off) and turns on Tiptap's built-in
 * resize handles for size control — no custom NodeView needed for either.
 * Alignment/replace/alt-text editing live in the editor's image bubble menu.
 */
export const Image = TiptapImage.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: "center",
        parseHTML: (element) => element.getAttribute("data-align") ?? "center",
        renderHTML: (attributes) => ({
          "data-align": attributes.align,
          class: `blog-image blog-image-${attributes.align}`,
        }),
      },
    };
  },
}).configure({
  inline: false,
  allowBase64: false,
  resize: { enabled: true, minWidth: 120, minHeight: 80 },
});
