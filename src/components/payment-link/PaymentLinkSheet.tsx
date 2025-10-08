import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";
import { CreatePaymentLinkForm } from "../payment-link/CreatePaymentLinkForm";
import { I18NNAMESPACE } from "@/lib/constants";
import { Invoice } from "@/types/invoice";
import { Link2Icon } from "lucide-react";
import { PaymentLink } from "@/types/payment_link";
import { ShowPaymentLinkDialog } from "@/components/payment-link/ShowPaymentLinkDialog";
import { useState } from "react";
import { useTranslation } from "react-i18next";

type PaymentLinkSheetProps = {
  invoice: Invoice;
};

export function PaymentLinkSheet({ invoice }: PaymentLinkSheetProps) {
  const { t } = useTranslation(I18NNAMESPACE);
  const [currentPaymentLink, setCurrentPaymentLink] = useState<PaymentLink>();
  const [showPaymentLinkDialog, setShowPaymentLinkDialog] = useState(false);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full">
          <Link2Icon className="h-4 w-4" />
          {t("collect_payment_via_razorpay_link")}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t("collect_payment_via_razorpay_link")}</SheetTitle>
          <SheetDescription>{t("razorpay_link_description")}</SheetDescription>
        </SheetHeader>

        <div className="mt-8 flex flex-col gap-8">
          <CreatePaymentLinkForm
            invoice={invoice}
            onSuccess={(paymentLink) => {
              setCurrentPaymentLink(paymentLink);
              setShowPaymentLinkDialog(true);
            }}
          />

          {currentPaymentLink && (
            <ShowPaymentLinkDialog
              paymentLink={currentPaymentLink}
              open={showPaymentLinkDialog}
              onOpenChange={setShowPaymentLinkDialog}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
