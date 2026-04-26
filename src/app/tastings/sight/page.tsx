import { Metadata } from "next";
import SightTastingClient from "../../../components/sight/SightTastingClient";

export const metadata: Metadata = {
  title: "Sight | Wine Tasting",
};

export default function SightPage({
  searchParams,
}: {
  searchParams: { wineType?: string };
}) {
  const wineType = (searchParams.wineType as "red" | "white") || "red";

  return <SightTastingClient wineType={wineType} />;
}
