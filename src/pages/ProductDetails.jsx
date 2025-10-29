import { useEffect, useState, useContext, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
// ✅ تم إضافة Star
import {
  ShoppingCart,
  ArrowLeft,
  Loader2,
  Minus,
  Plus,
  X,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import { CartContext } from "../contexts/CartContext";
import ProductCard from "../components/ProductCard";
import api from "../../src/api/axiosInstance";
import { toast } from "react-toastify"; // ✅ إضافة toast

export default function ProductDetails() {
  const { id } = useParams();
  const { search } = useLocation();
  const [product, setProduct] = useState(null);
  const [selectedColorId, setSelectedColorId] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedSizeId, setSelectedSizeId] = useState(null);
  const [selectedQty, setSelectedQty] = useState(1);
  const [error, setError] = useState("");
  const [relatedProducts, setRelatedProducts] = useState([]);
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const thumbnailsContainerRef = useRef(null); // ✅ هنا عرفنا الريف

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // ⭐️ حالة التقييمات
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [reviewerName, setReviewerName] = useState(""); // اسم المستخدم (الضيف)
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const colorsContainerRef = useRef(null);
  // ⭐️ Lightbox state
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState([]);
  // ⭐️ Meta Pixel ViewContent عند تحميل المنتج
  useEffect(() => {
    if (product && window.fbq) {
      window.fbq("track", "ViewContent", {
        content_ids: [product._id],
        content_name: product.name,
        content_type: "product",
        value: product.salePrice || product.originalPrice || 0,
        currency: "EGP",
      });
    }
  }, [product]);

  const { language } = useLanguage();
  useTheme();
  const isRTL = language === "ar";

  const translations = {
    error: isRTL ? "⚠️ فشل تحميل المنتج." : "⚠️ Failed to load product.",
    loading: isRTL ? "⏳ جارِ التحميل..." : "⏳ Loading...",
    currency: isRTL ? "ج.م" : "EGP",
    noImage: isRTL ? "لا توجد صورة متاحة" : "No image available",
    colors: isRTL ? "الألوان" : "Colors",
    sizes: isRTL ? "المقاسات" : "Sizes",
    quantity: isRTL ? "الكمية" : "Quantity",
    outOfStock: isRTL ? "نفد" : "Out",
    lowStock: isRTL ? "قليل" : "Low",
    addToCart: isRTL ? "🛒 أضف إلى السلة" : "🛒 Add to Cart",
    selectSizeAlert: isRTL
      ? "برجاء اختيار المقاس أولاً!"
      : "Please select a size first!",
    quantityAlert: isRTL ? "لا يوجد سوى " : "Only ",
    itemsAvailable: isRTL ? " قطعة متاحة!" : " items available!",
    addToCartSuccess: isRTL
      ? "✅ تم إضافة المنتج إلى سلة التسوق: "
      : "✅ Added to cart: ",
    relatedProductsTitle: isRTL ? "منتجات ذات صلة" : "Related Products",
    // ⭐️ ترجمة التقييمات
    addReviewTitle: isRTL ? "أضف تقييمك" : "Add Your Review",
    reviewName: isRTL ? "اسمك" : "Your Name",
    reviewRating: isRTL ? "التقييم" : "Rating",
    reviewComment: isRTL ? "التعليق" : "Comment",
    submitReview: isRTL ? "إرسال التقييم" : "Submit Review",
    alreadyReviewed: isRTL
      ? "لقد قيمت هذا المنتج بالفعل."
      : "You have already reviewed this product.",
    reviewSuccess: isRTL
      ? "🎉 تم إضافة التقييم بنجاح!"
      : "🎉 Review added successfully!",
    reviewsSection: isRTL ? "تقييمات العملاء" : "Customer Reviews",
    noReviews: isRTL
      ? "لا توجد تقييمات لهذا المنتج بعد."
      : "No reviews yet for this product.",
    fillReviewAlert: isRTL
      ? "الرجاء تعبئة الاسم، التقييم، والتعليق."
      : "Please fill in name, rating, and comment.",
  };

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  // ⭐️ دالة جلب التقييمات
  const fetchReviews = async (productId) => {
    try {
      // نفترض أن API /reviews/ يرجع قائمة التقييمات فقط
      const { data } = await api.get(`/products/${productId}/reviews`);
      return data.reviews || [];
    } catch (error) {
      console.error("Error fetching reviews:", error);
      return [];
    }
  };

  // ⭐️ دالة إرسال التقييمات
  const submitReviewHandler = async (e) => {
    e.preventDefault();

    if (!reviewerName || !newComment || newRating === 0) {
      toast.error(translations.fillReviewAlert);
      return;
    }

    setIsSubmittingReview(true);
    try {
      const { data } = await api.post(`/products/${id}/reviews`, {
        name: reviewerName,
        rating: newRating,
        comment: newComment,
      });

      // تحديث الواجهة بالبيانات المرجعة من السيرفر (والتي يجب أن تتضمن التقييم الجديد)
      setReviews(data.reviews);
      setHasReviewed(true);

      // تحديث بيانات المنتج الرئيسية لتعكس التقييم الجديد (كـ Rating و NumReviews)
      setProduct((prev) => ({
        ...prev,
        rating: data.rating,
        numReviews: data.numReviews,
      }));

      // حفظ الاسم في LocalStorage لمنع التكرار في باقي المنتجات (على الأقل لنفس المتصفح)
      localStorage.setItem("guestReviewerName", reviewerName);

      // مسح حقول الإدخال
      setNewComment("");
      setNewRating(0);
      toast.success(translations.reviewSuccess);
    } catch (error) {
      const message = error.response?.data?.message || "فشل إضافة التقييم.";
      toast.error(message);
      if (message.includes("already reviewed")) {
        setHasReviewed(true);
      }
    } finally {
      setIsSubmittingReview(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    async function loadProduct() {
      setError("");
      setProduct(null);
      setSelectedImage("");
      setSelectedColorId(null);
      setSelectedSizeId(null);
      setSelectedQty(1);

      try {
        // 1. جلب المنتج
        const { data } = await api.get(`/products/${id}`);
        const prod = data?.product || data;
        if (!mounted) return;

        setProduct(prod);

        // 2. جلب التقييمات بشكل منفصل (إذا كان الكود Back-end يرجعها كمسار منفصل)
        // أو استخدام `prod.reviews` إذا كان يرجعها مع المنتج
        let initialReviews = prod.reviews || [];
        if (!initialReviews.length && prod.numReviews > 0) {
          initialReviews = await fetchReviews(id);
        }
        setReviews(initialReviews);

        // 3. التحقق من الاسم المخزن محلياً ومنع التكرار
        const storedName = localStorage.getItem("guestReviewerName");
        if (storedName) {
          setReviewerName(storedName);
          const reviewed = initialReviews.some(
            (review) => review.name.toLowerCase() === storedName.toLowerCase()
          );
          setHasReviewed(reviewed);
        }
        const normalize = (value) => {
          if (!value) return "";
          // إزالة رمز الهاش (#) بشكل قاطع من أي مكان والتحويل لحروف صغيرة وإزالة الفراغات
          return value.replace(/#/g, "").toLowerCase().trim();
        };

        const params = new URLSearchParams(search);
        const colorFromUrl = params.get("color");

        let initialVariation = null;
        const normalizedColorFromUrl = normalize(colorFromUrl);

        if (normalizedColorFromUrl) {
          // 🆕 الخطوة 3: البحث باستخدام الدالة الموحدة
          // الآن، سيتم البحث سواء كانت القيمة نصاً ("red") أو كود هيكسا ("#ff0000")
          initialVariation = prod.variations.find(
            (v) => normalize(v.color) === normalizedColorFromUrl
          );
        }

        if (!initialVariation) {
          initialVariation = Array.isArray(prod.variations)
            ? prod.variations[0]
            : null;
        }

        setSelectedColorId(initialVariation?._id || null);
        setSelectedImage(
          initialVariation?.images?.[0]?.url || prod?.images?.[0]?.url || ""
        );

        setSelectedSizeId(null);
        setSelectedQty(1);

        // Lightbox images
        const allImgs =
          prod.variations?.flatMap((v) =>
            (v.images || []).map((img) => ({ ...img, variationId: v._id }))
          ) || [];
        setLightboxImages(allImgs);

        // ✅ Products related logic
        if (
          prod.category &&
          (Array.isArray(prod.category) ? prod.category.length > 0 : true)
        ) {
          const { data } = await api.get("/products");
          const allProducts = data.products || data;

          const sameProductVariations = prod.variations
            .filter((v) => v._id !== initialVariation?._id)
            .map((v) => ({
              ...prod,
              _id: `${prod._id}-${v.color}`,
              color: v.color,
              images: v.images,
              sizes: v.sizes,
              originalProductId: prod._id,
              allVariations: prod.variations,
            }));

          const prodCategories = Array.isArray(prod.category)
            ? prod.category.map((c) => c.toLowerCase())
            : [prod.category.toLowerCase()];

          const relatedByCategory = allProducts
            .filter((p) => {
              if (p._id === prod._id) return false;
              if (!p.category) return false;

              const pCategories = Array.isArray(p.category)
                ? p.category
                : [p.category];
              return pCategories.some((cat) =>
                prodCategories.includes(cat.toLowerCase())
              );
            })
            .flatMap((p) => {
              if (p.variations && p.variations.length > 0) {
                return p.variations.map((variation) => ({
                  ...p,
                  _id: `${p._id}-${variation.color}`,
                  color: variation.color,
                  images: variation.images,
                  sizes: variation.sizes,
                  originalProductId: p._id,
                  allVariations: p.variations,
                }));
              }
              return [{ ...p, originalProductId: p._id }];
            });

          const combinedRelatedProducts = [
            ...sameProductVariations,
            ...relatedByCategory,
          ].slice(0, 4);

          setRelatedProducts(combinedRelatedProducts);
        }
      } catch (err) {
        console.error(err);
        if (mounted) setError(translations.error);
      }
    }

    loadProduct();
    return () => {
      mounted = false;
    };
  }, [id, search, translations.error]);

  useEffect(() => {
    if (selectedSizeId && product) {
      const selectedVariation = product.variations?.find(
        (v) => v._id === selectedColorId
      );
      if (selectedVariation) {
        const size = selectedVariation.sizes.find(
          (s) => s._id === selectedSizeId
        );
        if (size && selectedQty > size.quantity) {
          setSelectedQty(size.quantity);
        }
      }
    }
  }, [selectedSizeId, selectedColorId, selectedQty, product]);
  const scrollToColor = (colorId) => {
    const container = colorsContainerRef.current;
    if (!container) return;

    const btn = container.querySelector(`[data-color-id='${colorId}']`);
    if (!btn) return;

    const scrollPos =
      btn.offsetLeft - container.offsetWidth / 2 + btn.offsetWidth / 2;

    container.scrollTo({ left: scrollPos, behavior: "smooth" });
  };
  // 🟢 تعريف دالة التمرير للـ Thumbnails
const scrollToThumbnail = (imgUrl) => {
  const container = thumbnailsContainerRef.current;
  if (!container) return;

  // البحث عن زر الصورة باستخدام الـ data-img-url الذي وضعته أنت
  const selectedBtn = container.querySelector(
      `[data-img-url='${imgUrl}']`
  );

  if (selectedBtn) {
      // منطق تمرير العنصر ليظهر في منتصف الحاوية (مهم لتجربة المستخدم)
      const containerWidth = container.offsetWidth;
      const buttonLeft = selectedBtn.offsetLeft;
      const buttonWidth = selectedBtn.offsetWidth;
      
      // حساب موضع التمرير لمركز الزر
      const scrollPosition = 
          buttonLeft - containerWidth / 2 + buttonWidth / 2;

      container.scrollTo({
          left: scrollPosition,
          behavior: "smooth",
      });
  }
};

  // ✅ Scroll selected color into view when it’s selected automatically
  useEffect(() => {
    scrollToColor(selectedColorId);
  }, [selectedColorId]);

  if (error)
    return (
      <div className="container mx-auto p-4 text-red-600 dark:text-red-400 pt-20 text-center">
        {error}
      </div>
    );
  if (!product)
    return (
      <p className="container mx-auto p-4 text-gray-600 dark:text-gray-300 pt-20 text-center flex items-center justify-center gap-2">
        <Loader2 className="animate-spin" size={24} /> {translations.loading}
      </p>
    );

  const selectedVariation = product.variations?.find(
    (v) => v._id === selectedColorId
  );

  // const allImages =
  //   product.variations?.flatMap((v) =>
  //     (v.images || []).map((img) => ({
  //       ...img,
  //       variationId: v._id,
  //     }))
  //   ) || [];

  const handleAddToCart = () => {
    if (!product?._id) {
      showToastMessage("❌ Product data is missing!");
      return;
    }

    if (!selectedColorId || !selectedSizeId) {
      showToastMessage(translations.selectSizeAlert);
      return;
    }

    const selectedVariation = product?.variations.find(
      (v) => v._id === selectedColorId
    );
    const selectedSize = selectedVariation?.sizes.find(
      (s) => s._id === selectedSizeId
    );

    if (!selectedSize) {
      showToastMessage(translations.selectSizeAlert);
      return;
    }

    if (selectedQty > selectedSize.quantity) {
      showToastMessage(
        translations.quantityAlert +
          selectedSize.quantity +
          translations.itemsAvailable
      );
      return;
    }

    addToCart(product, selectedColorId, selectedSizeId, selectedQty);

    // ✅ Meta Pixel AddToCart using window
    if (window.fbq) {
      window.fbq("track", "AddToCart", {
        content_ids: [product._id],
        content_name: product.name,
        content_type: "product",
        value: product.salePrice || product.originalPrice || 0,
        currency: "EGP",
        quantity: selectedQty,
      });
    }

    showToastMessage(
      translations.addToCartSuccess +
        `${product.name} - ${selectedVariation.color} - ${selectedSize.size} x${selectedQty}`
    );
  };

 
  

  const handleThumbnailClick = (img) => {
    setSelectedImage(img.url);
    if (img.variationId) {
      setSelectedColorId(img.variationId);
      setSelectedSizeId(null);
      setSelectedQty(1);
    }
  };
  const openLightbox = (img) => {
    if (!lightboxImages.length) return;
    const index = lightboxImages.findIndex((i) => i.url === img.url);
    setLightboxIndex(index >= 0 ? index : 0);
    setIsLightboxOpen(true);
  };

  const nextLightbox = () => {
    setLightboxIndex((prev) => (prev + 1) % lightboxImages.length);
  };

  const prevLightbox = () => {
    setLightboxIndex((prev) =>
      prev === 0 ? lightboxImages.length - 1 : prev - 1
    );
  };

  const isSoldOut =
    selectedVariation?.sizes?.length > 0 &&
    selectedVariation.sizes.every((s) => s.quantity === 0);

  // ⭐️ مكون عرض التقييم (لمساعدتك)
  const RatingStars = ({ value }) => {
    // التقريب لأقرب نصف نجمة للعرض
    const roundedValue = Math.round(value * 2) / 2;
    const fullStars = Math.floor(roundedValue);
    const emptyStars = 5 - Math.ceil(roundedValue);

    // دالة لتوليد النجوم الفارغة والممتلئة
    const renderStars = () => {
      const stars = [];
      for (let i = 0; i < fullStars; i++) {
        stars.push(
          <Star
            key={`full-${i}`}
            size={16}
            fill="currentColor"
            className="text-yellow-500"
          />
        );
      }
      // إذا كان هناك نصف نجمة
      if (roundedValue % 1 !== 0) {
        stars.push(
          <Star
            key={`half`}
            size={16}
            fill="currentColor"
            className="text-yellow-500"
            style={{ clipPath: "polygon(0 0, 50% 0, 50% 100%, 0% 100%)" }}
          />
        );
      }
      for (let i = 0; i < emptyStars; i++) {
        stars.push(
          <Star
            key={`empty-${i}`}
            size={16}
            className="text-gray-300 dark:text-gray-600"
          />
        );
      }
      return stars;
    };

    return <div className="flex items-center gap-0.5">{renderStars()}</div>;
  };

  // ⭐️ مكون اختيار التقييم (لإدخال المستخدم)
  const RatingInput = ({ value, onChange, disabled }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((starValue) => (
          <Star
            key={starValue}
            size={28}
            fill={starValue <= value ? "currentColor" : "none"}
            className={`cursor-pointer transition-colors ${
              starValue <= value ? "text-yellow-500" : "text-gray-400"
            } ${
              disabled
                ? "opacity-50 cursor-not-allowed"
                : "hover:text-yellow-400"
            }`}
            onClick={() => !disabled && onChange(starValue)}
          />
        ))}
      </div>
    );
  };

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="bg-white dark:bg-gray-950 text-gray-900 dark:text-white min-h-screen py-20 transition-colors duration-300"
    >
      <div className="container mt-10 mx-auto px-4 relative">
        <button
          aria-labelledby="back-button"
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 md:left-8 p-3 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors z-20 shadow-md"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex flex-col md:flex-row gap-12 md:gap-24">
          <div className="md:w-1/2 flex flex-col items-center">
            {/* <div className="relative w-full flex items-center justify-center mb-4 rounded-2xl overflow-hidden shadow-2xl bg-gray-100 dark:bg-gray-900">
  {selectedImage ? (
    <img
      src={selectedImage}
      alt={product.name}
      className="w-auto h-auto max-w-full max-h-[90vh] object-cover transition-transform duration-300 hover:scale-105"
      style={{
        display: "block",
      }}
    />
  ) : (
    <div className="text-gray-500 dark:text-gray-400 text-center p-10">
      {translations.noImage}
    </div>
  )}
</div> */}

            <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl bg-gray-100 dark:bg-gray-900">
              {selectedImage ? (
                <img
                  onClick={() => openLightbox({ url: selectedImage })}
                  src={selectedImage}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              ) : (
                <div className="text-gray-500 dark:text-gray-400 text-center p-10">
                  {translations.noImage}
                </div>
              )}
            </div>

           {/* ✅ هذا الشريط يجب أن يعرض فقط صور المتغير المحدد حاليًا (selectedVariation) */}
<div className="mb-6">
    <div
        ref={thumbnailsContainerRef}
        className={`flex gap-4 overflow-x-auto p-2 ${
            isRTL ? "flex-row-reverse" : ""
        } scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent`}
    >
        {/* 💡 نستخدم selectedVariation.images بدلاً من allImages */}
        {selectedVariation?.images?.map((img, index) => ( 
            <button
                data-img-url={img.url}
                aria-label={`Product image ${index + 1}`}
                key={img._id || img.url}
                onClick={() => {
                    // نستخدم setSelectedImageIndex بدلاً من handleThumbnailClick لتحديث الصورة الرئيسية
                    setSelectedImageIndex(index); 
                    handleThumbnailClick(img);
                    // 💡 الأهم: عند النقر على الصورة، مرر الشريط لإظهارها في المنتصف
                    scrollToThumbnail(img.url);
                }}
                className={`flex-shrink-0 rounded-xl border-2 transition-all p-1 ${
                    // نستخدم selectedImageIndex === index لتحديد الصورة المختارة
                    selectedImageIndex === index 
                        ? "border-purple-600 dark:border-purple-400 shadow-lg scale-105"
                        : "border-gray-300 dark:border-gray-700 hover:border-purple-400"
                }`}
            >
                <img
                    src={img.url}
                    alt={`${product.name} - ${selectedVariation.color} - image ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-lg bg-gray-200 dark:bg-gray-700"
                />
            </button>
        ))}
    </div>
</div>
          </div>

          <div className="md:w-1/2 flex flex-col justify-between p-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold mb-1 text-violet-700 dark:text-violet-400">
                {product.name}
              </h1>

              {/* ⭐️ عرض التقييم الكلي هنا ⭐️ */}
              <div className="flex items-center gap-2 mb-4">
                <RatingStars value={product.rating || 0} />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {product.rating ? product.rating.toFixed(1) : "0.0"} (
                  {product.numReviews || 0} {isRTL ? "تقييم" : "reviews"})
                </span>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm sm:text-base">
                {product.description}
              </p>

              <div className="mb-6 flex items-center gap-4">
                {product.salePrice ? (
                  <>
                    <p className="text-2xl sm:text-3xl font-extrabold text-green-600 dark:text-green-400">
                      {product.salePrice} {translations.currency}
                    </p>
                    <p className="text-gray-500 dark:text-gray-500 text-lg line-through">
                      {product.originalPrice} {translations.currency}
                    </p>
                    {product.salePercentage > 0 && (
                      <span className="bg-red-600 text-white text-sm font-bold px-2 py-1 rounded-full">
                        -{product.salePercentage}%
                      </span>
                    )}
                  </>
                ) : (
                  <p className="text-2xl sm:text-3xl font-extrabold text-green-600 dark:text-green-400">
                    {product.originalPrice || product.price}{" "}
                    {translations.currency}
                  </p>
                )}
              </div>

              {product.variations?.length > 1 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-2 text-violet-600 dark:text-violet-200">
                    {translations.colors}:
                  </h3>
                  <div
                    className={`flex gap-4 overflow-x-auto py-2 ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                    ref={colorsContainerRef}
                  >
                    {product.variations?.map((v) => (
                      <button
                        aria-label="Select color"
                        key={v._id}
                        data-color-id={v._id} // ✅ مهم جداً
                        onClick={() => {
                          setSelectedColorId(v._id);
                          setSelectedImage(v.images?.[0]?.url || "");
                          setSelectedSizeId(null);
                          setSelectedQty(1);
                          scrollToColor(v._id); // ✅ هنا استخدمنا الدالة
                        }}
                        className={`w-10 h-10 rounded-full border-4 transition-all transform ${
                          selectedColorId === v._id
                            ? "border-purple-600 dark:border-purple-400 scale-110 shadow-lg"
                            : "border-transparent hover:scale-105 hover:border-gray-400 dark:hover:border-gray-500"
                        }`}
                        style={{ backgroundColor: v.color || "#ccc" }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* for size chart modal */}
              {product.sizeChart && (
                <button
                  aria-label="Show size chart"
                  onClick={() => setShowSizeChart(true)}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                >
                  Size Chart
                </button>
              )}

              {showSizeChart && (
                // الخلفية الشفافة، الضغط عليها يغلق المودال
                <div
                  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                  onClick={() => setShowSizeChart(false)}
                >
                  {/* المودال نفسه، الضغط داخله لا يغلق المودال */}
                  <div
                    className="relative w-full max-w-full max-h-[90vh] flex items-center justify-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* زر الإغلاق */}
                    <button
                      aria-labelledby="Close size chart"
                      onClick={() => setShowSizeChart(false)}
                      className="absolute top-4 right-4 text-white text-3xl font-bold hover:text-red-500 z-50"
                      aria-label="Close"
                    >
                      ×
                    </button>

                    {/* صورة جدول المقاسات */}
                    <img
                      src={product.sizeChart.url}
                      alt={`${product.name} Size Chart`}
                      className="object-contain w-full max-h-[85vh] rounded-lg"
                    />
                  </div>
                </div>
              )}

              {selectedVariation?.sizes?.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-2 text-violet-600 dark:text-violet-200">
                    {translations.sizes}:
                  </h3>
                  <div
                    className={`flex gap-3 flex-wrap ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    {selectedVariation?.sizes?.map((s) => {
                      const isSelected = selectedSizeId === s._id;
                      const isOutOfStock = s.quantity === 0;
                      return (
                        <div key={s._id} className="relative">
                          <button
                            aria-label="Select size"
                            type="button"
                            onClick={() =>
                              !isOutOfStock && setSelectedSizeId(s._id)
                            }
                            className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                              isSelected
                                ? "bg-violet-600 text-white border-violet-600 shadow-md scale-105"
                                : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-300 dark:hover:bg-gray-700"
                            } ${
                              isOutOfStock
                                ? "bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed border-gray-300 dark:border-gray-800 opacity-70"
                                : ""
                            }`}
                            disabled={isOutOfStock}
                          >
                            {s.size} {s.quantity < 10 && `(${s.quantity})`}
                          </button>
                          {isOutOfStock && (
                            <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-600 text-white text-xs px-2 py-1 rounded-full shadow-md">
                              {translations.outOfStock}
                            </span>
                          )}
                          {!isOutOfStock && s.quantity < 10 && (
                            <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full shadow-md">
                              {translations.lowStock}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {selectedSizeId && (
                <div className="mb-6 flex items-center gap-4">
                  <h3 className="font-semibold text-lg text-violet-600 dark:text-violet-200">
                    {translations.quantity}:
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      aria-label="Decrease quantity"
                      onClick={() =>
                        setSelectedQty((prev) => Math.max(1, prev - 1))
                      }
                      className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={
                        selectedVariation.sizes.find(
                          (s) => s._id === selectedSizeId
                        )?.quantity || 1
                      }
                      value={selectedQty}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        const max =
                          selectedVariation.sizes.find(
                            (s) => s._id === selectedSizeId
                          )?.quantity || 1;
                        setSelectedQty(Math.min(value, max));
                      }}
                      className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-700 px-3 py-2 rounded-lg w-24 text-center focus:border-violet-500 outline-none"
                    />
                    <button
                      aria-label="Increase quantity"
                      onClick={() => setSelectedQty((prev) => prev + 1)}
                      className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {isSoldOut ? (
              <button
                disabled
                className="mt-6 flex items-center justify-center gap-2 bg-gray-400 text-white py-3 px-6 rounded-xl shadow-lg cursor-not-allowed w-full sm:w-auto font-bold text-lg"
              >
                {isRTL ? "غير متاح" : "Sold Out"}
              </button>
            ) : (
              <button
                aria-label="Add to Cart"
                onClick={handleAddToCart}
                className="mt-6 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white py-3 px-6 rounded-xl shadow-lg w-full sm:w-auto font-bold text-lg transition-all"
              >
                <ShoppingCart size={20} />
                {translations.addToCart}
              </button>
            )}
          </div>
        </div>
        {isLightboxOpen && (
          <div
            className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center"
            onClick={() => setIsLightboxOpen(false)}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevLightbox();
              }}
              className="absolute left-5 text-white text-4xl font-bold z-50"
            >
              ‹
            </button>
            <img
              src={lightboxImages[lightboxIndex]?.url}
              alt={product?.name}
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextLightbox();
              }}
              className="absolute right-5 text-white text-4xl font-bold z-50"
            >
              ›
            </button>
          </div>
        )}

        {relatedProducts.length > 0 && (
          <div className="mt-16 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-violet-700 dark:text-violet-400">
              {translations.relatedProductsTitle}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-center">
              {relatedProducts.map((rp) => (
                <div key={rp._id} className="flex justify-center">
                  <ProductCard product={rp} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ⭐️ قسم التقييمات الجديد ⭐️ */}
        <div className="mt-16 border-t pt-8 border-gray-300 dark:border-gray-700">
          {/* فورم إضافة تقييم جديد */}
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-violet-700 dark:text-violet-400">
            {hasReviewed
              ? translations.alreadyReviewed
              : translations.addReviewTitle}
          </h2>

          {!hasReviewed ? (
            <form
              onSubmit={submitReviewHandler}
              className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl shadow-lg mb-10"
            >
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  {translations.reviewName}
                </label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                  placeholder={isRTL ? "أدخل اسمك" : "Enter your name"}
                  required
                  // تعطيل حقل الاسم إذا كان الاسم مخزناً بالفعل، لفرض استخدام نفس الاسم في جميع التقييمات كإجراء أمان للـ Guest
                  disabled={
                    isSubmittingReview ||
                    (localStorage.getItem("guestReviewerName") && reviewerName)
                  }
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  {translations.reviewRating}
                </label>
                <RatingInput
                  value={newRating}
                  onChange={setNewRating}
                  disabled={isSubmittingReview}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-1">
                  {translations.reviewComment}
                </label>
                <textarea
                  rows="3"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 resize-none"
                  placeholder={
                    isRTL
                      ? "شاركنا رأيك في المنتج..."
                      : "Share your opinion on the product..."
                  }
                  required
                  disabled={isSubmittingReview}
                />
              </div>

              <button
                aria-label="Submit Review"
                type="submit"
                disabled={isSubmittingReview}
                className="w-full bg-purple-600 text-white py-3 rounded-xl shadow-md hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmittingReview ? (
                  <Loader2 className="animate-spin mx-auto" size={20} />
                ) : (
                  translations.submitReview
                )}
              </button>
            </form>
          ) : (
            <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 p-4 rounded-xl mb-10 text-center font-semibold">
              {translations.alreadyReviewed}
            </div>
          )}

          {/* عرض قائمة التقييمات */}
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-violet-700 dark:text-violet-400">
            {translations.reviewsSection} ({reviews.length})
          </h2>

          {reviews.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 italic">
              {translations.noReviews}
            </p>
          ) : (
            <div className="space-y-6">
              {reviews.map((review, index) => (
                <div
                  key={review._id || index}
                  className="p-4 bg-white dark:bg-gray-900 rounded-lg shadow-md border-l-4 border-purple-500 dark:border-purple-400"
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-lg text-gray-800 dark:text-white">
                      {review.name}
                    </p>
                    <RatingStars value={review.rating} />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    {review.comment}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    {new Date(review.createdAt).toLocaleDateString(
                      language === "ar" ? "ar-EG" : "en-US"
                    )}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {showToast && (
          <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg z-50">
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
}
