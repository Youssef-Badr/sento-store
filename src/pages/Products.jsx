

import { useEffect, useState, useMemo } from "react";
import ProductCard from "../components/ProductCard";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import api from "../../src/api/axiosInstance";

// ✅ Skeleton UI component
const ProductSkeleton = () => {
  return (
    <div className="animate-pulse bg-white dark:bg-gray-800 shadow rounded-lg p-4 w-full">
      {/* صورة */}
      <div className="h-40 bg-gray-300 dark:bg-gray-700 rounded-md mb-4"></div>
      {/* اسم المنتج */}
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2 w-3/4"></div>
      {/* السعر */}
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
    </div>
  );
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const { language } = useLanguage();
  const { darkMode } = useTheme();
  const isRTL = language === "ar";

  const translations = {
    title: isRTL ? "منتجاتنا" : "Our Products",
    loading: isRTL ? "جاري تحميل المنتجات... ⏳" : "Loading products... ⏳",
    noProducts: isRTL ? "لا توجد منتجات حاليًا." : "No products found.",
    error: isRTL
      ? "فشل تحميل المنتجات. الرجاء المحاولة لاحقًا."
      : "Failed to load products. Please try again later.",
  };

  useEffect(() => {
    let mounted = true;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await api.get("/products");
        if (!mounted) return;

        const fetchedProducts = res.data.products || res.data;

        // ✅ تسطيح البيانات لعرض كل variation كمنتج منفصل
        const flattenedProducts = fetchedProducts.flatMap((product) => {
          if (product.variations && product.variations.length > 0) {
            return product.variations.map((variation) => ({
              ...product,
              _id: `${product._id}-${variation.color}`, // مفتاح فريد
              color: variation.color,
              images: variation.images,
              sizes: variation.sizes,
              originalProductId: product._id, // للحفاظ على ID المنتج الأصلي
              allVariations: product.variations,
            }));
          }
          return [{ ...product, originalProductId: product._id }];
        });

        setProducts(flattenedProducts);
        setError(null);
      } catch (err) {
        console.error(err);
        if (mounted) setError(translations.error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProducts();
    return () => {
      mounted = false;
    };
  }, [translations.error]);

  // ✅ useMemo يمنع إعادة حساب المنتجات إلا لو اتغيرت
  const renderedProducts = useMemo(() => {
    return products.map((product) => (
      <ProductCard key={product._id} product={product} />
    ));
  }, [products]);

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className={`${
        darkMode ? "bg-[#111827] text-gray-100" : "bg-white text-gray-900"
      } min-h-screen pt-20 transition-colors duration-300`}
    >
      <div className="container mx-auto px-4 py-8">
        <h1
          className={`${
            darkMode ? "text-violet-400" : "text-violet-600"
          } text-3xl sm:text-4xl font-extrabold mb-8 mt-6 text-center`}
        >
          {translations.title}
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {loading ? (
            // ✅ Skeletons أثناء التحميل
            [...Array(8)].map((_, i) => <ProductSkeleton key={i} />)
          ) : error ? (
            <p className="text-center text-red-500 col-span-full">{error}</p>
          ) : products.length > 0 ? (
            renderedProducts
          ) : (
            <p className="text-center text-gray-400 col-span-full">
              {translations.noProducts}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
