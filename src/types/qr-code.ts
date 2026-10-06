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

/** What CARE knows about a QR code, independent of the gateway. */
export type QRCodeRecord = {
  id: string;
  invoice_id: string;
  qr_id: string;
  image_url: string;
  amount: string | null;
  usage: string;
  close_by: string | null;
  status: QRCodeStatus;
  amount_received: string;
  payments_count: number;
  created_date: string;
  modified_date: string;
};

export type RefreshQRCodeResponse = {
  qr_code: QRCodeRecord;
  gateway: QRCode | null;
  gateway_checked: boolean;
};

/** One shape for the dialog, whether the data came from CARE or Razorpay. */
export type QRCodeView = {
  id: string;
  image_url: string;
  close_by?: string | null;
  payment_amount: number;
  payments_amount_received: number;
  status: QRCodeStatus;
};

export const qrCodeViewFromGateway = (qrCode: QRCode): QRCodeView => ({
  id: qrCode.id,
  image_url: qrCode.image_url,
  close_by: qrCode.close_by,
  payment_amount: qrCode.payment_amount,
  payments_amount_received: qrCode.payments_amount_received,
  status: qrCode.status,
});

export const qrCodeViewFromRecord = (record: QRCodeRecord): QRCodeView => ({
  id: record.qr_id,
  image_url: record.image_url,
  close_by: record.close_by,
  payment_amount: Number(record.amount ?? 0),
  payments_amount_received: Number(record.amount_received),
  status: record.status,
});

export const QR_CODE_USAGE = ["single_use", "multiple_use"] as const;

export type QRCodeUsage = (typeof QR_CODE_USAGE)[number];

export type CreateQRCodeBody = {
  invoice_id: string;
  usage: QRCodeUsage;
  is_amount_fixed: boolean;
  closes_at?: string | null;
};
