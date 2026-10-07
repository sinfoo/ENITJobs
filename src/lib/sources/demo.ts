import type { NewJob } from "../db";
import { extractTags } from "./classify";

// Fictional offers for first run / offline demos. Companies and URLs are invented.
// Dates are anchored on module load so deadlines always sit in the near future.

const NOW = new Date();
const day = (n: number) => new Date(NOW.getTime() + n * 86_400_000).toISOString().slice(0, 10);

type Seed = Omit<NewJob, "source" | "url" | "tags" | "posted_at" | "deadline"> & { slug: string; posted: number; due: number };

const SEEDS: Seed[] = [
  {
    slug: "stage-ete-java-spring-novatek",
    title: "Stage d'été – Développeur Java / Spring Boot",
    company: "Novatek Solutions",
    location: "Lac 2, Tunis",
    remote: false,
    type: "stage",
    posted: -3,
    due: 21,
    description: `Novatek Solutions, éditeur de logiciels de gestion pour les PME tunisiennes, recrute un(e) stagiaire développeur Java pour l'été (juillet–août, 8 semaines).

Missions :
- Participer au développement de nouveaux endpoints REST sur notre back-office (Spring Boot 3, Java 21).
- Écrire des tests unitaires avec JUnit 5 et Mockito.
- Corriger des anomalies remontées par l'équipe support et documenter les correctifs.
- Découvrir notre chaîne CI (GitLab CI, Docker).

Profil recherché :
- Étudiant(e) en 1ère ou 2ème année cycle ingénieur informatique (ENIT, INSAT, ENSI...).
- Bases solides en POO et en Java ; une première approche de SQL (PostgreSQL) est un plus.
- Curiosité, rigueur, envie d'apprendre en équipe.

Conditions : stage rémunéré (gratification mensuelle), encadrement par un développeur senior, locaux au Lac 2, horaires 9h–17h. Possibilité de poursuivre en stage PFE l'année suivante.`,
  },
  {
    slug: "summer-internship-python-django-carthago",
    title: "Summer Internship – Backend Developer (Python / Django)",
    company: "Carthago Labs",
    location: "Technopole El Ghazala, Ariana",
    remote: false,
    type: "stage",
    posted: -5,
    due: 28,
    description: `Carthago Labs builds a SaaS platform for school administration used across North Africa. We are looking for a motivated summer intern (6 to 8 weeks, June to August) to join our backend team.

What you will do:
- Implement small features on our Django REST API (Python 3.12, Django 5, PostgreSQL).
- Write automated tests with pytest and keep coverage green.
- Help migrate a legacy cron job to Celery tasks.
- Pair with senior engineers during code reviews and daily stand-ups.

What we look for:
- 1st or 2nd year engineering student in computer science.
- Comfortable with Python; basic knowledge of HTTP and relational databases.
- You have built at least one personal or academic project (GitHub link welcome).
- Working English; French or Arabic for team chat.

Perks: paid internship, laptop provided, free shuttle from Tunis city centre to the Technopole, mentorship, and a reference letter at the end.`,
  },
  {
    slug: "pfe-flutter-medina-digital",
    title: "Stage PFE – Application mobile Flutter de suivi de livraisons",
    company: "Medina Digital",
    location: "Sousse",
    remote: false,
    type: "pfe",
    posted: -7,
    due: 35,
    description: `Medina Digital accompagne des commerçants du Sahel dans leur transformation numérique. Dans le cadre d'un projet de fin d'études (PFE, 4 à 6 mois à partir de février), nous proposons de concevoir une application mobile de suivi de livraisons pour nos clients.

Sujet :
- Conception et développement d'une application Flutter (Android + iOS) pour les livreurs et les commerçants.
- Suivi temps réel des colis (géolocalisation, notifications push via Firebase).
- Back-end Node.js / Express existant à étendre, base MongoDB.
- Mise en place d'un pipeline CI/CD et publication sur le Play Store.

Profil recherché :
- Étudiant(e) en dernière année cycle ingénieur informatique.
- Bonne maîtrise de Dart/Flutter ou forte motivation à l'apprendre vite ; notions de REST et Git.
- Autonomie, sens du produit, capacité à documenter son travail.

Encadrement par le CTO, gratification mensuelle, possibilité d'embauche à l'issue du PFE.`,
  },
  {
    slug: "pfe-data-ml-datasahel",
    title: "PFE – Modèle de prévision de la demande (Data / Machine Learning)",
    company: "DataSahel",
    location: "Tunis",
    remote: false,
    type: "pfe",
    posted: -10,
    due: 42,
    description: `DataSahel est un cabinet de conseil en data spécialisé dans la grande distribution. Nous proposons un projet de fin d'études autour de la prévision de la demande en magasin.

Objectifs du PFE :
- Construire un pipeline de données (Python, pandas, Airflow) à partir des historiques de ventes.
- Comparer plusieurs approches de prévision : modèles statistiques, gradient boosting (LightGBM), réseaux récurrents (PyTorch).
- Industrialiser le meilleur modèle sous forme d'API (FastAPI, Docker) et construire un tableau de bord Power BI.
- Rédiger un rapport et présenter les résultats au client.

Profil recherché :
- Étudiant(e) ingénieur en informatique ou mathématiques appliquées, dernière année.
- Bon niveau en Python et en statistiques ; connaissances en machine learning (scikit-learn) ; SQL.
- Esprit d'analyse, rigueur scientifique, bon niveau d'anglais écrit.

Durée : 5 à 6 mois, gratification, bureaux au centre-ville de Tunis, 2 jours de télétravail par semaine.`,
  },
  {
    slug: "junior-fullstack-react-node-oasis",
    title: "Junior Full-Stack Developer (React / Node.js)",
    company: "Oasis Cloud",
    location: "Remote (Tunisia)",
    remote: true,
    type: "emploi",
    posted: -2,
    due: 30,
    description: `Oasis Cloud is a fully remote team of 18 building invoicing and payroll tools for freelancers in the MENA region. We are hiring a junior full-stack developer to grow with us.

Responsibilities:
- Ship features end to end: React 19 + TypeScript on the front, Node.js (NestJS) and PostgreSQL on the back.
- Write unit and integration tests; take part in code reviews.
- Own small projects after a 3-month onboarding with a dedicated buddy.
- Participate in on-call rotation after 6 months (light, compensated).

Requirements:
- Engineering degree or final-year student available full time.
- Solid JavaScript/TypeScript fundamentals; a React or Node side project you can talk about.
- Git workflow, basic SQL, curiosity about cloud (we run on AWS).
- Good written English (async-first culture).

Offer: full-time contract, salary 1,800–2,400 TND net depending on profile, equipment budget, 25 days leave, remote across Tunisia with quarterly meetups in Tunis.`,
  },
  {
    slug: "stage-embarque-stm32-byrsa",
    title: "Stage d'été – Développement embarqué C / STM32",
    company: "Byrsa Electronics",
    location: "Sfax",
    remote: false,
    type: "stage",
    posted: -6,
    due: 24,
    description: `Byrsa Electronics conçoit des cartes électroniques pour l'agriculture connectée (capteurs d'humidité, vannes pilotées). Nous recherchons un(e) stagiaire pour l'été (6 à 8 semaines) au sein de l'équipe firmware.

Missions :
- Développer et tester des drivers en C pour microcontrôleurs STM32 (HAL, FreeRTOS).
- Implémenter la communication avec des capteurs via I2C / SPI / UART.
- Participer aux tests sur banc (oscilloscope, analyseur logique) et rédiger des rapports de test.
- Contribuer à un petit outil Python de visualisation des trames reçues.

Profil recherché :
- Étudiant(e) ingénieur en informatique, télécom ou électronique.
- Bases en C et en architecture des microprocesseurs ; cours d'électronique numérique suivi.
- Un projet Arduino / STM32 personnel est un vrai plus.

Stage gratifié, encadrement par l'ingénieur firmware lead, matériel fourni. Locaux en zone industrielle de Sfax (navette depuis le centre).`,
  },
  {
    slug: "devops-intern-nexora",
    title: "DevOps Intern – Cloud & CI/CD",
    company: "Nexora Systems",
    location: "Lac 2, Tunis",
    remote: false,
    type: "stage",
    posted: -4,
    due: 18,
    description: `Nexora Systems runs managed Kubernetes platforms for banks and insurers in Tunisia and West Africa. Our platform team is opening a 2-month summer internship.

Your mission:
- Automate environment provisioning with Terraform and Ansible on Azure.
- Improve our GitLab CI pipelines (build caching, security scanning with Trivy).
- Write Grafana dashboards and Prometheus alerts for a new client cluster.
- Document runbooks and present your work to the team at the end of the internship.

Profile:
- Engineering student (any year) with a strong interest in Linux and infrastructure.
- Comfortable with the shell, Git, and Docker basics; you have at least played with a VM or a home lab.
- Interest in Kubernetes, networking, or security is appreciated; no prior professional experience required.

Paid internship, hybrid (3 days on site at Lac 2), mentoring by a senior SRE, access to our training platform and certification vouchers for the best interns.`,
  },
  {
    slug: "alternance-dotnet-atlas",
    title: "Alternance – Développeur .NET / C# (12 mois)",
    company: "Atlas Softwares",
    location: "Centre urbain nord, Tunis",
    remote: false,
    type: "alternance",
    posted: -12,
    due: 45,
    description: `Atlas Softwares édite une suite de gestion de flotte automobile utilisée par 200 entreprises. Nous ouvrons un poste en alternance (rythme 3 jours entreprise / 2 jours école) pour 12 mois, convention avec l'établissement.

Missions :
- Développer des évolutions sur notre application web ASP.NET Core 8 / C# avec Entity Framework et SQL Server.
- Moderniser des écrans en Blazor et participer à la migration d'un module WinForms.
- Écrire des tests (xUnit) et participer aux revues de code.
- Intervenir ponctuellement sur le support de niveau 2 pour comprendre les usages clients.

Profil recherché :
- Étudiant(e) en cycle ingénieur informatique disponible en alternance sur l'année scolaire.
- Connaissance d'un langage objet (C#, Java) et de SQL ; envie de monter en compétence sur l'écosystème .NET.
- Sens du service, communication claire.

Rémunération mensuelle, tickets restaurant, télétravail possible 1 jour/semaine après la période d'intégration.`,
  },
  {
    slug: "cybersecurity-intern-soc-kairouan-secure",
    title: "Cybersecurity Intern – SOC Analyst (Summer)",
    company: "Kairouan Secure",
    location: "Ariana",
    remote: false,
    type: "stage",
    posted: -8,
    due: 26,
    description: `Kairouan Secure operates a 24/7 Security Operations Center for Tunisian and European clients. We offer a 2-month summer internship inside the SOC team.

What you will do:
- Triage alerts in our SIEM (Wazuh, Elastic) alongside level-1 analysts.
- Write detection rules and small Python scripts to enrich alerts (VirusTotal, AbuseIPDB APIs).
- Take part in a guided internal penetration test on a lab network (Kali, nmap, Burp Suite).
- Produce a short threat report at the end of the internship.

Profile:
- Computer science or telecom engineering student with a genuine interest in security.
- Linux and networking basics (TCP/IP, DNS, HTTP); scripting in Python or Bash.
- CTF participation (Root-Me, HackTheBox, Securinets events) is a plus.
- Discretion and ethics: a background check is part of the process.

Paid internship, on site in Ariana, badge access to the SOC, mentoring by a certified analyst, and priority for PFE topics the following year.`,
  },
  {
    slug: "developpeur-php-laravel-junior-webfennec",
    title: "Développeur PHP / Laravel junior",
    company: "WebFennec",
    location: "Sfax",
    remote: false,
    type: "emploi",
    posted: -14,
    due: 32,
    description: `WebFennec est une agence web de 12 personnes basée à Sfax qui réalise des sites e-commerce et des applications métiers pour des clients tunisiens et français. Nous recrutons un(e) développeur(se) junior en CDI.

Missions :
- Développer des applications Laravel 11 (API REST, Livewire, Blade) avec MySQL.
- Intégrer des maquettes Figma en Tailwind CSS ; un peu de Vue.js sur les projets récents.
- Déployer sur nos serveurs Linux (Docker, GitHub Actions) et assurer la maintenance corrective.
- Échanger directement avec les clients sur les tickets simples.

Profil recherché :
- Jeune diplômé(e) ou étudiant(e) en fin de cycle ingénieur disponible rapidement.
- Bonnes bases PHP et POO, notions de Laravel ou d'un framework MVC équivalent ; Git.
- Autonomie, souci du détail, français écrit correct.

Salaire 1 400–1 700 TND net selon profil, mutuelle, formation continue, 1 jour de télétravail par semaine après 3 mois.`,
  },
  {
    slug: "remote-data-analyst-intern-zenith",
    title: "Remote Internship – Data Analyst (Python / SQL)",
    company: "Zenith Analytics",
    location: "Remote",
    remote: true,
    type: "stage",
    posted: -1,
    due: 20,
    description: `Zenith Analytics is a small remote consultancy producing market dashboards for e-commerce brands in Europe. We host a fully remote, paid, 8-week internship for data-curious engineering students.

What you will do:
- Clean and model datasets in Python (pandas, Polars) and SQL (BigQuery).
- Build and maintain dashboards (Metabase, a bit of Power BI).
- Automate weekly reports with scheduled scripts and simple ETL in Airflow.
- Present findings in a short weekly call with a senior analyst.

Who we are looking for:
- 1st to 3rd year engineering student with a good grasp of Python and basic statistics.
- You know what a JOIN is and can explain a group-by; notebooks do not scare you.
- Reliable internet connection and 4 hours of overlap with CET working hours.
- Clear written English.

Equipment stipend, flexible hours, and a recommendation on LinkedIn for strong performers. Apply with a short note and, if you have one, a link to an analysis you did.`,
  },
  {
    slug: "urgent-stage-fullstack-innofast",
    title: "URGENT – Stage développeur full stack (démarrage immédiat)",
    company: "InnoFast Startup",
    location: "Tunis",
    remote: false,
    type: "stage",
    posted: -2,
    due: 14,
    description: `Startup innovante en pleine croissance cherche URGENT un stagiaire full stack passionné et disponible immédiatement pour rejoindre une aventure unique !

Missions :
- Développer l'ensemble de notre plateforme (front, back, mobile, base de données) et gérer les serveurs.
- Être force de proposition et polyvalent, travailler en autonomie totale.
- Disponible le week-end si besoin selon les urgences clients.

Profil :
- Minimum 3 ans d'expérience en développement web exigée.
- Maîtrise parfaite de React, Angular, Node, PHP, Python, Java, Flutter, AWS et Docker.
- Capable de livrer vite sous pression, esprit startup, pas de contraintes horaires.

Stage non rémunéré (expérience et visibilité garanties), possibilité de rémunération selon résultats. Durée à définir. Envoyez votre CV rapidement, premier arrivé premier servi !`,
  },
];

export const DEMO_JOBS: NewJob[] = SEEDS.map(({ slug, posted, due, ...s }) => ({
  ...s,
  source: "demo",
  url: `https://demo.enitjobs.local/offres/${slug}`,
  tags: extractTags(s.title, s.description),
  posted_at: day(posted),
  deadline: day(due),
}));
