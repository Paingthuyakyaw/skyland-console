import { Card, CardContent } from "@/components/ui/card"

export function ComboInquiriesTab() {
  return (
    <Card>
      <CardContent className="p-5">
        <h2 className="font-black text-foreground">Inquiry lead desk</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Qualify the combo request and send a tailored quote before any payment
          is requested.
        </p>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          No inquiries yet.
        </p>
      </CardContent>
    </Card>
  )
}
