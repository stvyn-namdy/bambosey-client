// client/src/app/layout.jsx
import "./styles/globals.css";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import { ARProvider } from "../context/ARContext";
import CartDrawer from "../components/common/CartDrawer";
import { FavoritesProvider } from "../context/FavoritesContext";
import { ProductsProvider } from "../context/ProductsContext";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen" suppressHydrationWarning={true}>
        <AuthProvider>
          <ProductsProvider>
            <CartProvider>
              <ARProvider>
              <FavoritesProvider>
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </FavoritesProvider>
              </ARProvider>
            </CartProvider>
          </ProductsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
