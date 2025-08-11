// client/src/app/layout.jsx
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import CartDrawer from "../components/CartDrawer";
import { FavoritesProvider } from "../context/FavoritesContext";
import { ProductsProvider } from "../context/ProductsContext";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen" suppressHydrationWarning={true}>
        <AuthProvider>
          <ProductsProvider>
            <CartProvider>
              <FavoritesProvider>
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </FavoritesProvider>
            </CartProvider>
          </ProductsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
//test
