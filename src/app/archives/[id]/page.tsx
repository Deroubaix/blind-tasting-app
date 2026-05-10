import { Metadata } from "next";
import TastingPageHeader from "../../../components/layout/TastingPageHeader";
import LeftSidebar from "../../../components/tasting/LeftSideBar";
import TastingDetail from "../../../components/archives/TastingDetail";

export const metadata: Metadata = {
  title: "Tasting Detail | Blind Tasting App",
};

export default async function TastingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="tasting-phase-page">
      <TastingPageHeader />
      <div className="tasting-phase-body">
        <LeftSidebar />
        <main className="tasting-phase-main">
          <TastingDetail id={id} />
        </main>
      </div>
    </div>
  );
}
