import Navbar from "./Navbar";
import Footer from "./Footer";
import AnnouncementBar from "./AnnouncementBar";

export default function Layout({ children }) {
  return (
    <>
      <AnnouncementBar />

      <Navbar />
      <main className="min-h-[80vh]">{children}</main>
      <Footer />
    </>
  );
}
