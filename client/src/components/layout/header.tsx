import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [location, setLocation] = useLocation();

  return (
    <motion.header 
      className="glass-dark fixed w-full top-0 z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <motion.div 
            className="flex items-center space-x-4 cursor-pointer"
            onClick={() => setLocation("/")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="fas fa-moon text-3xl text-yellow"></i>
            <h1 className="text-2xl md:text-3xl font-mystical font-bold gradient-text">
              Witch Card – Astrology & Kundali Reports
            </h1>
          </motion.div>
          
          <nav className="hidden md:flex space-x-6">
            <Button
              variant="ghost"
              onClick={() => setLocation("/")}
              className={`hover:text-yellow transition-colors ${location === "/" ? "text-yellow" : ""}`}
            >
              Home
            </Button>
            <Button
              variant="ghost"
              className="hover:text-yellow transition-colors"
            >
              Services
            </Button>
            <Button
              variant="ghost"
              className="hover:text-yellow transition-colors"
            >
              About
            </Button>
            <Button
              variant="ghost"
              className="hover:text-yellow transition-colors"
            >
              Contact
            </Button>
          </nav>
          
          <Button className="md:hidden text-white">
            <i className="fas fa-bars text-xl"></i>
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
