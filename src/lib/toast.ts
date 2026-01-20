import { toast as baseToast } from "@/hooks/use-toast";

type ToastFn = (title: string, description?: string) => void;

export const toast: {
  success: ToastFn;
  error: ToastFn;
  info: ToastFn;
  default: ToastFn;
} = {
  success: (title, description) =>
    baseToast({
      title,
      description,
      variant: "success",
    }),
  error: (title, description) =>
    baseToast({
      title,
      description,
      variant: "destructive",
    }),
  info: (title, description) =>
    baseToast({
      title,
      description,
      variant: "info",
    }),
  default: (title, description) =>
    baseToast({
      title,
      description,
    }),
};
