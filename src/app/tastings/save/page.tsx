import { Metadata } from "next";
import SavedTasting from "../../../components/tasting/SavedTastings";

export const metadata: Metadata = {
  title: "Review & Save | Wine Tasting",
};

export default function SavedTastingPage({
  searchParams,
}: {
  searchParams: { wineType?: string };
}) {
  const wineType = (searchParams.wineType as "red" | "white") || "red";
  return <SavedTasting wineType={wineType} />;
}
