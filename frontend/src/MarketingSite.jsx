import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ReaderProvider } from "./components/ReaderSupport";
import Layout from "./components/Layout";
import PortalApp from "./portal/PortalApp";
import Home from "./pages/Home";
import HowItWorks from "./pages/HowItWorks";
import ForOrganisations from "./pages/ForOrganisations";
import Security from "./pages/Security";
import RequestPilot from "./pages/RequestPilot";
import About from "./pages/About";
import Accessibility from "./pages/Accessibility";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";

/* Scroll to top on navigation */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function MarketingSite() {
  return (
    <ReaderProvider>
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="how-it-works" element={<HowItWorks />} />
          <Route path="for-organisations" element={<ForOrganisations />} />
          <Route path="security" element={<Security />} />
          <Route path="request-pilot" element={<RequestPilot />} />
          <Route path="about" element={<About />} />
          <Route path="accessibility" element={<Accessibility />} />
          <Route path="contact" element={<Contact />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="terms" element={<Terms />} />
        </Route>
          <Route path="portal/*" element={<PortalApp />} />
      </Routes>
    </BrowserRouter>
    </ReaderProvider>
  );
}
