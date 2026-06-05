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
      <Nav />
      <ReaderBar />
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
