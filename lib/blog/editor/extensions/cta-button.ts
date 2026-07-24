import { Node, mergeAttributes } from "@tiptap/core";

export type CtaButtonVariant = "primary" | "secondary";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    ctaButton: {
      setCtaButton: (attrs?: { href?: string; variant?: CtaButtonVariant }) => ReturnType;
    };
  }
}

/** An inline-editable CTA link, styled like a button — href/variant are
 * edited via the editor's bubble menu, not here (see callout.ts's note). */
export const CtaButton = Node.create({
  name: "ctaButton",
  group: "block",
  content: "inline*",
  defining: true,

  addAttributes() {
    return {
      href: {
        default: "#",
        parseHTML: (element) => element.getAttribute("href") ?? "#",
        renderHTML: (attributes) => ({ href: attributes.href }),
      },
      variant: {
        default: "primary",
        parseHTML: (element) => element.getAttribute("data-variant") ?? "primary",
        renderHTML: (attributes) => ({ "data-variant": attributes.variant }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'a[data-type="cta-button"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "a",
      mergeAttributes(HTMLAttributes, {
        "data-type": "cta-button",
        class: "blog-cta-button",
        rel: "noopener noreferrer",
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setCtaButton:
        (attrs = {}) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: { href: attrs.href ?? "#", variant: attrs.variant ?? "primary" },
            content: [{ type: "text", text: "Button text" }],
          }),
    };
  },
});
