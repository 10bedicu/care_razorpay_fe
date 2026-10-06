import { BadgeCheckIcon, BadgeInfoIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency, formatDate, toast } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { APIError } from "@/apis/request";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { I18NNAMESPACE } from "@/lib/constants";
import { Progress } from "@/components/ui/progress";
import {
  QRCodeView,
  qrCodeViewFromGateway,
  qrCodeViewFromRecord,
} from "@/types/qr-code";
import { apis } from "@/apis";

export const QR_CODES_QUERY_KEY = "razorpayQRCodes";

type ShowQRCodeDialogProps = {
  qrCode: QRCodeView;
  invoiceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ShowQRCodeDialog({
  qrCode: initialQRCode,
  invoiceId,
  open,
  onOpenChange,
}: ShowQRCodeDialogProps) {
  const { t } = useTranslation(I18NNAMESPACE);
  const queryClient = useQueryClient();
  const [qrCode, setQRCode] = useState(initialQRCode);

  useEffect(() => {
    setQRCode(initialQRCode);
  }, [initialQRCode]);

  const refresh = useMutation({
    mutationFn: () => apis.qr_codes.refresh(qrCode.id),
    onSuccess: ({ qr_code, gateway, gateway_checked }) => {
      const view = gateway
        ? qrCodeViewFromGateway(gateway)
        : qrCodeViewFromRecord(qr_code);
      setQRCode(view);
      queryClient.invalidateQueries({
        queryKey: [QR_CODES_QUERY_KEY, invoiceId],
      });
      // the host invoice page caches under this key
      queryClient.invalidateQueries({ queryKey: ["invoice", invoiceId] });
      if (!gateway_checked) {
        toast.error(t("razorpay_gateway_unreachable"));
      } else if (
        view.payment_amount > 0 &&
        view.payments_amount_received >= view.payment_amount
      ) {
        toast.success(t("razorpay_payment_confirmed"));
      } else if (view.payments_amount_received > 0) {
        toast.info(t("razorpay_payment_partially_paid"));
      } else if (view.status === "closed") {
        toast.warning(t("razorpay_qr_code_closed_unpaid"));
      } else {
        toast.info(t("razorpay_payment_still_pending"));
      }
    },
    onError: (error) => {
      toast.error(
        error instanceof APIError && error.message
          ? error.message
          : t("razorpay_gateway_unreachable")
      );
    },
  });

  const fixedAmount = qrCode.payment_amount > 0;
  const percentPaid = fixedAmount
    ? Math.min(
        (qrCode.payments_amount_received / qrCode.payment_amount) * 100,
        100
      )
    : 0;
  const isPaid =
    fixedAmount && qrCode.payments_amount_received >= qrCode.payment_amount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("qr_code")}</DialogTitle>
          <DialogDescription>{qrCode.id}</DialogDescription>
        </DialogHeader>
        <Card>
          <CardHeader className="relative">
            <CardDescription>{t("amount_payable")}</CardDescription>
            <CardTitle className="text-3xl">
              {fixedAmount
                ? formatCurrency(qrCode.payment_amount)
                : t("any_amount")}
            </CardTitle>
            <CardDescription>
              {fixedAmount ? (
                <>
                  {percentPaid.toFixed(2)}% {t("paid")} |{" "}
                  {formatCurrency(
                    Math.max(
                      qrCode.payment_amount - qrCode.payments_amount_received,
                      0
                    )
                  )}{" "}
                  {t("pending")}
                </>
              ) : (
                <>
                  {formatCurrency(qrCode.payments_amount_received)}{" "}
                  {t("received")}
                </>
              )}
            </CardDescription>
            {isPaid && (
              <Badge className="bg-green-500 text-white items-center gap-1 capitalize absolute top-6 right-4">
                <BadgeCheckIcon className="h-4 w-4" />
                {t("status_paid")}
              </Badge>
            )}
            {!isPaid && qrCode.payments_amount_received > 0 && (
              <Badge className="bg-yellow-500 text-white items-center gap-1 capitalize absolute top-6 right-4">
                <BadgeInfoIcon className="h-4 w-4" />
                {t("status_partially_paid")}
              </Badge>
            )}
            {!isPaid &&
              qrCode.payments_amount_received === 0 &&
              qrCode.status === "closed" && (
                <Badge className="bg-gray-500 text-white items-center gap-1 capitalize absolute top-6 right-4">
                  {t("status_closed")}
                </Badge>
              )}
          </CardHeader>
          {fixedAmount && (
            <CardContent>
              <Progress value={percentPaid} className="h-6 rounded-sm" />
            </CardContent>
          )}
          {!isPaid && (
            <CardFooter>
              <Button
                className="w-full"
                variant="secondary"
                onClick={() => refresh.mutate()}
                loading={refresh.isPending}
              >
                {t("verify_payment")}
              </Button>
            </CardFooter>
          )}
        </Card>
        {qrCode.status === "active" && (
          <Card>
            <CardContent className="py-6 space-y-1">
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-1 px-3 border w-fit">
                    <img
                      src={qrCode.image_url}
                      alt="QR Code"
                      style={{ height: "360px" }}
                    />
                  </div>
                </div>
              </div>

              {qrCode.close_by && (
                <div className="text-xs text-gray-600 dark:text-gray-400 gap-1 flex items-center justify-center px-2">
                  {t("expires")} {formatDate(qrCode.close_by, true)} (
                  {formatDate(qrCode.close_by)})
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
}
