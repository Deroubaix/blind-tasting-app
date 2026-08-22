import ForgotPasswordForm from '../../components/user/ForgotPasswordForm';
import { type Metadata } from 'next';

export const metadata: Metadata = {
	title: "Forgot Password — The Sommelier's Ledger",
};

export default function ForgotPasswordPage() {
	return <ForgotPasswordForm />;
}
