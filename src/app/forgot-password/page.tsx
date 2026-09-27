import ForgotPasswordForm from '../../components/user/ForgotPasswordForm';
import { type Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Forgot Password',
};

export default function ForgotPasswordPage() {
	return <ForgotPasswordForm />;
}
