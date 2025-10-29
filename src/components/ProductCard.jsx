import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useCart } from "../contexts/CartContext";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import { X } from "lucide-react";
import { FaStar, FaStarHalfAlt } from "react-icons/fa";
import React from "react";

function ProductCard({ product }) {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [showSizeSelector, setShowSizeSelector] = useState(false);
  const cardRef = useRef(null);

  const availableSizes = product.sizes || [];

// ✅ تشيك لو كل المقاسات خلصت
const isSoldOut =
  availableSizes.length > 0 && availableSizes.every((size) => size.quantity <= 0);
  const imageUrl =
    product.images?.[0]?.url ||
    "https://via.placeholder.com/400x400?text=No+Image";

  // ✅ حساب متوسط التقييم مرة واحدة
  const { average, count } = useMemo(() => {
    const productReviews = product.reviews || [];
    if (!productReviews.length) return { average: 0, count: 0 };
    const totalRating = productReviews.reduce(
      (sum, review) => sum + (review.rating || 0),
      0
    );
    return {
      average: totalRating / productReviews.length,
      count: productReviews.length,
    };
  }, [product.reviews]);

  // ✅ stars rendering
  const stars = useMemo(() => {
    const fullStars = Math.floor(average);
    const hasHalfStar = average % 1 >= 0.25;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <span className="flex items-center text-yellow-500">
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={`full-${i}`} className="w-3 h-3 sm:w-4 sm:h-4" />
        ))}
        {hasHalfStar && (
          <FaStarHalfAlt key="half" className="w-3 h-3 sm:w-4 sm:h-4" />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <FaStar
            key={`empty-${i}`}
            className="w-3 h-3 sm:w-4 sm:h-4 text-gray-300 dark:text-gray-600"
          />
        ))}
      </span>
    );
  }, [average]);

  // ✅ handle size selection
  const handleSelectSize = useCallback(
    (size) => {
      if (size.quantity > 0) {
        let variationId = product._id;
        if (product.variations?.length > 0 && product.color) {
          const foundVariation = product.variations.find(
            (v) => v.color === product.color
          );
          if (foundVariation) variationId = foundVariation._id;
        }
        const productId = product.originalProductId || product._id;

        addToCart({ ...product, _id: productId }, variationId, size._id, 1);
        setShowSizeSelector(false);

        // Meta Pixel AddToCart event
        if (window.fbq) {
          window.fbq("track", "AddToCart", {
            content_ids: [product._id],
            content_name: product.name,
            content_type: "product",
            value: product.salePrice || product.price,
            currency: "EGP",
          });
        }

        toast.success(
          isRTL ? "✅ تم إضافة المنتج إلى السلة" : "✅ Product added to cart"
        );
      } else {
        toast.error(isRTL ? "نفد هذا المقاس!" : "This size is out of stock!");
      }
    },
    [addToCart, isRTL, product]
  );

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        setShowSizeSelector(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={cardRef}
      // 🎯 التعديل هنا: إزالة رمز # من product.color قبل إرساله في الرابط
      onClick={() =>
        navigate(
          `/product/${product.originalProductId}?color=${product.color.replace(
            "#",
            ""
          )}`
        )
      }
      className="relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer border border-gray-200 dark:border-gray-700 group"
    >
      {product.salePrice > 0 && product.salePercentage > 0 ? (
        <>
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10 shadow-md">
            -{product.salePercentage}%
          </span>
          <span className="absolute top-2 right-2 bg-gradient-to-r from-red-600 to-red-400 text-white text-xs font-bold px-2 py-1 rounded-full z-10 shadow-md">
            {isRTL ? "تخفيض" : "SALE"}
          </span>
        </>
      ) : null}

      {/* Product Image */}
      <div className="w-full h-56 sm:h-64 lg:h-72 overflow-hidden bg-gray-100 dark:bg-gray-900">
        <img
          src={imageUrl}
          alt={product.name}
          width={400}
          height={400}
          loading="lazy"
          className="w-full h-full object-cover transform transition-transform duration-300 hover:scale-110"
        />
      </div>

      {/* Product Info */}
      <div className="p-5 flex flex-col justify-between pb-16 sm:pb-20">
        <h3
          className={`font-semibold text-lg sm:text-xl mb-2 text-gray-800 dark:text-gray-100 truncate ${
            isRTL ? "text-right" : "text-left"
          }`}
        >
          {`${product.name}`}
        </h3>

        {/* Stars + Rating */}
        {count > 0 ? (
          <div
            className={`flex flex-col mb-2 text-sm ${
              isRTL ? "items-end" : "items-start"
            }`}
          >
            <div className="flex items-center">
              {stars}
              <span
                className={`text-gray-500 dark:text-gray-400 font-semibold ${
                  isRTL ? "mr-2" : "ml-2"
                }`}
              >
                {average.toFixed(1)}
              </span>
            </div>
            <span className="text-gray-500 dark:text-gray-400 mt-0.5">
              ({count} {isRTL ? "تقييم" : "Reviews"})
            </span>
          </div>
        ) : (
          <p
            className={`text-sm text-gray-500 dark:text-gray-400 mb-3 ${
              isRTL ? "text-right" : "text-left"
            }`}
          >
            {isRTL ? "لا توجد تقييمات" : "No reviews yet"}
          </p>
        )}

        {/* Description */}
        {product.description && (
          <p
            className={`text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2 ${
              isRTL ? "text-right" : "text-left"
            }`}
          >
            {product.description}
          </p>
        )}

        {/* Price */}
        <div className="mt-auto">
          {product.salePrice ? (
            <div
              className={`flex items-center gap-2 ${
                isRTL ? "justify-end" : ""
              }`}
            >
              <p className="text-gray-500 dark:text-gray-400 text-sm line-through">
                {product.originalPrice} {isRTL ? "جنيه" : "EGP"}
              </p>
              <p className="text-lg sm:text-xl font-extrabold text-green-600 dark:text-green-400">
                {product.salePrice} {isRTL ? "جنيه" : "EGP"}
              </p>
            </div>
          ) : (
            <p
              className={`text-lg sm:text-xl font-extrabold text-indigo-600 dark:text-indigo-400 ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {product.originalPrice || product.price} {isRTL ? "جنيه" : "EGP"}
            </p>
          )}
        </div>
      </div>

      
{isSoldOut ? (
  <div
    className="absolute bottom-4 left-1/2 -translate-x-1/2
      bg-gray-400 dark:bg-gray-600
      text-white font-semibold rounded-full shadow-lg
      transition-all duration-300 ease-in-out
      w-[85%] px-3 py-2 text-sm cursor-not-allowed text-center
      sm:w-auto sm:px-5 sm:py-2.5 sm:text-base"
  >
    {isRTL ? "غير متاح" : "Sold Out"}
  </div>
) : (
  <button
    aria-labelledby=""
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      if (availableSizes.length > 0) setShowSizeSelector(true);
      else
        toast.error(
          language === "ar"
            ? "⚠️ هذا المنتج غير متاح حاليًا"
            : "⚠️ This product is currently unavailable"
        );
    }}
    className={`absolute bottom-4 left-1/2 -translate-x-1/2
      bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700
      text-white font-semibold rounded-full shadow-lg hover:shadow-xl
      transition-all duration-300 ease-in-out
      w-[85%] px-3 py-2 text-sm opacity-100 translate-y-0
      sm:w-auto sm:px-5 sm:py-2.5 sm:text-base sm:opacity-0 sm:translate-y-6
      sm:group-hover:opacity-100 sm:group-hover:translate-y-0`}
  >
    {isRTL ? "أضف إلى السلة" : "Add to Cart"}
  </button>
)}



      {/* Size Selector Modal */}
      {showSizeSelector && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl z-20"
        >
          <div className="bg-white dark:bg-gray-900 p-4 rounded-lg flex flex-col gap-2 w-36 sm:w-44 relative">
            <button
              aria-labelledby=""
              type="button"
              onClick={() => setShowSizeSelector(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <h4 className="text-center font-semibold text-gray-800 dark:text-gray-100 mt-2">
              {isRTL ? "اختر المقاس" : "Select Size"}
            </h4>

            {availableSizes.map((size) => {
              const isOutOfStock = size.quantity <= 0;
              return (
                <button
                  aria-label=""
                  type="button"
                  key={size._id}
                  onClick={() => handleSelectSize(size)}
                  disabled={isOutOfStock}
                  className={`font-medium rounded px-2 py-1 text-sm transition-colors duration-200 ${
                    isOutOfStock
                      ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white"
                  }`}
                >
                  {size.size}
                  {isOutOfStock && (
                    <span className="ml-2 text-xs opacity-75">
                      ({isRTL ? "نفد" : "Out"})
                    </span>
                  )}
                </button>
              );
            })}

            <button
              aria-label=""
              type="button"
              onClick={() => setShowSizeSelector(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 text-sm mt-2"
            >
              {isRTL ? "إلغاء" : "Cancel"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ✅ تحسين الأداء: React.memo
export default React.memo(ProductCard);
