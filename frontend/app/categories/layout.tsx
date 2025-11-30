import Navigation from "@/app/components/Navigation";
import Footer from "@/app/components/Footer";
import { colors } from "@/app/styles/colors";

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: colors.background.secondary }}>
      <Navigation />
      <main className="{flex-grow}">
          {children}
      </main>
      <Footer />
    </div>
  );
}
