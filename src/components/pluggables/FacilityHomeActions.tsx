import { FC, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";
import { ConfigureRazorpayAccountForm } from "@/components/razorpay-account/ConfigureRazorpayAccountForm";
import { Facility } from "@/types/facility";
import { I18NNAMESPACE } from "@/lib/constants";
import { SettingsIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

type FacilityHomeActionsProps = {
  facility: Facility;
  className?: string;
};

const FacilityHomeActions: FC<FacilityHomeActionsProps> = ({ facility }) => {
  const { t } = useTranslation(I18NNAMESPACE);
  const [open, setOpen] = useState(false);

  if (!facility) {
    return null;
  }

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="abdm-container">
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer font-semibold"
          >
            <SettingsIcon />
            {t("configure_razorpay_account")}
          </Button>
        </SheetTrigger>
        <SheetContent className="abdm-container w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{t("configure_razorpay_account")}</SheetTitle>
            <SheetDescription>
              {t("configure_razorpay_account_description")}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <ConfigureRazorpayAccountForm
              facilityId={facility.id}
              onSuccess={() => {
                setOpen(false);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default FacilityHomeActions;
