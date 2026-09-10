import { Button } from "@/components/ui/button"

import { PlusIcon } from "lucide-react"
import { DialogCloseButton } from "@/components/custom-dialog"
import { useState } from "react";

const ComboToursFeature = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex justify-between items-center">
        <div>
          <div className="text-2xl font-bold">ComboTours</div>
          <p>
            Multi-tour bundle offers. Customers can select multiple tours
            bundled at a package price.
          </p>
        </div>
        <div className="flex gap-2 text-sm">
          <DialogCloseButton open={open} setOpen={setOpen} btn="Manage Categories"/>
          <Button>
            <PlusIcon />
            New Combo Tours
          </Button>
        </div>
      </div>
    </>
  )
}

export default ComboToursFeature
