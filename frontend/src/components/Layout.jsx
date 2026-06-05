import { Outlet } from "react-router-dom";
import Nav from "./Nav";
import Footer from "./Footer";
import { ReaderBar, useReader } from "./ReaderSupport";

function PageContent() {
  const { styles } = useReader();

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{
        fontSize: styles.fontSize,
        lineHeight: styles.lineHeight,
        fontFamily: styles.fontFamily,
        backgroundColor: styles.backgroundColor,
      }}
    >
      {/* Sticky wrapper — both nav and reader bar stay pinned */}
      <div className="sticky top-0 z-50">
        <Nav />
        <ReaderBar />
      </div>
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function Layout() {
  return <PageContent />;
}
