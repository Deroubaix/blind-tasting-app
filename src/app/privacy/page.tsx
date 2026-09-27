import { type Metadata } from 'next';
import Link from 'next/link';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

export const metadata: Metadata = {
	title: 'Privacy',
	description: 'What The Sommelier’s Ledger stores about you, why, and how to have it deleted.',
};

const CONTROLLER = 'Marisha Deroubaix';
// TODO: set the privacy address before launch.
const CONTACT: string | null = null;
const UPDATED = '27 September 2026';

function Contact() {
	return CONTACT ? <a href={`mailto:${CONTACT}`}>{CONTACT}</a> : <em>the privacy address (to be added)</em>;
}

export default function PrivacyPage() {
	return (
		<>
			<Header />
			<main className="legal-page">
				<header className="legal-page__head">
					<span className="page-eyebrow">Privacy notice</span>
					<h1>Your data</h1>
					<p className="legal-page__updated">Last updated {UPDATED}</p>
				</header>

				<section>
					<h2>Who is responsible</h2>
					<p>
						The Sommelier&apos;s Ledger is run by {CONTROLLER}, in Portugal, who is responsible for your
						data under the EU General Data Protection Regulation (GDPR). For anything about your data, write
						to <Contact />.
					</p>
				</section>

				<section>
					<h2>What is stored</h2>
					<p>You can practice without an account; nothing is stored until you sign up and save.</p>
					<ul>
						<li>
							<strong>Your account:</strong> your name, email address and password. The password is stored
							only as a salted hash, never as you typed it.
						</li>
						<li>
							<strong>Your tastings:</strong> your answers, notes, the label you give each tasting, the
							reveal and its score, and when you saved it.
						</li>
						<li>
							<strong>Flights:</strong> anyone with a flight&apos;s code sees its name and the names of
							the host and tasters. Those in it also see when you are tasting and, once a wine is
							revealed, your answers and score for it.
						</li>
						<li>
							<strong>Label photos</strong> you choose to add. They are private: only you can open them.
						</li>
						<li>
							<strong>Password resets:</strong> a one-time code, stored hashed, that expires after an
							hour.
						</li>
						<li>
							<strong>Security counters:</strong> to stop password and flight-code guessing, failed
							attempts are counted against a hashed form of the email address, network address or account.
							They are cleared within a day.
						</li>
					</ul>
					<p>
						There is no advertising, no analytics and no tracking, and your data is never sold or shared for
						marketing.
					</p>
				</section>

				<section>
					<h2>Why, and on what basis</h2>
					<p>
						Your account and tastings are kept to provide the service you signed up for (GDPR Art. 6(1)(b)).
						The security counters and error logs are kept to keep the service safe and working, a legitimate
						interest (Art. 6(1)(f)).
					</p>
				</section>

				<section>
					<h2>Cookies and your browser</h2>
					<p>
						One cookie keeps you signed in. It is strictly necessary, lasts an hour and is removed when you
						log out, so no consent banner is needed. The app also remembers a few settings, such as your
						last timer choice, in your own browser; they never leave your device.
					</p>
				</section>

				<section>
					<h2>Who else handles it</h2>
					<p>Only the services the app needs to run, each bound by a data processing agreement:</p>
					<ul>
						<li>
							the hosting provider and database host that run the app and store your account and tastings;
						</li>
						<li>Cloudflare (R2), where label photos are stored;</li>
						<li>Resend, which sends password-reset emails.</li>
					</ul>
					<p>
						Some of these may process data outside the EU. Where they do, the transfer is covered by the EU
						Standard Contractual Clauses or the EU–US Data Privacy Framework.
					</p>
				</section>

				<section>
					<h2>How long it is kept</h2>
					<p>
						Your account, tastings and photos are kept until you delete them. Deleting a tasting deletes its
						photo; deleting your account deletes everything, straight away, including any flight you host
						(the tasters keep their own tastings from it).
					</p>
				</section>

				<section>
					<h2>Your rights</h2>
					<p>You can ask to see, correct, export or delete your data, or object to how it is used.</p>
					<ul>
						<li>
							<strong>Delete everything yourself</strong> from your <Link href="/account">Account</Link>{' '}
							page.
						</li>
						<li>
							For anything else, email <Contact />; you will get an answer within a month.
						</li>
						<li>
							You can also complain to Portugal&apos;s data protection authority, the{' '}
							<a href="https://www.cnpd.pt" target="_blank" rel="noopener noreferrer">
								CNPD
							</a>
							.
						</li>
					</ul>
				</section>

				<section>
					<h2>Age</h2>
					<p>The app is about wine and is meant for adults of legal drinking age (18 in Portugal).</p>
				</section>

				<section>
					<h2>Changes</h2>
					<p>If this notice changes, the date at the top changes with it.</p>
				</section>
			</main>
			<Footer />
		</>
	);
}
