import LoginForm from "../../components/user/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login — The Sommelier's Ledger",
};

export default function LoginPage() {
  return <LoginForm />;
}
