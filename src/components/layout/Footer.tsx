import React from "react";

import Link from "next/link";

export default function Footer() {
  return (
    <section id="footer-container" style={{ blockSize: "auto" }}>
      <footer className="dark-bg">
        <Link href="/" className="ndc-logo">
          <p>Blind Tasting</p>
        </Link>

        <p>© 2024 Blind Tasting App. All Rights Reserved.</p>
      </footer>
    </section>
  );
}
