import { type Metadata } from 'next';
import { getLang } from '../../i18n/server';
import Link from 'next/link';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

export async function generateMetadata(): Promise<Metadata> {
	return (await getLang()) === 'pt'
		? {
				title: 'Privacidade',
				description: 'O que o The Sommelier’s Ledger guarda sobre si, porquê, e como pedir que seja eliminado.',
			}
		: {
				title: 'Privacy',
				description: 'What The Sommelier’s Ledger stores about you, why, and how to have it deleted.',
			};
}

const CONTROLLER = 'Marisha Deroubaix';
// TODO: placeholder on the reserved example.com domain; replace with the real privacy inbox before launch.
const CONTACT: string | null = 'privacy@example.com';
const UPDATED = { en: '10 November 2026', pt: '10 de novembro de 2026' };

function Contact({ pt = false }: { pt?: boolean }) {
	if (CONTACT) {
		return <a href={`mailto:${CONTACT}`}>{CONTACT}</a>;
	}
	return <em>{pt ? 'o endereço de privacidade (a acrescentar)' : 'the privacy address (to be added)'}</em>;
}

function PrivacyEn() {
	return (
		<main className="legal-page">
			<header className="legal-page__head">
				<span className="page-eyebrow">Privacy notice</span>
				<h1>Your data</h1>
				<p className="legal-page__updated">Last updated {UPDATED.en}</p>
			</header>

			<section>
				<h2>Who is responsible</h2>
				<p>
					The Sommelier&apos;s Ledger is run by {CONTROLLER}, in Portugal, who is responsible for your data
					under the EU General Data Protection Regulation (GDPR). For anything about your data, write to{' '}
					<Contact />.
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
						<strong>Your tastings:</strong> your answers, notes, the label you give each tasting, the reveal
						and its score, and when you saved it.
					</li>
					<li>
						<strong>Flights:</strong> anyone with a flight&apos;s code sees its name and the names of the
						host and tasters. Those in it also see when you are tasting and, once a wine is revealed, your
						answers and score for it.
					</li>
					<li>
						<strong>Label photos</strong> you choose to add. They are private: only you can open them.
					</li>
					<li>
						<strong>Password resets:</strong> a one-time code, stored hashed, that expires after an hour.
					</li>
					<li>
						<strong>Security counters:</strong> to stop password and flight-code guessing, failed attempts
						are counted against a hashed form of the email address, network address or account. They are
						cleared within a day.
					</li>
					<li>
						<strong>Sign-ins:</strong> each browser you are signed in on, with when it started and ends, so
						logging out or resetting your password can sign it out. Removed when you log out, or soon after
						it ends.
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
					Your account and tastings are kept to provide the service you signed up for (GDPR Art. 6(1)(b)). The
					security counters and error logs are kept to keep the service safe and working, a legitimate
					interest (Art. 6(1)(f)).
				</p>
			</section>

			<section>
				<h2>Cookies and your browser</h2>
				<p>
					One cookie keeps you signed in. It is strictly necessary, lasts 30 days from when you last used the
					app and is removed when you log out. A second one remembers the language you chose. So no consent
					banner is needed. The app also remembers a few settings, such as your last timer choice, in your own
					browser; they never leave your device.
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
					photo; deleting your account deletes everything, straight away. A flight you host stays for its
					tasters, ended and without your name.
				</p>
			</section>

			<section>
				<h2>Your rights</h2>
				<p>You can ask to see, correct, export or delete your data, or object to how it is used.</p>
				<ul>
					<li>
						<strong>Download everything yourself</strong> from your <Link href="/account">Account</Link>{' '}
						page, as a ZIP of JSON files and your label photos.
					</li>
					<li>
						<strong>Delete everything yourself</strong> from your <Link href="/account">Account</Link> page.
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
	);
}

