import { Metadata } from "next";
import FinalConclusionTastingClient from "../../../components/tasting/FinalConclusionTastingClient";

export const metadata: Metadata = {
  title: "Final Conclusion | Wine Tasting",
};

export default async function FinalConclusionPage({
  searchParams,
}: {
  searchParams: Promise<{ wineType?: string }>;
}) {
  const { wineType: wineTypeParam } = await searchParams;
  const wineType = (wineTypeParam as "red" | "white") || "red";
  return <FinalConclusionTastingClient wineType={wineType} />;
}
