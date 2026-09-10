import { useState } from "react";
import { DialogCloseButton } from "@/components/custom-dialog";

const HolidayPackageFeature = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
    <div>
      <div>
      <div className="font-bold text-2xl">Holiday Packages</div>
    <p>Inquiry-only holiday offers. Visitors see a starting price and submit a request — never a payment checkout.

</p>
      </div>
      <DialogCloseButton open={open} setOpen={setOpen} btn="Manage Categories"/>
    </div>
    </>
  )
}

export default HolidayPackageFeature