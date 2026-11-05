import SignupForm from '../../components/user/SignupForm';
import { pageTitle } from '../../i18n/server';
import { userText } from '../../i18n/user';

export const generateMetadata = pageTitle({ en: userText.en.pages.signUp, pt: userText.pt.pages.signUp });

export default function SignupPage() {
	return <SignupForm />;
}
