import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";
import { FC } from "react";
import { I18NNAMESPACE } from "@/lib/constants";
import { Invoice } from "@/types/invoice";
import { LinkIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

export type InvoiceRecordPaymentOptionsProps = {
  invoice: Invoice;
};

const InvoiceRecordPaymentOptions: FC<
  InvoiceRecordPaymentOptionsProps
> = () => {
  const { t } = useTranslation(I18NNAMESPACE);

  return (
    <div className="care-razorpay-container w-full">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost">
            <LinkIcon className="h-4 w-4" />
            {t("pay_via_razorpay_link")}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{t("pay_via_razorpay_link")}</SheetTitle>
            <SheetDescription>
              {t("razorpay_link_description")}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-4 flex gap-2 flex-col">
            <p>{t("razorpay_link_description")}</p>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default InvoiceRecordPaymentOptions;
