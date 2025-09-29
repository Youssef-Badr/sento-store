import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Layout from "./components/Layout.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ✅ Lazy loading للصفحات
const Home = lazy(() => import("./pages/Home"));

// صفحات مهمة يمكن توقع دخول المستخدم عليها، نضيف prefetch
const Products = lazy(() =>
  import(/* webpackPrefetch: true */ "./pages/Products")
);
const ProductDetails = lazy(() =>
  import(/* webpackPrefetch: true */ "./pages/ProductDetails")
);
const Wishlist = lazy(() =>
  import(/* webpackPrefetch: true */ "./pages/Wishlist")
);
const Offers = lazy(() =>
  import(/* webpackPrefetch: true */ "./pages/Offers")
);

// باقي الصفحات
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const Cart = lazy(() => import("./pages/Cart"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const ThankYou = lazy(() => import("./pages/ThankYou"));

function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <Layout>
        <Suspense
          fallback={
            <div className="flex justify-center items-center h-[60vh] text-xl font-medium text-gray-600 dark:text-gray-300">
              {`جارٍ التحميل...`}
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/category/:categoryName" element={<CategoryPage />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/thankyou" element={<ThankYou />} />
            <Route path="/thankyou/:orderId" element={<ThankYou />} />
            <Route path="/wishlist" element={<Wishlist />} />
          </Routes>
        </Suspense>
        <ToastContainer
          position="top-center"
          autoClose={2500}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </Layout>
    </div>
  );
}

export default App;
