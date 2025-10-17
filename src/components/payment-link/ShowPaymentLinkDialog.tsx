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
import { formatCurrency, formatDate } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PaymentLink } from "@/types/payment_link";
import { Progress } from "@/components/ui/progress";
import { apis } from "@/apis";

type ShowPaymentLinkDialogProps = {
  paymentLink: PaymentLink;
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
  const queryClient = useQueryClient();

  const {
    data: paymentLink,
    refetch,
    isFetching: isFetchingPaymentLink,
  } = useQuery({
    queryKey: ["payment_link", initialPaymentLink.id],
    queryFn: () => apis.payment_links.get(initialPaymentLink.id),
    enabled: false,
    initialData: initialPaymentLink,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Payment Link</DialogTitle>
          <DialogDescription>{paymentLink.id}</DialogDescription>
        </DialogHeader>
        <Card>
          <CardHeader className="relative">
            <CardDescription>Amount Payable</CardDescription>
            <CardTitle className="text-3xl">
              {formatCurrency(paymentLink.amount)}
            </CardTitle>
            <CardDescription>
              {((paymentLink.amount_paid / paymentLink.amount) * 100).toFixed(
                2
              )}
              % paid |{" "}
              {formatCurrency(paymentLink.amount - paymentLink.amount_paid)}{" "}
              pending
            </CardDescription>
            {paymentLink.status === "paid" && (
              <Badge className="bg-green-500 text-white items-center gap-1 capitalize absolute top-6 right-4">
                <BadgeCheckIcon className="h-4 w-4" />
                PAID
              </Badge>
            )}
            {paymentLink.status === "partial_paid" && (
              <Badge className="bg-yellow-500 text-white items-center gap-1 capitalize absolute top-6 right-4">
                <BadgeInfoIcon className="h-4 w-4" />
                PARTIALLY PAID
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            <Progress
              value={(paymentLink.amount_paid / paymentLink.amount) * 100}
              className="h-6 rounded-sm"
            />
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              variant="secondary"
              onClick={() => {
                refetch();
                queryClient.invalidateQueries({
                  queryKey: ["payments", invoiceId],
                });
              }}
              loading={isFetchingPaymentLink}
            >
              Verify Payment
            </Button>
          </CardFooter>
        </Card>
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
                Expires {formatDate(paymentLink.expire_by, true)} (
                {formatDate(paymentLink.expire_by)})
              </div>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}

export function ShowPaymentLinkDialogSkeleton() {
  return <div>ShowPaymentLinkDialogSkeleton</div>;
}
