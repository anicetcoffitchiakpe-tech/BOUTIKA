import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import AdminLayout from './components/layout/AdminLayout.jsx';
import ShopLayout from './components/layout/ShopLayout.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './admin/Dashboard.jsx';
import Products from './admin/Products.jsx';
import Categories from './admin/Categories.jsx';
import Orders from './admin/Orders.jsx';
import Clients from './admin/Clients.jsx';
import Settings from './admin/Settings.jsx';
import Home from './shop/Home.jsx';
import ProductDetail from './shop/ProductDetail.jsx';
import Cart from './shop/Cart.jsx';
import Checkout from './shop/Checkout.jsx';
import Payment from './shop/Payment.jsx';
import Success from './shop/Success.jsx';
import Contact from './shop/Contact.jsx';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            {/* Espace d'administration (back-office) */}
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="categories" element={<Categories />} />
              <Route path="orders" element={<Orders />} />
              <Route path="clients" element={<Clients />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Boutique publique (front-office) */}
            <Route path="/" element={<ShopLayout />}>
              <Route index element={<Home />} />
              <Route path="product/:id" element={<ProductDetail />} />
              <Route path="cart" element={<Cart />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="payment/:id" element={<Payment />} />
              <Route path="success/:id" element={<Success />} />
              <Route path="contact" element={<Contact />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
