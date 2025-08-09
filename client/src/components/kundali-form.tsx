import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { loadRazorpay, initiateRazorpayPayment } from "@/lib/razorpay";
import { ASTROLOGY_PRODUCTS } from "@/lib/constants";

const baseFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  terms: z.boolean().refine(val => val === true, "You must agree to terms"),
});

const standardFormSchema = baseFormSchema.extend({
  dob: z.string().min(1, "Date of birth is required"),
  time: z.string().optional(),
  place: z.string().min(1, "Place of birth is required"),
  gender: z.enum(["male", "female", "other"]),
  timeUnknown: z.boolean().optional(),
});

const coupleFormSchema = standardFormSchema.extend({
  partnerName: z.string().min(1, "Partner's name is required"),
  partnerDob: z.string().min(1, "Partner's date of birth is required"),
  partnerTime: z.string().optional(),
  partnerPlace: z.string().min(1, "Partner's place of birth is required"),
  partnerGender: z.enum(["male", "female", "other"]),
  partnerTimeUnknown: z.boolean().optional(),
});

const simpleFormSchema = baseFormSchema.extend({
  dob: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female", "other"]),
});

const nameDobFormSchema = baseFormSchema.extend({
  dob: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female", "other"]),
});

const datePlaceFormSchema = baseFormSchema.extend({
  selectedDate: z.string().min(1, "Date is required"),
  place: z.string().min(1, "Place is required"),
});

const dateRangeFormSchema = baseFormSchema.extend({
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  place: z.string().min(1, "Place is required"),
  eventType: z.string().min(1, "Event type is required"),
});

interface KundaliFormProps {
  productType: string;
  productTitle: string;
}

