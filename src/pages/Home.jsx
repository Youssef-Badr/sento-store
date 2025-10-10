import { useEffect, useState, useRef, useMemo } from "react";
import { lazy, Suspense } from "react";

const Hero = lazy(() => import("../components/Hero"));
import ProductCard from "../components/ProductCard";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import api from "../../src/api/axiosInstance";

export default function Home() {
  const { language } = useLanguage();
  const { darkMode } = useTheme();
  const latestRef = useRef(null);

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadFeatured() {
      setError("");
      setLoading(true);
      try {
        const res = await api.get("/products/featured");
        const data = res.data;
        if (!mounted) return;

        setFeaturedProducts(data);
      } catch (err) {
        console.error(err);
        if (mounted)
          setError(
            language === "ar"
              ? "فشل تحميل المنتجات المميزة."
              : "Failed to load featured products."
          );
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadFeatured();
    return () => {
      mounted = false;
    };
  }, [language]);

  // ✅ تحسين الأداء: flatten + filter باستخدام useMemo
  const filteredAndFlattenedProducts = useMemo(() => {
    if (!featuredProducts.length) return [];
    return featuredProducts
      .flatMap((product) => {
        if (product.variations && product.variations.length > 0) {
          return product.variations.map((variation) => ({
            ...product,
            _id: `${product._id}-${variation.color}`,
            color: variation.color,
            images: variation.images,
            sizes: variation.sizes,
            originalProductId: product._id,
            allVariations: product.variations,
          }));
        }
        return [{ ...product, originalProductId: product._id }];
      })
      .filter((product) => product.salePrice && product.salePrice > 0);
  }, [featuredProducts]);

  return (
    <div
      className="min-h-screen pt-20"
      dir={language === "ar" ? "rtl" : "ltr"}
      style={{
        backgroundColor: darkMode ? "rgb(17,24,39)" : "white",
        color: darkMode ? "white" : "black",
      }}
    >
      <div className="container mx-auto px-4 py-10 space-y-16">
        {/* Hero Section */}
        <div className="w-full mt-8 h-64 sm:h-80 md:h-96 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex flex-col items-center justify-center text-center shadow-2xl">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-4 text-white drop-shadow-lg">
            {language === "ar" ? "Sento Store" : "Sento Store"}
          </h1>
          <p className="text-lg sm:text-xl text-indigo-100 font-light max-w-2xl px-4">
            {language === "ar"
              ? "اكتشف عالم الملابس عالية الجودة. اعثر على أسلوبك المثالي اليوم."
              : "Discover a world of quality apparel. Find your perfect style, today."}
          </p>
        </div>

        {/* Hero Slider */}
        <Suspense
          fallback={
            <div className="h-64 flex justify-center items-center">
              Loading Hero...
            </div>
          }
        >
          <Hero latestRef={latestRef} language={language} />
        </Suspense>
        {/* Featured Products */}
        <div className="py-8">
          <h2 className="text-3xl font-bold mb-6 text-center text-indigo-500 dark:text-indigo-400">
            {language === "ar" ? "✨ المنتجات المميزة" : "✨ Featured Products"}
          </h2>

          {loading ? (
            <p className="text-center text-gray-300">
              {language === "ar" ? "جارٍ التحميل..." : "Loading..."}
            </p>
          ) : error ? (
            <p className="text-center text-red-600">{error}</p>
          ) : filteredAndFlattenedProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {filteredAndFlattenedProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">
              {language === "ar"
                ? "لا توجد منتجات مميزة بعد."
                : "No featured products yet."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
