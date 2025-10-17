import { FC } from "react";
import { Invoice } from "@/types/invoice";
import { PaymentLinkSheet } from "@/components/payment-link/PaymentLinkSheet";
import { QRCodeSheet } from "@/components/qr-code/QRCodeSheet";
import { apis } from "@/apis";
import { useQuery } from "@tanstack/react-query";

export type InvoiceRecordPaymentOptionsProps = {
  facilityId: string;
  invoice: Invoice;
};

const InvoiceRecordPaymentOptions: FC<InvoiceRecordPaymentOptionsProps> = ({
  facilityId,
  invoice,
}) => {
  const { data: razorpayAccount, isLoading: isLoadingRazorpayAccount } =
    useQuery({
      queryKey: ["razorpayAccount", facilityId],
      queryFn: () => apis.razorpay_accounts.get(facilityId),
      enabled: !!facilityId,
    });

  const disabled = isLoadingRazorpayAccount || !razorpayAccount?.is_enabled;
  const disabledReason = isLoadingRazorpayAccount
    ? undefined
    : !razorpayAccount
    ? "razorpay_disabled_reason_no_account"
    : !razorpayAccount.is_enabled
    ? "razorpay_disabled_reason_payments_disabled"
    : undefined;

  return (
    <div className="care-razorpay-container w-full">
      <PaymentLinkSheet
        invoice={invoice}
        disabled={disabled}
        disabledReason={disabledReason}
      />
      <QRCodeSheet
        invoice={invoice}
        disabled={disabled}
        disabledReason={disabledReason}
      />
    </div>
  );
};

export default InvoiceRecordPaymentOptions;
