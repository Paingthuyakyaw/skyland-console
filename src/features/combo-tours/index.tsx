import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useComboCategories } from "@/store/server/combo/query"

import { PlusIcon } from "lucide-react"

function DialogCloseButton() {
  const {data} = useComboCategories();
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline">Manage Categories</Button>} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Manage combo tour categories</DialogTitle>
          <DialogDescription>
            
            <p>Combo tours use primary categories only</p>
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <Input placeholder="" className="flex-1" />
          <Button>Add</Button>
        </div>
        <DialogFooter className="sm:justify-end">
          <DialogClose render={<Button type="button"
          variant={"outline"}
          >Done</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const ComboToursFeature = () => {
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
          <DialogCloseButton />
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
