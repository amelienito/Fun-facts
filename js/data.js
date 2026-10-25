// Contenu du site. Pour ajouter une salle : copier un bloc de SALLES et l'adapter.
// Chaque salle = un objet du cabinet + une salve de questions + ses sources.

import { SALLES_NOTES, FRISE_NOTES } from "./notes.js";

export const VERIFIE_LE = "2026-10-25";

export const CATEGORIES = [
  { id: "sciences", nom: "Sciences" },
  { id: "histoire", nom: "Histoire" },
  { id: "nature", nom: "Nature" },
  { id: "pop", nom: "Pop culture" },
  { id: "art", nom: "Art" },
  { id: "musique", nom: "Musique" },
  { id: "mots", nom: "Mots rares" },
];

const SRC = {
  sciam: {
    nom: "Scientific American",
    titre: "Do People Only Use 10 Percent of Their Brains?",
    url: "https://www.scientificamerican.com/article/do-people-only-use-10-percent-of-their-brains/",
  },
  britCleo: {
    nom: "Encyclopædia Britannica",
    titre: "Cleopatra",
    url: "https://www.britannica.com/biography/Cleopatra-queen-of-Egypt",
  },
  britPyr: {
    nom: "Encyclopædia Britannica",
    titre: "How Was Ancient Egypt Ancient Even to Cleopatra?",
    url: "https://www.britannica.com/one-good-fact/how-was-ancient-egypt-ancient-even-to-cleopatra",
  },
  apple: {
    nom: "Apple Newsroom",
    titre: "Apple Reinvents the Phone with iPhone (9 janvier 2007)",
    url: "https://www.apple.com/newsroom/2007/01/09Apple-Reinvents-the-Phone-with-iPhone/",
  },
  nhm: {
    nom: "Natural History Museum, Londres",
    titre: "Shark evolution: a 450-million-year timeline",
    url: "https://www.nhm.ac.uk/discover/shark-evolution-a-450-million-year-timeline",
  },
  foret: {
    nom: "Yale Environment 360",
    titre: "Scientists Find the World's Oldest Known Forest, Dating Back 386 Million Years (étude parue dans Current Biology, 2019)",
    url: "https://e360.yale.edu/digest/scientists-find-the-worlds-oldest-known-forest-dating-back-386-million-years",
  },
  ninHist: {
    nom: "Nintendo",
    titre: "Company History",
    url: "https://www.nintendo.co.jp/corporate/en/history/",
  },
  ninProf: {
    nom: "Nintendo",
    titre: "Company Profile",
    url: "https://www.nintendo.co.jp/corporate/en/outline/index.html",
  },
  eiffel: {
    nom: "La tour Eiffel (site officiel)",
    titre: "Pourquoi la tour Eiffel change de taille",
    url: "https://www.toureiffel.paris/fr/actualites/histoire-et-culture/pourquoi-la-tour-eiffel-change-de-taille",
  },
  eiffelGus: {
    nom: "La tour Eiffel (site officiel)",
    titre: "Suivez Gus ! Les exploits de la tour (fiche pédagogique)",
    url: "https://www.toureiffel.paris/themes/custom/tour_eiffel/assets/Fiches/FR/04_les_exploits_de_la_tour.pdf",
  },
};

