import LoginForm from '../../components/user/LoginForm';
import { pageTitle } from '../../i18n/server';
import { userText } from '../../i18n/user';

export const generateMetadata = pageTitle({ en: userText.en.pages.logIn, pt: userText.pt.pages.logIn });

export default function LoginPage() {
	return <LoginForm />;
}
