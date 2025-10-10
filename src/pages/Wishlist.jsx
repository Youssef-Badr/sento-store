import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import { useLanguage } from "../contexts/LanguageContext";
import api from "../../src/api/axiosInstance";

export default function FeaturedProducts() {
  const { language } = useLanguage();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const isRTL = language === "ar";

  // ✨ جلب المنتجات المميزة وتسطيح البيانات
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await api.get("/products/featured");

        // ✅ تسطيح البيانات (كل variation يعتبر منتج مستقل)
        const flattenedProducts = (data.products || data).flatMap((product) => {
          if (product.variations && product.variations.length > 0) {
            return product.variations.map((variation) => ({
              ...product,
              _id: `${product._id}-${variation.color}`, // ID فريد
              color: variation.color,
              images: variation.images,
              sizes: variation.sizes,
              originalProductId: product._id,
              allVariations: product.variations,
            }));
          }
          return [{ ...product, originalProductId: product._id }];
        });

        // ✅ ترتيب المنتجات حسب الأحدث
        const sortedFeatured = flattenedProducts.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setFeaturedProducts(sortedFeatured);
      } catch (err) {
        console.error("Error fetching featured:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <div
      className="pt-24 px-4 sm:px-6 lg:px-8 mt-10 bg-white dark:bg-gray-900 min-h-screen mb-6"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Header */}
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-8 text-center text-gray-900 dark:text-white">
        {isRTL ? "✨ الأكثر مبيعًا" : "✨ Best Seller"}
      </h2>

      {/* Loading */}
      {loading ? (
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 animate-pulse">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-gray-200 dark:bg-gray-700 rounded-xl h-64 w-full"
            ></div>
          ))}
        </div>
      ) : featuredProducts.length > 0 ? (
        <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
          {featuredProducts.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400">
          {isRTL ? "لا توجد منتجات مميزة." : "No featured products yet."}
        </p>
      )}
    </div>
  );
}
