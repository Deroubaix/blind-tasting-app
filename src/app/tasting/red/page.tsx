import React from "react";
import { Metadata } from "next";
import RedWineTasting from "../../../components/tasting/RedWineTasting";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blind Tasting | Red Wine Tasting",
};

export default async function RedWinePage() {
  return (
    <>
      <div className="">
        <section className="">
          <RedWineTasting />
        </section>
      </div>
    </>
  );
}
