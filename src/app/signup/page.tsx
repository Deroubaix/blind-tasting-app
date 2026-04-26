import SignupForm from "../../components/user/SignupForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up — The Sommelier's Ledger",
};

export default function SignupPage() {
  return <SignupForm />;
}
