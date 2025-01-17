import React, { useEffect } from "react";
import { Button } from "./ui/button";
import { useCreateCheckoutSessionMutation } from "@/features/api/purchaseApi";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import Razorpay from "razorpay";

const BuyCourseButton = ({ courseId }) => {
  const [
    createCheckoutSession,
    { data, isLoading, isSuccess, isError, error },
  ] = useCreateCheckoutSessionMutation();

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const purchaseCourseHandler = async () => {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      toast.error("Failed to load Razorpay. Please try again.");
      return;
    }

    const { orderId, amount, currency, keyId, name, description } = data;

    const options = {
      key: keyId,
      amount: amount,
      currency: currency,
      name: name,
      description: description,
      order_id: orderId,
      handler: async function (response) {
        // Handle the payment success
        console.log("Payment Successful:", response);
        toast.success("Payment Successful! Enjoy your course.");
        // Optionally, call an API to verify the payment
      },
      prefill: {
        name: "Your Name",
        email: "your-email@example.com",
        contact: "9999999999",
      },
      theme: {
        color: "#3399cc",
      },
    };

    const rzp = new Razorpay(options);
    rzp.open();
  };

  useEffect(() => {
    if (isSuccess) {
      purchaseCourseHandler();
    }
    if (isError) {
      toast.error(error?.data?.message || "Failed to create checkout session");
    }
  }, [data, isSuccess, isError, error]);

  return (
    <Button
      disabled={isLoading}
      onClick={() => createCheckoutSession({ courseId })}
      className="w-full"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Please wait
        </>
      ) : (
        "Purchase Course"
      )}
    </Button>
  );
};

export default BuyCourseButton;
