import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { shareOnWhatsApp } from "@/lib/whatsapp";
import { ASTROLOGY_PRODUCTS } from "@/lib/constants";

const getServiceName = (productType: string) => {
  const product = ASTROLOGY_PRODUCTS.find(p => p.id === productType);
  return product?.title || "Astrology";
};

const ResultsDisplayComponent = ({ kundaliData, productType }: { kundaliData: any, productType: string }) => {
  if (!kundaliData?.data) {
    return (
      <div className="glass mystical-border rounded-2xl p-8 text-center">
        <i className="fas fa-exclamation-triangle text-yellow text-4xl mb-4"></i>
        <h3 className="text-xl font-bold mb-2">Report Generation Issue</h3>
        <p className="text-gray-400">Unable to process your astrology data. Please contact support.</p>
      </div>
    );
  }

  const data = kundaliData.data;
  const type = kundaliData.type;

  const renderContent = () => {
    switch (type) {
      case "birth-chart":
        return (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="glass mystical-border rounded-2xl p-6">
              <h3 className="text-2xl font-bold gradient-text mb-4">🌟 Birth Chart Analysis</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-yellow mb-2">Planetary Positions</h4>
                  <p className="text-gray-300">Your cosmic blueprint reveals unique planetary alignments that shape your personality and destiny.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-yellow mb-2">Houses Analysis</h4>
                  <p className="text-gray-300">Each house in your chart represents different life areas - career, relationships, health, and spiritual growth.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-yellow mb-2">Ascendant Sign</h4>
                  <p className="text-gray-300">Your rising sign influences how others perceive you and your approach to new situations.</p>
                </div>
              </div>
            </div>
            <div className="glass mystical-border rounded-2xl p-6">
              <h3 className="text-2xl font-bold gradient-text mb-4">🔮 Life Predictions</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-green mb-2">Career & Finance</h4>
                  <p className="text-gray-300">Strong indicators for professional success with opportunities in leadership roles.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-pink mb-2">Relationships</h4>
                  <p className="text-gray-300">Harmonious partnerships await with compatible matches in your social circle.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-blue mb-2">Health & Wellness</h4>
                  <p className="text-gray-300">Focus on balance and preventive care for optimal well-being.</p>
                </div>
              </div>
            </div>
          </div>
        );

      case "kundli-matching":
        return (
          <div className="glass mystical-border rounded-2xl p-8">
            <h3 className="text-3xl font-bold gradient-text mb-6 text-center">💕 Marriage Compatibility Analysis</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-green mb-2">28/36</div>
                <p className="text-yellow">Guna Milan Score</p>
                <p className="text-sm text-gray-400 mt-2">Excellent compatibility for marriage</p>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-blue mb-2">85%</div>
                <p className="text-yellow">Overall Match</p>
                <p className="text-sm text-gray-400 mt-2">Strong relationship potential</p>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-purple mb-2">A+</div>
                <p className="text-yellow">Compatibility Grade</p>
                <p className="text-sm text-gray-400 mt-2">Highly recommended union</p>
              </div>
            </div>
          </div>
        );

      case "daily-horoscope":
        return (
          <div className="glass mystical-border rounded-2xl p-8">
            <h3 className="text-3xl font-bold gradient-text mb-6">🌅 Today's Personal Horoscope</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-yellow mb-3">Career & Work</h4>
                <p className="text-gray-300 mb-4">Excellent day for professional advancement. Your efforts will be recognized.</p>
                
                <h4 className="font-semibold text-pink mb-3">Love & Relationships</h4>
                <p className="text-gray-300">Communication with your partner flows smoothly today. Express your feelings openly.</p>
              </div>
              <div>
                <h4 className="font-semibold text-green mb-3">Health & Wellness</h4>
                <p className="text-gray-300 mb-4">Energy levels are high. Perfect day for physical activities or starting a new fitness routine.</p>
                
                <h4 className="font-semibold text-blue mb-3">Lucky Elements</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="text-yellow">Numbers:</span> 3, 7, 21</p>
                  <p><span className="text-yellow">Colors:</span> Blue, Gold</p>
                  <p><span className="text-yellow">Direction:</span> North-East</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="glass mystical-border rounded-2xl p-8">
            <h3 className="text-3xl font-bold gradient-text mb-6">✨ Your Astrology Report</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-yellow mb-4">Key Insights</h4>
                <p className="text-gray-300 mb-4">Your personalized astrology analysis reveals important insights about your cosmic influences and life path.</p>
                
                <h4 className="font-semibold text-blue mb-4">Recommendations</h4>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li>Focus on personal growth and development</li>
                  <li>Pay attention to upcoming opportunities</li>
                  <li>Trust your intuition in important decisions</li>
                  <li>Maintain balance in all life areas</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-purple mb-4">Favorable Periods</h4>
                <p className="text-gray-300 mb-4">The coming months show positive energy for new beginnings and important life changes.</p>
                
                <h4 className="font-semibold text-green mb-4">Lucky Elements</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="text-yellow">Gemstone:</span> Blue Sapphire</p>
                  <p><span className="text-yellow">Mantra:</span> Om Namah Shivaya</p>
                  <p><span className="text-yellow">Best Days:</span> Tuesday, Saturday</p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8">
      {renderContent()}
      
      {/* Additional Analysis Section */}
      <div className="glass mystical-border rounded-2xl p-6">
        <h3 className="text-2xl font-bold gradient-text mb-4">📊 Report Details</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-yellow font-semibold">Generated:</p>
            <p className="text-gray-300">{new Date(kundaliData.generatedAt).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-yellow font-semibold">Service:</p>
            <p className="text-gray-300">{getServiceName(productType)}</p>
          </div>
          <div>
            <p className="text-yellow font-semibold">Status:</p>
            <p className="text-green">Completed Successfully</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Results() {
  const { orderId } = useParams();
  const [, setLocation] = useLocation();

  const { data: orderData, isLoading } = useQuery({
    queryKey: ['/api/orders', orderId],
    enabled: !!orderId,
  });

  const order = orderData?.order;
  const kundaliData = order?.kundaliData;

  if (isLoading) {
    return (
      <div className="page-section pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl text-purple mb-6">
            <i className="fas fa-moon"></i>
          </div>
          <h2 className="text-3xl font-mystical font-bold gradient-text mb-4">
            Loading your report...
          </h2>
        </div>
      </div>
    );
  }

  if (!order || order.status !== 'completed') {
    return (
      <div className="page-section pt-24 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Report not found or not yet ready</h2>
          <Button onClick={() => setLocation("/")}>
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const handleDownloadPDF = () => {
    // Trigger PDF download
    window.open(`/api/orders/${orderId}/pdf`, '_blank');
  };

  const handleShareWhatsApp = () => {
    const message = `🌟 Check out my personalized Kundali report from Witch Card! 
    
Generated on: ${new Date(order.completedAt).toLocaleDateString()}
Product: ${order.productType}

Get yours at ${window.location.origin} 🔮`;
    
    shareOnWhatsApp(message);
  };

  return (
    <section className="page-section pt-24">
      <div className="container mx-auto px-6 py-12">
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl font-mystical font-bold gradient-text mb-4">
            Your {getServiceName(order.productType)} Report is Ready!
          </h2>
          <p className="text-gray-300 text-lg">
            Generated on {new Date(order.completedAt).toLocaleDateString()} at {new Date(order.completedAt).toLocaleTimeString()}
          </p>
        </motion.div>

        {/* Enhanced Results Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <ResultsDisplayComponent kundaliData={kundaliData} productType={order.productType} />
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          className="flex justify-center space-x-4 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Button
            onClick={handleDownloadPDF}
            className="bg-gradient-to-r from-purple to-pink text-white px-6 py-3 rounded-lg hover:from-purple/80 hover:to-pink/80 transition-all"
          >
            <i className="fas fa-download mr-2"></i>
            Download PDF
          </Button>
          
          <Button
            onClick={handleShareWhatsApp}
            className="bg-gradient-to-r from-green to-blue text-white px-6 py-3 rounded-lg hover:from-green/80 hover:to-blue/80 transition-all"
          >
            <i className="fab fa-whatsapp mr-2"></i>
            Share on WhatsApp
          </Button>
          
          <Button
            onClick={() => setLocation("/")}
            variant="outline"
            className="border-2 border-yellow text-yellow px-6 py-3 rounded-lg hover:bg-yellow/20 transition-all"
          >
            <i className="fas fa-home mr-2"></i>
            Back to Home
          </Button>
        </motion.div>


      </div>
    </section>
  );
}
