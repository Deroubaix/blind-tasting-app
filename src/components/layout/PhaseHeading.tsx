import React, { ReactNode } from "react";

type PhaseHeadingProps = {
  phase: string;
  title: string;
  description: ReactNode;
};

export default function PhaseHeading({ phase, title, description }: PhaseHeadingProps) {
  return (
    <>
      <div className="phase-label">{phase}</div>
      <h1 className="phase-heading">{title}</h1>
      <p className="phase-description">{description}</p>
    </>
  );
}
