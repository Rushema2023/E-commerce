import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from './features/auth/AuthContext'
import { CurrencyProvider } from './features/currency/CurrencyContext'
import MainLayout from './layouts/MainLayout'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import HomePage from './pages/HomePage'
import ShopPage from './pages/ShopPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderConfirmationPage from './pages/OrderConfirmationPage'
import { LoginPage, SignUpPage } from './pages/auth/AuthPages'
import AccountPage from './pages/AccountPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import CustomerCarePage from './pages/CustomerCarePage'
import CartPage from './pages/CartPage'

// Admin pages
import AdminLayout from './layouts/AdminLayout'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminProductsPage from './pages/admin/AdminProductsPage'
import AdminOrdersPage from './pages/admin/AdminOrdersPage'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])

  return null
}

export default function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Public routes with main layout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/men" element={<ShopPage defaultCategory="men" />} />
            <Route path="/women" element={<ShopPage defaultCategory="women" />} />
            <Route path="/accessories" element={<ShopPage defaultCategory="accessories" />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/privacy" element={<CustomerCarePage page="privacy" />} />
            <Route path="/terms" element={<CustomerCarePage page="terms" />} />
            <Route path="/payment-info" element={<CustomerCarePage page="payment-info" />} />
            <Route path="/delivery" element={<CustomerCarePage page="delivery" />} />
            <Route path="/returns" element={<CustomerCarePage page="returns" />} />
            <Route path="/faqs" element={<CustomerCarePage page="faqs" />} />
            <Route path="/help" element={<CustomerCarePage page="help" />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <AccountPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Auth pages (no main layout) */}
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/signup" element={<SignUpPage />} />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={
            <MainLayout />
          } />
        </Routes>
      </BrowserRouter>
      </CurrencyProvider>
      <Toaster position="top-right" richColors closeButton />
    </AuthProvider>
  )
}
