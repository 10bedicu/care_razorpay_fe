import {
  CreatePaymentLinkBody,
  PaymentLink,
  PaymentRecord,
  RefreshPaymentLinkResponse,
} from "@/types/payment_link";
import {
  CreateQRCodeBody,
  QRCode,
  QRCodeRecord,
  RefreshQRCodeResponse,
} from "@/types/qr-code";
import {
  CreateRazorpayAccountBody,
  RazorpayAccount,
  UpdateRazorpayAccountBody,
} from "@/types/razorpay_account";

import { request } from "@/apis/request";

export const apis = {
  razorpay_accounts: {
    get: async (facilityId: string) => {
      return await request<RazorpayAccount>(
        `/api/care_razorpay/razorpay_account/${facilityId}/`
      );
    },
    create: async (data: CreateRazorpayAccountBody) => {
      return await request<RazorpayAccount>(
        "/api/care_razorpay/razorpay_account/",
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );
    },
    update: async (facilityId: string, data: UpdateRazorpayAccountBody) => {
      return await request<RazorpayAccount>(
        `/api/care_razorpay/razorpay_account/${facilityId}/`,
        {
          method: "PATCH",
          body: JSON.stringify(data),
        }
      );
    },
  },
  payment_links: {
    get: async (id: string) => {
      return await request<PaymentLink>(
        `/api/care_razorpay/payment_link/${id}/`
      );
    },
    /** Links CARE created for the invoice, newest first, as CARE last knew them. */
    list: async (invoiceId: string, status?: string) => {
      const query = new URLSearchParams({ invoice: invoiceId });
      if (status) query.set("status", status);
      return await request<{ count: number; results: PaymentRecord[] }>(
        `/api/care_razorpay/payment_link/?${query.toString()}`
      );
    },
    create: async (data: CreatePaymentLinkBody) => {
      return await request<PaymentLink>("/api/care_razorpay/payment_link/", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    /** Asks Razorpay for the link's state and settles it in CARE if paid. */
    refresh: async (id: string) => {
      return await request<RefreshPaymentLinkResponse>(
        `/api/care_razorpay/payment_link/${id}/refresh/`,
        { method: "POST" }
      );
    },
  },
  qr_codes: {
    get: async (id: string) => {
      return await request<QRCode>(`/api/care_razorpay/qr_code/${id}/`);
    },
    list: async (invoiceId: string, status?: string) => {
      const query = new URLSearchParams({ invoice: invoiceId });
      if (status) query.set("status", status);
      return await request<{ count: number; results: QRCodeRecord[] }>(
        `/api/care_razorpay/qr_code/?${query.toString()}`
      );
    },
    create: async (data: CreateQRCodeBody) => {
      return await request<QRCode>("/api/care_razorpay/qr_code/", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    /** Asks Razorpay for the QR code's payments and records any CARE missed. */
    refresh: async (id: string) => {
      return await request<RefreshQRCodeResponse>(
        `/api/care_razorpay/qr_code/${id}/refresh/`,
        { method: "POST" }
      );
    },
  },
};