// Draft for native-speaker review, like the rest of the Portuguese interface.
function PrivacyPt() {
	return (
		<main className="legal-page">
			<header className="legal-page__head">
				<span className="page-eyebrow">Aviso de privacidade</span>
				<h1>Os seus dados</h1>
				<p className="legal-page__updated">Última atualização: {UPDATED.pt}</p>
			</header>

			<section>
				<h2>Quem é o responsável</h2>
				<p>
					O The Sommelier&apos;s Ledger é gerido por {CONTROLLER}, em Portugal, que é responsável pelos seus
					dados nos termos do Regulamento Geral sobre a Proteção de Dados (RGPD) da UE. Para qualquer questão
					sobre os seus dados, escreva para <Contact pt />.
				</p>
			</section>

			<section>
				<h2>O que é guardado</h2>
				<p>Pode praticar sem conta; nada é guardado até criar uma conta e guardar uma prova.</p>
				<ul>
					<li>
						<strong>A sua conta:</strong> o seu nome, endereço de email e palavra-passe. A palavra-passe é
						guardada apenas como um hash com sal, nunca tal como a escreveu.
					</li>
					<li>
						<strong>As suas provas:</strong> as suas respostas, notas, o nome que dá a cada prova, a
						revelação e a respetiva pontuação, e quando a guardou.
					</li>
					<li>
						<strong>Flights:</strong> quem tiver o código de um flight vê o seu nome e os nomes do anfitrião
						e dos provadores. Quem está no flight vê também quando está a provar e, depois de um vinho ser
						revelado, as suas respostas e pontuação para esse vinho.
					</li>
					<li>
						<strong>Fotografias de rótulos</strong> que decida acrescentar. São privadas: só o próprio as
						pode abrir.
					</li>
					<li>
						<strong>Reposição da palavra-passe:</strong> um código de utilização única, guardado como hash,
						que expira ao fim de uma hora.
					</li>
					<li>
						<strong>Contadores de segurança:</strong> para impedir tentativas de adivinhar palavras-passe e
						códigos de flight, as tentativas falhadas são contadas com base numa forma em hash do endereço
						de email, do endereço de rede ou da conta. São apagados no prazo de um dia.
					</li>
					<li>
						<strong>Sessões:</strong> cada navegador em que tem sessão iniciada, com o início e o fim, para
						que terminar a sessão ou redefinir a palavra-passe a possa encerrar. Apagadas quando termina a
						sessão, ou pouco depois de expirarem.
					</li>
				</ul>
				<p>
					Não há publicidade, análise de tráfego nem rastreamento, e os seus dados nunca são vendidos nem
					partilhados para fins de marketing.
				</p>
			</section>

			<section>
				<h2>Porquê, e com que fundamento</h2>
				<p>
					A sua conta e as suas provas são guardadas para prestar o serviço em que se inscreveu (art.º 6.º,
					n.º 1, alínea b), do RGPD). Os contadores de segurança e os registos de erros são guardados para
					manter o serviço seguro e a funcionar, um interesse legítimo (art.º 6.º, n.º 1, alínea f)).
				</p>
			</section>

			<section>
				<h2>Cookies e o seu navegador</h2>
				<p>
					Um cookie mantém a sua sessão iniciada. É estritamente necessário, dura 30 dias desde a última vez
					que usou a aplicação e é removido quando termina a sessão. Um segundo cookie lembra o idioma que
					escolheu. Por isso não é necessário um aviso de consentimento. A aplicação também guarda algumas
					definições, como a última escolha de cronómetro, no seu próprio navegador; nunca saem do seu
					dispositivo.
				</p>
			</section>

			<section>
				<h2>Quem mais os trata</h2>
				<p>
					Apenas os serviços de que a aplicação precisa para funcionar, cada um vinculado por um acordo de
					tratamento de dados:
				</p>
				<ul>
					<li>
						o fornecedor de alojamento e o fornecedor da base de dados, que executam a aplicação e guardam a
						sua conta e as suas provas;
					</li>
					<li>a Cloudflare (R2), onde são guardadas as fotografias de rótulos;</li>
					<li>a Resend, que envia os emails de reposição da palavra-passe.</li>
				</ul>
				<p>
					Alguns destes serviços podem tratar dados fora da UE. Quando o fazem, a transferência está abrangida
					pelas Cláusulas Contratuais-Tipo da UE ou pelo Quadro de Privacidade de Dados UE-EUA.
				</p>
			</section>

			<section>
				<h2>Durante quanto tempo são guardados</h2>
				<p>
					A sua conta, provas e fotografias são guardadas até as eliminar. Eliminar uma prova elimina a
					respetiva fotografia; eliminar a conta elimina tudo, de imediato. Um flight que organize fica para
					os provadores, terminado e sem o seu nome.
				</p>
			</section>

			<section>
				<h2>Os seus direitos</h2>
				<p>
					Pode pedir para ver, corrigir, exportar ou eliminar os seus dados, ou opor-se à forma como são
					usados.
				</p>
				<ul>
					<li>
						<strong>Transfira tudo por si</strong> a partir da página <Link href="/account">Conta</Link>,
						num ZIP com ficheiros JSON e as suas fotografias de rótulos.
					</li>
					<li>
						<strong>Elimine tudo por si</strong> a partir da página <Link href="/account">Conta</Link>.
					</li>
					<li>
						Para qualquer outro pedido, escreva para <Contact pt />; terá resposta no prazo de um mês.
					</li>
					<li>
						Pode também apresentar queixa à autoridade portuguesa de proteção de dados, a{' '}
						<a href="https://www.cnpd.pt" target="_blank" rel="noopener noreferrer">
							CNPD
						</a>
						.
					</li>
				</ul>
			</section>

			<section>
				<h2>Idade</h2>
				<p>
					A aplicação é sobre vinho e destina-se a adultos com a idade legal para consumir bebidas alcoólicas
					(18 anos em Portugal).
				</p>
			</section>

			<section>
				<h2>Alterações</h2>
				<p>Se este aviso mudar, a data no topo muda com ele.</p>
			</section>
		</main>
	);
}

export default async function PrivacyPage() {
	const lang = await getLang();
	return (
		<>
			<Header />
			{lang === 'pt' ? <PrivacyPt /> : <PrivacyEn />}
			<Footer />
		</>
	);
}
