import { useParams, useLocation } from "wouter";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

export default function PaymentProcessing() {
  const { orderId } = useParams();
  const [, setLocation] = useLocation();

  const { data: order, isLoading } = useQuery({
    queryKey: ['/api/orders', orderId],
    enabled: !!orderId,
    refetchInterval: 2000, // Poll every 2 seconds
  });

  useEffect(() => {
    if (order?.order?.status === 'completed') {
      setLocation(`/results/${orderId}`);
    } else if (order?.order?.status === 'failed') {
      // Handle failed payment/generation
      setLocation('/');
    }
  }, [order, orderId, setLocation]);

  if (isLoading) {
    return (
      <div className="page-section pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl text-purple mb-6">
            <i className="fas fa-moon"></i>
          </div>
          <h2 className="text-3xl font-mystical font-bold gradient-text mb-4">
            Loading...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <section className="page-section pt-24">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div 
            className="glass mystical-border rounded-2xl p-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div 
              className="text-6xl text-purple mb-6"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <i className="fas fa-moon"></i>
            </motion.div>
            
            <h2 className="text-3xl font-mystical font-bold gradient-text mb-4">
              Processing Your Payment
            </h2>
            <p className="text-gray-300 mb-6">
              Please wait while we process your payment and generate your personalized Kundali report.
              This may take a few moments...
            </p>
            
            <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
              <motion.div 
                className="bg-gradient-to-r from-purple to-pink h-2 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "60%" }}
                transition={{ duration: 3, ease: "easeOut" }}
              />
            </div>
            
            <motion.p 
              className="text-sm text-gray-400"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Generating your cosmic insights...
            </motion.p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
