import { forwardRef, useEffect, useImperativeHandle, useState } from "react"
import { toast } from "sonner"

import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { SettingsImageField } from "@/features/settings/components/image-field"
import {
  optionalText,
  type SettingsTabHandle,
} from "@/features/settings/components/utils"
import {
  useCompanyInformation,
  useUpdateCompanyInformation,
} from "@/store/server/settings/settings"

type FormState = {
  companyName: string
  uaeOfficeAddress: string
  franceOfficeAddress: string
  contactEmail: string
  contactPhone: string
  logoUrl: string
  version: number
}

const EMPTY: FormState = {
  companyName: "",
  uaeOfficeAddress: "",
  franceOfficeAddress: "",
  contactEmail: "",
  contactPhone: "",
  logoUrl: "",
  version: 0,
}

export const CompanyTab = forwardRef<SettingsTabHandle>(
  function CompanyTab(_, ref) {
    const { data, isPending, isError } = useCompanyInformation()
    const update = useUpdateCompanyInformation()
    const [form, setForm] = useState<FormState>(EMPTY)

    useEffect(() => {
      if (!data) return
      setForm({
        companyName: data.companyName ?? "",
        uaeOfficeAddress: data.uaeOfficeAddress ?? "",
        franceOfficeAddress: data.franceOfficeAddress ?? "",
        contactEmail: data.contactEmail ?? "",
        contactPhone: data.contactPhone ?? "",
        logoUrl: data.logoUrl ?? "",
        version: data.version ?? 0,
      })
    }, [data])

    useImperativeHandle(
      ref,
      () => ({
        save: async () => {
          if (!form.companyName.trim()) {
            toast.error("Company name is required")
            return
          }
          if (
            !form.uaeOfficeAddress.trim() ||
            !form.franceOfficeAddress.trim()
          ) {
            toast.error("Office addresses are required")
            return
          }
          if (!form.contactEmail.trim() || !form.contactPhone.trim()) {
            toast.error("Contact email and phone are required")
            return
          }
          await update.mutateAsync({
            version: form.version,
            companyName: form.companyName.trim(),
            uaeOfficeAddress: form.uaeOfficeAddress.trim(),
            franceOfficeAddress: form.franceOfficeAddress.trim(),
            contactEmail: form.contactEmail.trim(),
            contactPhone: form.contactPhone.trim(),
            logoUrl: optionalText(form.logoUrl),
          })
        },
      }),
      [form, update]
    )

    if (isPending) {
      return <p className="text-sm text-muted-foreground">Loading company…</p>
    }
    if (isError) {
      return (
        <p className="text-sm text-destructive">
          Failed to load company settings.
        </p>
      )
    }

    return (
      <div className="space-y-4">
        <h3 className="font-bold text-foreground">Company Information</h3>
        <Field>
          <FieldLabel htmlFor="company-name">Company name</FieldLabel>
          <Input
            id="company-name"
            value={form.companyName}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                companyName: event.target.value,
              }))
            }
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="uae-address">UAE office address</FieldLabel>
            <Textarea
              id="uae-address"
              rows={3}
              value={form.uaeOfficeAddress}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  uaeOfficeAddress: event.target.value,
                }))
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="france-address">
              France office address
            </FieldLabel>
            <Textarea
              id="france-address"
              rows={3}
              value={form.franceOfficeAddress}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  franceOfficeAddress: event.target.value,
                }))
              }
            />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="contact-email">Contact email</FieldLabel>
            <Input
              id="contact-email"
              type="email"
              value={form.contactEmail}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  contactEmail: event.target.value,
                }))
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="contact-phone">Contact phone</FieldLabel>
            <Input
              id="contact-phone"
              value={form.contactPhone}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  contactPhone: event.target.value,
                }))
              }
            />
          </Field>
        </div>
        <SettingsImageField
          label="Logo"
          value={form.logoUrl}
          folderPath="settings/company"
          emptyLabel="Upload logo"
          onChange={(logoUrl) =>
            setForm((current) => ({ ...current, logoUrl }))
          }
        />
      </div>
    )
  }
)
