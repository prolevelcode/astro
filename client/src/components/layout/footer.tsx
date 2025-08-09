import { motion } from "framer-motion";

export default function Footer() {
  return (
    <motion.footer 
      className="glass-dark border-t border-white/10 mt-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.5 }}
    >
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex items-center space-x-3 mb-4">
              <i className="fas fa-moon text-2xl text-yellow"></i>
              <h3 className="text-xl font-mystical font-bold gradient-text">Witch Card</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Discover your cosmic destiny with accurate Vedic astrology and personalized Kundali reports.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-yellow transition-colors">Kundali Analysis</a></li>
              <li><a href="#" className="hover:text-yellow transition-colors">Marriage Compatibility</a></li>
              <li><a href="#" className="hover:text-yellow transition-colors">Career Guidance</a></li>
              <li><a href="#" className="hover:text-yellow transition-colors">Health Predictions</a></li>
            </ul>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-yellow transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-yellow transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-yellow transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-yellow transition-colors">Contact Us</a></li>
            </ul>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h4 className="text-lg font-semibold mb-4">Connect</h4>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="text-gray-400 hover:text-yellow transition-colors">
                <i className="fab fa-facebook text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-yellow transition-colors">
                <i className="fab fa-twitter text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-yellow transition-colors">
                <i className="fab fa-instagram text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-yellow transition-colors">
                <i className="fab fa-youtube text-xl"></i>
              </a>
            </div>
            <p className="text-sm text-gray-400">
              <i className="fas fa-envelope mr-2"></i>
              info@witchcard.com
            </p>
          </motion.div>
        </div>
        
        <motion.div 
          className="border-t border-white/10 pt-8 text-center text-sm text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <p>&copy; 2024 Witch Card – Astrology & Kundali Reports. All rights reserved.</p>
          <p className="mt-2">Made with ❤️ for cosmic seekers worldwide</p>
        </motion.div>
      </div>
    </motion.footer>
  );
}
