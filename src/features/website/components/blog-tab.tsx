import { useEffect, useRef, useState } from "react"
import { ImagePlus, Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { ListPagination } from "@/components/list-pagination"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { isEmptyHtml, RichTextEditor } from "@/components/rich-text-editor"
import { DeleteCmsDialog } from "@/features/website/components/delete-cms-dialog"
import {
  BLOG_STATUS_ITEMS,
  blogStatusClass,
  formatCmsDate,
} from "@/features/website/components/utils"
import {
  useBlog,
  useBlogs,
  useCreateBlog,
  useDeleteBlog,
  useUpdateBlog,
  useUploadCmsImage,
} from "@/store/server/cms/cms"
import type { BlogStatus } from "@/store/server/cms/typed"

const PAGE_SIZE = 9

type BlogForm = {
  title: string
  coverImageUrl: string
  body: string
  status: BlogStatus
}

function BlogEditor({
  blogId,
  onClose,
}: {
  blogId?: string
  onClose: () => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { data: blog, isPending } = useBlog(blogId ?? "", Boolean(blogId))
  const createBlog = useCreateBlog()
  const updateBlog = useUpdateBlog()
  const upload = useUploadCmsImage()
  const [form, setForm] = useState<BlogForm>({
    title: "",
    coverImageUrl: "",
    body: "",
    status: "DRAFT",
  })

  useEffect(() => {
    if (!blog) return
    setForm({
      title: blog.title,
      coverImageUrl: blog.coverImageUrl ?? "",
      body: blog.body,
      status: blog.status,
    })
  }, [blog])

  const saving = createBlog.isPending || updateBlog.isPending

  const handleUpload = async (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return
    const response = await upload.mutateAsync({
      file,
      folderPath: "cms/blogs",
    })
    const url = response.data?.url
    if (!url) {
      toast.error("Upload succeeded but no image URL was returned")
      return
    }
    setForm((current) => ({ ...current, coverImageUrl: url }))
  }

  const handleSave = () => {
    if (!form.title.trim()) {
      toast.error("Title is required")
      return
    }
    if (isEmptyHtml(form.body)) {
      toast.error("Body is required")
      return
    }

    const value = {
      title: form.title.trim(),
      coverImageUrl: form.coverImageUrl.trim() || undefined,
      body: form.body.trim(),
      status: form.status,
    }

    if (blogId && blog) {
      updateBlog.mutate(
        { id: blog.id, version: blog.version ?? 0, value },
        { onSuccess: onClose }
      )
      return
    }

    createBlog.mutate(value, { onSuccess: onClose })
  }

  if (blogId && isPending) {
    return (
      <Card className="p-5">
        <p className="py-8 text-center text-sm text-muted-foreground">
          Loading post…
        </p>
      </Card>
    )
  }

  return (
    <Card className="gap-4 p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-foreground">
          {blogId ? "Edit Post" : "New Post"}
        </h3>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button type="button" disabled={saving} onClick={handleSave}>
            {saving ? "Saving…" : "Save post"}
          </Button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          void handleUpload(event.target.files)
          event.target.value = ""
        }}
      />

      <div className="space-y-4">
        <Field>
          <FieldLabel htmlFor="blog-title">Title</FieldLabel>
          <Input
            id="blog-title"
            value={form.title}
            onChange={(event) =>
              setForm((current) => ({ ...current, title: event.target.value }))
            }
          />
        </Field>
        <Field>
          <FieldLabel>Cover image</FieldLabel>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-32 w-full items-center justify-center overflow-hidden rounded-control border-2 border-dashed border-input text-sm text-muted-foreground hover:border-primary hover:text-primary"
          >
            {form.coverImageUrl ? (
              <img
                src={form.coverImageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="inline-flex items-center gap-2">
                <ImagePlus className="size-5" />
                {upload.isPending ? "Uploading…" : "Upload cover image"}
              </span>
            )}
          </button>
        </Field>
        <Field>
          <FieldLabel htmlFor="blog-body">Body</FieldLabel>
          <RichTextEditor
            id="blog-body"
            value={form.body}
            onChange={(body) => setForm((current) => ({ ...current, body }))}
          />
        </Field>
        <Field>
          <FieldLabel>Publish status</FieldLabel>
          <Select
            items={BLOG_STATUS_ITEMS}
            value={form.status}
            onValueChange={(value) => {
              if (value === "PUBLISHED" || value === "DRAFT") {
                setForm((current) => ({ ...current, status: value }))
              }
            }}
          >
            <SelectTrigger className="h-10 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(BLOG_STATUS_ITEMS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>
    </Card>
  )
}

export function BlogTab() {
  const [ui, setUi] = useState<{
    page: number
    editingId: string | "new" | null
    deleting: { id: string; title: string } | null
  }>({
    page: 0,
    editingId: null,
    deleting: null,
  })
  const { data, isPending, isError } = useBlogs({
    page: ui.page,
    size: PAGE_SIZE,
  })
  const deleteBlog = useDeleteBlog()
  const posts = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  useEffect(() => {
    if (totalPages > 0 && ui.page > totalPages - 1) {
      setUi((current) => ({ ...current, page: totalPages - 1 }))
    }
  }, [ui.page, totalPages])

  if (ui.editingId !== null) {
    return (
      <BlogEditor
        blogId={ui.editingId === "new" ? undefined : ui.editingId}
        onClose={() => setUi((current) => ({ ...current, editingId: null }))}
      />
    )
  }

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="flex items-center justify-between px-5 py-4">
        <h3 className="font-bold text-foreground">Blog Posts</h3>
        <Button
          type="button"
          onClick={() => setUi((current) => ({ ...current, editingId: "new" }))}
        >
          <Plus />
          New Post
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 border-t border-border p-4 sm:grid-cols-3">
        {posts.map((post) => (
          <div
            key={post.id}
            className="overflow-hidden rounded-[var(--radius-card)] border border-border"
          >
            <div className="h-32 bg-muted">
              {post.coverImageUrl ? (
                <img
                  src={post.coverImageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <div className="p-3">
              <div className="mb-1 flex items-center justify-between gap-2">
                <Badge
                  className={`border-transparent font-bold ${blogStatusClass(post.status)}`}
                >
                  {BLOG_STATUS_ITEMS[post.status]}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatCmsDate(post.updatedAt || post.createdAt)}
                </span>
              </div>
              <div className="font-bold text-foreground">{post.title}</div>
              <div className="mt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setUi((current) => ({ ...current, editingId: post.id }))
                  }
                  className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setUi((current) => ({
                      ...current,
                      deleting: { id: post.id, title: post.title },
                    }))
                  }
                  className="inline-flex items-center gap-1 text-sm font-bold text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isPending ? (
        <p className="px-6 py-12 text-center text-sm text-muted-foreground">
          Loading posts…
        </p>
      ) : null}

      {isError ? (
        <p className="px-6 py-12 text-center text-sm text-destructive">
          Failed to load posts.
        </p>
      ) : null}

      {!isPending && !isError && posts.length === 0 ? (
        <p className="px-6 py-12 text-center text-sm text-muted-foreground">
          No blog posts yet.
        </p>
      ) : null}

      {!isPending && !isError ? (
        <ListPagination
          className="border-t border-border px-4 py-3"
          page={ui.page}
          size={PAGE_SIZE}
          totalPages={totalPages}
          totalElements={data?.totalElements ?? 0}
          onPageChange={(page) => setUi((current) => ({ ...current, page }))}
        />
      ) : null}

      <DeleteCmsDialog
        open={ui.deleting !== null}
        title="Delete post"
        description={
          ui.deleting
            ? `Are you sure you want to delete "${ui.deleting.title}"? This action cannot be undone.`
            : "Are you sure you want to delete this post?"
        }
        deleting={deleteBlog.isPending}
        onOpenChange={(open) => {
          if (!open && !deleteBlog.isPending) {
            setUi((current) => ({ ...current, deleting: null }))
          }
        }}
        onConfirm={() => {
          if (!ui.deleting) return
          deleteBlog.mutate(ui.deleting.id, {
            onSuccess: () =>
              setUi((current) => ({ ...current, deleting: null })),
          })
        }}
      />
    </Card>
  )
}
