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
import { formatCurrency, formatDate } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { QRCode } from "@/types/qr-code";
import { apis } from "@/apis";
import { useQuery } from "@tanstack/react-query";

type ShowQRCodeDialogProps = {
  qrCode: QRCode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ShowQRCodeDialog({
  qrCode: initialQRCode,
  open,
  onOpenChange,
}: ShowQRCodeDialogProps) {
  const {
    data: qrCode,
    refetch,
    isFetching: isFetchingQRCode,
  } = useQuery({
    queryKey: ["qr_code", initialQRCode.id],
    queryFn: () => apis.qr_codes.get(initialQRCode.id),
    enabled: false,
    initialData: initialQRCode,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>QR Code</DialogTitle>
          <DialogDescription>{qrCode.id}</DialogDescription>
        </DialogHeader>
        <Card>
          <CardHeader className="relative">
            <CardDescription>Amount Payable</CardDescription>
            <CardTitle className="text-3xl">
              {formatCurrency(qrCode.payment_amount)}
            </CardTitle>
            <CardDescription>
              {(
                (qrCode.payments_amount_received / qrCode.payment_amount) *
                100
              ).toFixed(2)}
              % paid |{" "}
              {formatCurrency(
                qrCode.payment_amount - qrCode.payments_amount_received
              )}{" "}
              pending
            </CardDescription>
            {qrCode.payments_amount_received === qrCode.payment_amount && (
              <Badge className="bg-green-500 text-white items-center gap-1 capitalize absolute top-6 right-4">
                <BadgeCheckIcon className="h-4 w-4" />
                PAID
              </Badge>
            )}
            {qrCode.payments_amount_received < qrCode.payment_amount &&
              qrCode.payments_amount_received > 0 && (
                <Badge className="bg-yellow-500 text-white items-center gap-1 capitalize absolute top-6 right-4">
                  <BadgeInfoIcon className="h-4 w-4" />
                  PARTIALLY PAID
                </Badge>
              )}
          </CardHeader>
          <CardContent>
            <Progress
              value={
                (qrCode.payments_amount_received / qrCode.payment_amount) * 100
              }
              className="h-6 rounded-sm"
            />
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              variant="secondary"
              onClick={() => refetch()}
              loading={isFetchingQRCode}
            >
              Verify Payment
            </Button>
          </CardFooter>
        </Card>
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
                Expires {formatDate(qrCode.close_by, true)} (
                {formatDate(qrCode.close_by)})
              </div>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
