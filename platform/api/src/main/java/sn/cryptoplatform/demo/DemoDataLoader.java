package sn.cryptoplatform.demo;

import java.io.ByteArrayInputStream;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import sn.cryptoplatform.course.CourseAuthoring;
import sn.cryptoplatform.course.CourseAuthoring.CourseDetails;
import sn.cryptoplatform.course.CourseAuthoring.LessonDraft;
import sn.cryptoplatform.course.CourseLevel;
import sn.cryptoplatform.course.LessonType;
import sn.cryptoplatform.media.MediaInfo;
import sn.cryptoplatform.media.MediaKind;
import sn.cryptoplatform.media.MediaService;
import sn.cryptoplatform.quiz.QuizAuthoring;
import sn.cryptoplatform.quiz.QuizAuthoring.ChoiceDraft;
import sn.cryptoplatform.quiz.QuizAuthoring.QuestionDraft;
import sn.cryptoplatform.quiz.QuizAuthoring.QuestionKind;
import sn.cryptoplatform.quiz.QuizAuthoring.QuizDraft;
import sn.cryptoplatform.user.Role;
import sn.cryptoplatform.user.UserService;

/**
 * Deux cours d'exemple, créés une seule fois (le compte « equipe » sert de témoin).
 * Activé par DEMO_DATA=true ; jamais en production.
 */
@Component
@ConditionalOnProperty(name = "app.demo.enabled", havingValue = "true")
class DemoDataLoader {

	static final String AUTHOR_EMAIL = "equipe@cryptoplatform.local";

	private static final Logger log = LoggerFactory.getLogger(DemoDataLoader.class);

	private final UserService users;
	private final MediaService media;
	private final CourseAuthoring courses;
	private final QuizAuthoring quizzes;

	DemoDataLoader(UserService users, MediaService media, CourseAuthoring courses, QuizAuthoring quizzes) {
		this.users = users;
		this.media = media;
		this.courses = courses;
		this.quizzes = quizzes;
	}

	/** Après la création du bucket S3 (ordre par défaut) : la fiche PDF doit pouvoir être envoyée. */
	@EventListener(ApplicationReadyEvent.class)
	@Order(100)
	void load() {
		if (users.findByEmail(AUTHOR_EMAIL).isPresent()) {
			return;
		}
		try {
			byte[] memo = SimplePdf.page("Fiche mémo : chiffrement symétrique", MEMO);
			// Le fichier est envoyé avant toute écriture en base : en cas d'échec, rien n'est créé
			// et le chargement sera retenté au prochain démarrage.
			long authorId = createAuthor();
			MediaInfo pdf = media.store(authorId, MediaKind.PDF, "fiche-memo-chiffrement-symetrique.pdf", memo.length,
					new ByteArrayInputStream(memo));
			symmetricCourse(authorId, pdf.id());
			rsaCourse(authorId);
			log.info("Données de démonstration créées : 2 cours publiés par « Équipe CryptoPlatform »");
		} catch (Exception e) {
			log.warn("Données de démonstration non créées : {}", e.getMessage());
		}
	}

	private long createAuthor() {
		long authorId = users.registerExternal(AUTHOR_EMAIL, "equipe", "Équipe CryptoPlatform").id();
		users.grantRole(authorId, Role.CREATOR);
		return authorId;
	}

