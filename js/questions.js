// Questions réécrites (V4) : la réponse ne doit jamais se deviner à la formulation.
// Règles : pas d'affirmation « trop précise pour être fausse », des choix tous plausibles,
// l'ordre des choix est mélangé à l'affichage (sauf « ordre: true », pour les nombres).
// Tout ce qui est affirmé ici vient des explications et sources déjà vérifiées dans data.js et notes.js.

export const QUESTIONS = {
  cerveau: [{
    type: "vf", texte: "On n'utilise que 10 % de notre cerveau.", reponse: false,
    explication: "Faux. Les neurologues sont formels : on utilise pratiquement toutes les parties du cerveau. L'imagerie montre que la plupart des régions sont actives au cours d'une journée, même pendant le sommeil.",
  }],
  cleopatre: [{
    type: "qcm", texte: "De quoi Cléopâtre est-elle la plus proche dans le temps ?",
    choix: ["Du premier iPhone", "De la construction de la grande pyramide"], reponse: 0,
    explication: "Du premier iPhone. La grande pyramide est achevée au début du XXVe siècle av. J.-C., Cléopâtre naît en 70 ou 69 av. J.-C., et l'iPhone est présenté le 9 janvier 2007. Environ 2 400 à 2 500 ans d'un côté, environ 2 075 de l'autre.",
  }],
  requins: [{
    type: "qcm", texte: "Qui est apparu en premier sur Terre ?",
    choix: ["Les requins", "Les arbres"], reponse: 0,
    explication: "Les requins. Leurs plus anciennes traces sont des écailles d'environ 450 millions d'années, alors que la plus ancienne forêt fossile connue, à Cairo, dans l'État de New York, a environ 386 millions d'années.",
  }],
  nintendo: [
    {
      type: "qcm", texte: "En quelle année Nintendo a-t-elle été fondée ?", ordre: true,
      choix: ["1889", "1933", "1959", "1977"], reponse: 0,
      explication: "En 1889. Nintendo indique avoir été fondée en septembre 1889, à Kyoto.",
    },
    {
      type: "qcm", texte: "Et que fabriquait Nintendo à ses débuts ?",
      choix: ["Des cartes à jouer", "Des jouets en bois", "Des horloges", "Des cerfs-volants"], reponse: 0,
      explication: "Des hanafuda, des cartes à jouer japonaises, que Fusajiro Yamauchi fabrique et vend dès 1889.",
    },
  ],
  eiffel: [
    {
      type: "qcm", texte: "Que fait la tour Eiffel quand il fait chaud ?",
      choix: ["Elle grandit un peu", "Elle rétrécit un peu", "Elle s'enfonce dans le sol", "Rien du tout"], reponse: 0,
      explication: "Elle grandit un peu : avec la chaleur, le métal se dilate. Elle gagne quelques millimètres en été, et les reperd en hiver quand il se contracte.",
    },
    {
      type: "qcm", texte: "Et par grand soleil, que fait son sommet ?",
      choix: ["Il penche du côté opposé au soleil", "Il penche vers le soleil", "Il tourne sur lui-même", "Il vibre en continu"], reponse: 0,
      explication: "Il penche du côté opposé au soleil : seule la face éclairée chauffe et se dilate. Au fil de la journée, le sommet décrit une courbe d'environ 15 centimètres de diamètre.",
    },
  ],

  coucou: [{
    type: "qcm", texte: "Où le coucou gris pond-il ses œufs ?",
    choix: ["Dans le nid d'autres oiseaux", "Dans un trou qu'il creuse dans un arbre", "À même le sol", "Dans un nid qu'il construit en couple"], reponse: 0,
    explication: "Dans le nid d'autres oiseaux. Le coucou gris est un parasite de couvée : d'autres espèces couvent son œuf, puis nourrissent le poussin comme s'il était le leur.",
  }],
  hiboux: [{
    type: "qcm", texte: "Sous leurs plumes, comment sont les pattes des hiboux ?",
    choix: ["Très longues", "Très courtes", "Palmées", "Atrophiées"], reponse: 0,
    explication: "Très longues. On ne voit d'habitude que le bas de la patte et les serres : la cuisse et le genou sont cachés dans le plumage. Ces longues pattes servent à chasser en gardant la tête à distance de la proie.",
  }],
  pizzly: [{
    type: "qcm", texte: "Un « pizzly » est un hybride entre…",
    choix: ["Un ours blanc et un grizzli", "Un panda géant et un ours brun", "Un puma et un lynx", "Un loup et un husky"], reponse: 0,
    explication: "Un ours blanc et un grizzli. Ces hybrides existent aussi à l'état sauvage : des individus ont été observés et confirmés par des analyses génétiques dans l'Arctique canadien.",
  }],
  dragonnier: [{
    type: "qcm", texte: "De quelle couleur est la résine du dragonnier de Socotra ?",
    choix: ["Rouge sang", "Bleu nuit", "Noire", "Dorée"], reponse: 0,
    explication: "Rouge sang. Cette résine, appelée « sang-de-dragon », sert depuis l'Antiquité de colorant et de remède. L'arbre ne pousse que sur l'île yéménite de Socotra.",
  }],
  cachalot: [{
    type: "qcm", texte: "Comment dit-on « cachalot » en anglais ?",
    choix: ["Sperm whale", "Killer whale", "Pilot whale", "Humpback whale"], reponse: 0,
    explication: "Sperm whale. Les baleiniers prenaient le spermaceti, une substance huileuse contenue dans la tête de l'animal, pour du sperme. Le nom est resté.",
  }],
  etrier: [{
    type: "qcm", texte: "Où se trouve le plus petit os du corps humain ?",
    choix: ["Dans l'oreille", "Dans le pied", "Dans la main", "Dans le nez"], reponse: 0,
    explication: "Dans l'oreille moyenne : c'est l'étrier, l'un des trois osselets qui transmettent les vibrations du tympan à l'oreille interne. Il doit son nom à sa forme.",
  }],
  tumbler: [{
    type: "qcm", texte: "Sur certaines photos d'essais nucléaires, des pointes sortent du bas de la boule de feu. D'où viennent-elles ?",
    choix: ["Des câbles de la tour, vaporisés", "Du sable aspiré par l'explosion", "D'un défaut des appareils photo", "D'éclairs provoqués par l'explosion"], reponse: 0,
    explication: "Des câbles qui tiennent la tour de tir : la lumière intense de la boule de feu les chauffe, ils se vaporisent et forment ces pointes. C'est l'« effet rope trick », photographié notamment lors de l'opération Tumbler-Snapper, au Nevada, en 1952.",
  }],
  femto: [{
    type: "qcm", texte: "Une femtoseconde, c'est…", ordre: true,
    choix: ["10⁻⁹ seconde", "10⁻¹² seconde", "10⁻¹⁵ seconde", "10⁻¹⁸ seconde"], reponse: 2,
    explication: "10⁻¹⁵ seconde, soit un millionième de milliardième de seconde. 10⁻⁹, c'est la nanoseconde, 10⁻¹² la picoseconde et 10⁻¹⁸ l'attoseconde.",
  }],
  farriner: [{
    type: "qcm", texte: "Où le Grand Incendie de Londres a-t-il démarré, en 1666 ?",
    choix: ["Dans une boulangerie", "Dans une taverne", "Dans une église", "Sur un navire du port"], reponse: 0,
    explication: "Dans la boulangerie de Thomas Farriner, sur Pudding Lane. Ce boulanger était connu pour avoir fourni du pain à la Royal Navy.",
  }],
  melos: [{
    type: "qcm", texte: "En 416 av. J.-C., l'île de Mélos veut rester neutre et en appelle à la justice. Que lui répond Athènes, selon Thucydide ?",
    choix: ["La justice ne vaut qu'entre égaux", "Un oracle a ordonné votre chute", "Vos ancêtres ont trahi Athènes", "Payez et vous serez épargnés"], reponse: 0,
    explication: "« La justice ne vaut qu'entre égaux » : les forts font ce qu'ils peuvent, les faibles subissent ce qu'ils doivent. Mélos refuse de se soumettre. Athènes assiège l'île, tue les hommes et réduit les femmes et les enfants en esclavage. Le Loup et l'Agneau, version antique.",
  }],
  fifa: [{
    type: "qcm", texte: "Dans quelle ville la FIFA a-t-elle été fondée, en 1904 ?",
    choix: ["Paris", "Londres", "Zurich", "Bruxelles"], reponse: 0,
    explication: "À Paris, le 21 mai 1904, au 229 rue Saint-Honoré. La France, la Belgique, le Danemark, les Pays-Bas et la Suisse étaient présents ; l'Angleterre ne l'a rejointe qu'en 1905.",
  }, {
    type: "qcm", texte: "Et dans quelle langue est son nom officiel ?",
    choix: ["En français", "En anglais", "En allemand", "En latin"], reponse: 0,
    explication: "En français : Fédération internationale de football association. Un héritage de sa fondation à Paris.",
  }],
  dexaie: [{
    type: "qcm", texte: "Que criaient les chevaliers normands en partant au combat ?",
    choix: ["« Dex aïe ! »", "« Montjoie ! »", "« Saint-Georges ! »", "« Santiago ! »"], reponse: 0,
    explication: "« Dex aïe ! », c'est-à-dire « Dieu, notre aide ! ». Ils le lançaient sur les champs de bataille d'Europe et du Proche-Orient, pour signaler leur présence et leur origine.",
  }],
  statue: [{
    type: "qcm", texte: "Quelle est la plus grande statue du monde ?",
    choix: ["La statue de l'Unité, en Inde", "La statue de la Liberté, aux États-Unis", "Le Christ rédempteur, au Brésil", "Le Bouddha du temple de la Source, en Chine"], reponse: 0,
    explication: "La statue de l'Unité : 182 mètres, 240 avec son socle. Inaugurée en 2018 dans l'État du Gujarat, elle représente Sardar Vallabhbhai Patel, l'un des pères de l'Inde indépendante.",
  }],
  bosch: [{
    type: "qcm", texte: "Dans Le Jardin des délices de Jérôme Bosch, qu'est-ce qui est peint sur les fesses d'un damné ?",
    choix: ["Une partition", "La signature du peintre", "Une carte du monde", "Une prière en latin"], reponse: 0,
    explication: "Une partition : sur le panneau de l'Enfer, en bas à gauche, un damné porte une portée musicale sur le postérieur. Une étudiante américaine l'a transcrite et enregistrée, et le morceau a fait le tour d'Internet en 2014.",
  }],
  bocklin: [{
    type: "qcm", texte: "Combien de versions de L'Île des morts Arnold Böcklin a-t-il peintes ?", ordre: true,
    choix: ["Une seule", "Deux", "Cinq", "Douze"], reponse: 2,
    explication: "Cinq, entre 1880 et 1886. Une sixième a été achevée en 1901 par son fils Carlo, avec lui. L'une des versions a été détruite à Berlin pendant la Seconde Guerre mondiale.",
  }],
  droste: [{
    type: "qcm", texte: "L'effet Droste, cette image qui se répète à l'intérieur d'elle-même, doit son nom à…",
    choix: ["Une marque de cacao", "Un mathématicien néerlandais", "Un peintre flamand", "Une ville allemande"], reponse: 0,
    explication: "Une marque de cacao : les boîtes Droste montraient une infirmière portant un plateau avec une boîte identique, sur laquelle on retrouvait la même scène, et ainsi de suite.",
  }],
  beksinski: [{
    type: "qcm", texte: "Quel titre le peintre polonais Zdzisław Beksiński donnait-il à ses tableaux ?",
    choix: ["Aucun", "Un prénom", "Un mot inventé", "Un lieu"], reponse: 0,
    explication: "Aucun : il ne nommait ni ses dessins ni ses tableaux, car ses œuvres n'avaient pas à être expliquées. Il disait ne pas savoir lui-même ce qu'elles signifiaient.",
  }],
  quebec: [{
    type: "qcm", texte: "Sous quel titre la comédie Le Plus Escroc des deux (1988) est-elle sortie au Québec ?",
    choix: ["Deux fils de pute", "Deux beaux salauds", "Sales Escrocs", "Les Deux Arnaqueurs"], reponse: 0,
    explication: "« Deux fils de pute ». Le film de Frank Oz, avec Steve Martin et Michael Caine, s'appelle Dirty Rotten Scoundrels en version originale.",
  }],
  katerine: [{
    type: "qcm", texte: "Dans le film d'animation Jim Queen, quel rôle tient Philippe Katerine ?",
    choix: ["Une prostate", "Un appendice", "Un rein", "Une vessie"], reponse: 0,
    explication: "Une prostate. Selon le coréalisateur Marco Nguyen, l'idée venait du producteur, et Katerine a accepté justement parce qu'il s'agissait d'une prostate.",
  }],
  zidane: [{
    type: "qcm", texte: "Pour ses proches, Zinédine Zidane s'appelle…",
    choix: ["Yazid", "Zinou", "Didou", "Zaza"], reponse: 0,
    explication: "Yazid, ou Yaz. C'est son deuxième prénom : il est né Zinédine Yazid Zidane, à Marseille, de parents algériens.",
  }],
  cage: [{
    type: "qcm", texte: "Quel lien de parenté unit Nicolas Cage à Francis Ford Coppola ?",
    choix: ["C'est son neveu", "C'est son fils", "C'est son cousin", "Aucun"], reponse: 0,
    explication: "C'est son neveu : son père, August Coppola, est le frère de Francis Ford Coppola. Nicolas Cage, né Nicolas Coppola, est donc le cousin germain de Sofia Coppola.",
  }],
  trump: [{
    type: "qcm", texte: "Dans quel film de Noël Donald Trump fait-il une apparition ?",
    choix: ["Maman, j'ai encore raté l'avion", "Love Actually", "Elf", "Le Grinch"], reponse: 0,
    explication: "Maman, j'ai encore raté l'avion (1992). Il croise Kevin dans le hall de l'hôtel Plaza, qui lui appartenait. Selon le réalisateur Chris Columbus, cette apparition était la condition pour tourner dans l'hôtel.",
  }],
  mclain: [{
    type: "qcm", texte: "Dans quel film entend-on aussi la voix de GLaDOS, l'intelligence artificielle du jeu Portal ?",
    choix: ["Pacific Rim", "Interstellar", "Her", "Wall-E"], reponse: 0,
    explication: "Pacific Rim (2013) : l'actrice Ellen McLain y prête sa voix aux ordinateurs de bord des robots géants. Les joueurs l'ont reconnue dès la première bande-annonce.",
  }],
  mouthwashing: [{
    type: "qcm", texte: "Quel studio a créé le jeu d'horreur Mouthwashing (2024) ?",
    choix: ["Wrong Organ", "Critical Reflex", "Puppet Combo", "Team Cherry"], reponse: 0,
    explication: "Wrong Organ. Critical Reflex en est l'éditeur, ce qui explique que son nom apparaisse souvent à côté de celui du jeu.",
  }],
  forhonor: [{
    type: "qcm", texte: "D'où vient l'idée du jeu de combat For Honor ?",
    choix: ["D'un cours d'épée longue allemande", "D'un documentaire sur les samouraïs", "D'une reconstitution médiévale au Québec", "D'un tournoi de kendo à Tokyo"], reponse: 0,
    explication: "D'un cours d'épée longue allemande : son directeur créatif, Jason VandenBerghe, voulait reproduire ces gardes avec le stick droit de la manette.",
  }],
  ecureuil: [{
    type: "qcm", texte: "Squirrel with a Gun (« écureuil avec un flingue »), c'est…",
    choix: ["Un vrai jeu vidéo", "Un faux jeu inventé pour un mème", "Un court-métrage Pixar", "Une bande dessinée de Gotlib"], reponse: 0,
    explication: "Un vrai jeu vidéo, sorti en 2024 : développé par Dee Dee Creations et édité par Maximum Entertainment, il est sorti sur PC le 29 août 2024. On y incarne, comme promis, un écureuil armé.",
  }],
  justin: [{
    type: "qcm", texte: "De quel site est né Twitch ?",
    choix: ["Justin.tv", "Ustream", "Dailymotion", "Livestream"], reponse: 0,
    explication: "Justin.tv. Twitch en était la catégorie « jeux vidéo », qui attirait plus de spectateurs que toutes les autres réunies. Elle est devenue un service à part en 2011.",
  }],
  baseball: [{
    type: "qcm", texte: "Combien de matchs chaque équipe de la MLB joue-t-elle pendant la saison régulière ?", ordre: true,
    choix: ["82", "120", "162", "200"], reponse: 2,
    explication: "162, à peu près un par jour pendant six mois. 82, c'est le nombre de matchs d'une saison régulière en NBA ou en NHL.",
  }],
  around: [{
    type: "qcm", texte: "Combien de fois la phrase « Around the world » est-elle répétée dans le morceau de Daft Punk ?", ordre: true,
    choix: ["44 fois", "88 fois", "144 fois", "200 fois"], reponse: 2,
    explication: "144 fois, selon le décompte le plus souvent cité pour la version de l'album Homework (1997). Ce sont les seules paroles du morceau.",
  }],
  bestof: [{
    type: "qcm", texte: "The Best of Both Worlds (2002) est un album commun de…",
    choix: ["R. Kelly et Jay-Z", "Dieudonné et Élie", "Richard Pryor et Bill Cosby", "Hitler et Mussolini"], reponse: 0,
    explication: "R. Kelly et Jay-Z. Le duo a publié une suite, Unfinished Business, en 2004.",
  }],
  ritz: [{
    type: "qcm", texte: "Qui est crédité comme coauteur de Sexual Healing, de Marvin Gaye ?",
    choix: ["Son biographe", "Son avocat", "Son coiffeur", "Son chauffeur"], reponse: 0,
    explication: "Son biographe, David Ritz. Il travaillait avec Gaye sur sa biographie quand il lui a suggéré l'expression « sexual healing ». Il n'a obtenu son crédit qu'après un procès réglé avec la succession du chanteur.",
  }],
  zoubida: [{
    type: "qcm", texte: "Combien de semaines La Zoubida, de Lagaf', est-elle restée numéro 1 des ventes en France ?", ordre: true,
    choix: ["1", "4", "11", "25"], reponse: 2,
    explication: "11 semaines, non consécutives, en 1991. La chanson a aussi été certifiée disque de platine.",
  }],
  grenoble: [{
    type: "qcm", texte: "Qu'ont en commun le chanteur Michel Fugain et le vidéaste Mister V ?",
    choix: ["Ils sont nés à Grenoble", "Ils sont cousins", "Ils sont demi-frères", "Ils sont nés à Marseille"], reponse: 0,
    explication: "Ils sont nés à Grenoble, à deux générations d'écart : Mister V, de son vrai nom Yvick Letexier, y est né le 14 août 1993.",
  }],
  glabre: [{
    type: "qcm", texte: "Que veut dire « glabre » ?",
    choix: ["Sans poils", "Très pâle", "Collant", "Timide"], reponse: 0,
    explication: "Sans poils. Glabre se dit d'une peau, d'un visage ou d'une plante dépourvus de poils. Un visage glabre est imberbe ou rasé de près.",
  }],
  laudatif: [{
    type: "qcm", texte: "Un discours « laudatif »…",
    choix: ["fait l'éloge de quelqu'un", "se moque de quelqu'un", "dure très longtemps", "n'a aucun sens"], reponse: 0,
    explication: "Il fait l'éloge de quelqu'un. Laudatif signifie « qui contient un éloge, qui loue ». Le mot vient du latin laudare, « louer ».",
  }],
  berezina: [{
    type: "qcm", texte: "Que veut dire « c'est la bérézina » ?",
    choix: ["C'est un désastre complet", "Il fait un froid glacial", "C'est la fête", "C'est très loin"], reponse: 0,
    explication: "C'est un désastre. L'expression vient de la Bérézina, rivière de l'actuelle Biélorussie, que l'armée de Napoléon a franchie en novembre 1812 au prix de très lourdes pertes.",
  }],
  noosphere: [{
    type: "qcm", texte: "La « noosphère », c'est…",
    choix: ["La sphère de la pensée humaine", "Une couche de l'atmosphère", "Une partie de l'œil", "Une figure de géométrie"], reponse: 0,
    explication: "La sphère de la pensée humaine : l'idée que la pensée et les connaissances humaines forment une couche qui enveloppe la Terre, comme la biosphère. Le mot vient du grec noos, « esprit ».",
  }],
  poioumenon: [{
    type: "qcm", texte: "Un « poioumenon », c'est…",
    choix: ["Une œuvre qui raconte sa propre création", "Un poème qui ne rime jamais", "Un personnage qui n'apparaît qu'une fois", "Une erreur de traduction célèbre"], reponse: 0,
    explication: "Une œuvre de métafiction qui raconte le processus de sa création, parfois l'écriture de l'œuvre elle-même. Le terme a été proposé par le critique Alastair Fowler.",
  }],
  manicule: [{
    type: "qcm", texte: "Comment s'appelle la petite main à l'index tendu ☞ ?",
    choix: ["Une manicule", "Un index", "Une digitule", "Un pointeur"], reponse: 0,
    explication: "Une manicule. Les lecteurs du Moyen Âge et de la Renaissance en dessinaient dans la marge des manuscrits et des livres pour signaler un passage important.",
  }],
  eigengrau: [{
    type: "qcm", texte: "Que voit l'œil humain dans l'obscurité totale ?",
    choix: ["Un gris très foncé", "Un noir parfait", "Un bleu nuit", "Des étoiles colorées"], reponse: 0,
    explication: "Un gris très foncé, appelé eigengrau (« gris intrinsèque » en allemand). Même sans lumière, le nerf optique continue de transmettre des signaux : une sorte de bruit de fond visuel.",
  }],
  naute: [{
    type: "qcm", texte: "Astronaute pour les Américains, cosmonaute pour les Russes… et pour les Français ?",
    choix: ["Spationaute", "Taïkonaute", "Aéronaute", "Stellonaute"], reponse: 0,
    explication: "Spationaute. Et pour les Chinois, on parle de taïkonaute. Selon le Larousse, ces distinctions s'effacent avec les équipages internationaux, et « astronaute » s'impose de plus en plus pour tout le monde.",
  }],
  albanais: [{
    type: "qcm", texte: "Qu'est-ce qui sépare les deux grands dialectes de l'albanais ?",
    choix: ["Un fleuve", "Une chaîne de montagnes", "Une frontière", "La religion"], reponse: 0,
    explication: "Un fleuve, le Shkumbin, à peu près : le guègue se parle au nord, le tosque au sud.",
  }],
  charolais: [{
    type: "qcm", texte: "Le charolais, c'est…",
    choix: ["Une race de vache et un fromage", "Une race de vache et un vin", "Un fromage et une danse", "Une race de cheval et un vin"], reponse: 0,
    explication: "Une race de vache et un fromage. La race bovine charolaise est connue dans le monde entier, et le charolais est aussi un fromage de chèvre de Bourgogne, protégé par une appellation d'origine (AOP).",
  }],
};

