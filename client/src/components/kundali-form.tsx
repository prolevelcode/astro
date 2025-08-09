import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ASTROLOGY_PRODUCTS } from "@/lib/constants";

// Form schema definitions (email removed)
const baseFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  terms: z.boolean().refine(val => val === true, "You must accept terms"),
});

const standardFormSchema = baseFormSchema.extend({
  dob: z.string().min(1, "Date of birth is required"),
  time: z.string().optional(),
  timeUnknown: z.boolean().optional(),
  place: z.string().min(1, "Place of birth is required"),
  gender: z.enum(["male", "female", "other"]),
});

interface KundaliFormProps {
  productType: string;
  productTitle: string;
}

export default function KundaliForm({ productType, productTitle }: KundaliFormProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(standardFormSchema),
    defaultValues: {
      name: "",
      dob: "",
      time: "",
      timeUnknown: false,
      place: "",
      gender: "male",
      terms: false,
    },
    mode: "onChange"
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const payload = {
        name: data.name,
        dob: data.dob,
        time: data.timeUnknown ? undefined : data.time,
        place: data.place,
        gender: data.gender,
        productType,
      };

      const response = await fetch("/api/horoscope/birth-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (result.success) {
        toast({ title: "Success!", description: "Your birth chart report has been generated." });
        setLocation("/results");
      } else {
        toast({ title: "Payment Failed", description: result.message || "Something went wrong.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit form.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Full Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter your full name"
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isLoading ? true : false}
                  readOnly={false}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date of Birth */}
        <FormField
          control={form.control}
          name="dob"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of Birth *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="date"
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isLoading ? true : false}
                  readOnly={false}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Time Unknown Checkbox */}
        <FormField
          control={form.control}
          name="timeUnknown"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading ? true : false}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm text-gray-400">Time of birth unknown</FormLabel>
              </div>
            </FormItem>
          )}
        />

        {/* Time of Birth Input */}
        {!form.watch("timeUnknown") && (
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time of Birth</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="time"
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isLoading ? true : false}
                    readOnly={false}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Place of Birth */}
        <FormField
          control={form.control}
          name="place"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Place of Birth *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter city, state, country"
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isLoading ? true : false}
                  readOnly={false}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Gender */}
        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading ? true : false}
                >
                  <div>
                    <RadioGroupItem value="male" id="male" />
                    <label htmlFor="male">Male</label>
                  </div>
                  <div>
                    <RadioGroupItem value="female" id="female" />
                    <label htmlFor="female">Female</label>
                  </div>
                  <div>
                    <RadioGroupItem value="other" id="other" />
                    <label htmlFor="other">Other</label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Terms & Conditions */}
        <FormField
          control={form.control}
          name="terms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading ? true : false}
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
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
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