const SALLES_BASE = [
  {
    id: "cerveau",
    inventaire: 1,
    cat: "sciences",
    objet: "cerveau",
    nom: "Cerveau en bocal",
    porte: "L'organe le plus gourmand du corps",
    questions: [
      {
        type: "vf",
        texte: "On n'utilise que 10 % de notre cerveau.",
        reponse: false,
        explication:
          "Les neurologues interrogés par Scientific American sont formels : on utilise pratiquement toutes les parties du cerveau. L'imagerie montre que la plupart des régions sont actives au cours d'une journée, même pendant le sommeil.",
      },
    ],
    saviezVous:
      "Le cerveau représente environ 3 % du poids du corps, mais il consomme environ 20 % de son énergie. L'origine du mythe reste floue : on la rattache parfois aux écrits du psychologue William James, et on l'attribue aussi à Einstein, sans preuve.",
    sources: [SRC.sciam],
    liens: [],
  },
  {
    id: "cleopatre",
    inventaire: 2,
    cat: "histoire",
    objet: "pyramide",
    nom: "Pyramide et téléphone",
    porte: "Une reine, une pyramide et un téléphone",
    questions: [
      {
        type: "vf",
        texte:
          "Cléopâtre a vécu plus près de l'invention de l'iPhone que de la construction de la grande pyramide de Gizeh.",
        reponse: true,
        explication:
          "La grande pyramide est achevée au début du XXVe siècle av. J.-C. Cléopâtre naît en 70 ou 69 av. J.-C., et le premier iPhone est présenté le 9 janvier 2007. De la pyramide à la naissance de Cléopâtre, il s'écoule environ 2 400 à 2 500 ans ; de sa naissance à l'iPhone, environ 2 075.",
      },
    ],
    saviezVous:
      "Cléopâtre était d'origine macédonienne et n'avait que peu, voire pas, de sang égyptien, selon l'Encyclopædia Britannica. Elle fut la dernière reine de la dynastie macédonienne qui régnait sur l'Égypte.",
    note:
      "Les sources ne datent pas toutes la grande pyramide de la même façon : on lit souvent « vers 2560 av. J.-C. ». La comparaison reste vraie quelle que soit la date retenue.",
    sources: [SRC.britCleo, SRC.britPyr, SRC.apple],
    liens: [
      {
        vers: "requins",
        porte: "Plus vieux que les pyramides. Bien plus vieux.",
        transition:
          "La grande pyramide a environ 4 500 ans. Les plus anciennes traces de requins sont à peu près cent mille fois plus vieilles.",
      },
    ],
  },
  {
    id: "requins",
    inventaire: 3,
    cat: "nature",
    objet: "dent",
    nom: "Dent de requin fossile",
    porte: "Un prédateur très, très ancien",
    questions: [
      {
        type: "vf",
        texte: "Les requins existent depuis plus longtemps que les arbres.",
        reponse: true,
        explication:
          "Les plus anciennes traces de requins sont des écailles vieilles d'environ 450 millions d'années. La plus ancienne forêt fossile connue, découverte à Cairo, dans l'État de New York, a environ 386 millions d'années.",
      },
    ],
    saviezVous:
      "Cette forêt fossile a été retrouvée dans une ancienne carrière de grès des monts Catskill. On y distingue encore les systèmes racinaires de ces arbres primitifs.",
    note:
      "Les écailles de 450 millions d'années font débat : on ne sait pas avec certitude s'il s'agit de vrais requins. Mais même les plus vieilles dents de type requin connues, celles de Doliodus problematicus (environ 410 millions d'années), sont plus anciennes que cette forêt.",
    sources: [SRC.nhm, SRC.foret],
    liens: [
      {
        vers: "cleopatre",
        porte: "Retour à l'échelle humaine",
        transition: "Après 450 millions d'années, retour à des dates plus humaines.",
      },
    ],
  },
  {
    id: "nintendo",
    inventaire: 4,
    cat: "pop",
    objet: "hanafuda",
    nom: "Carte hanafuda",
    porte: "Des cartes à jouer de Kyoto",
    questions: [
      {
        type: "vf",
        texte: "Nintendo a été fondée au XIXe siècle.",
        reponse: true,
        explication: "Nintendo indique avoir été fondée en septembre 1889, à Kyoto.",
      },
      {
        type: "qcm",
        texte: "Que fabriquait Nintendo à ses débuts ?",
        choix: ["Des cartes à jouer", "Des jouets en bois", "Des horloges", "Des cerfs-volants"],
        reponse: 0,
        explication:
          "Des hanafuda, des cartes à jouer japonaises, que Fusajiro Yamauchi fabrique et vend dès 1889.",
      },
    ],
    saviezVous:
      "En 1902, Nintendo commence à fabriquer et à vendre les premières cartes à jouer occidentales du Japon.",
    sources: [SRC.ninHist, SRC.ninProf],
    liens: [
      {
        vers: "eiffel",
        porte: "La même année, à Paris",
        transition:
          "1889 : l'année où Fusajiro Yamauchi se lance à Kyoto, Paris inaugure une tour de 312 mètres.",
      },
    ],
  },
  {
    id: "eiffel",
    inventaire: 5,
    cat: "sciences",
    objet: "eiffel",
    nom: "Tour Eiffel miniature",
    porte: "Un monument parisien, vu de près",
    questions: [
      {
        type: "vf",
        texte: "La tour Eiffel grandit en été.",
        reponse: true,
        explication:
          "Avec la chaleur, le métal se dilate : la tour gagne un peu de hauteur en été, et en perd en hiver quand il se contracte.",
      },
      {
        type: "qcm",
        texte: "Par grand soleil, que fait le sommet de la tour ?",
        choix: [
          "Il penche du côté opposé au soleil",
          "Il penche vers le soleil",
          "Il s'enfonce de quelques centimètres",
          "Il ne bouge pas",
        ],
        reponse: 0,
        explication:
          "Le soleil ne chauffe qu'une face à la fois : ce côté se dilate davantage, et la tour penche légèrement à l'opposé. Au fil de la journée, son sommet décrit une courbe d'environ 15 centimètres de diamètre.",
      },
    ],
    saviezVous:
      "Le vent fait aussi bouger le sommet de quelques centimètres. Le record date de la tempête de décembre 1999 : 9 centimètres d'amplitude.",
    note:
      "On lit souvent que la tour grandit de 15 à 20 centimètres en été. Le site officiel parle seulement de « quelques millimètres » de hauteur. Les 15 centimètres correspondent au mouvement du sommet par grand soleil ; une fiche pédagogique du même site évoque jusqu'à 18 centimètres d'inclinaison par très forte chaleur.",
    sources: [SRC.eiffel, SRC.eiffelGus],
    liens: [
      {
        vers: "nintendo",
        porte: "La même année, à Kyoto",
        transition:
          "1889 : l'année où la tour Eiffel est inaugurée, un artisan de Kyoto se lance dans les cartes à jouer.",
      },
    ],
  },
];

