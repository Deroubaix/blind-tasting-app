import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tasting Saved | Blind Tasting App",
};

export default function ThankyouPage() {
  return (
    <div className="tasting-page dark-bg">
      <div className="thankyou-container light-bg">
        <div className="thankyou-content">
          <div className="thankyou-icon">🍷</div>
          <h1>Tasting Saved!</h1>
          <p>Your blind tasting has been saved to your archives.</p>
          <div className="navigation-buttons">
            <Link href="/tastings/start" className="button rounded solid">
              Start New Tasting
            </Link>
            <Link href="/archives" className="button rounded quiet">
              View Archives
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
