import SiteFooter from "../components/SiteFooter";
import SiteHeader, { container } from "../components/SiteHeader";

export default function PoliciesLayout({ children }) {
  return (
    <>
      <SiteHeader />
      <main className={`${container} flex-1 pb-16 pt-6 sm:pt-10`}>{children}</main>
      <SiteFooter />
    </>
  );
}