	private void symmetricCourse(long authorId, long memoPdfId) {
		long course = courses.createCourse(authorId, "Chiffrement symétrique : de César à AES",
				"Comprendre le chiffrement à clé secrète : substitution, analyse de fréquences, AES, ses modes d'opération et les erreurs qui cassent tout.",
				CourseLevel.BEGINNER);
		courses.updateCourse(course, new CourseDetails("Chiffrement symétrique : de César à AES",
				"Comprendre le chiffrement à clé secrète : substitution, analyse de fréquences, AES, ses modes d'opération et les erreurs qui cassent tout.",
				"""
				Ce cours part des chiffrements historiques pour arriver à **AES-GCM**, le chiffrement authentifié
				utilisé aujourd'hui partout (TLS, disques, messageries).

				Vous saurez à la fin :

				- expliquer pourquoi César et les substitutions simples sont cassés ;
				- choisir un mode d'opération et gérer correctement le nonce ;
				- éviter les quatre erreurs d'implémentation les plus fréquentes.
				""", CourseLevel.BEGINNER, List.of("aes", "hachage"), null));

		long foundations = courses.addChapter(course, "Les fondations");
		courses.addLesson(foundations, new LessonDraft("Chiffrer, déchiffrer, casser", LessonType.TEXT, """
				Chiffrer consiste à transformer un **message clair** $m$ en **message chiffré** $c$ à l'aide d'une **clé** $k$ :

				$$c = E_k(m) \\qquad m = D_k(c)$$

				En chiffrement **symétrique**, la même clé sert aux deux opérations : l'émetteur et le destinataire
				doivent donc l'avoir partagée à l'avance.

				## Le principe de Kerckhoffs

				> La sécurité d'un système ne doit reposer que sur le secret de la clé, pas sur celui de l'algorithme.

				AES ou ChaCha20 sont publics et étudiés depuis des années par des milliers de chercheurs :
				c'est précisément ce qui permet de leur faire confiance.

				## Ce que l'on attend d'un bon chiffrement

				- **Confidentialité** : sans la clé, $c$ ne révèle rien de $m$ (hormis sa longueur).
				- **Clé assez longue** : avec 128 bits, il faut essayer en moyenne $2^{127}$ clés.
				- **Intégrité**, avec les modes authentifiés : toute modification de $c$ est détectée.
				""", null, 360, true));
		courses.addLesson(foundations, new LessonDraft("Le chiffre de César et l'analyse de fréquences", LessonType.TEXT, """
				César décalait chaque lettre de trois rangs : `A → D`, `B → E`… Avec un alphabet de 26 lettres :

				$$c_i = (m_i + k) \\bmod 26$$

				```python
				def cesar(texte: str, k: int) -> str:
				    resultat = []
				    for car in texte.upper():
				        if car.isalpha():
				            resultat.append(chr((ord(car) - ord("A") + k) % 26 + ord("A")))
				        else:
				            resultat.append(car)
				    return "".join(resultat)

				print(cesar("ATTAQUE A L AUBE", 3))  # DWWDTXH D O DXEH
				```

				## Pourquoi c'est cassé

				1. **Espace de clés minuscule** : 25 décalages utiles, que l'on essaie tous en une fraction de seconde.
				2. **Fréquences conservées** : en français, `E` est la lettre la plus fréquente (environ 15 %).
				   La lettre la plus fréquente du message chiffré trahit donc le décalage.

				Même une substitution quelconque, avec $26! \\approx 4 \\times 10^{26}$ clés possibles, tombe
				par **analyse de fréquences** : une grande clé ne suffit pas, le chiffré doit aussi ressembler à du hasard.
				""", null, 480, false));
		courses.addLesson(foundations, new LessonDraft("Fiche mémo : le vocabulaire", LessonType.PDF, null, memoPdfId,
				180, false));
		quizzes.saveQuiz(foundations, new QuizDraft(70, null, List.of(
				new QuestionDraft(QuestionKind.SINGLE, "En chiffrement **symétrique** :",
						"Émetteur et destinataire partagent **la même clé secrète**, d'où le problème de sa distribution.", 1,
						List.of(new ChoiceDraft("la même clé sert à chiffrer et à déchiffrer", true),
								new ChoiceDraft("chaque personne possède une clé publique et une clé privée", false),
								new ChoiceDraft("le message chiffré ne dépend pas de la clé", false))),
				new QuestionDraft(QuestionKind.SINGLE, "Combien de clés faut-il essayer, au pire, pour casser le chiffre de César ?",
						"Seuls 25 décalages changent le message : une recherche exhaustive est immédiate.", 1,
						List.of(new ChoiceDraft("25", true), new ChoiceDraft("$26!$", false), new ChoiceDraft("$2^{128}$", false))),
				new QuestionDraft(QuestionKind.MULTIPLE, "Selon le principe de Kerckhoffs, qu'est-ce qui **peut** être public ?",
						"Seule la clé doit rester secrète ; le message clair, lui, est ce que l'on protège.", 2,
						List.of(new ChoiceDraft("L'algorithme de chiffrement", true),
								new ChoiceDraft("Le code source de l'implémentation", true),
								new ChoiceDraft("La clé", false),
								new ChoiceDraft("Le message clair", false))))));

		long aes = courses.addChapter(course, "AES en pratique");
		courses.addLesson(aes, new LessonDraft("AES et les modes d'opération", LessonType.TEXT, """
				**AES** (Rijndael, standardisé en 2001) chiffre des **blocs de 128 bits** avec une clé de 128, 192
				ou 256 bits (10, 12 ou 14 tours).

				Un chiffrement par bloc ne traite qu'un bloc : le **mode d'opération** définit comment enchaîner
				les blocs d'un message plus long.

				| Mode | IV / nonce | Authentifie ? | À retenir |
				|---|---|---|---|
				| ECB | aucun | non | **à proscrire** : deux blocs clairs identiques donnent deux blocs chiffrés identiques |
				| CBC | IV aléatoire de 16 octets | non | à compléter par un MAC (encrypt-then-MAC) |
				| CTR | nonce unique | non | transforme AES en chiffrement par flot |
				| **GCM** | nonce unique de 12 octets | **oui** | le choix par défaut aujourd'hui |

				## AES-GCM en Java

				```java
				KeyGenerator generateur = KeyGenerator.getInstance("AES");
				generateur.init(256);
				SecretKey cle = generateur.generateKey();

				byte[] nonce = new byte[12];
				new SecureRandom().nextBytes(nonce); // jamais deux fois le même avec la même clé

				Cipher chiffreur = Cipher.getInstance("AES/GCM/NoPadding");
				chiffreur.init(Cipher.ENCRYPT_MODE, cle, new GCMParameterSpec(128, nonce));
				chiffreur.updateAAD("en-tete".getBytes(StandardCharsets.UTF_8)); // authentifié mais non chiffré
				byte[] chiffre = chiffreur.doFinal(message); // se termine par l'étiquette d'authentification (16 octets)
				```

				Le destinataire a besoin de la clé, du nonce (qui peut voyager en clair) et des mêmes données
				associées. Si un seul bit du chiffré a été modifié, `doFinal` lève une `AEADBadTagException`.
				""", null, 600, false));
		courses.addLesson(aes, new LessonDraft("Les erreurs qui cassent tout", LessonType.TEXT, """
				## 1. Réutiliser un nonce avec GCM ou CTR

				Ces modes chiffrent par XOR avec un flot de clé $F$ qui ne dépend que de la clé et du nonce :

				$$c_1 = m_1 \\oplus F \\qquad c_2 = m_2 \\oplus F \\quad\\Longrightarrow\\quad c_1 \\oplus c_2 = m_1 \\oplus m_2$$

				L'attaquant obtient le XOR des deux messages clairs sans connaître la clé ; avec GCM, il peut en
				plus fabriquer des messages que le destinataire acceptera. **Un nonce ne sert jamais deux fois avec la même clé.**

				## 2. Utiliser ECB

				Chaque bloc est chiffré indépendamment : les motifs du message restent visibles (le célèbre « pingouin ECB »).

				## 3. Oublier l'authentification

				CBC ou CTR seuls garantissent la confidentialité, pas l'intégrité : un attaquant peut modifier le chiffré
				(attaques par *padding oracle* sur CBC). Préférez un mode authentifié comme GCM.

				## 4. Dériver la clé d'un mot de passe avec un simple hachage

				`SHA-256(motDePasse)` se calcule des milliards de fois par seconde sur une carte graphique.
				Utilisez une fonction de dérivation lente et salée : **Argon2id**, scrypt ou PBKDF2.
				""", null, 360, false));
		quizzes.saveQuiz(aes, new QuizDraft(70, 3, List.of(
				new QuestionDraft(QuestionKind.SINGLE, "Quelle est la taille de bloc d'AES ?",
						"Toujours 128 bits : AES-256 désigne la taille de la **clé**, pas celle du bloc.", 1,
						List.of(new ChoiceDraft("128 bits", true), new ChoiceDraft("256 bits", false),
								new ChoiceDraft("Elle dépend de la taille de la clé", false))),
				new QuestionDraft(QuestionKind.MULTIPLE, "Que risque-t-on en réutilisant un nonce avec AES-GCM ?",
						"Le XOR des deux chiffrés donne celui des messages clairs, et la clé d'authentification peut être retrouvée. La clé AES, elle, reste inconnue.", 2,
						List.of(new ChoiceDraft("Révéler le XOR de deux messages clairs", true),
								new ChoiceDraft("Permettre la fabrication de faux messages acceptés", true),
								new ChoiceDraft("Révéler directement la clé AES", false),
								new ChoiceDraft("Aucun risque si la clé fait 256 bits", false))),
				new QuestionDraft(QuestionKind.SINGLE, "Pour dériver une clé à partir d'un mot de passe, on utilise :",
						"Une fonction lente, salée et gourmande en mémoire comme Argon2id rend les attaques par dictionnaire coûteuses.", 1,
						List.of(new ChoiceDraft("Argon2id", true), new ChoiceDraft("SHA-256", false),
								new ChoiceDraft("AES en mode ECB", false))))));

		courses.publish(course);
	}

