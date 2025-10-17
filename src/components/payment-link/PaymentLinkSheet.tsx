import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Button } from "@/components/ui/button";
import { CreatePaymentLinkForm } from "@/components/payment-link/CreatePaymentLinkForm";
import { I18NNAMESPACE } from "@/lib/constants";
import { Invoice } from "@/types/invoice";
import { Link2Icon } from "lucide-react";
import { PaymentLink } from "@/types/payment_link";
import { ShowPaymentLinkDialog } from "@/components/payment-link/ShowPaymentLinkDialog";
import { useState } from "react";
import { useTranslation } from "react-i18next";

type PaymentLinkSheetProps = {
  invoice: Invoice;
  disabled?: boolean;
  disabledReason?: string;
};

export function PaymentLinkSheet({
  invoice,
  disabled,
  disabledReason,
}: PaymentLinkSheetProps) {
  const { t } = useTranslation(I18NNAMESPACE);
  const [currentPaymentLink, setCurrentPaymentLink] = useState<PaymentLink>();
  const [showPaymentLinkDialog, setShowPaymentLinkDialog] = useState(false);

  return (
    <Sheet>
      <SheetTrigger asChild disabled={disabled}>
        {disabled && disabledReason ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="w-full">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  disabled
                >
                  <Link2Icon className="h-4 w-4" />
                  {t("collect_payment_via_razorpay_link")}
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>{t(disabledReason)}</TooltipContent>
          </Tooltip>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            disabled={disabled}
          >
            <Link2Icon className="h-4 w-4" />
            {t("collect_payment_via_razorpay_link")}
          </Button>
        )}
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
              invoiceId={invoice.id}
              open={showPaymentLinkDialog}
              onOpenChange={setShowPaymentLinkDialog}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
