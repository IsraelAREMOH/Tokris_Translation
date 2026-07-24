"use client";

import { useEffect } from "react";

import { recordPostView } from "@/lib/blog/posts/actions";

/** Invisible — records a view once a real browser opens the article. See
 * recordPostView()'s doc comment for why this can't run in the server render. */
export function PostViewTracker({ postId }: { postId: string }) {
  useEffect(() => {
    void recordPostView(postId);
  }, [postId]);

  return null;
}
