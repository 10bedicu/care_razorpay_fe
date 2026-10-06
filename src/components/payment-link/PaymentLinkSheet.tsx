import {
  PAYMENT_LINKS_QUERY_KEY,
  ShowPaymentLinkDialog,
} from "@/components/payment-link/ShowPaymentLinkDialog";
import {
  PaymentLinkView,
  paymentLinkViewFromGateway,
  paymentLinkViewFromRecord,
} from "@/types/payment_link";
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
import { formatCurrency, formatDate } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { CreatePaymentLinkForm } from "@/components/payment-link/CreatePaymentLinkForm";
import { I18NNAMESPACE } from "@/lib/constants";
import { Invoice } from "@/types/invoice";
import { Link2Icon } from "lucide-react";
import { apis } from "@/apis";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [currentPaymentLink, setCurrentPaymentLink] =
    useState<PaymentLinkView>();
  const [showPaymentLinkDialog, setShowPaymentLinkDialog] = useState(false);

  const { data: pending } = useQuery({
    queryKey: [PAYMENT_LINKS_QUERY_KEY, invoice.id],
    queryFn: () =>
      apis.payment_links.list(invoice.id, "created,partially_paid"),
    enabled: open && !!invoice.id,
  });
  const pendingLinks = pending?.results ?? [];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
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
          {pendingLinks.length > 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-medium">
                {t("existing_payment_links")}
              </h3>
              {pendingLinks.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between gap-3 rounded-lg border p-3 shadow-sm"
                >
                  <div className="min-w-0 text-sm">
                    <div className="font-medium">
                      {formatCurrency(Number(record.amount))}
                      <span className="ml-2 text-xs font-normal uppercase text-gray-500">
                        {t(`status_${record.status}`)}
                      </span>
                    </div>
                    <div className="truncate text-xs text-gray-500">
                      {record.payment_link_id}
                      {record.expires_at && (
                        <>
                          {" · "}
                          {t("expires")} {formatDate(record.expires_at, true)}
                        </>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setCurrentPaymentLink(paymentLinkViewFromRecord(record));
                      setShowPaymentLinkDialog(true);
                    }}
                  >
                    {t("view_and_verify")}
                  </Button>
                </div>
              ))}
            </div>
          )}

          <CreatePaymentLinkForm
            invoice={invoice}
            onSuccess={(paymentLink) => {
              queryClient.invalidateQueries({
                queryKey: [PAYMENT_LINKS_QUERY_KEY, invoice.id],
              });
              setCurrentPaymentLink(paymentLinkViewFromGateway(paymentLink));
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
