import { Metadata } from "next";
import Header from "../../components/layout/Header";
import ArchivesList from "../../components/archives/ArchivesList";
import Link from "next/link";

export const metadata: Metadata = {
  title: "My Tastings | Blind Tasting App",
};

export default function ArchivesPage() {
  return (
    <>
      <Header />
      <main className="archives-page light-bg">
        <div className="archives-header">
          <h1>My Tasting Archives</h1>
          <Link href="/tastings/start" className="button rounded solid">
            + New Tasting
          </Link>
        </div>
        <ArchivesList />
      </main>
    </>
  );
}
