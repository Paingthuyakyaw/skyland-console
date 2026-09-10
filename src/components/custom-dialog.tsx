
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog"
  import { Input } from "@/components/ui/input"
  import { useComboCategories } from "@/store/server/combo/query"


interface dataProps  {
  open : boolean,
  setOpen : React.Dispatch<React.SetStateAction<boolean>>
  btn ? : string
}

export function DialogCloseButton({open , setOpen , btn} : dataProps) {
    const {data} = useComboCategories();
    return (
     <>
       <Button onClick={() => setOpen(!open)}> {btn || "Manage Categories"}</Button>
      <Dialog open = {open} onOpenChange ={setOpen} >
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
     </>
    )
  }