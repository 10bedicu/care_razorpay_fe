import {
  QR_CODES_QUERY_KEY,
  ShowQRCodeDialog,
} from "@/components/qr-code/ShowQRCodeDialog";
import {
  QRCodeView,
  qrCodeViewFromGateway,
  qrCodeViewFromRecord,
} from "@/types/qr-code";
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
import { CreateQRCodeForm } from "@/components/qr-code/CreateQRCodeForm";
import { I18NNAMESPACE } from "@/lib/constants";
import { Invoice } from "@/types/invoice";
import { QrCodeIcon } from "lucide-react";
import { apis } from "@/apis";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";

type QRCodeSheetProps = {
  invoice: Invoice;
  disabled?: boolean;
  disabledReason?: string;
};

export function QRCodeSheet({
  invoice,
  disabled,
  disabledReason,
}: QRCodeSheetProps) {
  const { t } = useTranslation(I18NNAMESPACE);
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [currentQRCode, setCurrentQRCode] = useState<QRCodeView>();
  const [showQRCodeDialog, setShowQRCodeDialog] = useState(false);

  const { data: active } = useQuery({
    queryKey: [QR_CODES_QUERY_KEY, invoice.id],
    queryFn: () => apis.qr_codes.list(invoice.id, "active"),
    enabled: open && !!invoice.id,
  });
  const activeQRCodes = active?.results ?? [];

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
                  <QrCodeIcon className="h-4 w-4" />
                  {t("collect_payment_via_razorpay_qr_code")}
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
            <QrCodeIcon className="h-4 w-4" />
            {t("collect_payment_via_razorpay_qr_code")}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t("collect_payment_via_razorpay_qr_code")}</SheetTitle>
          <SheetDescription>
            {t("razorpay_qr_code_description")}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-8 flex flex-col gap-8">
          {activeQRCodes.length > 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-medium">{t("existing_qr_codes")}</h3>
              {activeQRCodes.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between gap-3 rounded-lg border p-3 shadow-sm"
                >
                  <div className="min-w-0 text-sm">
                    <div className="font-medium">
                      {record.amount
                        ? formatCurrency(Number(record.amount))
                        : t("any_amount")}
                      {Number(record.amount_received) > 0 && (
                        <span className="ml-2 text-xs font-normal text-gray-500">
                          {formatCurrency(Number(record.amount_received))}{" "}
                          {t("received")}
                        </span>
                      )}
                    </div>
                    <div className="truncate text-xs text-gray-500">
                      {record.qr_id}
                      {record.close_by && (
                        <>
                          {" · "}
                          {t("expires")} {formatDate(record.close_by, true)}
                        </>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setCurrentQRCode(qrCodeViewFromRecord(record));
                      setShowQRCodeDialog(true);
                    }}
                  >
                    {t("view_and_verify")}
                  </Button>
                </div>
              ))}
            </div>
          )}

          <CreateQRCodeForm
            invoice={invoice}
            onSuccess={(qrCode) => {
              queryClient.invalidateQueries({
                queryKey: [QR_CODES_QUERY_KEY, invoice.id],
              });
              setCurrentQRCode(qrCodeViewFromGateway(qrCode));
              setShowQRCodeDialog(true);
            }}
          />

          {currentQRCode && (
            <ShowQRCodeDialog
              qrCode={currentQRCode}
              invoiceId={invoice.id}
              open={showQRCodeDialog}
              onOpenChange={setShowQRCodeDialog}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