export default function KundaliForm({ productType, productTitle }: KundaliFormProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const product = ASTROLOGY_PRODUCTS.find(p => p.id === productType);
  const formType = product?.formType || "standard";

  const getFormSchema = () => {
    switch (formType) {
      case "couple":
        return coupleFormSchema;
      case "simple":
        return simpleFormSchema;
      case "name-dob":
        return nameDobFormSchema;
      case "date-place":
        return datePlaceFormSchema;
      case "date-range":
        return dateRangeFormSchema;
      default:
        return standardFormSchema;
    }
  };

  const getDefaultValues = () => {
    const base = {
      name: "",
      email: "",
      terms: false,
    };

    switch (formType) {
      case "couple":
        return {
          ...base,
          dob: "",
          time: "",
          place: "",
          gender: "male" as const,
          timeUnknown: false,
          partnerName: "",
          partnerDob: "",
          partnerTime: "",
          partnerPlace: "",
          partnerGender: "female" as const,
          partnerTimeUnknown: false,
        };
      case "simple":
      case "name-dob":
        return {
          ...base,
          dob: "",
          gender: "male" as const,
        };
      case "date-place":
        return {
          ...base,
          selectedDate: "",
          place: "",
        };
      case "date-range":
        return {
          ...base,
          startDate: "",
          endDate: "",
          place: "",
          eventType: "",
        };
      default:
        return {
          ...base,
          dob: "",
          time: "",
          place: "",
          gender: "male" as const,
          timeUnknown: false,
        };
    }
  };

  const form = useForm<any>({
    resolver: zodResolver(getFormSchema()),
    defaultValues: getDefaultValues(),
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/orders", {
        ...data,
        productType,
        amount: 50, // ₹50 demo amount
      });
      return response.json();
    },
  });

  const verifyPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      const response = await apiRequest("POST", "/api/verify-payment", paymentData);
      return response.json();
    },
  });

  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true);

      // Transform form data based on form type
      const transformedData = transformFormData(data, formType);

      // Load Razorpay script
      const razorpayLoaded = await loadRazorpay();
      if (!razorpayLoaded) {
        throw new Error("Failed to load Razorpay");
      }

      // Create order
      const orderResult = await createOrderMutation.mutateAsync(transformedData);
      
      if (!orderResult.success) {
        throw new Error(orderResult.message || "Failed to create order");
      }

      const { order, razorpayOrder, razorpayKeyId } = orderResult;

      // Navigate to processing page immediately
      setLocation(`/payment/${order.id}`);

      // Initiate Razorpay payment
      const paymentResult = await initiateRazorpayPayment({
        orderId: razorpayOrder.id,
        amount: 50 * 100, // Convert to paise
        currency: "INR",
        keyId: razorpayKeyId,
        name: "Witch Card",
        description: productTitle,
        customerName: data.name,
        customerEmail: data.email,
      });

      if (paymentResult.success) {
        // Verify payment
        const verificationResult = await verifyPaymentMutation.mutateAsync({
          orderId: order.id,
          razorpayOrderId: paymentResult.razorpay_order_id,
          razorpayPaymentId: paymentResult.razorpay_payment_id,
          razorpaySignature: paymentResult.razorpay_signature,
        });

        if (verificationResult.success) {
          toast({
            title: "Payment Successful!",
            description: "Your report is being generated.",
          });
          
          setLocation(`/results/${order.id}`);
        } else {
          throw new Error(verificationResult.message || "Payment verification failed");
        }
      } else {
        throw new Error("Payment was cancelled or failed");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setLocation("/");
    } finally {
      setIsLoading(false);
    }
  };

  const transformFormData = (data: any, formType: string) => {
    const base = {
      name: data.name,
      email: data.email,
      productType,
      amount: 50,
    };

    switch (formType) {
      case "couple":
        return {
          ...base,
          dob: data.dob,
          time: data.timeUnknown ? undefined : data.time,
          place: data.place,
          gender: data.gender,
          timeUnknown: data.timeUnknown,
          partnerName: data.partnerName,
          partnerDob: data.partnerDob,
          partnerTime: data.partnerTimeUnknown ? undefined : data.partnerTime,
          partnerPlace: data.partnerPlace,
          partnerGender: data.partnerGender,
          partnerTimeUnknown: data.partnerTimeUnknown,
        };
      case "simple":
      case "name-dob":
        return {
          ...base,
          dob: data.dob,
          gender: data.gender,
          place: "Not Required", // Some services don't need place
        };
      case "date-place":
        return {
          ...base,
          dob: data.selectedDate,
          place: data.place,
          gender: "male", // Default for date-based services
        };
      case "date-range":
        return {
          ...base,
          startDate: data.startDate,
          endDate: data.endDate,
          place: data.place,
          eventType: data.eventType,
          dob: data.startDate, // Use start date as dob for API compatibility
          gender: "male", // Default
        };
      default:
        return {
          ...base,
          dob: data.dob,
          time: data.timeUnknown ? undefined : data.time,
          place: data.place,
          gender: data.gender,
          timeUnknown: data.timeUnknown,
        };
    }
  };

  const renderFormFields = () => {
    const commonFields = (
      <>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Full Name *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter your full name"
                  className="w-full bg-black/30 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-purple focus:ring-2 focus:ring-purple/20 transition-all"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Email Address *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder="your@email.com"
                  className="w-full bg-black/30 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-purple focus:ring-2 focus:ring-purple/20 transition-all"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </>
    );

    const standardFields = (
      <>
        <FormField
          control={form.control}
          name="dob"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Date of Birth *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="date"
                  className="w-full bg-black/30 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-purple focus:ring-2 focus:ring-purple/20 transition-all"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="timeUnknown"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm text-gray-400">
                  Time of birth unknown
                </FormLabel>
              </div>
            </FormItem>
          )}
        />

        {!form.watch("timeUnknown") && (
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Time of Birth</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="time"
                    className="w-full bg-black/30 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-purple focus:ring-2 focus:ring-purple/20 transition-all"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="place"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Place of Birth *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter city, state, country"
                  className="w-full bg-black/30 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-purple focus:ring-2 focus:ring-purple/20 transition-all"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Gender</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <label htmlFor="male">Male</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <label htmlFor="female">Female</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <label htmlFor="other">Other</label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </>
    );

    const partnerFields = (
      <>
        <div className="border-t border-gray-600 pt-6 mt-6">
          <h4 className="text-lg font-semibold mb-4 text-yellow">Partner's Details</h4>
          
          <FormField
            control={form.control}
            name="partnerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Partner's Name *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter partner's full name"
                    className="w-full bg-black/30 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-purple focus:ring-2 focus:ring-purple/20 transition-all"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="partnerDob"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Partner's Date of Birth *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="date"
                    className="w-full bg-black/30 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-purple focus:ring-2 focus:ring-purple/20 transition-all"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="partnerTimeUnknown"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm text-gray-400">
                    Partner's time of birth unknown
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />

          {!form.watch("partnerTimeUnknown") && (
            <FormField
              control={form.control}
              name="partnerTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Partner's Time of Birth</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="time"
                      className="w-full bg-black/30 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-purple focus:ring-2 focus:ring-purple/20 transition-all"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="partnerPlace"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Partner's Place of Birth *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter city, state, country"
                    className="w-full bg-black/30 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-purple focus:ring-2 focus:ring-purple/20 transition-all"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="partnerGender"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Partner's Gender</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="partner-male" />
                      <label htmlFor="partner-male">Male</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="partner-female" />
                      <label htmlFor="partner-female">Female</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="other" id="partner-other" />
                      <label htmlFor="partner-other">Other</label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </>
    );

    switch (formType) {
      case "couple":
        return (
          <>
            {commonFields}
            {standardFields}
            {partnerFields}
          </>
        );

      case "simple":
      case "name-dob":
        return (
          <>
            {commonFields}
            <FormField
              control={form.control}
              name="dob"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Date of Birth *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="date"
                      className="w-full bg-black/30 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-purple focus:ring-2 focus:ring-purple/20 transition-all"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Gender</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <label htmlFor="male">Male</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <label htmlFor="female">Female</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="other" />
                        <label htmlFor="other">Other</label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      case "date-place":
        return (
          <>
            {commonFields}
            <FormField
              control={form.control}
              name="selectedDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Select Date *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="date"
                      className="w-full bg-black/30 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-purple focus:ring-2 focus:ring-purple/20 transition-all"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="place"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Location *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter city, state, country"
                      className="w-full bg-black/30 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-purple focus:ring-2 focus:ring-purple/20 transition-all"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      case "date-range":
        return (
          <>
            {commonFields}
            <FormField
              control={form.control}
              name="eventType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Event Type *</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className="w-full bg-black/30 border border-gray-600 rounded-lg px-4 py-3 text-white">
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="marriage">Marriage</SelectItem>
                        <SelectItem value="housewarming">Housewarming</SelectItem>
                        <SelectItem value="business">Business Launch</SelectItem>
                        <SelectItem value="travel">Travel</SelectItem>
                        <SelectItem value="property">Property Purchase</SelectItem>
                        <SelectItem value="ceremony">Religious Ceremony</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Start Date *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="date"
                      className="w-full bg-black/30 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-purple focus:ring-2 focus:ring-purple/20 transition-all"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">End Date *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="date"
                      className="w-full bg-black/30 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-purple focus:ring-2 focus:ring-purple/20 transition-all"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="place"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Location *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter city, state, country"
                      className="w-full bg-black/30 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-purple focus:ring-2 focus:ring-purple/20 transition-all"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      default:
        return (
          <>
            {commonFields}
            {standardFields}
          </>
        );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {renderFormFields()}

        <FormField
          control={form.control}
          name="terms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm text-gray-400">
                  I agree to the{" "}
                  <a href="#" className="text-purple hover:text-purple/80">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-purple hover:text-purple/80">
                    Privacy Policy
                  </a>
                </FormLabel>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple to-pink text-white font-bold py-4 px-8 rounded-lg hover:from-purple/80 hover:to-pink/80 transition-all transform hover:scale-105 animate-pulse-glow"
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Processing...
              </>
            ) : (
              <>
                <i className="fas fa-credit-card mr-2"></i>
                Pay ₹50 & Get Your {productTitle}
              </>
            )}
          </Button>
        </motion.div>
      </form>
    </Form>
  );
}
