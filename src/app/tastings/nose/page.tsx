import { Metadata } from "next";
import NoseTastingClient from "../../../components/nose/NoseTastingClient";

export const metadata: Metadata = {
  title: "Nose | Wine Tasting",
};

export default function NosePage({
  searchParams,
}: {
  searchParams: { wineType?: string };
}) {
  const wineType = (searchParams.wineType as "red" | "white") || "red";
  return <NoseTastingClient wineType={wineType} />;
}
