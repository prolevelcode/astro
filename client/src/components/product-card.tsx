import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

interface Product {
  id: string;
  title: string;
  description: string;
  image: string;
  price: number;
  originalPrice: number;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [, setLocation] = useLocation();

  return (
    <motion.div 
      className="glass mystical-border rounded-2xl p-6 hover:scale-105 transition-all duration-300 hover:shadow-2xl group cursor-pointer"
      onClick={() => setLocation(`/product/${product.id}`)}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.img 
        src={product.image} 
        alt={product.title}
        className="w-full h-48 object-cover rounded-xl mb-4" 
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
      />
      
      <h4 className="text-xl font-semibold mb-3 group-hover:text-yellow transition-colors">
        {product.title}
      </h4>
      
      <p className="text-gray-400 mb-4 line-clamp-3">
        {product.description}
      </p>
      
      <div className="flex justify-between items-center">
        <div>
          <span className="text-2xl font-bold text-yellow">₹{product.price}</span>
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through ml-2">₹{product.originalPrice}</span>
          )}
        </div>
        
        <Button 
          className="glass px-4 py-2 rounded-lg hover:bg-purple/20 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            setLocation(`/product/${product.id}`);
          }}
        >
          Get Your Report <i className="fas fa-arrow-right ml-2"></i>
        </Button>
      </div>
    </motion.div>
  );
}