// Moments datés pour la salle des archives (frise).
const FRISE_BASE = [
  { id: "ecailles", texte: "Les plus anciennes écailles de requin connues", date: -450e6, affichage: "il y a environ 450 millions d'années", salle: "requins", source: SRC.nhm },
  { id: "foret", texte: "La plus ancienne forêt fossile connue", date: -386e6, affichage: "il y a environ 386 millions d'années", salle: "requins", source: SRC.foret },
  { id: "pyramide", texte: "L'achèvement de la grande pyramide de Gizeh", date: -2500, affichage: "début du XXVe siècle av. J.-C.", salle: "cleopatre", source: SRC.britPyr },
  { id: "cleopatre", texte: "La mort de Cléopâtre", date: -30, affichage: "30 av. J.-C.", salle: "cleopatre", source: SRC.britCleo },
  { id: "yamauchi", texte: "Les premières hanafuda de Fusajiro Yamauchi, futur Nintendo", date: 1889, affichage: "1889", salle: "nintendo", source: SRC.ninHist },
  { id: "inauguration", texte: "L'inauguration de la tour Eiffel", date: 1889, affichage: "1889", salle: "eiffel", source: SRC.eiffel },
  { id: "cartes1902", texte: "Les premières cartes à jouer occidentales fabriquées au Japon", date: 1902, affichage: "1902", salle: "nintendo", source: SRC.ninHist },
  { id: "iphone", texte: "La présentation du premier iPhone", date: 2007, affichage: "2007", salle: "cleopatre", source: SRC.apple },
];

export const SALLES = [
  ...SALLES_BASE,
  ...SALLES_NOTES.map((salle, i) => ({ inventaire: SALLES_BASE.length + i + 1, ...salle })),
];

export const FRISE = [...FRISE_BASE, ...FRISE_NOTES];
