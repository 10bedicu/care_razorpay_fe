import { CreatePaymentLinkBody, PaymentLink } from "@/types/payment_link";

import { request } from "./request";

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
};
