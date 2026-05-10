import { Metadata } from "next";
import NoseTastingClient from "../../../components/nose/NoseTastingClient";

export const metadata: Metadata = {
  title: "Nose | Wine Tasting",
};

export default async function NosePage({
  searchParams,
}: {
  searchParams: Promise<{ wineType?: string }>;
}) {
  const { wineType: wineTypeParam } = await searchParams;
  const wineType = (wineTypeParam as "red" | "white") || "red";
  return <NoseTastingClient wineType={wineType} />;
}
