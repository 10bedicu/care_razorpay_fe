import { CreatePaymentLinkBody, PaymentLink } from "@/types/payment_link";
import { CreateQRCodeBody, QRCode } from "@/types/qr-code";

import { request } from "@/apis/request";

export const apis = {
  payment_links: {
    get: async (id: string) => {
      return await request<PaymentLink>(
        `/api/care_razorpay/payment_link/${id}/`
      );
    },
    create: async (data: CreatePaymentLinkBody) => {
      return await request<PaymentLink>("/api/care_razorpay/payment_link/", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
  },
  qr_codes: {
    get: async (id: string) => {
      return await request<QRCode>(`/api/care_razorpay/qr_code/${id}/`);
    },
    create: async (data: CreateQRCodeBody) => {
      return await request<QRCode>("/api/care_razorpay/qr_code/", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
  },
};
