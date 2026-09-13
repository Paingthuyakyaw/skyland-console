import { MessageSquare } from "lucide-react"

import { Card } from "@/components/ui/card"

export function ReviewsTab() {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="px-5 py-4">
        <h3 className="font-bold text-foreground">Moderation Queue</h3>
        <p className="text-xs text-muted-foreground">
          Guest reviews are collected on public product pages. An admin
          moderation list is not available in the CMS API yet.
        </p>
      </div>
      <div className="flex flex-col items-center justify-center gap-2 border-t border-border px-6 py-16 text-center">
        <MessageSquare className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No reviews to moderate.</p>
      </div>
    </Card>
  )
}
