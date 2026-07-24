"use client";

import type { Editor } from "@tiptap/react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { ContentMetaPanel } from "@/components/admin/blog/editor/sidebar/content-meta-panel";
import { FeaturedImagePanel } from "@/components/admin/blog/editor/sidebar/featured-image-panel";
import { PublishPanel } from "@/components/admin/blog/editor/sidebar/publish-panel";
import { SeoPanel } from "@/components/admin/blog/editor/sidebar/seo-panel";
import { TaxonomyPanel } from "@/components/admin/blog/editor/sidebar/taxonomy-panel";
import { PostEditor } from "@/components/admin/blog/editor/post-editor";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useRouter } from "@/i18n/navigation";
import { calculateReadingTime } from "@/lib/blog/editor/reading-time";
import { AUTOSAVE_INTERVAL_MS } from "@/lib/blog/posts/constants";
import {
  deletePost,
  duplicatePost,
  restorePost,
  savePost,
} from "@/lib/blog/posts/actions";
import { slugify } from "@/lib/blog/slugify";
import type { BlogAuthor, BlogCategory, BlogPost, BlogPostStatus, BlogTag } from "@/lib/blog/types";
import { useAutosave, useUnsavedChangesWarning } from "@/hooks/use-autosave";
import type { MediaAsset } from "@/lib/media/types";

