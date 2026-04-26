import React from "react";
import UserProfile from "../../components/user/UserProfile";

export default function AccountPage() {
  return (
    <div className="AccountPage">
      <header className="AccountPage-header">
        <h1>My Account</h1>
        <p>Manage your tastings and view your saved results here.</p>
      </header>

      <section className="AccountPage-content">
        <UserProfile />
      </section>
    </div>
  );
}
