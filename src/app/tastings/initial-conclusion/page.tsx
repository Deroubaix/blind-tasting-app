import { Metadata } from "next";
import InitialConclusionTastingClient from "../../../components/tasting/InitialConclusionTastingClient";

export const metadata: Metadata = {
  title: "Initial Conclusion | Wine Tasting",
};

export default function InitialConclusionPage({
  searchParams,
}: {
  searchParams: { wineType?: string };
}) {
  const wineType = (searchParams.wineType as "red" | "white") || "red";
  return <InitialConclusionTastingClient wineType={wineType} />;
}
