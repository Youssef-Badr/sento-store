// src/components/AnnouncementBar.jsx
import { useEffect, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";
import api from "../../src/api/axiosInstance";

export default function AnnouncementBar() {
  const { language } = useLanguage();
  const [announcements, setAnnouncements] = useState([]);
  const isRTL = language === "ar";

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await api.get("/announcement");
        const data = res.data;

        let normalized = [];
        if (Array.isArray(data)) {
          normalized = data.filter((a) => a.active);
        } else if (data && data.active) {
          normalized = [data];
        }

        setAnnouncements(normalized);
      } catch (err) {
        console.error("Failed to fetch announcements", err);
      }
    };
    fetchAnnouncements();
  }, []);

  if (announcements.length === 0) return null;

  // ✅ نكرر أكتر في الإنجليزي وأقل في العربي
  const repeatCount = isRTL ? 100 : 800;
  const marqueeItems = Array(repeatCount).fill(announcements).flat();

  return (
    <div className="fixed top-0 left-0 w-full bg-purple-600 dark:bg-purple-800 text-white py-2 z-[60] overflow-hidden">
      <motion.div
        className="flex whitespace-nowrap"
        initial={{ x: isRTL ? "100%" : "-100%" }}
        animate={{ x: isRTL ? "-100%" : "100%" }}
        transition={{
          duration: isRTL ? 20 : 40, // 👈 العربي أسرع
          ease: "linear",
          repeat: Infinity,
        }}
      >
        {marqueeItems.map((a, index) => (
          <span
            key={`${a._id || index}-${index}`}
            className="mx-4 font-bold px-4 py-1 rounded"
          >
            {a.text}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
