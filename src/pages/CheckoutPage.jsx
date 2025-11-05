import { useState, useEffect } from "react";
import { useCart } from "../contexts/CartContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import api from "../../src/api/axiosInstance";
const CheckoutPage = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { language } = useLanguage();

  const [citiesList, setCitiesList] = useState([]);
  const [shippingCost, setShippingCost] = useState(0);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    address: "",
    paymentMethod: "cash",
    transactionId: "",
    proofImage: null,
    discountCode: "",
  });

  const [discountInfo, setDiscountInfo] = useState(null);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await api.get("/delivery-charges/public");

        setCitiesList(res.data);
      } catch (error) {
        console.error(error);
        toast.error(
          language === "ar"
            ? "حدث خطأ أثناء تحميل المدن"
            : "Failed to load cities"
        );
      }
    };
    fetchCities();
  }, [language]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "city") {
      const cityData = citiesList.find((c) => c.city === value);
      if (cityData) setShippingCost(cityData.charge);
      else setShippingCost(0);
    }
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, proofImage: e.target.files[0] });
  };

  const validateDiscount = async () => {
    if (!formData.discountCode) {
      setDiscountInfo(null);
      return;
    }

    try {
      try {
        const res = await api.post("/discounts/validate", {
          code: formData.discountCode,
          orderItems: cart.map((item) => ({
            product: item.product,
            quantity: item.qty,
            price: item.price,
          })),
        });

        setDiscountInfo(res.data);
        toast.success(
          language === "ar"
            ? "✅ كود الخصم صالح!"
            : "✅ Discount code is valid!"
        );
      } catch (err) {
        const msg =
          err.response?.data?.message ||
          (language === "ar"
            ? "⚠️ خطأ أثناء التحقق"
            : "⚠️ Error while validating");
        toast.error(`⚠️ ${msg}`);
        setDiscountInfo({ error: msg });
      }

     
    } catch (err) {
      console.error(err);
      toast.error(
        language === "ar"
          ? "⚠️ حدث خطأ أثناء التحقق من الخصم"
          : "⚠️ Something went wrong while validating discount"
      );
    }
  };

 
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    setLoading(true); // 👈 أول ما تبدأ
  
    try {
      if (cart.length === 0) {
        toast.error(language === "ar" ? "عربة التسوق فارغة ❌" : "Your cart is empty ❌");
        return;
      }
  
      if (
        (formData.paymentMethod === "instapay" ||
          formData.paymentMethod === "vodafone") &&
        !formData.transactionId &&
        !formData.proofImage
      ) {
        toast.error(language === "ar"
          ? "⚠️ الرجاء إدخال رقم العملية أو رفع صورة الإيصال"
          : "⚠️ Please provide either Transaction ID or Proof Image");
        return;
      }
  
      const phoneRegex = /^(010|011|012|015)\d{8}$/;
      if (!formData.phone) {
        toast.error(language === "ar" ? "⚠️ الرجاء إدخال رقم الهاتف" : "⚠️ Please provide a phone number");
        return;
      }
      if (!phoneRegex.test(formData.phone)) {
        toast.error(language === "ar"
          ? "⚠️ رقم الهاتف غير صالح"
          : "⚠️ Invalid phone number");
        return;
      }
  
      if (!formData.city || !formData.address) {
        toast.error(language === "ar" ? "⚠️ الرجاء إدخال المدينة والعنوان" : "⚠️ Please provide both City and Address");
        return;
      }
  
      // ✅ بناء البيانات
      const payload = new FormData();
      payload.append("name", formData.name);
      if (formData.email) payload.append("email", formData.email);
      payload.append("phone", formData.phone);
      payload.append("shippingAddress", JSON.stringify({
        city: formData.city,
        address: formData.address,
        country: "Egypt",
      }));
      payload.append("paymentMethod", formData.paymentMethod);
      payload.append("transactionId", formData.transactionId);
      if (formData.proofImage) payload.append("proofImage", formData.proofImage);
  
      const orderItems = cart.map((item) => ({
        product: item.product,
        variationId: item.variationId,
        sizeId: item.sizeId,
        qty: item.qty,
        color: item.color,
        size: item.size,
      }));
  
      if (discountInfo && !discountInfo.error) {
        payload.append("discountCode", formData.discountCode);
      }
  
      payload.append("orderItems", JSON.stringify(orderItems));





// // 👈 قبل إرسال الأوردر
// if (window.fbq) {
//   window.fbq('track', 'InitiateCheckout', {
//     value: totalWithDiscount,
//     currency: 'EGP',
//     contents: cart.map(item => ({
//       id: item.product,
//       quantity: item.qty,
//       item_price: item.price
//     })),
//     content_type: 'product'
//   });
// }

// if (window.gtag) { // بيتأكد إن مكتبة Google Analytics موجودة
//   window.gtag('event', 'begin_checkout', { // بيبعت حدث باسم "begin_checkout"
//     value: totalWithDiscount,        // إجمالي قيمة العربه بعد الخصم
//     currency: 'EGP',                 // العملة
//     items: cart.map(item => ({       // تفاصيل كل منتج بالعربة
//       id: item.product,              // رقم المنتج
//       quantity: item.qty,            // الكمية
//       price: item.price              // سعر الوحدة
//     }))
//   });
// }
// 👈 قبل إرسال الأوردر
if (window.trackFBEvent) {  // بدل window.fbq
  window.trackFBEvent('InitiateCheckout', {
    value: totalWithDiscount,
    currency: 'EGP',
    contents: cart.map(item => ({
      id: item.product,
      quantity: item.qty,
      item_price: item.price
    })),
    content_type: 'product'
  });
}

if (window.gtag) { // بيتأكد إن مكتبة Google Analytics موجودة
  window.gtag('event', 'begin_checkout', { // بيبعت حدث باسم "begin_checkout"
    value: totalWithDiscount,        // إجمالي قيمة العربه بعد الخصم
    currency: 'EGP',                 // العملة
    items: cart.map(item => ({       // تفاصيل كل منتج بالعربة
      id: item.product,              // رقم المنتج
      quantity: item.qty,            // الكمية
      price: item.price              // سعر الوحدة
    }))
  });
}



  
      // ✅ طلب إنشاء الأوردر
      const res = await api.post("/orders", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      const createdOrder = res.data;
  
      clearCart();
      toast.success(language === "ar"
        ? `🎉 شكرًا ${formData.name}! تم تسجيل طلبك بنجاح.`
        : `🎉 Thank you ${formData.name}! Your order has been successfully placed.`);
  
      navigate(`/thankyou/${createdOrder._id || createdOrder.order?._id}`);
    } catch (error) {
      console.error(error);
      toast.error(language === "ar"
        ? `⚠️ حدث خطأ أثناء تسجيل الطلب: ${error.message}`
        : `⚠️ Something went wrong: ${error.message}`);
    } finally {
      setLoading(false); // 👈 يتنفذ في جميع الحالات
    }
  };
  
  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  let totalDiscountAmount = 0;
  let totalFreeQuantity = 0; // ✅ تم تعديل هذا الجزء ليعتمد على قيم الـ Backend

  if (discountInfo && discountInfo.valid) {
    totalDiscountAmount = discountInfo.discountAmount || 0;
    totalFreeQuantity = discountInfo.freeQuantity || 0;
  }

  const totalWithDiscount = cartTotal + shippingCost - totalDiscountAmount;

  const bgColor = darkMode ? "bg-[#111827]" : "bg-gray-50";
  const textColor = darkMode ? "text-gray-200" : "text-gray-900";
  const inputBg = darkMode
    ? "bg-gray-800 text-gray-200 placeholder-gray-400"
    : "bg-white text-gray-900";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-300";
  const buttonBg = darkMode
    ? "bg-purple-600 hover:bg-purple-700"
    : "bg-purple-500 hover:bg-purple-600";
  const buttonText = "text-white";

  return (
    <div
      dir={language === "ar" ? "rtl" : "ltr"}
      className={`${bgColor} mt-12 min-h-screen flex items-start justify-center py-10 transition-colors duration-300`}
    >
      <div className="w-full max-w-lg p-6 rounded-md shadow-md">
        <div className="flex items-center justify-between mb-6 mt-5">
          <button
          aria-label="Go back"
            type="button"
            onClick={() => {
              if (window.history.length > 2) {
                navigate(-1);
              } else {
                navigate("/cart");
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium transition-colors duration-200 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {language === "ar" ? "⬅ رجوع" : "⬅ Back"}
          </button>

          <h2 className={`text-2xl font-bold ${textColor} text-center flex-1`}>
            {language === "ar" ? "إتمام الطلب" : "Checkout"}
          </h2>

          {/* عنصر فارغ للمحافظة على توازن Flex */}
          <div className="w-20"></div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder={language === "ar" ? "الاسم الكامل" : "Full Name"}
            value={formData.name}
            onChange={handleChange}
            required
            className={`w-full p-3 rounded border ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-400 ${inputBg}`}
          />
          <input
            type="email"
            name="email"
            placeholder={
              language === "ar"
                ? "البريد الإلكتروني (اختياري)"
                : "Email (optional)"
            }
            value={formData.email}
            onChange={handleChange}
            className={`w-full p-3 rounded border ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-400 ${inputBg}`}
          />
          <input
            type="text"
            name="phone"
            placeholder={
              language === "ar"
                ? "رقم الهاتف (تأكد أنه صحيح)"
                : "Phone Number (Make sure it's correct)"
            }
            value={formData.phone}
            onChange={handleChange}
            required
            className={`w-full p-3 rounded border ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-400 ${inputBg}`}
          />
          <select
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
            autoComplete="new-city"
            className={`w-full p-3 rounded border ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-400 ${inputBg}`}
          >
            <option value="">
            {language === "ar" ? "اختر مدينة الشحن:" : "Select charge city:"}
            </option>
            {citiesList.map((c) => (
              <option key={c._id} value={c.city}>
                {c.city}
              </option>
            ))}
          </select>
          {shippingCost > 0 && (
            <p className="mt-1 text-green-600 font-medium">
              {language === "ar"
                ? `تكلفة الشحن: ${shippingCost} جنيه`
                : `Shipping cost: ${shippingCost} EGP`}
            </p>
          )}
          <input
            type="text"
            name="discountCode"
            placeholder={
              language === "ar"
                ? "إذا لديك كود خصم، أدخله هنا (اختياري)"
                : "Discount Code (optional if you have one)"
            }
            value={formData.discountCode}
            onChange={handleChange}
            onBlur={validateDiscount}
            className={`w-full p-3 rounded border ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-400 ${inputBg}`}
          />
          {discountInfo && (
            <div className="mt-2 text-sm space-y-1">
              {discountInfo.error && (
                <p className="text-red-600 font-medium">
                  {language === "ar"
                    ? `⚠️ ${discountInfo.error}`
                    : `⚠️ ${discountInfo.error}`}
                </p>
              )}
              {discountInfo.discountType === "percentage" &&
                !discountInfo.error && (
                  <p className="text-green-600 font-medium">
                    {language === "ar"
                      ? `✔️ تم خصم ${discountInfo.percentage}% (-${totalDiscountAmount} جنيه)`
                      : `✔️ ${discountInfo.percentage}% off (-${totalDiscountAmount} EGP)`}
                  </p>
                )}
              {discountInfo.discountType === "bogo" && !discountInfo.error && (
                <p className="text-green-600 font-medium">
                  {language === "ar"
                    ? `✔️ حصلت على إجمالي ${totalFreeQuantity} قطعة مجانية! (-${totalDiscountAmount} جنيه)`
                    : `✔️ You get a total of ${totalFreeQuantity} free items! (-${totalDiscountAmount} EGP)`}
                </p>
              )}
              {discountInfo.discountType === "bogo_discount" &&
                !discountInfo.error && (
                  <p className="text-green-600 font-medium">
                    {language === "ar"
                      ? `✔️ حصلت على إجمالي خصم ${totalDiscountAmount.toFixed(
                          2
                        )} جنيه!`
                      : `✔️ You get a total discount of ${totalDiscountAmount.toFixed(
                          2
                        )} EGP!`}
                  </p>
                )}
            </div>
          )}
          <input
            type="text"
            name="address"
            placeholder={
              language === "ar"
                ? "العنوان بالتفصيل: أدخل المحافظة، المدينة، الحي، اسم الشارع، رقم العقار"
                : "Full Address: Enter Governorate, City, District, Street Name, Building Number"
            }
            value={formData.address}
            onChange={handleChange}
            required
            autoComplete="new-address"
            className={`w-full p-3 rounded border ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-400 ${inputBg}`}
          />
          <select
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            className={`w-full p-3 rounded border ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-400 ${inputBg}`}
          >
            <option value="cash">
              {language === "ar" ? "الدفع عند الاستلام" : "Cash on Delivery"}
            </option>
            <option value="instapay">
              {language === "ar" ? "إنستاباي" : "InstaPay"}
            </option>
            <option value="vodafone">
              {language === "ar" ? "فودافون كاش" : "Vodafone Cash"}
            </option>
          </select>
          {(formData.paymentMethod === "instapay" ||
            formData.paymentMethod === "vodafone") && (
            <div className="space-y-2">
              <input
                type="text"
                name="transactionId"
                placeholder={
                  language === "ar" ? "رقم العملية" : "Transaction ID"
                }
                value={formData.transactionId}
                onChange={handleChange}
                className={`w-full p-3 rounded border ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-400 ${inputBg}`}
              />
              <input
                type="file"
                name="proofImage"
                accept="image/*"
                onChange={handleFileChange}
                className={`w-full p-2 rounded border ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-400 ${inputBg}`}
              />
              <p className="text-sm text-gray-500">
                {language === "ar"
                  ? "يمكنك إدخال رقم العملية أو رفع صورة الإيصال (واحد فقط مطلوب)."
                  : "Provide either Transaction ID or Proof Image (only one is required)."}
              </p>
            </div>
          )}
          <div className="mt-4 p-3 rounded bg-gray-100 dark:bg-gray-800">
            <p className={`font-medium ${textColor}`}>
              {language === "ar"
                ? `إجمالي المنتجات: ${cartTotal} جنيه`
                : `Subtotal: ${cartTotal} EGP`}
            </p>
            {totalDiscountAmount > 0 && (
              <p className={`font-medium text-green-600`}>
                {language === "ar"
                  ? `الخصم: -${totalDiscountAmount} جنيه`
                  : `Discount: -${totalDiscountAmount} EGP`}
              </p>
            )}
            <p className={`font-medium ${textColor}`}>
              {language === "ar"
                ? `تكلفة الشحن: ${shippingCost} جنيه`
                : `Shipping: ${shippingCost} EGP`}
            </p>
            <p className={`font-bold text-lg ${textColor}`}>
              {language === "ar"
                ? `الإجمالي الكلي: ${totalWithDiscount} جنيه`
                : `Total: ${totalWithDiscount} EGP`}
            </p>
          </div>
        

<button
aria-label="Submit Order"
  type="submit"
  disabled={loading}
  className={`w-full py-3 rounded font-semibold shadow-md transition-all 
    ${loading ? "bg-gray-400 cursor-not-allowed" : buttonBg} ${buttonText}`}
>
  {loading ? (
    <div className="flex items-center justify-center gap-2">
      <svg
        className="animate-spin h-5 w-5 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        ></path>
      </svg>
      {language === "ar" ? "جاري إرسال الطلب..." : "Placing Order..."}
    </div>
  ) : (
    language === "ar" ? "تأكيد الطلب" : "Confirm Order"
  )}
</button>

        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
