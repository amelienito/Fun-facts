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
    type: "qcm", texte: "Combien d'années séparent la construction de la grande pyramide de Gizeh et la naissance de Cléopâtre ?", ordre: true,
    choix: ["Environ 500 ans", "Environ 1 000 ans", "Environ 2 500 ans", "Environ 4 000 ans"], reponse: 2,
    explication: "Environ 2 500 ans. La pyramide est achevée au début du XXVe siècle av. J.-C., Cléopâtre naît en 70 ou 69 av. J.-C. Elle est donc plus proche du premier iPhone (2007, environ 2 075 ans plus tard) que de la pyramide.",
  }],
  requins: [{
    type: "qcm", texte: "Qui est apparu en premier sur Terre ?",
    choix: ["Les requins", "Les arbres"], reponse: 0,
    explication: "Les requins. Leurs plus anciennes traces sont des écailles d'environ 450 millions d'années, alors que la plus ancienne forêt fossile connue, à Cairo, dans l'État de New York, a environ 386 millions d'années.",
  }],
  nintendo: [
    {
      type: "placer", texte: "Nintendo a été fondée à Kyoto. Place sa création sur la frise.", sujet: "Nintendo",
      min: 1666, max: 2007, gauche: "Grand Incendie de Londres", gaucheDate: "1666", droite: "Premier iPhone", droiteDate: "2007",
      val: 1889, valTexte: "1889", tol: 40,
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
    type: "qcm", texte: "Quand on entaille le tronc du dragonnier, un arbre de l'île de Socotra, de quelle couleur est la résine qui en coule ?",
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
    type: "qcm", texte: "Le « dialogue mélien » : l'île de Mélos invoque la justice pour rester neutre. Que lui répond Athènes ?",
    choix: ["La justice ne vaut qu'entre égaux", "Un oracle a ordonné votre chute", "Vos ancêtres ont trahi Athènes", "Payez et vous serez épargnés"], reponse: 0,
    explication: "Que la justice ne vaut qu'entre égaux : les forts font ce qu'ils peuvent, les faibles subissent ce qu'ils doivent. Thucydide reconstitue cette négociation de 416 av. J.-C., un texte encore étudié en relations internationales.",
  }],
  fifa: [{
    type: "qcm", texte: "Dans quelle ville la FIFA a-t-elle été fondée, en 1904 ?",
    choix: ["Paris", "Londres", "Zurich", "Bruxelles"], reponse: 0,
    explication: "À Paris, le 21 mai 1904, au 229 rue Saint-Honoré. La France, la Belgique, le Danemark, les Pays-Bas et la Suisse étaient présents ; l'Angleterre ne l'a rejointe qu'en 1905.",
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
    type: "qcm", texte: "Quel titre ce peintre polonais du XXe siècle donnait-il à ses tableaux ?",
    choix: ["Aucun", "Un prénom", "Un mot inventé", "Un lieu"], reponse: 0,
    explication: "Aucun : il ne nommait ni ses dessins ni ses tableaux, car ses œuvres n'avaient pas à être expliquées. Il disait ne pas savoir lui-même ce qu'elles signifiaient.",
  }, {
    type: "qcm", texte: "Et comment s'écrit le nom de ce peintre ?",
    choix: ["Zdzisław Beksiński", "Zdzislaw Bekszinski", "Zdzisłav Beksinsky", "Zdźisław Bekśinski"], reponse: 0,
    explication: "Zdzisław Beksiński, avec un « ł » barré et un « ń » accentué.",
  }],
  quebec: [{
    type: "qcm", casse: false, texte: "Sous quel titre la comédie Le Plus Escroc des deux (1988) est-elle sortie au Québec ?",
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
    type: "qcm", casse: false, texte: "Dans quel film de Noël Donald Trump fait-il une apparition ?",
    choix: ["Maman, j'ai encore raté l'avion", "Love Actually", "Elf", "Le Grinch"], reponse: 0,
    explication: "Maman, j'ai encore raté l'avion (1992). Il croise Kevin dans le hall de l'hôtel Plaza, qui lui appartenait. Selon le réalisateur Chris Columbus, cette apparition était la condition pour tourner dans l'hôtel.",
  }, {
    type: "multi", texte: "Et dans lesquels de ces films apparaît-il aussi ? Touche-les tous, puis valide.",
    choix: ["Zoolander", "L'Amour sans préavis", "Wall Street : L'argent ne dort jamais", "Maman, j'ai raté l'avion (le premier)", "Retour vers le futur II", "Le Loup de Wall Street"],
    bonnes: [0, 1, 2],
    explication: "Zoolander (2001), L'Amour sans préavis (2002) et Wall Street : L'argent ne dort jamais (2010). Pas dans le premier Maman, j'ai raté l'avion. Et le Biff de Retour vers le futur II est seulement inspiré de lui.",
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
  ecureuil: [{
    type: "qcm", texte: "Squirrel with a Gun (« écureuil avec un flingue »), c'est…",
    choix: ["Un vrai jeu vidéo", "Un faux jeu inventé pour un mème", "Un court-métrage Pixar", "Une bande dessinée de Pénélope Bagieux"], reponse: 0,
    explication: "Un vrai jeu vidéo, sorti en 2024 : développé par Dee Dee Creations et édité par Maximum Entertainment, il est sorti sur PC le 29 août 2024. On y incarne, comme promis, un écureuil armé.",
  }],
  justin: [{
    type: "qcm", texte: "De quel site est né Twitch ?",
    choix: ["Justin.tv", "Ustream", "Dailymotion", "Livestream"], reponse: 0,
    explication: "Justin.tv. Twitch en était la catégorie « jeux vidéo », qui attirait plus de spectateurs que toutes les autres réunies. Elle est devenue un service à part en 2011.",
  }],
  eswc: [{
    type: "qcm", texte: "En quelle année la Coupe du monde des jeux vidéo (ESWC) a-t-elle lancé un tournoi Counter-Strike 100 % féminin ?", ordre: true,
    choix: ["2003", "2009", "2015", "2021"], reponse: 0,
    explication: "En 2003, dès la toute première édition de l'ESWC : huit équipes invitées.",
  }, {
    type: "qcm", texte: "Et où se jouait-il ?",
    choix: ["Au Futuroscope, près de Poitiers", "À Séoul", "À Las Vegas", "Au Carrousel du Louvre, à Paris"], reponse: 0,
    explication: "Au Futuroscope, près de Poitiers. Le tournoi féminin passera ensuite au Carrousel du Louvre, à Paris, en 2005, avec 24 équipes entièrement féminines.",
  }],
  baseball: [{
    type: "estimer", texte: "Combien de matchs chaque équipe de la MLB joue-t-elle pendant la saison régulière ?",
    min: 50, max: 250, val: 162, tol: 25, unite: "matchs",
    explication: "162, à peu près un par jour pendant six mois. 82, c'est le nombre de matchs d'une saison régulière en NBA ou en NHL.",
  }],
  around: [{
    type: "estimer", texte: "Combien de fois la phrase « Around the world » est-elle répétée dans le morceau de Daft Punk ?",
    min: 0, max: 300, val: 144, tol: 35, unite: "fois",
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
    type: "taper", texte: "Astronaute pour les Américains, cosmonaute pour les Russes… et pour les Français ?",
    accepte: ["Spationaute"],
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
  nessie: [{
    type: "taper", texte: "Comment surnomme-t-on le monstre du loch Ness ?",
    accepte: ["Nessie"],
    explication: "Nessie, tout simplement, d'après le nom du lac.",
  }, {
    type: "qcm", texte: "La plus célèbre photo de Nessie, publiée en 1934, montrait en réalité…",
    choix: ["Un sous-marin jouet avec une tête sculptée", "Un tronc d'arbre à la dérive", "Un éléphant de cirque en train de nager", "Une loutre photographiée de très près"], reponse: 0,
    explication: "Un sous-marin jouet surmonté d'un cou et d'une tête de serpent de mer. Christian Spurling, qui avait fabriqué la maquette, l'a avoué en 1994, soixante ans plus tard.",
  }],
  ankylosaure: [{
    type: "qcm", texte: "Au bout de sa queue, l'ankylosaure avait…",
    choix: ["Une massue en os", "Un dard venimeux", "Une nageoire", "Une touffe de plumes"], reponse: 0,
    explication: "Une massue en os : ses dernières vertèbres étaient soudées en une tige rigide terminée par un gros bloc osseux. Selon une étude, un coup pouvait briser les os d'un prédateur.",
  }],
  cadratin: [{
    type: "qcm", texte: "Le « cadratin », qui donne son nom au tiret long (—) et au demi-cadratin (–), vient d'un mot latin qui veut dire…",
    choix: ["« Carré »", "« Trait »", "« Plume »", "« Page »"], reponse: 0,
    explication: "« Carré » (quadratus) : le cadratin est un carré aussi large que la police est haute. Le tiret demi-cadratin en fait la moitié.",
  }],
  simpsonwave: [{
    type: "qcm", texte: "La « simpsonwave », apparue sur YouTube en 2016, c'est…",
    choix: ["Des extraits des Simpson montés sur de la musique vaporwave", "Une coiffure inspirée de celle de Marge", "Une danse tirée d'un épisode culte", "Les mèmes sur les « prédictions » des Simpson"], reponse: 0,
    explication: "Des scènes des Simpson filtrées façon vieille VHS, sur de la vaporwave. Le genre a été lancé en février 2016 par Lucien Hughes, un étudiant de Nottingham.",
  }],
  lej: [{
    type: "taper", texte: "Après la victoire des Bleus au Mondial 2018, le trio L.E.J sort un hymne : « Liberté, Égalité… » ?",
    accepte: ["Mbappé"],
    explication: "Mbappé ! Le clip « Liberté, Égalité, Mbappé » sort fin juillet 2018, pour le meilleur jeune joueur du Mondial, 19 ans à l'époque.",
  }],
};

// Séries à compléter dans la collection.
export const SERIES = [
  { id: "vivant", nom: "Le vivant", ids: ["coucou", "hiboux", "pizzly", "dragonnier", "cachalot", "requins", "ankylosaure"] },
  { id: "corps", nom: "Le corps", ids: ["cerveau", "etrier", "eigengrau"] },
  { id: "physique", nom: "Physique", ids: ["tumbler", "femto", "eiffel"] },
  { id: "histoire", nom: "Histoire", ids: ["farriner", "melos", "cleopatre", "nessie"] },
  { id: "arts", nom: "Beaux-arts", ids: ["bosch", "bocklin", "droste", "beksinski", "statue"] },
  { id: "ecrans", nom: "Écrans", ids: ["quebec", "katerine", "cage", "trump", "mclain"] },
  { id: "manettes", nom: "Manettes", ids: ["mouthwashing", "ecureuil", "justin", "nintendo", "eswc"] },
  { id: "stades", nom: "Stades", ids: ["zidane", "baseball", "fifa", "lej"] },
  { id: "disques", nom: "Disques", ids: ["around", "bestof", "ritz", "zoubida", "grenoble", "simpsonwave"] },
  { id: "mots", nom: "Dictionnaire", ids: ["glabre", "laudatif", "berezina", "poioumenon", "manicule", "naute", "albanais", "charolais", "cadratin"] },
];

// Pépites : les faits les plus étonnants, qui rapportent double.
export const PEPITES = ["quebec", "bosch", "cleopatre", "requins", "katerine", "tumbler", "droste", "cachalot"];

export const NIVEAUX = [
  { xp: 0, nom: "Curieux" },
  { xp: 3000, nom: "Fouineur" },
  { xp: 7500, nom: "Dénicheur" },
  { xp: 14000, nom: "Érudit" },
  { xp: 22500, nom: "Savant" },
  { xp: 35000, nom: "Encyclopédiste" },
  { xp: 50000, nom: "Oracle" },
];

// Faits dont l'objet ou la série trahirait la réponse : affichés en « ? » jusqu'à la révélation.
export const MYSTERES = new Set(["ecureuil", "hiboux"]);

// Frises : les questions à deux choix évidents se jouent sur une ligne du temps.
// Les choix restent dans l'ordre (gauche, droite). « cache » : le point apparaît après la réponse.
export const FRISES = {
  "requins:0": {
    min: -500, max: 0,
    gauche: { nom: "Il y a 500 millions d'années", date: "" },
    droite: { nom: "Aujourd'hui", date: "" },
    points: [
      { nom: "Requins", val: -450, date: "≈ 450 millions d'années", cache: true },
      { nom: "Arbres", val: -386, date: "≈ 386 millions d'années (plus vieille forêt fossile)", cache: true },
    ],
  },
};

// Intermède « Plus ou moins » : chiffres tirés des explications déjà vérifiées.
export const NOMBRES = [
  { id: "baseball", libelle: "matchs par équipe dans une saison régulière de MLB", val: 162 },
  { id: "around", libelle: "fois « Around the world » dans le morceau de Daft Punk", val: 144 },
  { id: "zoubida", libelle: "semaines de La Zoubida à la première place des ventes", val: 11 },
  { id: "bocklin", libelle: "versions de L'Île des morts peintes par Böcklin", val: 5 },
  { id: "statue", libelle: "mètres de haut pour la statue de l'Unité (sans socle)", val: 182 },
  { id: "ritz", libelle: "autobiographies coécrites par David Ritz", val: 36 },
  { id: "eiffel", libelle: "centimètres : la courbe que trace le sommet de la tour Eiffel par grand soleil", val: 15 },
  { id: "requins", libelle: "millions d'années : l'âge des plus anciennes traces de requins", val: 450 },
  { id: "requins", libelle: "millions d'années : l'âge de la plus vieille forêt fossile connue", val: 386 },
];

// Intermède « Les paires » : un mot, sa définition.
export const PAIRES = [
  { id: "glabre", mot: "Glabre", def: "Sans poils" },
  { id: "laudatif", mot: "Laudatif", def: "Qui fait l'éloge de quelqu'un" },
  { id: "berezina", mot: "Bérézina", def: "Un désastre complet" },
  { id: "poioumenon", mot: "Poioumenon", def: "Une œuvre qui raconte sa propre création" },
  { id: "manicule", mot: "Manicule", def: "La petite main à l'index tendu ☞" },
  { id: "eigengrau", mot: "Eigengrau", def: "Le gris que l'œil voit dans le noir total" },
  { id: "naute", mot: "Spationaute", def: "Astronaute, version française" },
];
