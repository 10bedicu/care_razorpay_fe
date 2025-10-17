export type RazorpayAccount = {
  id: string;
  account_id: string;
  facility_id: string;
  is_enabled: boolean;
  metadata: {
    business_type:
      | "public_limited"
      | "private_limited"
      | "sole_proprietorship"
      | "partnership"
      | "llp"
      | "other";
    email: string;
    legal_business_name: string;
    customer_facing_business_name: string;
  };
  created_date: string;
  modified_date: string;
};

export type CreateRazorpayAccountBody = {
  facility_id: string;
  account_id: string;
  is_enabled: boolean;
};

export type UpdateRazorpayAccountBody = {
  account_id?: string;
  is_enabled?: boolean;
};
