import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ProductDetail from "@/pages/product-detail";
import PaymentProcessing from "@/pages/payment-processing";
import Results from "@/pages/results";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import StarsBackground from "@/components/layout/stars-background";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/product/:productType" component={ProductDetail} />
      <Route path="/payment/:orderId" component={PaymentProcessing} />
      <Route path="/results/:orderId" component={Results} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="galaxy-bg min-h-screen">
          <StarsBackground />
          <Header />
          <main className="relative z-10">
            <Router />
          </main>
          <Footer />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
