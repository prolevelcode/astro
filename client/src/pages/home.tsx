import { motion } from "framer-motion";
import ProductCard from "@/components/product-card";
import { ASTROLOGY_PRODUCTS } from "@/lib/constants";

export default function Home() {
  return (
    <section className="page-section pt-24">
      <div className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <motion.h2 
            className="text-5xl md:text-7xl font-mystical font-bold gradient-text mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Discover Your Cosmic Destiny
          </motion.h2>
          <motion.p 
            className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Unlock the secrets of the universe with personalized Kundali reports and astrology insights
          </motion.p>
          
          <motion.div 
            className="glass mystical-border rounded-2xl p-8 max-w-4xl mx-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <motion.div 
                className="animate-float"
                style={{ animationDelay: '0.2s' }}
              >
                <i className="fas fa-star text-4xl text-yellow mb-4"></i>
                <h3 className="text-lg font-semibold mb-2">Accurate Predictions</h3>
                <p className="text-gray-400">Based on ancient Vedic astrology</p>
              </motion.div>
              <motion.div 
                className="animate-float"
                style={{ animationDelay: '0.4s' }}
              >
                <i className="fas fa-certificate text-4xl text-purple mb-4"></i>
                <h3 className="text-lg font-semibold mb-2">Expert Analysis</h3>
                <p className="text-gray-400">Professional astrologer insights</p>
              </motion.div>
              <motion.div 
                className="animate-float"
                style={{ animationDelay: '0.6s' }}
              >
                <i className="fas fa-download text-4xl text-blue mb-4"></i>
                <h3 className="text-lg font-semibold mb-2">Instant Reports</h3>
                <p className="text-gray-400">Download PDF instantly</p>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Products Grid */}
        <div className="mb-16">
          <motion.h3 
            className="text-4xl font-mystical text-center mb-12 gradient-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Choose Your Astrology Service
          </motion.h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ASTROLOGY_PRODUCTS.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Trust Indicators */}
        <motion.div 
          className="glass mystical-border rounded-2xl p-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <h3 className="text-2xl font-mystical mb-6 gradient-text">Trusted by Thousands</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div>
              <div className="text-3xl font-bold text-yellow mb-2">10,000+</div>
              <div className="text-gray-400">Reports Generated</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple mb-2">98%</div>
              <div className="text-gray-400">Accuracy Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue mb-2">5,000+</div>
              <div className="text-gray-400">Happy Customers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-pink mb-2">24/7</div>
              <div className="text-gray-400">Support Available</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
