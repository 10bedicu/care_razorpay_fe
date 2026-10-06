export type PaymentLinkStatus =
  | "created"
  | "paid"
  | "partial_paid"
  | "expired"
  | "cancelled";

export type PaymentLink = {
  id: string;
  short_url: string;
  created_at: string;
  expire_by?: string | null;
  amount: number;
  amount_paid: number;
  status: PaymentLinkStatus;
};

export type PaymentRecordStatus =
  | "created"
  | "partially_paid"
  | "paid"
  | "expired"
  | "cancelled"
  | "superseded";

/** What CARE knows about a payment link, independent of the gateway. */
export type PaymentRecord = {
  id: string;
  invoice_id: string;
  payment_link_id: string;
  payment_url: string;
  amount: string;
  status: PaymentRecordStatus;
  reference: string;
  expires_at: string | null;
  needs_review: boolean;
  review_reason: string;
  created_date: string;
  modified_date: string;
};

export type RefreshPaymentLinkResponse = {
  payment: PaymentRecord;
  link: PaymentLink | null;
  gateway_checked: boolean;
};

/** One shape for the dialog, whether the data came from CARE or Razorpay. */
export type PaymentLinkView = {
  id: string;
  short_url: string;
  amount: number;
  amount_paid: number;
  status: PaymentRecordStatus;
  expire_by?: string | null;
  reference?: string;
  needs_review?: boolean;
  review_reason?: string;
};

const GATEWAY_STATUS: Record<PaymentLinkStatus, PaymentRecordStatus> = {
  created: "created",
  paid: "paid",
  partial_paid: "partially_paid",
  expired: "expired",
  cancelled: "cancelled",
};

export const paymentLinkViewFromGateway = (
  link: PaymentLink,
  record?: PaymentRecord
): PaymentLinkView => ({
  id: link.id,
  short_url: link.short_url,
  amount: link.amount,
  amount_paid: link.amount_paid,
  status: record?.status ?? GATEWAY_STATUS[link.status] ?? "created",
  expire_by: link.expire_by,
  reference: record?.reference,
  needs_review: record?.needs_review,
  review_reason: record?.review_reason,
});

export const paymentLinkViewFromRecord = (
  record: PaymentRecord
): PaymentLinkView => {
  const amount = Number(record.amount);
  return {
    id: record.payment_link_id,
    short_url: record.payment_url,
    amount,
    amount_paid: record.status === "paid" ? amount : 0,
    status: record.status,
    expire_by: record.expires_at,
    reference: record.reference,
    needs_review: record.needs_review,
    review_reason: record.review_reason,
  };
};

export type CreatePaymentLinkBody = {
  invoice_id: string;
  email?: string | null;
  phone_number?: string | null;
  is_partial_payment_allowed: boolean;
  minimum_down_payment?: number | null;
  expires_at?: string | null;
};
