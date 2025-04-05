import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CartDrawer from "../components/CartDrawer";
import LoginModal from "../components/LoginModal";
import Sidebar from "../components/Sidebar";
import { CartProvider } from "../context/CartContext";
import { AuthProvider } from "../context/AuthContext";
import { DeliveryLocationProvider } from "../context/DeliveryLocationContext";

const MainLayout = ({ children }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <AuthProvider>
      <CartProvider>
        <DeliveryLocationProvider>
          <div className="flex flex-col min-h-screen">
            <Header 
              onCartClick={() => setIsCartOpen(true)} 
              onLoginClick={() => setIsLoginModalOpen(true)} 
            />
            <div className="flex flex-grow">
              <Sidebar />
              <main className="flex-grow">
                {children}
              </main>
            </div>
            <Footer />
            <CartDrawer 
              isOpen={isCartOpen} 
              onClose={() => setIsCartOpen(false)} 
            />
            <LoginModal 
              isOpen={isLoginModalOpen} 
              onClose={() => setIsLoginModalOpen(false)} 
            />
          </div>
        </DeliveryLocationProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default MainLayout;
