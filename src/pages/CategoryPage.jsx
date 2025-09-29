import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useLanguage } from "../contexts/LanguageContext";
import api from "../../src/api/axiosInstance";

const categoryTranslations = {
  men: "رجالي",
  women: "حريمي",
  unisex: "للجنسين",
  sport: "رياضية",
  "on-sale": "التخفيضات",
};

export default function CategoryPage() {
  const { language } = useLanguage();
  const isRTL = language === "ar";

  const { categoryName } = useParams();
  const [Products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    async function fetchProducts() {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/products?category=${categoryName}`);
        if (!mounted) return;

        const allProducts = res.data.products || res.data;

        const categoryProducts = allProducts; // أو قم بتغيير اسم المتغير ليكون أكثر وضوحًا
        const flattenedProducts = categoryProducts.flatMap((product) => {
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
        });

        setFilteredProducts(flattenedProducts);
        setProducts(allProducts);
      } catch (err) {
        console.error(err);
        if (mounted)
          setError(
            isRTL
              ? "فشل تحميل المنتجات. تحقق من الكونسول."
              : "Failed to load products. Check console for details."
          );
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchProducts();
    return () => {
      mounted = false;
    };
  }, [categoryName, isRTL]);

  const translatedCategoryName =
    categoryTranslations[categoryName.toLowerCase()] || categoryName;

  if (loading)
    return (
      <p className="text-center py-20 text-gray-500 dark:text-gray-300 animate-pulse">
        {isRTL ? "جاري تحميل المنتجات..." : "Loading products..."}
      </p>
    );
  if (error)
    return (
      <p className="text-center py-20 text-red-600 dark:text-red-400">
        {error}
      </p>
    );

  return (
    <div
      className="bg-gray-50 dark:bg-gray-900 min-h-screen pt-20 transition-colors duration-300"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="container mx-auto mt-10 px-4 py-8 relative">
        <button
          onClick={() => navigate(-1)}
          className={`absolute top-4 ${
            isRTL ? "right-4" : "left-4"
          } p-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 
                     dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors z-20 shadow-md`}
          aria-label={isRTL ? "العودة" : "Go back"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
        </button>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-12 text-indigo-600 dark:text-indigo-400">
          {isRTL
            ? `منتجات ${translatedCategoryName}`
            : `${
                categoryName.charAt(0).toUpperCase() + categoryName.slice(1)
              } Products`}
        </h1>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600 dark:text-gray-400 text-lg sm:text-xl py-20">
            {isRTL ? "🚀 قريباً ✨" : "🚀 Coming Soon ✨"}
          </p>
        )}
      </div>
    </div>
  );
}
