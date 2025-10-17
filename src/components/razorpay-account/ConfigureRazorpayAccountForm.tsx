"use client";

import * as z from "zod";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FC, useEffect } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  RazorpayAccount,
  UpdateRazorpayAccountBody,
} from "@/types/razorpay_account";
import { useMutation, useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { I18NNAMESPACE } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { apis } from "@/apis";
import { toast } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";

type ConfigureRazorpayAccountFormProps = {
  facilityId: string;
  onSuccess?: (data: RazorpayAccount) => void;
};

const configureRazorpayAccountFormSchema = z.object({
  account_id: z.string().length(18),
  is_enabled: z.boolean(),
});

type ConfigureRazorpayAccountFormValues = z.infer<
  typeof configureRazorpayAccountFormSchema
>;

export const ConfigureRazorpayAccountForm: FC<
  ConfigureRazorpayAccountFormProps
> = ({ facilityId, onSuccess }) => {
  const { t } = useTranslation(I18NNAMESPACE);

  const { data: razorpayAccount, refetch } = useQuery({
    queryKey: ["razorpayAccount", facilityId],
    queryFn: () => apis.razorpay_accounts.get(facilityId),
    enabled: !!facilityId,
  });

  const form = useForm<ConfigureRazorpayAccountFormValues>({
    resolver: zodResolver(configureRazorpayAccountFormSchema),
    defaultValues: {
      account_id: "",
      is_enabled: false,
    },
  });

  useEffect(() => {
    if (razorpayAccount) {
      form.setValue("account_id", razorpayAccount.account_id);
      form.setValue("is_enabled", razorpayAccount.is_enabled);
    }
  }, [razorpayAccount, form]);

  const createRazorpayAccountMutation = useMutation({
    mutationFn: apis.razorpay_accounts.create,
    onSuccess: (data) => {
      toast.success(t("razorpay_account_created"));
      refetch();
      onSuccess?.(data);
    },
    onError: (error) => {
      toast.error(error?.message || t("razorpay_account_creation_failed"));
    },
  });

  const updateRazorpayAccountMutation = useMutation({
    mutationFn: (data: UpdateRazorpayAccountBody) =>
      apis.razorpay_accounts.update(facilityId, data),
    onSuccess: (data) => {
      toast.success(t("razorpay_account_updated"));
      refetch();
      onSuccess?.(data);
    },
    onError: (error) => {
      toast.error(error?.message || t("razorpay_account_update_failed"));
    },
  });

  function onSubmit(values: ConfigureRazorpayAccountFormValues) {
    if (razorpayAccount) {
      updateRazorpayAccountMutation.mutate({
        account_id: razorpayAccount.account_id,
        is_enabled: values.is_enabled,
      });
    } else {
      createRazorpayAccountMutation.mutate({
        facility_id: facilityId,
        account_id: values.account_id,
        is_enabled: values.is_enabled,
      });
    }
  }

  return (
    <div className="grid gap-4">
      {razorpayAccount && (
        <Card>
          <CardHeader>
            <CardTitle>{t("razorpay_account") || "Razorpay account"}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">{t("razorpay_account_id")}</span>
              <span className="font-mono">{razorpayAccount.account_id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">
                {t("payment_collection_status")}
              </span>
              <span>
                {razorpayAccount.is_enabled ? t("enabled") : t("disabled")}
              </span>
            </div>
            {razorpayAccount.metadata?.legal_business_name && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500">
                  {t("business_name")}
                </span>
                <span>{razorpayAccount.metadata.legal_business_name} ({razorpayAccount.metadata.customer_facing_business_name})</span>
              </div>
            )}
            {razorpayAccount.metadata?.email && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500">{t("contact_email")}</span>
                <span>{razorpayAccount.metadata.email}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      <Form {...form}>
        <form
          onSubmit={(e) => {
            e.stopPropagation();
            form.handleSubmit(onSubmit)(e);
          }}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="account_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("razorpay_account_id")}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="is_enabled"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>
                    {t("enable_payment_collection_through_razorpay") ||
                      "Enable payment collection through Razorpay"}
                  </FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-label={
                        t("enable_payment_collection_through_razorpay") ||
                        "Enable payment collection through Razorpay"
                      }
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            loading={
              updateRazorpayAccountMutation.isPending ||
              createRazorpayAccountMutation.isPending
            }
          >
            {t("configure_razorpay_account")}
          </Button>
        </form>
      </Form>
    </div>
  );
};
