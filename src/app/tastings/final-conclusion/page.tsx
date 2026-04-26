import { Metadata } from "next";
import FinalConclusionTastingClient from "../../../components/tasting/FinalConclusionTastingClient";

export const metadata: Metadata = {
  title: "Final Conclusion | Wine Tasting",
};

export default function FinalConclusionPage({
  searchParams,
}: {
  searchParams: { wineType?: string };
}) {
  const wineType = (searchParams.wineType as "red" | "white") || "red";
  return <FinalConclusionTastingClient wineType={wineType} />;
}
