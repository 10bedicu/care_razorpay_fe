import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { I18NNAMESPACE } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Invoice } from "@/types/invoice";
import { PaymentLink } from "@/types/payment_link";
import { PhoneInput } from "@/components/ui/phone-input";
import { Switch } from "@/components/ui/switch";
import { apis } from "@/apis";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

type CreatePaymentLinkFormProps = {
  invoice: Invoice;
  onSuccess: (paymentLink: PaymentLink) => void;
};

const formSchema = z
  .object({
    notify_via_email: z.boolean(),
    email: z.email().optional(),
    notify_via_sms: z.boolean(),
    phone_number: z.e164().optional(),
    is_partial_payment_allowed: z.boolean(),
    minimum_down_payment: z.number().optional(),
    expires_at: z.date().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.notify_via_email && !data.email) {
      ctx.addIssue({
        path: ["email"],
        code: z.ZodIssueCode.custom,
        message: "Email is required when notify via email is enabled",
      });
    }
    if (data.notify_via_sms && !data.phone_number) {
      ctx.addIssue({
        path: ["phone_number"],
        code: z.ZodIssueCode.custom,
        message: "Phone number is required when notify via sms is enabled",
      });
    }
    if (data.is_partial_payment_allowed && !data.minimum_down_payment) {
      ctx.addIssue({
        path: ["minimum_down_payment"],
        code: z.ZodIssueCode.custom,
        message:
          "Minimum down payment is required when partial payment is allowed",
      });
    }
  });

export function CreatePaymentLinkForm({
  invoice,
  onSuccess,
}: CreatePaymentLinkFormProps) {
  const { t } = useTranslation(I18NNAMESPACE);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      notify_via_email: false,
      email: undefined,
      notify_via_sms: true,
      phone_number: invoice.account.patient.phone_number,
      is_partial_payment_allowed: false,
      minimum_down_payment: 0,
      expires_at: undefined,
    },
  });

  const createPaymentLinkMutation = useMutation({
    mutationFn: apis.payment_links.create,
    onSuccess(data) {
      toast.success(t("payment_link_created"));
      onSuccess(data);
    },
    onError() {
      toast.error(t("payment_link_creation_failed"));
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createPaymentLinkMutation.mutate({
      invoice_id: invoice.id,
      email: values.notify_via_email ? values.email : undefined,
      phone_number: values.notify_via_sms ? values.phone_number : undefined,
      is_partial_payment_allowed: values.is_partial_payment_allowed,
      minimum_down_payment: values.is_partial_payment_allowed
        ? values.minimum_down_payment
        : undefined,
      expires_at: values.expires_at
        ? values.expires_at.toISOString()
        : undefined,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <h3 className="text-lg font-medium">{t("create_payment_link")}</h3>

        <Collapsible
          open={form.watch("notify_via_email")}
          className="flex flex-col gap-2 rounded-lg border p-3 shadow-sm"
        >
          <CollapsibleTrigger asChild>
            <FormField
              control={form.control}
              name="notify_via_email"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>{t("notify_via_email")}</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="flex flex-col gap-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t("enter_email")}
                      type="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CollapsibleContent>
          <div className="text-sm text-gray-500">
            {t("notify_via_email_description")}
          </div>
        </Collapsible>

        <Collapsible
          open={form.watch("notify_via_sms")}
          className="flex flex-col gap-2 rounded-lg border p-3 shadow-sm"
        >
          <CollapsibleTrigger asChild>
            <FormField
              control={form.control}
              name="notify_via_sms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>{t("notify_via_sms")}</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="flex flex-col gap-2">
            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <PhoneInput
                      {...field}
                      defaultCountry="IN"
                      placeholder={t("enter_phone_number")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CollapsibleContent>
          <div className="text-sm text-gray-500">
            {t("notify_via_sms_description")}
          </div>
        </Collapsible>

        <FormField
          control={form.control}
          name="expires_at"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expiry time</FormLabel>
              <FormControl>
                <DateTimePicker
                  {...field}
                  className="w-full"
                  placeholder="Set an expiry time"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          loading={createPaymentLinkMutation.isPending}
        >
          {t("generate_payment_link")}
        </Button>
      </form>
    </Form>
  );
}
