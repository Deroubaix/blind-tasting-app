import { Metadata } from "next";
import InitialConclusionTastingClient from "../../../components/tasting/InitialConclusionTastingClient";

export const metadata: Metadata = {
  title: "Initial Conclusion | Wine Tasting",
};

export default async function InitialConclusionPage({
  searchParams,
}: {
  searchParams: Promise<{ wineType?: string }>;
}) {
  const { wineType: wineTypeParam } = await searchParams;
  const wineType = (wineTypeParam as "red" | "white") || "red";
  return <InitialConclusionTastingClient wineType={wineType} />;
}
