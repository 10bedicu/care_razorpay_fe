import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { QRCode, QR_CODE_USAGE } from "@/types/qr-code";

import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { I18NNAMESPACE } from "@/lib/constants";
import { Invoice } from "@/types/invoice";
import { apis } from "@/apis";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

type CreateQRCodeFormProps = {
  invoice: Invoice;
  onSuccess: (qrCode: QRCode) => void;
};

const formSchema = z
  .object({
    usage: z.enum(QR_CODE_USAGE),
    is_amount_fixed: z.boolean(),
    closes_at: z.date().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.usage === "single_use" && !data.is_amount_fixed) {
      ctx.addIssue({
        path: ["is_amount_fixed"],
        code: z.ZodIssueCode.custom,
        message: "Amount should be fixed for single use QR code",
      });
    }
  });

export function CreateQRCodeForm({
  invoice,
  onSuccess,
}: CreateQRCodeFormProps) {
  const { t } = useTranslation(I18NNAMESPACE);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      usage: "single_use",
      is_amount_fixed: true,
      closes_at: undefined,
    },
  });

  const createQRCodeMutation = useMutation({
    mutationFn: apis.qr_codes.create,
    onSuccess(data) {
      toast.success(t("qr_code_created"));
      onSuccess(data);
    },
    onError() {
      toast.error(t("qr_code_creation_failed"));
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createQRCodeMutation.mutate({
      invoice_id: invoice.id,
      usage: values.usage,
      is_amount_fixed: values.is_amount_fixed,
      closes_at: values.closes_at ? values.closes_at.toISOString() : undefined,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <h3 className="text-lg font-medium">{t("create_qr_code")}</h3>

        <FormField
          control={form.control}
          name="closes_at"
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
          loading={createQRCodeMutation.isPending}
        >
          {t("generate_qr_code")}
        </Button>
      </form>
    </Form>
  );
}
