import { colors } from "@/app/styles/colors";

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-grow" style={{ backgroundColor: colors.background.secondary }}>
      {children}
    </div>
  );
}