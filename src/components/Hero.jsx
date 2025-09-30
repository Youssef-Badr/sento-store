import { Swiper, SwiperSlide } from "swiper/react";
import React from "react"; // لازم علشان useMemo

import "swiper/css";
import "swiper/css/pagination";
import { Pagination, Autoplay } from "swiper/modules";
import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";

export default function BannerSlider() {
  const { language } = useLanguage();

  // ⚡ استخدم useMemo لتجنب إعادة إنشاء banners عند كل render
  const banners = React.useMemo(
    () => [
      { id: 1, custom: true },
      {
        id: 2,
        title: language === "ar" ? "⚡ التخفيضات الكبرى" : "⚡ Big Sale",
        subtitle:
          language === "ar"
            ? "اكتشف كل المنتجات المخفضة"
            : "Discover all discounted products",
        cta: language === "ar" ? "اكتشف العروض" : "Explore Offers",
        link: "/offers",
        bg: "bg-gradient-to-r from-pink-500 to-red-500",
      },
      {
        id: 3,
        title: language === "ar" ? "🏃‍♂️ مجموعة الرياضة" : "🏃‍♂️ Sport Collection",
        subtitle:
          language === "ar"
            ? "أحدث المنتجات للرياضيين"
            : "New arrivals for athletes",
        cta: language === "ar" ? "تسوق الرياضة" : "Shop Sports",
        link: "/category/sport",
        bg: "bg-gradient-to-r from-emerald-500 to-teal-600",
      },
    ],
    [language]
  );

  return (
    <div dir={language === "ar" ? "rtl" : "ltr"}>
      <Swiper
        key={language}
        modules={[Pagination, Autoplay]}
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000 }}
        loop={true}
        className="rounded-2xl shadow-xl w-full"
        dir={language === "ar" ? "rtl" : "ltr"}
      >
        {banners.map((banner) =>
          banner.custom ? (
            <SwiperSlide key={banner.id}>
              <div className="relative w-full h-72 sm:h-80 md:h-96 lg:h-96 rounded-2xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-90"></div>
                <div
                  className={`relative z-10 flex flex-col items-center justify-center text-center h-full px-4 ${
                    language === "ar" ? "text-right" : "text-left"
                  }`}
                >
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white drop-shadow-lg mb-4">
                    {language === "ar"
                      ? "وصلت تشكيلات الموسم الجديد"
                      : "New Season Arrivals"}
                  </h1>
                  <p className="text-lg sm:text-xl text-indigo-100 max-w-2xl mb-6">
                    {language === "ar"
                      ? "قم بتحديث خزانتك بأحدث صيحات الموضة بأسعار لا تقارن."
                      : "Upgrade your wardrobe with the latest trends in fashion at unbeatable prices."}
                  </p>
                  <div
                    className={`flex ${
                      language === "ar"
                        ? "flex-row-reverse space-x-reverse"
                        : "space-x-4"
                    } flex-wrap justify-center`}
                  >
                    <Link
                      to="/products"
                      aria-label={language === "ar" ? "تسوق الآن" : "Shop Now"}
                      className="bg-white text-gray-900 dark:bg-gray-800 dark:text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition transform hover:scale-105 mb-2 sm:mb-0"
                    >
                      {language === "ar" ? "تسوق الآن" : "Shop Now"}
                    </Link>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ) : (
            <SwiperSlide key={banner.id}>
              <div
                className={`${banner.bg} h-72 sm:h-80 md:h-96 lg:h-96 flex flex-col items-center justify-center text-center text-white px-4 rounded-2xl shadow-xl`}
              >
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-2">
                  {banner.title}
                </h2>
                <p className="text-lg sm:text-xl mb-4">{banner.subtitle}</p>
                <Link
                  to={banner.link}
                  aria-label={banner.cta}
                  className="bg-white text-gray-900 dark:bg-gray-800 dark:text-white px-6 py-2 rounded-full font-semibold shadow hover:bg-gray-100 dark:hover:bg-gray-700 transition transform hover:scale-105"
                >
                  {banner.cta}
                </Link>
              </div>
            </SwiperSlide>
          )
        )}
      </Swiper>
    </div>
  );
}