	private void rsaCourse(long authorId) {
		long course = courses.createCourse(authorId, "RSA et signatures numériques",
				"Construire une paire de clés RSA à la main, comprendre sur quoi repose sa sécurité, puis signer et vérifier avec Ed25519.",
				CourseLevel.INTERMEDIATE);
		courses.updateCourse(course, new CourseDetails("RSA et signatures numériques",
				"Construire une paire de clés RSA à la main, comprendre sur quoi repose sa sécurité, puis signer et vérifier avec Ed25519.",
				"""
				La cryptographie **asymétrique** résout le problème que le symétrique laisse ouvert : comment
				s'échanger une clé, ou prouver l'origine d'un message, sans secret partagé au préalable ?

				Prérequis : notions d'arithmétique modulaire.
				""", CourseLevel.INTERMEDIATE, List.of("rsa", "signature"), null));

		long maths = courses.addChapter(course, "Les mathématiques de RSA");
		courses.addLesson(maths, new LessonDraft("Construire une paire de clés RSA", LessonType.TEXT, """
				1. Choisir deux grands nombres premiers $p$ et $q$ (1 024 bits chacun pour RSA-2048).
				2. Calculer le module $n = p \\times q$ et $\\varphi(n) = (p-1)(q-1)$.
				3. Choisir l'exposant public $e$, premier avec $\\varphi(n)$ ; en pratique $e = 65537$.
				4. Calculer l'exposant privé $d \\equiv e^{-1} \\pmod{\\varphi(n)}$.

				La clé publique est $(n, e)$, la clé privée $d$ :

				$$c = m^e \\bmod n \\qquad m = c^d \\bmod n$$

				## Exemple jouet

				Avec $p = 61$ et $q = 53$ : $n = 3233$, $\\varphi(n) = 3120$, $e = 17$ et $d = 2753$,
				car $17 \\times 2753 = 46\\,801 = 15 \\times 3120 + 1$.

				Pour $m = 65$ : $c = 65^{17} \\bmod 3233 = 2790$, et $2790^{2753} \\bmod 3233 = 65$.

				## Pourquoi c'est sûr

				Retrouver $d$ à partir de $(n, e)$ revient en pratique à **factoriser** $n$ : aucun algorithme connu
				n'y parvient en temps raisonnable pour 2 048 bits et plus. Un ordinateur quantique assez grand le
				pourrait (algorithme de Shor) : c'est la raison d'être de la cryptographie post-quantique.

				> Ne chiffrez jamais avec ce « RSA de manuel » : en pratique, on ajoute un bourrage aléatoire (OAEP).
				""", null, 540, true));
		quizzes.saveQuiz(maths, new QuizDraft(70, null, List.of(
				new QuestionDraft(QuestionKind.SINGLE, "Avec $p = 61$ et $q = 53$, que vaut $n$ ?",
						"$n = p \\times q = 3233$ ; $3120$ est $\\varphi(n)$.", 1,
						List.of(new ChoiceDraft("3233", true), new ChoiceDraft("3120", false), new ChoiceDraft("114", false))),
				new QuestionDraft(QuestionKind.SINGLE, "Sur quel problème repose la sécurité de RSA ?",
						"Connaître $p$ et $q$ permet de calculer $\\varphi(n)$ puis $d$.", 1,
						List.of(new ChoiceDraft("La difficulté de factoriser $n$", true),
								new ChoiceDraft("Le logarithme discret sur courbe elliptique", false),
								new ChoiceDraft("La difficulté d'inverser SHA-256", false))))));

		long signatures = courses.addChapter(course, "Signer et vérifier");
		courses.addLesson(signatures, new LessonDraft("Signature numérique : principe et code", LessonType.TEXT, """
				Signer, c'est prouver qu'un message vient bien du détenteur d'une clé privée et qu'il n'a pas été modifié :

				1. on calcule une empreinte du message avec une fonction de hachage ;
				2. on la transforme avec la **clé privée** : c'est la signature ;
				3. n'importe qui la vérifie avec la **clé publique**.

				Une signature apporte **intégrité**, **authenticité** et **non-répudiation**, mais pas la
				confidentialité : le message reste lisible.

				## Ed25519 en Java

				```java
				KeyPair paire = KeyPairGenerator.getInstance("Ed25519").generateKeyPair();

				Signature signeur = Signature.getInstance("Ed25519");
				signeur.initSign(paire.getPrivate());
				signeur.update(message);
				byte[] signature = signeur.sign(); // 64 octets

				Signature verificateur = Signature.getInstance("Ed25519");
				verificateur.initVerify(paire.getPublic());
				verificateur.update(message);
				boolean valide = verificateur.verify(signature);
				```

				Ed25519, sur courbe elliptique, offre une sécurité comparable à RSA-3072 avec des clés de 32 octets.
				C'est l'algorithme qui signe les certificats de cette plateforme : chacun est vérifiable publiquement.
				""", null, 480, false));
		quizzes.saveQuiz(signatures, new QuizDraft(70, null, List.of(
				new QuestionDraft(QuestionKind.MULTIPLE, "Que garantit une signature numérique ?",
						"Le message signé reste lisible : pour le cacher, il faut aussi le chiffrer.", 2,
						List.of(new ChoiceDraft("L'intégrité du message", true),
								new ChoiceDraft("L'authenticité de l'émetteur", true),
								new ChoiceDraft("La non-répudiation", true),
								new ChoiceDraft("La confidentialité du message", false))),
				new QuestionDraft(QuestionKind.SINGLE, "Avec quelle clé vérifie-t-on une signature ?",
						"Seul le signataire détient la clé privée ; tout le monde peut vérifier avec sa clé publique.", 1,
						List.of(new ChoiceDraft("La clé publique du signataire", true),
								new ChoiceDraft("La clé privée du signataire", false),
								new ChoiceDraft("La clé publique du destinataire", false))))));

		courses.publish(course);
	}

	private static final List<String> MEMO = List.of(
			"Message clair (m) : le texte à protéger.",
			"Message chiffré (c) : le résultat du chiffrement, illisible sans la clé.",
			"Clé (k) : le secret partagé par l'émetteur et le destinataire.",
			"Chiffrement symétrique : la même clé chiffre et déchiffre (AES, ChaCha20).",
			"Principe de Kerckhoffs : seule la clé est secrète ; l'algorithme est public et étudié.",
			"Analyse de fréquences : attaque qui exploite la répartition des lettres dans une langue.",
			"Chiffrement par bloc : traite des blocs de taille fixe (128 bits pour AES).",
			"Mode d'opération : manière d'enchaîner les blocs (ECB à proscrire, CBC, CTR, GCM).",
			"IV / nonce : valeur publique qui ne doit jamais servir deux fois avec la même clé.",
			"Chiffrement authentifié : confidentialité et intégrité à la fois (AES-GCM, ChaCha20-Poly1305).",
			"Dérivation de clé : transforme un mot de passe en clé, lentement et avec un sel (Argon2id, scrypt).");
}
