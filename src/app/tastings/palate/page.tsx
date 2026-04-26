import { Metadata } from "next";
import PalateTastingClient from "../../../components/palate/PalateTastingClient";

export const metadata: Metadata = {
  title: "Palate | Wine Tasting",
};

export default function PalatePage({
  searchParams,
}: {
  searchParams: { wineType?: string };
}) {
  const wineType = (searchParams.wineType as "red" | "white") || "red";
  return <PalateTastingClient wineType={wineType} />;
}
