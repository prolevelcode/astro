import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import KundaliForm from "@/components/kundali-form";
import { ASTROLOGY_PRODUCTS } from "@/lib/constants";

const getFormTitle = (formType: string) => {
  switch (formType) {
    case "couple":
      return "Enter Birth Details for Both Partners";
    case "simple":
      return "Enter Your Basic Details";
    case "name-dob":
      return "Enter Your Name and Birth Date";
    case "date-place":
      return "Enter Date and Location";
    case "date-range":
      return "Select Date Range and Event Details";
    default:
      return "Enter Your Birth Details";
  }
};

export default function ProductDetail() {
  const { productType } = useParams();
  const [, setLocation] = useLocation();

  const product = ASTROLOGY_PRODUCTS.find(p => p.id === productType);

  if (!product) {
    return (
      <div className="page-section pt-24 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <Button onClick={() => setLocation("/")}>
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <section className="page-section pt-24">
      <div className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Button 
            onClick={() => setLocation("/")}
            className="glass px-4 py-2 rounded-lg mb-8 hover:bg-purple/20 transition-colors"
          >
            <i className="fas fa-arrow-left mr-2"></i> Back to Services
          </Button>
        </motion.div>
        
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Image & Details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <img 
              src={product.image} 
              alt={product.title}
              className="w-full h-80 object-cover rounded-2xl mb-6" 
            />
            
            <div className="glass mystical-border rounded-2xl p-6">
              <h2 className="text-4xl font-mystical font-bold gradient-text mb-4">
                {product.title}
              </h2>
              <p className="text-gray-300 text-lg mb-6">
                {product.fullDescription}
              </p>
              
              <div className="space-y-4 mb-6">
                {product.features.map((feature, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-center space-x-3"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 * index }}
                  >
                    <i className="fas fa-check-circle text-green"></i>
                    <span>{feature}</span>
                  </motion.div>
                ))}
              </div>
              
              <div className="text-4xl font-bold text-yellow mb-6">
                ₹{product.price} 
                <span className="text-lg text-gray-400 line-through ml-2">₹{product.originalPrice}</span>
              </div>
            </div>
          </motion.div>

          {/* Kundali Input Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="glass mystical-border rounded-2xl p-8">
              <h3 className="text-2xl font-mystical font-bold gradient-text mb-6">
                {getFormTitle(product.formType || "standard")}
              </h3>
              
              <KundaliForm productType={product.id} productTitle={product.title} />

              {/* Security Badges */}
              <div className="mt-6 pt-6 border-t border-gray-600">
                <div className="flex justify-center space-x-6 text-sm text-gray-400">
                  <div className="flex items-center">
                    <i className="fas fa-shield-alt text-green mr-2"></i>
                    Secure Payment
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-lock text-blue mr-2"></i>
                    Data Protected
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-download text-yellow mr-2"></i>
                    Instant Download
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
