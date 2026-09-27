import SignupForm from '../../components/user/SignupForm';
import { type Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Sign up',
};

export default function SignupPage() {
	return <SignupForm />;
}
