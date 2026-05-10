import { Metadata } from "next";
import SavedTasting from "../../../components/tasting/SavedTastings";

export const metadata: Metadata = {
  title: "Review & Save | Wine Tasting",
};

export default async function SavedTastingPage({
  searchParams,
}: {
  searchParams: Promise<{ wineType?: string }>;
}) {
  const { wineType: wineTypeParam } = await searchParams;
  const wineType = (wineTypeParam as "red" | "white") || "red";
  return <SavedTasting wineType={wineType} />;
}
