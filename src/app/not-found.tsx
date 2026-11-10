import { type Metadata } from 'next';
import Link from 'next/link';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { getLang } from '../i18n/server';
import { layoutText } from '../i18n/layout';

export async function generateMetadata(): Promise<Metadata> {
	return { title: layoutText[await getLang()].notFound.title };
}

export default async function NotFound() {
	const t = layoutText[await getLang()].notFound;
	return (
		<>
			<Header />
			<main className="not-found">
				<span className="page-eyebrow">404</span>
				<h1>{t.heading}</h1>
				<p>{t.body}</p>
				<div className="not-found__links">
					<Link href="/" className="btn-primary">
						{t.home}
					</Link>
					<Link href="/archives" className="btn-quiet">
						{t.archive}
					</Link>
				</div>
			</main>
			<Footer />
		</>
	);
}
