import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useEffect, useState } from "react";
import api from "../../src/api/axiosInstance";

const ThankYou = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/public/${orderId}`);
        setOrder(data.order || data);
      } catch (err) {
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) fetchOrder();
  }, [orderId]);

  // 🧮 الحسابات
  const subtotal = order?.orderItems?.reduce(
    (acc, item) =>
      acc + (Number(item.price) || 0) * (Number(item.quantity) || 0),
    0
  )|| 0;
  const shipping = Number(order?.shippingFee) || 0;
  const discount = order?.discount?.amount || 0;
  const calculatedTotal = subtotal + shipping - discount;

 // ------------------- Tracking بعد تحميل البيانات -------------------
 useEffect(() => {
  if (!order || !order.orderItems) return;

  // ------------- Google Analytics (gtag) -------------
  const metaCurrency = ["EGP","USD"].includes("EGP") ? "EGP" : "USD";

  if (window.gtag) {
    window.gtag("event", "purchase", {
      transaction_id: order._id || "unknown",
      value: Number(calculatedTotal) || 0,
      currency: metaCurrency,
      items: order.orderItems.map((item) => ({
        id: item.product || item._id || "unknown",
        quantity: Number(item.quantity) || 1,
        price: Number(item.price) || 0,
      })),
    });
  }

  // ------------- Facebook / Instagram Pixel -------------
 // ✅ Meta Pixel Purchase

 if (window.trackFBEvent) {
  window.trackFBEvent("Purchase", {
    value: Number(calculatedTotal) || 0,
    currency: metaCurrency,
    content_ids: order.orderItems.map(item => String(item.product || item._id)), // مهم
    contents: order.orderItems.map((item) => ({
      id: String(item.product || item._id),
      quantity: Number(item.quantity) || 1,
      item_price: Number(item.price) || 0,
    })),
    content_type: "product",
  });
}
}, [order, calculatedTotal]);





  if (loading) {
    return (
      <div
        dir={language === "ar" ? "rtl" : "ltr"}
        className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6"
      >
        <p className="text-gray-600 dark:text-gray-400 animate-pulse">
          {language === "ar"
            ? "جاري تحميل تفاصيل الطلب..."
            : "Loading order details..."}
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div
        dir={language === "ar" ? "rtl" : "ltr"}
        className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6"
      >
        <p className="text-red-600 dark:text-red-400 font-semibold">
          {language === "ar"
            ? "تعذر تحميل تفاصيل الطلب."
            : "Failed to load order details."}
        </p>
      </div>
    );
  }


  return (
    <div
      dir={language === "ar" ? "rtl" : "ltr"}
      className="min-h-screen flex flex-col mt-16 items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-10 transition-colors duration-300"
    >
      {/* العنوان الرئيسي */}
      <h1 className="text-2xl sm:text-3xl font-extrabold mb-6 mt-12 text-gray-900 dark:text-gray-100 text-center">
        {language === "ar" ? "🎉 شكراً لطلبك!" : "🎉 Thank you for your order!"}
      </h1>

      {/* تفاصيل الطلب */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 max-w-2xl w-full transition-colors duration-300">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          {language === "ar" ? "تفاصيل الطلب" : "Order Details"}
        </h2>
        {/* معلومات العميل */}
        <div className="mt-4 space-y-1 text-gray-700 dark:text-gray-300">
          <p>
            <strong>
              {language === "ar" ? "اسم العميل:" : "Customer Name:"}
            </strong>{" "}
            {order.guestInfo?.name || "—"}
          </p>
          <p>
            <strong>{language === "ar" ? "رقم الهاتف:" : "Phone:"}</strong>{" "}
            {order.guestInfo?.phone || "—"}
          </p>
        </div>

        <div className="space-y-2 text-gray-700 dark:text-gray-300">
          <p>
            <strong>ID:</strong> {order._id}
          </p>
          <p>
            <strong>{language === "ar" ? "الحالة:" : "Status:"}</strong>{" "}
            <span
              className={`px-2 py-1 rounded text-sm font-medium ${
                order.status === "Pending"
                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200"
                  : order.status === "Shipped"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200"
                  : "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200"
              }`}
            >
              {order.status}
            </span>
          </p>
          <p>
            <strong>
              {language === "ar" ? "طريقة الدفع:" : "Payment Method:"}
            </strong>{" "}
            <span className="font-medium text-purple-600 dark:text-purple-400">
              {order.paymentMethod || "—"}
            </span>
          </p>
        </div>

        {/* المنتجات */}
        <h3 className="text-lg font-semibold mt-6 mb-2 text-gray-900 dark:text-gray-100">
          {language === "ar" ? "المنتجات:" : "Items:"}
        </h3>
        <ul className="space-y-2 mb-4">
          {order.orderItems.map((item) => {
            const price = Number(item.price) || 0;
            const qty = Number(item.quantity) || 0;
            return (
              <li
                key={item._id}
                className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-lg"
              >
                <span>
                  {item.name} ({item.size}, {item.color}) × {qty}
                </span>
                <span className="font-semibold">{price * qty} EGP</span>
              </li>
            );
          })}
        </ul>

        {/* الشحن والخصومات */}
        <div className="space-y-1 text-gray-700 dark:text-gray-300">
          <p>
            <strong>{language === "ar" ? "المدينة:" : "City:"}</strong>{" "}
            {order.shippingAddress?.city ||
              (language === "ar" ? "غير محددة" : "Not specified")}
          </p>
          <p>
            <strong>{language === "ar" ? "الشحن:" : "Shipping:"}</strong>{" "}
            {shipping} EGP
          </p>
          {discount > 0 && (
            <p className="text-green-600 dark:text-green-400 font-semibold">
              <strong>{language === "ar" ? "الخصم:" : "Discount:"}</strong> -{" "}
              {discount} EGP
            </p>
          )}
        </div>

        {/* الإجماليات */}
        <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          <p className="text-gray-700 dark:text-gray-300">
            <strong>
              {language === "ar" ? "المجموع الفرعي:" : "Subtotal:"}
            </strong>{" "}
            {subtotal} EGP
          </p>
          <p className="text-gray-900 dark:text-gray-100 font-bold text-lg mt-2">
            <strong>
              {language === "ar" ? "الإجمالي النهائي:" : "Final Total:"}
            </strong>{" "}
            {calculatedTotal} EGP
          </p>

          {calculatedTotal !== order.totalPrice && (
            <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
              {language === "ar"
                ? `الإجمالي : ${order.totalPrice} EGP`
                : `Total : ${order.totalPrice} EGP`}
            </p>
          )}
        </div>
      </div>

      {/* خدمة العملاء */}
      <div className="mt-6 p-4 sm:p-6 bg-gray-100 dark:bg-gray-700 rounded-xl w-full max-w-2xl transition-colors duration-300">
        <p className="text-gray-800 dark:text-gray-200 font-semibold mb-2">
          {language === "ar"
            ? "يمكنك متابعة طلبك بالتواصل معنا عبر:"
            : "You can track your order by contacting us on:"}
        </p>
        <ul className="flex flex-col sm:flex-row gap-2 text-blue-600 dark:text-blue-400 font-medium">
          <li>
            <a
              href="https://wa.me/201157035111"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              WhatsApp 1
            </a>
          </li>
          <li>
            <a
              href="https://wa.me/201515162937"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              WhatsApp 2
            </a>
          </li>
        </ul>
      </div>

      {/* زر العودة */}
      <button
      aria-label=""
        onClick={() => navigate("/")}
        className="px-6 py-3 mt-8 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-300"
      >
        {language === "ar" ? "العودة للرئيسية" : "Go to Home"}
      </button>
    </div>
  );
};

export default ThankYou;
