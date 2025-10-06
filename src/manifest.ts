import { lazy } from "react";

const manifest = {
  plugin: "care_razorpay",
  routes: {},
  extends: [],
  components: {
    InvoiceRecordPaymentOptions: lazy(
      () => import("./components/pluggables/InvoiceRecordPaymentOptions")
    ),
  },
  navItems: [],
  encounterTabs: {},
};

export default manifest;