// Séries à compléter dans la collection.
export const SERIES = [
  { id: "vivant", nom: "Le vivant", ids: ["coucou", "hiboux", "pizzly", "dragonnier", "cachalot", "requins"] },
  { id: "corps", nom: "Le corps", ids: ["cerveau", "etrier", "eigengrau"] },
  { id: "physique", nom: "Physique", ids: ["tumbler", "femto", "eiffel"] },
  { id: "histoire", nom: "Histoire", ids: ["farriner", "melos", "dexaie", "cleopatre"] },
  { id: "arts", nom: "Beaux-arts", ids: ["bosch", "bocklin", "droste", "beksinski", "statue"] },
  { id: "ecrans", nom: "Écrans", ids: ["quebec", "katerine", "cage", "trump", "mclain"] },
  { id: "manettes", nom: "Manettes", ids: ["mouthwashing", "forhonor", "ecureuil", "justin", "nintendo"] },
  { id: "stades", nom: "Stades", ids: ["zidane", "baseball", "fifa"] },
  { id: "disques", nom: "Disques", ids: ["around", "bestof", "ritz", "zoubida", "grenoble"] },
  { id: "mots", nom: "Dictionnaire", ids: ["glabre", "laudatif", "berezina", "noosphere", "poioumenon", "manicule", "naute", "albanais", "charolais"] },
];

// Pépites : les faits les plus étonnants, qui rapportent double.
export const PEPITES = ["quebec", "bosch", "cleopatre", "requins", "katerine", "tumbler", "droste", "cachalot"];

export const NIVEAUX = [
  { xp: 0, nom: "Curieux" },
  { xp: 60, nom: "Fouineur" },
  { xp: 150, nom: "Dénicheur" },
  { xp: 280, nom: "Érudit" },
  { xp: 450, nom: "Savant" },
  { xp: 700, nom: "Encyclopédiste" },
  { xp: 1000, nom: "Oracle" },
];
