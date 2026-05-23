import LoginForm from "../../components/user/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log in — The Sommelier's Ledger",
};

export default function LoginPage() {
  return <LoginForm />;
}
