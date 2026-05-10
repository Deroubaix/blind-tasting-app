import { Metadata } from "next";
import TastingPageHeader from "../../components/layout/TastingPageHeader";
import LeftSidebar from "../../components/tasting/LeftSideBar";
import ArchivesList from "../../components/archives/ArchivesList";

export const metadata: Metadata = {
  title: "Tasting Archives | Blind Tasting App",
};

export default function ArchivesPage() {
  return (
    <div className="tasting-phase-page">
      <TastingPageHeader />
      <div className="tasting-phase-body">
        <LeftSidebar />
        <main className="tasting-phase-main">
          <div className="archives-hero">
            <h1 className="archives-hero__title">Tasting Archives</h1>
            <p className="archives-hero__description">
              Your personal collection of deductive tastings. Review historical notes and master your sensory analysis.
            </p>
          </div>
          <ArchivesList />
        </main>
      </div>
    </div>
  );
}
