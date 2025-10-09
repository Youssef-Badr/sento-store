import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import { FaFacebookF, FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa";
import { FiShoppingBag, FiGift, FiStar } from "react-icons/fi"; // أيقونات للروابط السريعة
import { useEffect, useState } from "react";

export default function Footer() {
  const { language } = useLanguage();
  const { darkMode } = useTheme();
  const isRTL = language === "ar";

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + window.innerHeight;
      if (scrollPos > document.body.offsetHeight - 200) setVisible(true);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const socialLinks = {
    facebook: "https://www.facebook.com/share/16XPrNjwBV/?mibextid=wwXIfr",
    instagram: "https://www.instagram.com/sento_store__?igsh=MmFyOHZiaGloZGR2",
    tiktok: "https://www.tiktok.com/@sento.store?_t=ZS-904ty1uTUIr&_r=1",
  };

  const t = {
    about: isRTL ? "حول" : "About",
    description: isRTL
      ? "Sento Store هو متجر إلكتروني يقدم أحدث صيحات الملابس لجميع الفئات."
      : "Sento Store is an online shop offering the latest fashion for all categories.",
    contact: isRTL ? "تواصل معنا" : "Contact",
    contactText: isRTL
      ? "يمكنك التواصل معنا عبر وسائل التواصل الاجتماعي التالية."
      : "You can contact us through the following social media platforms.",
    links: isRTL ? "روابط سريعة" : "Quick Links",
    rights: isRTL
      ? "جميع الحقوق محفوظة © 2025 سنتو ستور"
      : "All rights reserved © 2025 Sento Store",
  };

  const bgGradient = darkMode
    ? "bg-gradient-to-tr from-gray-900 via-gray-800 to-gray-950"
    : "bg-gradient-to-tr from-blue-50 via-pink-50 to-yellow-50";

  const textColor = darkMode ? "text-gray-200" : "text-gray-900";
  const linkHover = darkMode ? "hover:text-blue-400" : "hover:text-blue-600";
  const borderColor = darkMode ? "border-gray-800" : "border-gray-300";

  const quickLinks = [
    {
      name: isRTL ? "المنتجات" : "Products",
      href: "/products",
      icon: <FiShoppingBag size={18} />,
    },
    {
      name: isRTL ? "العروض" : "On Sale",
      href: "/offers",
      icon: <FiGift size={18} />,
    },
    {
      name: isRTL ? "الأكثر مبيعًا" : "Best Seller",
      href: "/wishlist",
      icon: <FiStar size={18} />,
    },
  ];

  return (
    <footer
      dir={isRTL ? "rtl" : "ltr"}
      className={`${bgGradient} ${textColor} w-full transition-colors duration-500 ease-in-out transform ${
        visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      }`}
    >
      <div className="container mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* About Section */}
        <div className="flex flex-col">
          <h3 className="text-2xl font-bold mb-3">{t.about}</h3>
          <p
            className={`text-sm md:text-base ${
              isRTL ? "text-right" : ""
            } opacity-90 transition-colors duration-500`}
          >
            {t.description}
          </p>
        </div>

        {/* Quick Links with Icons */}
        <div className="flex flex-col">
          <h3 className="text-2xl font-bold mb-3">{t.links}</h3>
          <ul className={`flex flex-col gap-3 ${isRTL ? "text-right" : ""}`}>
            {quickLinks.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  aria-label={link.name}
                  className={`flex items-center gap-2 transition-colors duration-300 ${linkHover} hover:animate-pulse`}
                >
                  <span className="text-purple-600 dark:text-purple-400">
                    {link.icon}
                  </span>
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact / Social Links */}
        <div className="flex flex-col">
          <h3 className="text-2xl font-bold mb-3">{t.contact}</h3>
          <p
            className={`text-sm md:text-base mb-4 ${
              isRTL ? "text-right" : ""
            } opacity-90 transition-colors duration-500`}
          >
            {t.contactText}
          </p>
          <div className={`flex gap-5 ${isRTL ? "justify-end" : ""}`}>
            {/* Facebook */}
            <a
              href={socialLinks.facebook}
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="p-2 rounded-full bg-blue-600 text-white shadow hover:bg-blue-700 transform hover:scale-110 hover:animate-pulse transition-all duration-300"
            >
              <FaFacebookF size={24} />
            </a>

            {/* Instagram */}
            <a
              href={socialLinks.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="p-2 rounded-full bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-400 text-white shadow hover:scale-110 hover:animate-pulse transform transition-all duration-300"
            >
              <FaInstagram size={24} />
            </a>

            {/* TikTok */}
            <a
              href={socialLinks.tiktok}
              target="_blank"
              rel="noreferrer"
              aria-label="TikTok"
              className="p-2 rounded-full bg-black text-white shadow hover:scale-110 hover:animate-pulse transform transition-all duration-300"
            >
              <FaTiktok size={24} />
            </a>

            {/* WhatsApp Dropdown */}
            <div className="relative group">
              <button
                aria-label="WhatsApp"
                className="p-2 rounded-full bg-green-500 text-white shadow hover:bg-green-600 transform hover:scale-110 hover:animate-pulse transition-all duration-300"
              >
                <FaWhatsapp size={24} />
              </button>
              <div className="absolute bottom-12 left-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col gap-2 min-w-[160px]">
                <a
                  href="https://wa.me/201157035111"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 text-sm rounded-md hover:bg-green-100 dark:hover:bg-green-600 transition-colors"
                >
                  WhatsApp No.1
                </a>
                <a
                  href="https://wa.me/201515162937"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 text-sm rounded-md hover:bg-green-100 dark:hover:bg-green-600 transition-colors"
                >
                  WhatsApp No.2
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div
        className={`mt-10 border-t ${borderColor} pt-4 text-center text-sm opacity-90 transition-colors duration-500`}
      >
        {t.rights}
      </div>
    </footer>
  );
}
