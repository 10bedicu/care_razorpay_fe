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
import { CreateQRCodeForm } from "@/components/qr-code/CreateQRCodeForm";
import { I18NNAMESPACE } from "@/lib/constants";
import { Invoice } from "@/types/invoice";
import { QRCode } from "@/types/qr-code";
import { QrCodeIcon } from "lucide-react";
import { ShowQRCodeDialog } from "@/components/qr-code/ShowQRCodeDialog";
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
  const [currentQRCode, setCurrentQRCode] = useState<QRCode>();
  const [showQRCodeDialog, setShowQRCodeDialog] = useState(false);

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
          <CreateQRCodeForm
            invoice={invoice}
            onSuccess={(qrCode) => {
              setCurrentQRCode(qrCode);
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
