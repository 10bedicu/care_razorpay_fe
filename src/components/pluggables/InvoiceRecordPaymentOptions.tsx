import { FC } from "react";
import { Invoice } from "@/types/invoice";
import { PaymentLinkSheet } from "@/components/payment-link/PaymentLinkSheet";
import { QRCodeSheet } from "@/components/qr-code/QRCodeSheet";

export type InvoiceRecordPaymentOptionsProps = {
  invoice: Invoice;
};

const InvoiceRecordPaymentOptions: FC<InvoiceRecordPaymentOptionsProps> = ({
  invoice,
}) => {
  return (
    <div className="care-razorpay-container w-full">
      <PaymentLinkSheet invoice={invoice} />
      <QRCodeSheet invoice={invoice} />
    </div>
  );
};

export default InvoiceRecordPaymentOptions;
