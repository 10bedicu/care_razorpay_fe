import { BadgeCheckIcon, BadgeInfoIcon, CopyIcon } from "lucide-react";
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
import {
  PaymentLinkView,
  paymentLinkViewFromGateway,
  paymentLinkViewFromRecord,
} from "@/types/payment_link";
import { Progress } from "@/components/ui/progress";
import { apis } from "@/apis";

export const PAYMENT_LINKS_QUERY_KEY = "razorpayPaymentLinks";

type ShowPaymentLinkDialogProps = {
  paymentLink: PaymentLinkView;
  invoiceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ShowPaymentLinkDialog({
  paymentLink: initialPaymentLink,
  invoiceId,
  open,
  onOpenChange,
}: ShowPaymentLinkDialogProps) {
  const { t } = useTranslation(I18NNAMESPACE);
  const queryClient = useQueryClient();
  const [paymentLink, setPaymentLink] = useState(initialPaymentLink);

  useEffect(() => {
    setPaymentLink(initialPaymentLink);
  }, [initialPaymentLink]);

  const refresh = useMutation({
    mutationFn: () => apis.payment_links.refresh(paymentLink.id),
    onSuccess: ({ payment, link, gateway_checked }) => {
      setPaymentLink(
        link
          ? paymentLinkViewFromGateway(link, payment)
          : paymentLinkViewFromRecord(payment)
      );
      queryClient.invalidateQueries({
        queryKey: [PAYMENT_LINKS_QUERY_KEY, invoiceId],
      });
      // the host invoice page caches under this key
      queryClient.invalidateQueries({ queryKey: ["invoice", invoiceId] });
      if (payment.status === "paid") {
        toast.success(t("razorpay_payment_confirmed"));
      } else if (!gateway_checked) {
        toast.error(t("razorpay_gateway_unreachable"));
      } else if (payment.status === "partially_paid") {
        toast.info(t("razorpay_payment_partially_paid"));
      } else if (payment.status === "created") {
        toast.info(t("razorpay_payment_still_pending"));
      } else {
        toast.warning(
          t("razorpay_payment_not_completed", { status: payment.status })
        );
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

  const percentPaid =
    paymentLink.amount > 0
      ? (paymentLink.amount_paid / paymentLink.amount) * 100
      : 0;
  const isOpen =
    paymentLink.status === "created" || paymentLink.status === "partially_paid";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("payment_link")}</DialogTitle>
          <DialogDescription>{paymentLink.id}</DialogDescription>
        </DialogHeader>
        <Card>
          <CardHeader className="relative">
            <CardDescription>{t("amount_payable")}</CardDescription>
            <CardTitle className="text-3xl">
              {formatCurrency(paymentLink.amount)}
            </CardTitle>
            <CardDescription>
              {percentPaid.toFixed(2)}% {t("paid")} |{" "}
              {formatCurrency(
                Math.max(paymentLink.amount - paymentLink.amount_paid, 0)
              )}{" "}
              {t("pending")}
            </CardDescription>
            {paymentLink.status === "paid" && (
              <Badge className="bg-green-500 text-white items-center gap-1 capitalize absolute top-6 right-4">
                <BadgeCheckIcon className="h-4 w-4" />
                {t("status_paid")}
              </Badge>
            )}
            {paymentLink.status === "partially_paid" && (
              <Badge className="bg-yellow-500 text-white items-center gap-1 capitalize absolute top-6 right-4">
                <BadgeInfoIcon className="h-4 w-4" />
                {t("status_partially_paid")}
              </Badge>
            )}
            {!isOpen && paymentLink.status !== "paid" && (
              <Badge className="bg-gray-500 text-white items-center gap-1 capitalize absolute top-6 right-4">
                {t(`status_${paymentLink.status}`)}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress value={percentPaid} className="h-6 rounded-sm" />
            {paymentLink.reference && (
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {t("reference")}: {paymentLink.reference}
              </div>
            )}
            {paymentLink.needs_review && (
              <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-900">
                <div className="font-medium">{t("needs_review")}</div>
                <div className="whitespace-pre-line">
                  {paymentLink.review_reason}
                </div>
              </div>
            )}
          </CardContent>
          {paymentLink.status !== "paid" && (
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
        {isOpen && (
          <Card>
            <CardContent className="py-6 space-y-1">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-md p-1 px-3 border">
                    <code className="text-sm font-mono break-all text-gray-900 dark:text-gray-100">
                      {paymentLink.short_url}
                    </code>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () =>
                      await navigator.clipboard.writeText(paymentLink.short_url)
                    }
                    className="shrink-0"
                  >
                    <CopyIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {paymentLink.expire_by && (
                <div className="text-xs text-gray-600 dark:text-gray-400 gap-1 flex items-center px-2">
                  {t("expires")} {formatDate(paymentLink.expire_by, true)} (
                  {formatDate(paymentLink.expire_by)})
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function ShowPaymentLinkDialogSkeleton() {
  return <div>ShowPaymentLinkDialogSkeleton</div>;
}
