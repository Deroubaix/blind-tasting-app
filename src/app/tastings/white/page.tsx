import React from "react";
import { Metadata } from "next";
import WhiteWineTasting from "../../../components/tasting/WhiteWineTasting";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blind Tasting | White Wine Tasting",
};

export default async function WhiteWinePage() {
  return (
    <>
      <div className="">
        <section className="">
          <WhiteWineTasting />
        </section>
      </div>
    </>
  );
}
