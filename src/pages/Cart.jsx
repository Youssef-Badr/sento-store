// CartPage.jsx
import { Link } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import { Plus, Minus, Trash, ShoppingCart, X } from "lucide-react";
import { toast } from "react-toastify";

const CartPage = () => {
  const { cart, removeFromCart, updateQty, clearCart } = useCart();
  const { language } = useLanguage();
  const { darkMode } = useTheme();

  const isRTL = language === "ar";
  const translations = {
    cartTitle: isRTL ? "سلة التسوق" : "Shopping Cart",
    emptyCart: isRTL ? "سلة التسوق فارغة 😔" : "Your cart is empty 😔",
    total: isRTL ? "الإجمالي" : "Total",
    checkout: isRTL ? "🛒 إتمام الشراء" : "🛒 Checkout",
    clearCart: isRTL ? "❌ مسح السلة" : "❌ Clear Cart",
    continueShopping: isRTL ? "العودة للتسوق" : "Continue Shopping",
    itemDeleted: isRTL ? "تم حذف المنتج بنجاح!" : "Item successfully removed!",
    quantityUpdated: isRTL ? "تم تحديث الكمية!" : "Quantity updated!",
    cartCleared: isRTL ? "تم مسح سلة التسوق." : "Cart has been cleared.",
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  const handleUpdateQty = (productId, sizeId, newQty) => {
    if (newQty < 1) return;
    updateQty(productId, sizeId, newQty);
    toast.success(translations.quantityUpdated);
  };

  const handleRemove = (productId, sizeId) => {
    removeFromCart(productId, sizeId);
    toast.success(translations.itemDeleted);
  };

  const handleClearCart = () => {
    clearCart();
    toast.success(translations.cartCleared);
  };

  const containerBg = darkMode ? "bg-gray-950" : "bg-white";
  const sectionBg = darkMode ? "bg-gray-900" : "bg-gray-100";
  const buttonPrimary = darkMode
    ? "bg-purple-600 hover:bg-purple-700"
    : "bg-purple-500 hover:bg-purple-600";
  const buttonSecondary = darkMode
    ? "bg-gray-700 hover:bg-gray-600"
    : "bg-gray-300 hover:bg-gray-400";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-600";
  const totalBoxBg = darkMode ? "bg-gray-800" : "bg-gray-200";

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className={`min-h-screen py-20 ${containerBg} ${textPrimary} transition-colors duration-300`}
    >
      <div className="container mt-10 mx-auto px-4">
        <h1 className="text-4xl font-extrabold text-center mb-10 text-violet-600 dark:text-violet-400">
          {translations.cartTitle}
        </h1>
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center">
            <ShoppingCart size={80} className="mb-4 text-gray-400" />
            <p className="text-xl font-medium mb-6 text-gray-500">
              {translations.emptyCart}
            </p>
            <Link
              to="/products"
              className={`px-6 py-3 rounded-lg font-bold transition-transform transform hover:scale-105 ${buttonPrimary} text-white`}
            >
              {translations.continueShopping}
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div
              className={`flex-1 p-6 rounded-lg shadow-xl ${sectionBg} transition-colors`}
            >
              {cart.map((item) => (
                <div
                  key={`${item.product}-${item.sizeId}`}
                  className={`flex flex-col sm:flex-row items-center border-b ${
                    darkMode ? "border-gray-700" : "border-gray-200"
                  } py-4 last:border-b-0`}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-lg mr-4 mb-4 sm:mb-0 shadow-md"
                  />
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                    <p className={`${textSecondary} text-sm`}>
                      {isRTL ? "اللون: " : "Color: "}
                      {item.color} | {isRTL ? "المقاس: " : "Size: "}
                      {item.size}
                    </p>
                    <p className="font-bold text-purple-500 dark:text-purple-300 mt-1">
                      {item.price.toFixed(2)} {isRTL ? "ج.م" : "EGP"}
                    </p>
                  </div>
                  <div className="flex items-center mt-4 sm:mt-0 gap-2">
                    <div className="flex items-center border rounded-lg px-2 py-1 gap-2 border-gray-300 dark:border-gray-700">
                      <button
                      aria-label="Decrease quantity"
                        onClick={() =>
                          handleUpdateQty(
                            item.product,
                            item.sizeId,
                            item.qty - 1
                          )
                        }
                        className="p-1 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        disabled={item.qty === 1}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="font-bold w-6 text-center">
                        {item.qty}
                      </span>
                      <button
                      aria-label="Increase quantity"
                        onClick={() =>
                          handleUpdateQty(
                            item.product,
                            item.sizeId,
                            item.qty + 1
                          )
                        }
                        className="p-1 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <button
                    aria-label="Remove item"
                      onClick={() => handleRemove(item.product, item.sizeId)}
                      className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div
              className={`w-full lg:w-1/3 p-6 rounded-lg shadow-xl ${totalBoxBg} transition-colors`}
            >
              <h2 className="text-2xl font-bold mb-4">{translations.total}</h2>
              <div className="flex justify-between mb-4">
                <span>
                  {translations.total} ({cart.length} {isRTL ? "قطعة" : "items"}
                  )
                </span>
                <span className="font-bold">
                  {cartTotal.toFixed(2)} {isRTL ? "ج.م" : "EGP"}
                </span>
              </div>
              <button
              aria-label="Clear Cart"
                onClick={handleClearCart}
                className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-bold transition-all mt-4 ${buttonSecondary} ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                <X size={18} /> {translations.clearCart}
              </button>
              <Link
                to="/checkout"
                className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-bold text-white transition-all mt-4 ${buttonPrimary} transform hover:scale-105`}
              >
                <ShoppingCart size={18} /> {translations.checkout}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
