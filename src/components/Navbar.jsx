import { Link } from "react-router-dom";
import { useState, useContext, useEffect, useRef } from "react";
import { CartContext } from "../contexts/CartContext";
import {
  Menu,
  X,
  ShoppingCart,
  ChevronDown,
  User,
  Sun,
  Moon,
  Home,
  ShoppingBag,
  Heart,
  Gift,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import logo from "../assets/logo.webp";

const prefetchPage = (page) => {
  switch (page) {
    case "products":
      import("../pages/Products");
      break;
    case "wishlist":
      import("../pages/Wishlist");
      break;
    case "offers":
      import("../pages/Offers");
      break;
    case "productDetails":
      import("../pages/ProductDetails");
      break;
    default:
      break;
  }
};

export default function Navbar() {
  const { darkMode, setDarkMode } = useTheme();
  const { language, setLanguage } = useLanguage();
  const isRTL = language === "ar";
  const { cart } = useContext(CartContext);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const [menuOpen, setMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [careOpen, setCareOpen] = useState(false);

  const categoriesRef = useRef(null);
  const careRef = useRef(null);

  // ✅ إغلاق القوائم لما تضغط براها (في الديسكتوب فقط)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        window.innerWidth >= 768 && // يعني فقط في الديسكتوب
        !categoriesRef.current?.contains(e.target) &&
        !careRef.current?.contains(e.target)
      ) {
        setCategoriesOpen(false);
        setCareOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const links = [
    { name: isRTL ? "الرئيسية" : "Home", path: "/", icon: Home },
    {
      name: isRTL ? "المنتجات" : "Products",
      path: "/products",
      icon: ShoppingBag,
    },
    { name: isRTL ? "العروض" : "On Sale", path: "/offers", icon: Gift },
    { name: isRTL ? "المفضلة" : "Wishlist", path: "/wishlist", icon: Heart },
  ];

  const categories = [
    { name: isRTL ? "رجال" : "Men", path: "/category/men", icon: User },
    { name: isRTL ? "نساء" : "Women", path: "/category/women", icon: User },
    { name: isRTL ? "للجنسين" : "Unisex", path: "/category/unisex", icon: User },
    { name: isRTL ? "رياضة" : "Sport", path: "/category/sport", icon: User },
  ];

  const [offsetTop, setOffsetTop] = useState(40);
  useEffect(() => {
    const updateOffset = () =>
      setOffsetTop(
        document.querySelector(".announcement-bar")?.offsetHeight || 40
      );
    updateOffset();
    window.addEventListener("resize", updateOffset);
    return () => window.removeEventListener("resize", updateOffset);
  }, []);

  const handleLinkClick = () => {
    setMenuOpen(false);
    setCategoriesOpen(false);
    setCareOpen(false);
  };

  return (
    <nav
      dir={isRTL ? "rtl" : "ltr"}
      className="w-full fixed z-50 transition-all duration-300 backdrop-blur-md bg-white dark:bg-gray-900 shadow-md"
      style={{ top: offsetTop }}
    >
      <div className="w-full relative p-4 flex items-center justify-between">
        {/* اسم المتجر */}
        <div
          className={`${
            isRTL ? "order-3" : "order-1"
          } flex items-center gap-2 z-10`}
        >
          <Link
            to="/"
            className="font-bold text-xl text-purple-600 dark:text-purple-400 flex items-center gap-2"
          >
            <Home size={24} /> Sento Store
          </Link>
        </div>

        {/* اللوجو في النص للموبايل */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0 md:hidden">
          <Link to="/">
            <img src={logo} alt="Sento Store" className="h-10 object-contain" />
          </Link>
        </div>

        {/* روابط الديسكتوب */}
        <div className="hidden md:flex items-center gap-6 order-2">
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={handleLinkClick}
              onMouseEnter={() => {
                if (link.path === "/products") prefetchPage("products");
                if (link.path === "/wishlist") prefetchPage("wishlist");
                if (link.path === "/offers") prefetchPage("offers");
              }}
              className="flex items-center gap-1 px-3 py-2 rounded-md text-gray-800 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              <link.icon size={18} /> {link.name}
            </Link>
          ))}

          {/* الفئات */}
          <div className="relative" ref={categoriesRef}>
            <button
              aria-label="Categories"
              onClick={() => setCategoriesOpen(!categoriesOpen)}
              className="flex items-center gap-1 px-3 py-2 rounded-md text-gray-800 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              {isRTL ? "الفئات" : "Categories"} <ChevronDown size={16} />
            </button>
            {categoriesOpen && (
              <div className="absolute top-full mt-2 w-44 bg-white dark:bg-gray-700 rounded-lg shadow-lg flex flex-col z-50">
                {categories.map((cat) => (
                  <Link
                    key={cat.name}
                    to={cat.path}
                    onClick={() => setCategoriesOpen(false)}
                    className="flex items-center gap-1 px-4 py-2 hover:bg-purple-200 dark:hover:bg-purple-600 rounded-md transition-colors"
                  >
                    <cat.icon size={16} /> {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* خدمة العملاء */}
          <div className="relative" ref={careRef}>
            <button
              aria-label="Customer Care"
              onClick={() => setCareOpen(!careOpen)}
              className="flex items-center gap-1 px-3 py-2 rounded-md text-green-600 dark:text-green-400 hover:text-green-400 dark:hover:text-green-200 transition-colors"
            >
              {isRTL ? "خدمة العملاء" : "Customer Care"} <User size={16} />
            </button>
            {careOpen && (
              <div className="absolute top-full mt-2 w-44 bg-white dark:bg-gray-700 rounded-lg shadow-lg flex flex-col z-50">
                <a
                  href="https://wa.me/201157035111"
                  className="px-4 py-2 hover:bg-green-100 dark:hover:bg-green-600 rounded-md transition-colors"
                >
                  WhatsApp No.1
                </a>
                <a
                  href="https://wa.me/201515162937"
                  className="px-4 py-2 hover:bg-green-100 dark:hover:bg-green-600 rounded-md transition-colors"
                >
                  WhatsApp No.2
                </a>
              </div>
            )}
          </div>

          {/* السلة */}
          <Link
            to="/cart"
            onClick={handleLinkClick}
            className="relative text-gray-800 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
          >
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 px-2 py-1 rounded-full bg-red-600 text-white text-xs font-bold">
                {cartCount}
              </span>
            )}
          </Link>

          {/* الثيم واللغة */}
          <button
            aria-label="Toggle Dark Mode"
            onClick={() => setDarkMode(!darkMode)}
            className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            aria-label="Toggle Language"
            onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
            className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          >
            {language === "ar" ? "EN" : "AR"}
          </button>
        </div>

        {/* منيو الموبايل كما هي بدون أي تعديل */}
        <div
          className={`${
            isRTL ? "order-1" : "order-3"
          } md:hidden flex items-center gap-4 z-10`}
        >
          <Link
            to="/cart"
            className="relative text-gray-800 dark:text-gray-200"
          >
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 px-2 py-1 rounded-full bg-red-600 text-white text-xs font-bold">
                {cartCount}
              </span>
            )}
          </Link>
          <button
            aria-label="Toggle Menu"
            onClick={() => setMenuOpen(!menuOpen)}
            className={darkMode ? "text-white" : "text-gray-800"}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* منيو الموبايل الأصلية */}
      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 p-4 flex flex-col gap-4">
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={handleLinkClick}
              onMouseEnter={() => {
                if (link.path === "/products") prefetchPage("products");
                if (link.path === "/wishlist") prefetchPage("wishlist");
                if (link.path === "/offers") prefetchPage("offers");
              }}
              className="flex items-center gap-1 px-2 py-2 text-gray-800 dark:text-gray-200 hover:bg-purple-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              {link.icon && <link.icon size={16} />} {link.name}
            </Link>
          ))}

          <button
            aria-label="Categories"
            onClick={() => setCategoriesOpen(!categoriesOpen)}
            className="flex justify-between items-center px-2 py-2 w-full text-gray-800 dark:text-gray-200"
          >
            {isRTL ? "الفئات" : "Categories"} <ChevronDown size={16} />
          </button>
          {categoriesOpen && (
            <div className="flex flex-col pl-4 gap-1">
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  to={cat.path}
                  onClick={() => {
                    handleLinkClick();
                    setCategoriesOpen(false);
                  }}
                  className="flex items-center gap-1 px-2 py-1 text-gray-700 dark:text-gray-200 hover:bg-purple-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <cat.icon size={16} /> {cat.name}
                </Link>
              ))}
            </div>
          )}

          <button
            aria-label="Customer Care"
            onClick={() => setCareOpen(!careOpen)}
            className="flex justify-between items-center px-2 py-2 w-full text-green-600 dark:text-green-400"
          >
            {isRTL ? "خدمة العملاء" : "Customer Care"} <User size={16} />
          </button>
          {careOpen && (
            <div className="flex flex-col pl-4 gap-1">
              <a
                href="https://wa.me/201157035111"
                className="py-1 text-green-600 dark:text-green-200"
              >
                WhatsApp No.1
              </a>
              <a
                href="https://wa.me/201515162937"
                className="py-1 text-green-600 dark:text-green-200"
              >
                WhatsApp No.2
              </a>
            </div>
          )}

          <div className="flex gap-2 mt-2">
            <button
              aria-label="Toggle Dark Mode"
              onClick={() => setDarkMode(!darkMode)}
              className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              aria-label="Toggle Language"
              onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
              className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            >
              {language === "ar" ? "EN" : "AR"}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
