import ForgotPasswordForm from '../../components/user/ForgotPasswordForm';
import { pageTitle } from '../../i18n/server';
import { userText } from '../../i18n/user';

export const generateMetadata = pageTitle({
	en: userText.en.pages.forgotPassword,
	pt: userText.pt.pages.forgotPassword,
});

export default function ForgotPasswordPage() {
	return <ForgotPasswordForm />;
}
