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

export type CreatePaymentLinkBody = {
  invoice_id: string;
  email?: string | null;
  phone_number?: string | null;
  is_partial_payment_allowed: boolean;
  minimum_down_payment?: number | null;
  expires_at?: string | null;
};
