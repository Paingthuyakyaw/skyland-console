import { useEffect, useState } from "react"
import { ChevronDown, Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { CustomDialog } from "@/components/custom-dialog"
import { ListPagination } from "@/components/list-pagination"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DeleteCmsDialog } from "@/features/website/components/delete-cms-dialog"
import { cn } from "@/lib/utils"
import {
  useCreateFaq,
  useDeleteFaq,
  useFaqs,
  useUpdateFaq,
} from "@/store/server/cms/cms"
import type { FaqResponse } from "@/store/server/cms/typed"

const PAGE_SIZE = 20

type FaqForm = {
  question: string
  answer: string
}

export function FaqsTab() {
  const [ui, setUi] = useState<{
    page: number
    openIds: string[]
    formOpen: boolean
    editing: FaqResponse | null
    form: FaqForm
    deleting: FaqResponse | null
  }>({
    page: 0,
    openIds: [],
    formOpen: false,
    editing: null,
    form: { question: "", answer: "" },
    deleting: null,
  })
  const { data, isPending, isError } = useFaqs({
    page: ui.page,
    size: PAGE_SIZE,
  })
  const createFaq = useCreateFaq()
  const updateFaq = useUpdateFaq()
  const deleteFaq = useDeleteFaq()
  const faqs = data?.content ?? []
  const totalPages = data?.totalPages ?? 0
  const saving = createFaq.isPending || updateFaq.isPending

  useEffect(() => {
    if (totalPages > 0 && ui.page > totalPages - 1) {
      setUi((current) => ({ ...current, page: totalPages - 1 }))
    }
  }, [ui.page, totalPages])

  const handleSave = () => {
    if (!ui.form.question.trim()) {
      toast.error("Question is required")
      return
    }
    if (!ui.form.answer.trim()) {
      toast.error("Answer is required")
      return
    }

    const value = {
      question: ui.form.question.trim(),
      answer: ui.form.answer.trim(),
    }

    if (ui.editing) {
      updateFaq.mutate(
        { id: ui.editing.id, version: ui.editing.version ?? 0, value },
        {
          onSuccess: () => {
            setUi((current) => ({
              ...current,
              formOpen: false,
              editing: null,
            }))
          },
        }
      )
      return
    }

    createFaq.mutate(value, {
      onSuccess: () => setUi((current) => ({ ...current, formOpen: false })),
    })
  }

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="flex items-center justify-between px-5 py-4">
        <h3 className="font-bold text-foreground">FAQs</h3>
        <Button
          type="button"
          onClick={() => {
            setUi((current) => ({
              ...current,
              editing: null,
              form: { question: "", answer: "" },
              formOpen: true,
            }))
          }}
        >
          <Plus />
          Add FAQ
        </Button>
      </div>

      <div className="divide-y divide-border border-t border-border">
        {faqs.map((faq) => {
          const open = ui.openIds.includes(faq.id)
          return (
            <div key={faq.id} className="px-5 py-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setUi((current) => ({
                      ...current,
                      openIds: current.openIds.includes(faq.id)
                        ? current.openIds.filter((id) => id !== faq.id)
                        : [...current.openIds, faq.id],
                    }))
                  }
                  className="flex flex-1 items-center justify-between text-left"
                >
                  <span className="font-bold text-foreground">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform",
                      open && "rotate-180"
                    )}
                  />
                </button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label={`Edit ${faq.question}`}
                  onClick={() => {
                    setUi((current) => ({
                      ...current,
                      editing: faq,
                      form: {
                        question: faq.question,
                        answer: faq.answer,
                      },
                      formOpen: true,
                    }))
                  }}
                >
                  <Pencil />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label={`Delete ${faq.question}`}
                  onClick={() =>
                    setUi((current) => ({ ...current, deleting: faq }))
                  }
                >
                  <Trash2 />
                </Button>
              </div>
              {open ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  {faq.answer}
                </p>
              ) : null}
            </div>
          )
        })}
      </div>

      {isPending ? (
        <p className="px-6 py-12 text-center text-sm text-muted-foreground">
          Loading FAQs…
        </p>
      ) : null}

      {isError ? (
        <p className="px-6 py-12 text-center text-sm text-destructive">
          Failed to load FAQs.
        </p>
      ) : null}

      {!isPending && !isError && faqs.length === 0 ? (
        <p className="px-6 py-12 text-center text-sm text-muted-foreground">
          No FAQs yet.
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

      <CustomDialog
        open={ui.formOpen}
        onOpenChange={(open) => {
          if (!saving) {
            setUi((current) => ({
              ...current,
              formOpen: open,
              editing: open ? current.editing : null,
            }))
          }
        }}
        title={ui.editing ? "Edit FAQ" : "Add FAQ"}
        showDone={false}
        contentClassName="sm:max-w-md"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => {
                setUi((current) => ({
                  ...current,
                  formOpen: false,
                  editing: null,
                }))
              }}
            >
              Cancel
            </Button>
            <Button type="button" disabled={saving} onClick={handleSave}>
              {saving ? "Saving…" : ui.editing ? "Save changes" : "Add FAQ"}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Field>
            <FieldLabel htmlFor="faq-question">Question</FieldLabel>
            <Input
              id="faq-question"
              value={ui.form.question}
              onChange={(event) =>
                setUi((current) => ({
                  ...current,
                  form: { ...current.form, question: event.target.value },
                }))
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="faq-answer">Answer</FieldLabel>
            <Textarea
              id="faq-answer"
              rows={5}
              value={ui.form.answer}
              onChange={(event) =>
                setUi((current) => ({
                  ...current,
                  form: { ...current.form, answer: event.target.value },
                }))
              }
            />
          </Field>
        </div>
      </CustomDialog>

      <DeleteCmsDialog
        open={ui.deleting !== null}
        title="Delete FAQ"
        description={
          ui.deleting
            ? `Are you sure you want to delete "${ui.deleting.question}"? This action cannot be undone.`
            : "Are you sure you want to delete this FAQ?"
        }
        deleting={deleteFaq.isPending}
        onOpenChange={(open) => {
          if (!open && !deleteFaq.isPending) {
            setUi((current) => ({ ...current, deleting: null }))
          }
        }}
        onConfirm={() => {
          if (!ui.deleting) return
          deleteFaq.mutate(ui.deleting.id, {
            onSuccess: () =>
              setUi((current) => ({ ...current, deleting: null })),
          })
        }}
      />
    </Card>
  )
}
