import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  HeartHandshake,
  Users,
  Medal,
  ShieldCheck,
  Clock,
  BarChart2,
  Bell,
  UserPlus,
  CalendarCheck,
  FileText,
  CreditCard,
  Building2,
  Stethoscope,
} from "lucide-react";

export const subscriptionPlans = [
  {
    title: "Free",
    price: "Gratuit / 1 mois",
    description: "Découverte de MedCare avec fonctionnalités limitées.",
    features: [
      "Gestion du staff basique",
      "Gestion patients simplifiée",
      "Agenda et rendez-vous simples",
      "Consultations et ordonnances PDF limitées",
      "Portail patient de base (sans paiement en ligne)",
      "Support par email",
    ],
  },
  {
    title: "Pro",
    price: "700 DT / 6 mois",
    description: "Pour cliniques de taille moyenne avec suivi complet.",
    popular: true,
    features: [
      "Gestion complète du staff et services",
      "Gestion complète des patients",
      "Agenda avancé & notifications",
      "Consultations illimitées et ordonnances PDF",
      "Portail patient complet (sans paiement en ligne)",
      "Support prioritaire",
    ],
  },
  {
    title: "Entreprise",
    price: "700 DT / 12 mois",
    description: "Toutes les fonctionnalités pour grandes cliniques.",
    features: [
      "Tout le contenu du plan Pro",
      "Portail patient complet avec paiement en ligne",
      "Analytics avancés ",
      "Support dédié 24/7",
    ],
  },
];
export const processData = [
  {
    icon: <UserPlus className="w-8 h-8 text-blue" />,
    step: "1",
    title: "Créer un compte",
    description:
      "Inscrivez votre clinique et configurez votre profil en quelques minutes.",
  },
  {
    icon: <CalendarCheck className="w-8 h-8 text-blue" />,
    step: "2",
    title: "Gérer le personnel & services",
    description: "Ajoutez vos employés et configurez les services disponibles.",
  },
  {
    icon: <FileText className="w-8 h-8 text-blue" />,
    step: "3",
    title: "Suivi des rendez-vous",
    description:
      "Planifiez et suivez les rendez-vous de vos patients facilement.",
  },
  {
    icon: <CreditCard className="w-8 h-8 text-blue" />,
    step: "4",
    title: "Paiement et facturation",
    description:
      "Gérez les paiements et générez des factures en ligne rapidement.",
  },
];
export const locationsData = [
  {
    city: "Tunis",
    address: "123 Avenue Habib Bourguiba",
    phone: "(216) 71 123 456",
  },
  {
    city: "Sfax",
    address: "45 Rue de la Santé",
    phone: "(216) 74 987 654",
  },
  {
    city: "Sousse",
    address: "12 Boulevard de la Clinique",
    phone: "(216) 73 555 321",
  },
];

export const valuesData = [
  {
    icon: <HeartHandshake className="text-white w-8 h-8" />,
    title: "Compassion",
    description:
      "Nous plaçons le bien-être des patients au cœur de chaque décision et action.",
  },
  {
    icon: <ShieldCheck className="text-white w-8 h-8" />,
    title: "Intégrité",
    description:
      "Nous assurons transparence, fiabilité et sécurité dans la gestion des données et des soins.",
  },
  {
    icon: <Medal className="text-white w-8 h-8" />,
    title: "Excellence",
    description:
      "Nous visons la qualité et l’efficacité dans tous les services et processus cliniques.",
  },
  {
    icon: <Users className="text-white w-8 h-8" />,
    title: "Collaboration",
    description:
      "Nous favorisons la coordination entre médecins, personnel et patients pour des soins optimaux.",
  },
];

export const socials = [
  {
    name: "Facebook",
    icon: <Facebook size={28} />,
    href: "https://facebook.com",
  },
  {
    name: "Twitter",
    icon: <Twitter size={28} />,
    href: "https://twitter.com",
  },
  {
    name: "Instagram",
    icon: <Instagram size={28} />,
    href: "https://instagram.com",
  },
  {
    name: "LinkedIn",
    icon: <Linkedin size={28} />,
    href: "https://linkedin.com",
  },
];

export const navLinks = [
  {
    Title: "Accueil",
    href: "/",
  },
  {
    Title: "À propos",
    href: "about",
  },
  {
    Title: "Services",
    href: "/services",
  },

  {
    Title: "Contact",
    href: "/contact",
  },
];

export const footerLinks = [
  {
    title: "Quick Links",
    links: [
      {
        title: "Accueil",
        url: "/",
      },
      {
        title: "Services",
        url: "/services",
      },
      {
        title: "À propos",
        url: "about",
      },

      {
        title: "Contact",
        url: "/contact",
      },
    ],
  },
];

export const aboutContent = {
  tag: "À propos de nous",
  title: "Une plateforme connectée au service de la santé",
  description1:
    "MedCare offre une solution intégrée pour simplifier la gestion des activités cliniques.",
  description2:
    "Notre plateforme favorise l’efficacité opérationnelle, l’organisation du personnel et une expérience fluide pour chaque utilisateur, du professionnel de santé au patient.",
};
// /constants/index.jsx

export const featuresData = [
  {
    icon: <Building2 className="text-blue w-10 h-10" />,
    title: "Gestion Clinique & Personnel",
    description:
      "Gérez le staff, configurez les services et suivez les activités de votre clinique.",
  },
  {
    icon: <Stethoscope className="text-blue w-10 h-10" />,
    title: "Suivi Médical & Rendez-vous",
    description:
      "Gérez les patients, planifiez les rendez-vous et générez les ordonnances en PDF.",
  },
  {
    icon: <CreditCard className="text-blue w-10 h-10" />,
    title: "Portail Patient & Paiement",
    description:
      "Offrez aux patients un espace pour réserver, consulter et payer en ligne.",
  },
];

export const featuresHeader = {
  title: "Nos Services",
  description:
    "Des solutions intégrées pour simplifier la gestion, améliorer la coordination et offrir une expérience fluide à chaque utilisateur.",
};

export const advantagesData = [
  {
    icon: <ShieldCheck className="w-10 h-10 text-white" />,
    title: "Sécurité des données",
    description:
      "Toutes les informations de vos patients sont protégées et confidentielles.",
  },
  {
    icon: <Clock className="w-10 h-10 text-white" />,
    title: "Accès 24/7",
    description:
      "Accédez à vos données et services à tout moment depuis n'importe où.",
  },
  {
    icon: <BarChart2 className="w-10 h-10 text-white" />,
    title: "Statistiques avancées",
    description:
      "Suivez les performances de votre clinique avec des rapports détaillés.",
  },
  {
    icon: <Bell className="w-10 h-10 text-white" />,
    title: "Notifications automatiques",
    description:
      "Recevez des rappels pour les rendez-vous et alertes importantes.",
  },
];
