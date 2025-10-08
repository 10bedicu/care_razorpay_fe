export type QRCodeStatus = "active" | "closed";

export type QRCode = {
  id: string;
  image_url: string;
  close_by?: string | null;
  created_at: string;
  payment_amount: number;
  payments_amount_received: number;
  payments_count_received: number;
  status: QRCodeStatus;
};

export const QR_CODE_USAGE = ["single_use", "multiple_use"] as const;

export type QRCodeUsage = (typeof QR_CODE_USAGE)[number];

export type CreateQRCodeBody = {
  invoice_id: string;
  usage: QRCodeUsage;
  is_amount_fixed: boolean;
  closes_at?: string | null;
};