export function PostForm({
  post,
  categories,
  tags,
  authors,
}: {
  post: BlogPost;
  categories: BlogCategory[];
  tags: BlogTag[];
  authors: BlogAuthor[];
}) {
  const router = useRouter();
  const confirm = useConfirm();
  const editorRef = useRef<Editor | null>(null);

  const [title, setTitleRaw] = useState(post.title);
  const [manualSlug, setManualSlug] = useState<string | null>(
    post.slug.startsWith("untitled-draft-") ? null : post.slug,
  );
  const [excerpt, setExcerptRaw] = useState(post.excerpt ?? "");
  const [categoryId, setCategoryIdRaw] = useState<string | null>(post.category_id);
  const [authorId, setAuthorIdRaw] = useState<string | null>(post.author_id);
  const [tagIds, setTagIdsRaw] = useState<string[]>(post.tags.map((tag) => tag.id));
  const [coverImage, setCoverImageRaw] = useState<MediaAsset | null>(post.cover_image);
  const [coverImageAlt, setCoverImageAltRaw] = useState(post.cover_image_alt ?? "");
  const [ogImage, setOgImageRaw] = useState<MediaAsset | null>(post.og_image);
  const [seoTitle, setSeoTitleRaw] = useState(post.seo_title ?? "");
  const [metaDescription, setMetaDescriptionRaw] = useState(post.meta_description ?? "");
  const [canonicalUrl, setCanonicalUrlRaw] = useState(post.canonical_url ?? "");
  const [allowComments, setAllowCommentsRaw] = useState(post.allow_comments);
  const [featured, setFeaturedRaw] = useState(post.featured);
  const [pinned, setPinnedRaw] = useState(post.pinned);

  const [autoReadingTime, setAutoReadingTime] = useState(post.reading_time_minutes);
  const [manualReadingTime, setManualReadingTime] = useState<number | null>(null);
  const [readingTimeManual, setReadingTimeManualRaw] = useState(false);

  const [status, setStatus] = useState<BlogPostStatus>(post.status);
  const [scheduledAt, setScheduledAt] = useState<string | null>(post.scheduled_at);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(
    post.updated_at ? Date.parse(post.updated_at) : null,
  );

  const slug = manualSlug ?? slugify(title);
  const readingTimeMinutes = readingTimeManual ? (manualReadingTime ?? autoReadingTime) : autoReadingTime;

  function setTitle(value: string) {
    setTitleRaw(value);
    setDirty(true);
  }
  function setExcerpt(value: string) {
    setExcerptRaw(value);
    setDirty(true);
  }
  function setCategoryId(value: string | null) {
    setCategoryIdRaw(value);
    setDirty(true);
  }
  function setAuthorId(value: string | null) {
    setAuthorIdRaw(value);
    setDirty(true);
  }
  function setTagIds(value: string[]) {
    setTagIdsRaw(value);
    setDirty(true);
  }
  function setCoverImage(value: MediaAsset | null) {
    setCoverImageRaw(value);
    if (value?.alt_text) setCoverImageAltRaw(value.alt_text);
    setDirty(true);
  }
  function setCoverImageAlt(value: string) {
    setCoverImageAltRaw(value);
    setDirty(true);
  }
  function setOgImage(value: MediaAsset | null) {
    setOgImageRaw(value);
    setDirty(true);
  }
  function setSeoTitle(value: string) {
    setSeoTitleRaw(value);
    setDirty(true);
  }
  function setMetaDescription(value: string) {
    setMetaDescriptionRaw(value);
    setDirty(true);
  }
  function setCanonicalUrl(value: string) {
    setCanonicalUrlRaw(value);
    setDirty(true);
  }
  function setAllowComments(value: boolean) {
    setAllowCommentsRaw(value);
    setDirty(true);
  }
  function setFeatured(value: boolean) {
    setFeaturedRaw(value);
    setDirty(true);
  }
  function setPinned(value: boolean) {
    setPinnedRaw(value);
    setDirty(true);
  }
  function handleSlugChange(value: string) {
    setManualSlug(value);
    setDirty(true);
  }
  function handleReadingTimeChange(value: number) {
    setManualReadingTime(value);
    setDirty(true);
  }
  function handleToggleReadingTimeManual(manual: boolean) {
    setReadingTimeManualRaw(manual);
    if (manual) setManualReadingTime(autoReadingTime);
    setDirty(true);
  }
  function handleEditorChange() {
    setDirty(true);
    if (!readingTimeManual && editorRef.current) {
      setAutoReadingTime(calculateReadingTime(editorRef.current.getText()));
    }
  }

  function buildFormData(nextStatus?: BlogPostStatus, nextScheduledAt?: string) {
    const editor = editorRef.current;
    const contentJson = editor ? editor.getJSON() : {};
    const contentHtml = editor ? editor.getHTML() : "";
    const contentText = editor ? editor.getText() : "";

    const formData = new FormData();
    formData.set("id", post.id);
    formData.set("title", title);
    formData.set("slug", slug);
    formData.set("excerpt", excerpt);
    formData.set("contentJson", JSON.stringify(contentJson));
    formData.set("contentHtml", contentHtml);
    formData.set("contentText", contentText);
    formData.set("readingTimeMinutes", String(readingTimeMinutes));
    formData.set("categoryId", categoryId ?? "");
    formData.set("authorId", authorId ?? "");
    tagIds.forEach((id) => formData.append("tagIds", id));
    formData.set("coverImageId", coverImage?.id ?? "");
    formData.set("coverImageAlt", coverImageAlt);
    formData.set("ogImageId", ogImage?.id ?? "");
    formData.set("seoTitle", seoTitle);
    formData.set("metaDescription", metaDescription);
    formData.set("canonicalUrl", canonicalUrl);
    if (allowComments) formData.set("allowComments", "on");
    if (featured) formData.set("featured", "on");
    if (pinned) formData.set("pinned", "on");
    if (nextStatus) formData.set("status", nextStatus);
    if (nextScheduledAt) formData.set("scheduledAt", nextScheduledAt);
    return formData;
  }

  async function doSave(
    nextStatus?: BlogPostStatus,
    nextScheduledAt?: string,
    { silent = false }: { silent?: boolean } = {},
  ) {
    if (!title.trim()) {
      if (!silent) toast.error("Give the post a title before saving.");
      return false;
    }

    setSaving(true);
    const result = await savePost({}, buildFormData(nextStatus, nextScheduledAt));
    setSaving(false);

    if (result.error) {
      toast.error(result.error);
      return false;
    }

    setDirty(false);
    setLastSavedAt(result.savedAt ?? Date.now());
    if (nextStatus) setStatus(nextStatus);
    if (nextScheduledAt) setScheduledAt(nextScheduledAt);
    if (!silent) {
      const messages: Record<string, string> = {
        published: "Post published.",
        scheduled: "Post scheduled.",
        archived: "Post archived.",
        draft: "Draft saved.",
      };
      toast.success((nextStatus && messages[nextStatus]) || "Saved.");
    }
    return true;
  }

  useAutosave({
    enabled: true,
    intervalMs: AUTOSAVE_INTERVAL_MS,
    isDirty: () => dirty,
    onSave: async () => {
      await doSave(undefined, undefined, { silent: true });
    },
  });
  useUnsavedChangesWarning(() => dirty);

  async function handleRestore() {
    const result = await restorePost(post.id);
    if (result.error) toast.error(result.error);
    else {
      setStatus("draft");
      toast.success("Restored to draft.");
    }
  }

  async function handleDuplicate() {
    const result = await duplicatePost(post.id);
    if (result.error) toast.error(result.error);
    else if (result.postId) {
      toast.success("Post duplicated.");
      router.push(`/admin/blog/posts/${result.postId}`);
    }
  }

  async function handleDelete() {
    const ok = await confirm({
      title: "Delete this post?",
      description: "This can't be undone.",
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;

    const formData = new FormData();
    formData.set("id", post.id);
    const result = await deletePost({}, formData);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Post deleted.");
      router.push("/admin/blog/posts");
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="flex min-w-0 flex-col gap-4">
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Post title"
          className="rounded-xl border border-border bg-surface px-5 py-4 font-display text-2xl font-semibold tracking-[-0.02em] text-foreground placeholder:text-muted-foreground/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 sm:text-3xl"
        />
        <PostEditor
          content={post.content_json}
          onReady={(editor) => {
            editorRef.current = editor;
          }}
          onChange={handleEditorChange}
        />
      </div>

      <div className="flex flex-col gap-5 lg:sticky lg:top-8 lg:self-start">
        <PublishPanel
          postId={post.id}
          status={status}
          scheduledAt={scheduledAt}
          saving={saving}
          lastSavedAt={lastSavedAt}
          onSaveDraft={() => doSave("draft")}
          onPublishNow={() => doSave("published")}
          onSchedule={(iso) => doSave("scheduled", iso)}
          onArchive={() => doSave("archived")}
          onRestore={handleRestore}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
        />
        <TaxonomyPanel
          categories={categories}
          authors={authors}
          tags={tags}
          categoryId={categoryId}
          authorId={authorId}
          tagIds={tagIds}
          onCategoryChange={setCategoryId}
          onAuthorChange={setAuthorId}
          onTagsChange={setTagIds}
        />
        <FeaturedImagePanel
          coverImage={coverImage}
          coverImageAlt={coverImageAlt}
          onChangeCoverImage={setCoverImage}
          onChangeAlt={setCoverImageAlt}
        />
        <SeoPanel
          title={title}
          slug={slug}
          seoTitle={seoTitle}
          onSeoTitleChange={setSeoTitle}
          metaDescription={metaDescription}
          onMetaDescriptionChange={setMetaDescription}
          canonicalUrl={canonicalUrl}
          onCanonicalUrlChange={setCanonicalUrl}
          ogImage={ogImage}
          onOgImageChange={setOgImage}
        />
        <ContentMetaPanel
          slug={slug}
          onSlugChange={handleSlugChange}
          excerpt={excerpt}
          onExcerptChange={setExcerpt}
          readingTimeMinutes={readingTimeMinutes}
          readingTimeManual={readingTimeManual}
          onReadingTimeChange={handleReadingTimeChange}
          onToggleReadingTimeManual={handleToggleReadingTimeManual}
          featured={featured}
          onFeaturedChange={setFeatured}
          pinned={pinned}
          onPinnedChange={setPinned}
          allowComments={allowComments}
          onAllowCommentsChange={setAllowComments}
        />
      </div>
    </div>
  );
}
