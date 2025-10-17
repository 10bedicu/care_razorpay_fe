import { CreatePaymentLinkBody, PaymentLink } from "@/types/payment_link";
import { CreateQRCodeBody, QRCode } from "@/types/qr-code";
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
