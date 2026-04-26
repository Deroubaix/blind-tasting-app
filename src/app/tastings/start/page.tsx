import React from "react";
import TastingStartClient from "../../../components/tasting/TastingStartClient";
import TastingPageHeader from "../../../components/layout/TastingPageHeader";

export default function TastingStartPage() {
  return (
    <div className="tasting-start-page">
      <TastingPageHeader />
      <TastingStartClient />
    </div>
  );
}
