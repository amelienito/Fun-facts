// Salles tirées des notes d'Amélien (vérifiées le 25 octobre 2026).
// Même format que dans data.js. « objet » = type d'objet 3D, avec une variante après « : » si besoin.

const S = {
  inpnCoucou: { nom: "INPN (Muséum national d'Histoire naturelle)", titre: "Cuculus canorus, coucou gris", url: "https://inpn.mnhn.fr/espece/cd_nom/3465" },
  abcHiboux: { nom: "American Bird Conservancy", titre: "Why Are Owl Legs So Long?", url: "https://abcbirds.org/news/why-are-owl-legs-so-long-the-science-behind-those-lengthy-bird-limbs/" },
  natgeoPizzly: { nom: "National Geographic", titre: "Grizzly-Polar Bear Hybrid Found—But What Does It Mean?", url: "https://www.nationalgeographic.com/animals/article/grizzly-polar-bear-hybrid-animals" },
  jstorDragon: { nom: "JSTOR Daily", titre: "Plant of the Month: The Dragon Tree", url: "https://daily.jstor.org/plant-of-the-month-the-dragon-tree" },
  britCachalot: { nom: "Encyclopædia Britannica", titre: "How Did the Sperm Whale Get Its Name?", url: "https://www.britannica.com/story/how-did-the-sperm-whale-get-its-name" },
  ncbiOs: { nom: "NCBI Bookshelf (StatPearls)", titre: "Anatomy, Head and Neck, Ear Ossicles", url: "https://www.ncbi.nlm.nih.gov/books/NBK570549/" },
  blHubert: { nom: "British Library", titre: "Robert Hubert and the Great Fire of London", url: "https://www.bl.uk/stories/blogs/posts/robert-hubert-and-the-great-fire-of-london" },
  wikiFarriner: { nom: "Wikipédia (en)", titre: "Thomas Farriner", url: "https://en.wikipedia.org/wiki/Thomas_Farriner" },
  britMelos: { nom: "Encyclopædia Britannica", titre: "Melian Dialogue", url: "https://www.britannica.com/topic/Melian-Dialogue" },
  thucydide: { nom: "Thucydide", titre: "La Guerre du Péloponnèse, livre V, chapitres 84 à 116" },
  fifaMusee: { nom: "Musée de la FIFA", titre: "1904 – The Foundation of FIFA", url: "https://editorial.fifamuseum.com/en/read/1904-the-foundation-of-fifa/" },
  wikiStatue: { nom: "Wikipédia (en)", titre: "Statue of Unity", url: "https://en.wikipedia.org/wiki/Statue_of_Unity" },
  dezeenStatue: { nom: "Dezeen", titre: "India unveils world's tallest statue", url: "https://www.dezeen.com/?p=1280423" },
  ropeTrick: { nom: "Wikipédia (en)", titre: "Rope trick effect", url: "https://en.wikipedia.org/wiki/Rope_trick_effect" },
  atomicArchive: { nom: "Atomic Archive", titre: "Early Fireball", url: "https://www.atomicarchive.com/media/photographs/fireball/fireball-4.html" },
  bipm: { nom: "BIPM (Bureau international des poids et mesures)", titre: "SI prefixes", url: "https://www.bipm.org/en/measurement-units/si-prefixes" },
  bipm1964: { nom: "BIPM", titre: "Résolution 8 de la 12e Conférence générale des poids et mesures (1964)", url: "https://www.bipm.org/en/committees/cg/cgpm/12-1964/resolution-8" },
  britCage: { nom: "Encyclopædia Britannica", titre: "How Is Sofia Coppola Related to Nicolas Cage?", url: "https://www.britannica.com/question/How-is-Sofia-Coppola-related-to-Nicolas-Cage" },
  britCageBio: { nom: "Encyclopædia Britannica", titre: "Nicolas Cage", url: "https://www.britannica.com/biography/Nicolas-Cage" },
  scmpTrump: { nom: "South China Morning Post", titre: "Donald Trump's most memorable appearances in TV and film", url: "https://scmp.com/magazines/style/entertainment/article/3265462/donald-trumps-most-memorable-appearances-tv-and-film-sex-and-city-fresh-prince-bel-air-and-nanny" },
  esrEswc2003: { nom: "ESReality", titre: "Electronic Sports World Cup 2003", url: "https://www.esreality.com/post/385348/electronic-sports-world-cup-2003/" },
  gdEswc2005: { nom: "Game Developer", titre: "About the ESWC 2005 Counter-Strike Women Masters", url: "https://gamedeveloper.com/press-release/about-the-eswc-2005-counter-strike-women-masters" },
  aaaEswc: { nom: "Team aAa", titre: "ESWC, une décennie à la loupe", url: "https://www.team-aaa.com/fr/breve/eswc-une-decennie-a-la-loupe_93847" },
  wikiTrumpFilms: { nom: "Wikipédia", titre: "Donald Trump filmography", url: "https://en.wikipedia.org/wiki/Donald_Trump_filmography" },
  irishTrump: { nom: "The Irish Post", titre: "Home Alone 2 director says Donald Trump bullied his way into movie", url: "https://www.irishpost.com/news/home-alone-2-director-says-donald-trump-bullied-his-way-into-movie-197727" },
  pcgMcLain: { nom: "PC Gamer", titre: "Yes, GLaDOS' voice is in Guillermo del Toro's Pacific Rim", url: "https://www.pcgamer.com/glados-voice-pacific-rim" },
  gdMouth: { nom: "Game Developer", titre: "Critical Reflex to publish Mouthwashing, Wrong Organ's story-driven psychological horror game", url: "https://www.gamedeveloper.com/press-release/critical-reflex-to-publish-mouthwashing-wrong-organ-s-story-driven-psychological-horror-game" },
  pcgHonor: { nom: "PC Gamer", titre: "For Honor: the sword fighting game no publisher would touch for 14 years", url: "https://www.pcgamer.com/for-honor-interview-wip" },
  gematsuEcureuil: { nom: "Gematsu", titre: "Squirrel with a Gun launches August 29 for PC", url: "https://gematsu.com/2024/06/squirrel-with-a-gun-launches-august-29-for-pc-this-fall-for-ps5-and-xbox-series" },
  tcJustin: { nom: "TechCrunch", titre: "Justin.tv Shuts Down To Let The Company Focus On Twitch (5 août 2014)", url: "https://techcrunch.com/2014/08/05/justin-tv-shuts-down-to-let-the-company-focus-on-twitch" },
  britMlb: { nom: "Encyclopædia Britannica", titre: "How Many Games Are in a Regular MLB Season?", url: "https://www.britannica.com/question/How-many-games-are-in-a-regular-MLB-season" },
  songfacts: { nom: "Songfacts", titre: "Around The World by Daft Punk", url: "https://www.songfacts.com/facts/daft-punk/around-the-world" },
  slantBest: { nom: "Slant Magazine", titre: "Review: R. Kelly & Jay-Z, The Best of Both Worlds", url: "https://www.slantmagazine.com/music/r-kelly-and-jay-z-the-best-of-both-worlds/" },
  openBosch: { nom: "Open Culture", titre: "Listen to a Recording of a Song Written on a Man's Butt in a Hieronymus Bosch Painting", url: "https://www.openculture.com/2014/02/song-written-on-mans-butt-in-bosch-painting.html" },
  wikiBocklin: { nom: "Wikipédia (en)", titre: "Isle of the Dead (painting)", url: "https://en.wikipedia.org/wiki/Isle_of_the_Dead_(painting)" },
  wikiDroste: { nom: "Wikipédia (en)", titre: "Droste effect", url: "https://en.wikipedia.org/wiki/Droste_effect" },
  aleteiaDroste: { nom: "Aleteia", titre: "How a Dutch cocoa tin was inspired by a medieval altarpiece", url: "https://aleteia.org/2017/12/13/how-a-dutch-cocoa-tin-was-inspired-by-a-medieval-altarpiece/" },
  cnrtlGlabre: { nom: "CNRTL", titre: "Définition de « glabre »", url: "https://www.cnrtl.fr/definition/glabre" },
  cnrtlLaudatif: { nom: "CNRTL", titre: "Définition de « laudatif »", url: "https://www.cnrtl.fr/definition/laudatif" },
  larousseBerezina: { nom: "Larousse", titre: "Définitions : bérézina, Bérézina", url: "https://www.larousse.fr/dictionnaires/francais/b%C3%A9r%C3%A9zina/186203" },
  wikiNoo: { nom: "Wikipédia (en)", titre: "Noosphere", url: "https://en.wikipedia.org/wiki/Noosphere" },
  unimelbManicule: { nom: "Bibliothèques de l'université de Melbourne", titre: "The Manicule: A Remnant of Readers Past", url: "https://blogs.unimelb.edu.au/librarycollections/?p=3479" },
  viceEigengrau: { nom: "Vice", titre: "Quelle couleur voit-on dans le noir total ? L'eigengrau, évidemment", url: "https://www.vice.com/fr/article/quelle-couleur-voit-on-dans-le-noir-total-leigengrau-evidemment/" },
  wikiMeta: { nom: "Wikipédia (en)", titre: "Metafiction (section « Poioumenon »)", url: "https://en.wikipedia.org/wiki/Metafiction" },
  larousseSpatio: { nom: "Larousse", titre: "Définitions : spationaute", url: "https://www.larousse.fr/dictionnaires/francais/spationaute/74067" },
  larousseTaiko: { nom: "Larousse", titre: "Définitions : taïkonaute", url: "https://www.larousse.fr/dictionnaires/francais/ta%C3%AFkonaute/10910021" },
  britTosk: { nom: "Encyclopædia Britannica", titre: "Tosk", url: "https://www.britannica.com/topic/Tosk-language" },
  mediafilmEscroc: { nom: "Mediafilm", titre: "Deux fils de pute (Dirty Rotten Scoundrels), de Frank Oz (1988)", url: "https://mediafilm.ca/films/1988/deux-fils-de-pute" },
  wikiEscroc: { nom: "Wikipédia", titre: "Le Plus Escroc des deux", url: "https://fr.wikipedia.org/wiki/Le_Plus_Escroc_des_deux" },
  wikiZidane: { nom: "Wikipédia", titre: "Zinédine Zidane", url: "https://fr.wikipedia.org/wiki/Zin%C3%A9dine_Zidane" },
  asRitz: { nom: "American Songwriter", titre: "Remembering When Marvin Gaye's Biographer Nudged Him Toward His Comeback Hit in 1982", url: "https://americansongwriter.com/remembering-when-marvin-gayes-biographer-nudged-him-toward-his-comeback-hit-in-1982/" },
  wikiDivided: { nom: "Wikipédia (en)", titre: "Divided Soul", url: "https://en.wikipedia.org/wiki/Divided_Soul" },
  wikiZoubida: { nom: "Wikipédia (en)", titre: "La Zoubida", url: "https://en.wikipedia.org/wiki/La_Zoubida" },
  septiemeJim: { nom: "Le Petit Septième", titre: "[Cannes] Jim Queen : Queentastic", url: "https://lepetitseptieme.ca/en/2026/05/20/cannes-jim-queen-queentastic/" },
  politisJim: { nom: "Politis", titre: "« Jim Queen », une prostate salutaire", url: "https://www.politis.fr/articles/2026/06/cinema-nguyen-athane-jim-queen-une-prostate-salutaire/" },
  wikiBeksinski: { nom: "Wikipédia (en)", titre: "Zdzisław Beksiński", url: "https://en.wikipedia.org/wiki/Zdzis%C5%82aw_Beksi%C5%84ski" },
  htNormands: { nom: "History Today", titre: "God and the Normans", url: "https://www.historytoday.com/archive/god-and-normans" },
  wikiRitz: { nom: "Wikipédia (en)", titre: "David Ritz", url: "https://en.wikipedia.org/wiki/David_Ritz" },
  wikiMisterV: { nom: "Wikipédia (en)", titre: "Mister V (rapper)", url: "https://en.wikipedia.org/wiki/Mister_V_(rapper)" },
  wikiFugain: { nom: "Wikipédia", titre: "Michel Fugain", url: "https://fr.wikipedia.org/wiki/Michel_Fugain" },
  reussirCharolais: { nom: "Réussir", titre: "Fromages : le charolais reconnu comme AOP", url: "https://www.reussir.fr/lesmarches/fromages-le-charolais-reconnu-comme-aop" },
};

export const SALLES_NOTES = [
  /* ---------- Nature ---------- */
  {
    id: "coucou", cat: "nature", objet: "nid", nom: "Nid avec un œuf de trop",
    porte: "Un oiseau qui ne fait pas le travail lui-même",
    questions: [
      {
        type: "vf", texte: "Le coucou gris couve lui-même ses œufs.", reponse: false,
        explication: "Le coucou gris est un parasite de couvée : la femelle pond dans le nid d'autres espèces d'oiseaux, qui couvent l'œuf puis nourrissent le poussin comme s'il était le leur.",
      },
    ],
    sources: [S.inpnCoucou],
    liens: [{ vers: "hiboux", porte: "Un autre oiseau qui cache bien son jeu" }],
  },
  {
    id: "hiboux", cat: "nature", objet: "hibou", nom: "Hibou perché",
    porte: "Ce que cachent les plumes",
    questions: [
      {
        type: "vf", texte: "Les hiboux ont de longues pattes, cachées sous leurs plumes.", reponse: true,
        explication: "Ce qu'on voit d'un hibou, c'est surtout le bas de la patte et les serres : la cuisse et le genou sont cachés dans le plumage. Ces longues pattes servent à chasser : le hibou attrape ses proies avec les serres, ce qui garde sa tête et ses yeux à distance.",
      },
    ],
    saviezVous: "La chouette lapone ne pèse qu'environ 1,4 kg, mais elle pourrait percer une croûte de neige assez solide pour supporter une personne de 80 kg.",
    sources: [S.abcHiboux],
    liens: [],
  },
  {
    id: "pizzly", cat: "nature", objet: "ours", nom: "Ours pizzly",
    porte: "Un ours qui n'est ni l'un ni l'autre",
    questions: [
      {
        type: "qcm", texte: "Un « pizzly », aussi appelé « grolar », est un hybride entre…",
        choix: ["Un ours blanc et un grizzli", "Un panda géant et un ours brun", "Un puma et un lynx", "Un loup et un husky"], reponse: 0,
        explication: "Un ours blanc et un grizzli. Ces hybrides existent aussi à l'état sauvage : des individus ont été observés et confirmés par des analyses génétiques dans l'Arctique canadien.",
      },
    ],
    sources: [S.natgeoPizzly],
    liens: [{ vers: "cachalot", porte: "Un géant au nom trompeur" }],
  },
  {
    id: "dragonnier", cat: "nature", objet: "arbre", nom: "Dragonnier de Socotra",
    porte: "Un arbre qui saigne",
    questions: [
      {
        type: "vf", texte: "Il existe un arbre dont la sève est rouge comme du sang.", reponse: true,
        explication: "Le dragonnier de Socotra (Dracaena cinnabari), qui ne pousse que sur l'île yéménite de Socotra, produit une résine rouge vif appelée « sang-de-dragon ». Elle est utilisée depuis l'Antiquité comme colorant et comme remède.",
      },
    ],
    sources: [S.jstorDragon],
    liens: [],
  },
  {
    id: "cachalot", cat: "nature", objet: "cachalot", nom: "Maquette de cachalot",
    porte: "Un géant des mers, et un malentendu",
    questions: [
      {
        type: "qcm", texte: "Comment dit-on « cachalot » en anglais ?",
        choix: ["Sperm whale", "Killer whale", "Pilot whale", "Humpback whale"], reponse: 0,
        explication: "Sperm whale. Les baleiniers prenaient le spermaceti, une substance huileuse contenue dans la tête de l'animal, pour du sperme. Le nom est resté.",
      },
    ],
    sources: [S.britCachalot],
    liens: [],
  },

  /* ---------- Sciences ---------- */
  {
    id: "etrier", cat: "sciences", objet: "os", nom: "Étrier (agrandi)",
    porte: "Le plus discret de tes os",
    questions: [
      {
        type: "vf", texte: "Le plus petit os du corps humain se trouve dans le pied.", reponse: false,
        explication: "Il se trouve dans l'oreille moyenne : c'est l'étrier, l'un des trois osselets qui transmettent les vibrations du tympan à l'oreille interne. Il doit son nom à sa forme.",
      },
    ],
    sources: [S.ncbiOs],
    liens: [],
  },
  {
    id: "tumbler", cat: "sciences", objet: "boulefeu", nom: "Boule de feu à pointes",
    porte: "Quelques millisecondes dans le désert du Nevada",
    questions: [
      {
        type: "vf", texte: "Sur certaines photos d'essais nucléaires, des pointes sortent de la boule de feu à cause de simples câbles.", reponse: true,
        explication: "C'est l'« effet rope trick ». La lumière intense de la boule de feu chauffe les haubans qui tiennent la tour de tir : ils se vaporisent et forment ces pointes. Il a été photographié notamment lors de l'opération Tumbler-Snapper, au Nevada, en 1952.",
      },
    ],
    saviezVous: "Ces images ont été prises avec des caméras rapatronic, conçues notamment par Harold Edgerton. Chaque caméra ne prenait qu'une seule photo, avec une exposition d'environ trois microsecondes : il fallait en aligner plusieurs pour obtenir une séquence.",
    note: "Le physicien John Malik, qui a nommé l'effet, a montré que des câbles peints en noir l'accentuaient, et que de la peinture réfléchissante ou de l'aluminium le faisaient disparaître.",
    sources: [S.ropeTrick, S.atomicArchive],
    liens: [{ vers: "femto", porte: "Des temps encore plus courts", transition: "Trois microsecondes, c'est déjà très court. On peut descendre beaucoup plus bas." }],
  },
  {
    id: "femto", cat: "sciences", objet: "chrono", nom: "Chronomètre de précision",
    porte: "Une durée presque impossible à imaginer",
    questions: [
      {
        type: "qcm", texte: "Une femtoseconde, c'est…",
        choix: ["10⁻⁹ seconde", "10⁻¹² seconde", "10⁻¹⁵ seconde", "10⁻¹⁸ seconde"], reponse: 2,
        explication: "10⁻¹⁵ seconde, soit un millionième de milliardième de seconde. 10⁻⁹, c'est la nanoseconde, 10⁻¹² la picoseconde et 10⁻¹⁸ l'attoseconde.",
      },
    ],
    saviezVous: "Les préfixes « femto » et « atto » ont été ajoutés au Système international d'unités en 1964.",
    sources: [S.bipm, S.bipm1964],
    liens: [],
  },

  /* ---------- Histoire ---------- */
  {
    id: "farriner", cat: "histoire", objet: "pain", nom: "Miche de Pudding Lane",
    porte: "Une boulangerie, une nuit de septembre",
    questions: [
      {
        type: "vf", texte: "Le Grand Incendie de Londres, en 1666, est parti d'une boulangerie.", reponse: true,
        explication: "Le feu démarre dans la boulangerie de Thomas Farriner, sur Pudding Lane. Ce boulanger était connu pour avoir fourni du pain à la Royal Navy.",
      },
    ],
    saviezVous: "Un horloger français, Robert Hubert, avoue avoir allumé l'incendie. Farriner et ses enfants signent l'acte d'accusation, et Hubert est pendu le 27 octobre 1666. Pourtant, le capitaine de son navire témoigne qu'il n'est arrivé en Angleterre que deux jours après le début du feu. Farriner meurt en 1670.",
    note: "Le rôle de Farriner dans l'accusation repose sur une transcription d'archives de la City de Londres, citée par la page Wikipédia qui lui est consacrée.",
    sources: [S.blHubert, S.wikiFarriner],
    liens: [],
  },
  {
    id: "melos", cat: "histoire", objet: "colonne", nom: "Colonne de Mélos",
    porte: "Une île qui voulait rester neutre",
    questions: [
      {
        type: "vf", texte: "Au Ve siècle av. J.-C., Athènes a rasé une île parce qu'elle voulait rester neutre.", reponse: true,
        explication: "En 416 av. J.-C., Athènes somme l'île de Mélos de se soumettre. Les Méliens refusent, plaident la neutralité et en appellent à la justice. Athènes assiège l'île, tue les hommes et réduit les femmes et les enfants en esclavage.",
      },
    ],
    saviezVous: "Les Méliens ont refusé de se soumettre. Athènes a assiégé l'île, tué les hommes et réduit les femmes et les enfants en esclavage.",
    note: "Selon Thucydide, Mélos était une colonie fondée par Sparte, ce qui explique la méfiance d'Athènes. Une île, donc, et non Sparte elle-même.",
    sources: [S.britMelos, S.thucydide],
    liens: [],
  },
  {
    id: "fifa", cat: "histoire", objet: "ballon", nom: "Ballon de 1904",
    porte: "Un sport anglais, une adresse parisienne",
    questions: [
      {
        type: "vf", texte: "La FIFA a été fondée en Angleterre, berceau du football.", reponse: false,
        explication: "Elle a été fondée à Paris, le 21 mai 1904, au 229 rue Saint-Honoré. Les représentants de la France, de la Belgique, du Danemark, des Pays-Bas et de la Suisse étaient présents ; l'Allemagne, l'Espagne et la Suède ont rejoint le mouvement à distance.",
      },
    ],
    saviezVous: "L'Angleterre n'était pas là : sa fédération s'est excusée de son absence et n'a rejoint la FIFA qu'en 1905.",
    sources: [S.fifaMusee],
    liens: [{ vers: "baseball", porte: "De l'autre côté de l'Atlantique, un autre sport" }, { vers: "zidane", porte: "Un enfant de Marseille" }],
  },

  {
    id: "dexaie", cat: "histoire", objet: "bouclier", nom: "Bouclier normand",
    porte: "Un cri qui traversait les champs de bataille",
    questions: [
      {
        type: "qcm", texte: "Que criaient les chevaliers normands en partant au combat ?",
        choix: ["« Dex aïe ! »", "« Montjoie ! »", "« Saint-Georges ! »", "« Santiago ! »"], reponse: 0,
        explication: "« Dex aïe ! », c'est-à-dire « Dieu, notre aide ! ». Les chevaliers normands le lançaient sur les champs de bataille d'Europe et du Proche-Orient, pour signaler leur présence et leur origine. Parmi les Français, ils étaient les seuls à revendiquer par leur cri un lien particulier avec Dieu.",
      },
    ],
    sources: [S.htNormands],
    liens: [{ vers: "melos", porte: "Une autre guerre, bien plus ancienne" }],
  },

  /* ---------- Art ---------- */
  {
    id: "statue", cat: "art", objet: "statue", nom: "Statue de l'Unité (réduction)",
    porte: "La plus haute de toutes",
    questions: [
      {
        type: "qcm", texte: "Quelle est la plus grande statue du monde ?",
        choix: ["La statue de la Liberté, aux États-Unis", "La statue de l'Unité, en Inde", "Le Christ rédempteur, au Brésil", "Le Bouddha du temple de la Source, en Chine"], reponse: 1,
        explication: "La statue de l'Unité, en Inde : 182 mètres, et 240 mètres avec son socle. Inaugurée en 2018 dans l'État du Gujarat, elle représente Sardar Vallabhbhai Patel, l'un des pères de l'Inde indépendante.",
      },
    ],
    saviezVous: "Elle dépasse de 54 mètres l'ancien record, le Bouddha du temple de la Source, en Chine.",
    sources: [S.wikiStatue, S.dezeenStatue],
    liens: [],
  },
  {
    id: "bosch", cat: "art", objet: "tableau:jardin", nom: "Le Jardin des délices (copie)",
    porte: "Un détail que personne ne regarde",
    questions: [
      {
        type: "vf", texte: "Dans Le Jardin des délices de Jérôme Bosch, une partition est peinte sur les fesses d'un personnage.", reponse: true,
        explication: "Sur le panneau de l'Enfer, en bas à gauche, un damné porte une portée musicale sur le postérieur. Une étudiante américaine l'a transcrite et enregistrée, et le morceau a fait le tour d'Internet en 2014.",
      },
    ],
    note: "Cette transcription est contestée : certains spécialistes de la musique ancienne estiment que la notation peinte par Bosch ne peut pas vraiment être déchiffrée.",
    sources: [S.openBosch],
    liens: [{ vers: "bocklin", porte: "Un autre tableau qui hante les esprits" }],
  },
  {
    id: "bocklin", cat: "art", objet: "tableau:ile", nom: "L'Île des morts (copie)",
    porte: "Une île, un rameur, des cyprès",
    questions: [
      {
        type: "vf", texte: "Arnold Böcklin n'a peint qu'une seule version de L'Île des morts.", reponse: false,
        explication: "Il en a peint cinq, entre 1880 et 1886. Une sixième a été achevée en 1901 par son fils Carlo, avec lui. L'une des versions a été détruite à Berlin pendant la Seconde Guerre mondiale.",
      },
    ],
    saviezVous: "Hitler, admirateur de Böcklin, a acheté la version de 1883 en 1933 ; elle est aujourd'hui à l'Alte Nationalgalerie de Berlin. Rachmaninov a composé en 1909 un poème symphonique d'après une simple reproduction en noir et blanc du tableau.",
    sources: [S.wikiBocklin],
    liens: [{ vers: "droste", porte: "Une image qui se contient elle-même" }, { vers: "beksinski", porte: "Un peintre qui refusait de s'expliquer" }],
  },
  {
    id: "droste", cat: "art", objet: "boite", nom: "Boîte de cacao à l'infini",
    porte: "Une image dans une image dans une image",
    questions: [
      {
        type: "vf", texte: "L'effet Droste, cette image qui se répète à l'intérieur d'elle-même, doit son nom à une marque de cacao.", reponse: true,
        explication: "Les boîtes de cacao Droste montraient une infirmière portant un plateau avec une tasse et une boîte identique, sur laquelle on retrouvait la même scène, et ainsi de suite. L'image date du début du XXe siècle ; le terme « effet Droste » a été popularisé à la fin des années 1970 par le chroniqueur néerlandais Nico Scheepmaker.",
      },
    ],
    saviezVous: "Regarde les boucles d'oreilles de la Vache qui rit : ce sont des boîtes de Vache qui rit, avec la vache dessus. Et Giotto avait eu l'idée six siècles plus tôt : sur le triptyque Stefaneschi (début du XIVe siècle), le cardinal Stefaneschi est représenté en train d'offrir… le triptyque lui-même.",
    sources: [S.wikiDroste, S.aleteiaDroste],
    liens: [{ vers: "bosch", porte: "Un autre détail caché dans un tableau" }],
  },

  {
    id: "beksinski", cat: "art", objet: "tableau:beksinski", nom: "Toile sans titre",
    porte: "Des tableaux qui ne disent pas leur nom",
    questions: [
      {
        type: "vf", texte: "Le peintre polonais Zdzisław Beksiński refusait de donner un titre à ses tableaux.", reponse: true,
        explication: "Il ne nommait aucun de ses dessins ni de ses tableaux : selon lui, ses œuvres n'avaient pas à être expliquées. Il disait ne pas savoir lui-même ce qu'elles signifiaient, et ne pas s'intéresser aux interprétations.",
      },
    ],
    saviezVous: "Né en 1929 à Sanok, dans le sud de la Pologne, et mort en 2005 à Varsovie, il résumait sa démarche ainsi : « Je ne veux rien dire ni rien transmettre. Je peins simplement ce qui me vient à l'esprit. »",
    sources: [S.wikiBeksinski],
    liens: [{ vers: "bocklin", porte: "Un autre paysage de fin du monde" }],
  },

  /* ---------- Pop culture ---------- */
  {
    id: "quebec", cat: "pop", objet: "vhs:bleu", nom: "Cassette québécoise",
    porte: "Un titre qui ne passerait pas en France",
    questions: [
      {
        type: "vf", texte: "Au Québec, la comédie Le Plus Escroc des deux (1988) est sortie sous le titre « Deux fils de pute ».", reponse: true,
        explication: "Le film de Frank Oz, avec Steve Martin et Michael Caine, s'appelle Dirty Rotten Scoundrels en version originale. La France l'a rebaptisé Le Plus Escroc des deux ; au Québec, il est devenu « Deux fils de pute ».",
      },
    ],
    sources: [S.mediafilmEscroc, S.wikiEscroc],
    liens: [{ vers: "katerine", porte: "Un autre rôle inattendu au cinéma" }, { vers: "cage", porte: "Une autre histoire de cinéma" }],
  },
  {
    id: "katerine", cat: "pop", objet: "bobine:rose", nom: "Bobine de Jim Queen",
    porte: "Un rôle très particulier pour un chanteur",
    questions: [
      {
        type: "qcm", texte: "Dans le film d'animation Jim Queen, quel rôle tient Philippe Katerine ?",
        choix: ["Une prostate", "Un chat de gouttière", "Le maire de Paris", "Un DJ"], reponse: 0,
        explication: "Une prostate. Selon le coréalisateur Marco Nguyen, l'idée venait du producteur, et Katerine a accepté justement parce qu'il s'agissait d'une prostate.",
      },
    ],
    saviezVous: "Réalisé par Marco Nguyen et Nicolas Athané, Jim Queen suit un influenceur de la nuit gay parisienne qui contracte « l'hétérose », un virus qui rend les homosexuels hétérosexuels. Le film a été présenté au Festival de Cannes.",
    sources: [S.septiemeJim, S.politisJim],
    liens: [{ vers: "quebec", porte: "Un titre de film très direct" }],
  },
  {
    id: "zidane", cat: "pop", objet: "ballon:or", nom: "Ballon de la Castellane",
    porte: "Un surnom que seuls les proches utilisent",
    questions: [
      {
        type: "qcm", texte: "Pour ses proches, Zinédine Zidane s'appelle…",
        choix: ["Yazid", "Zinou", "Didou", "Zaza"], reponse: 0,
        explication: "Yazid, ou Yaz. C'est son deuxième prénom : il est né Zinédine Yazid Zidane, à Marseille, de parents algériens.",
      },
    ],
    saviezVous: "C'est sur la place Tartane, dans la cité de La Castellane, à Marseille, qu'il a fait ses premiers pas avec un ballon.",
    sources: [S.wikiZidane],
    liens: [{ vers: "fifa", porte: "Là où le football mondial s'est organisé" }],
  },
  {
    id: "cage", cat: "pop", objet: "bobine", nom: "Bobine de film",
    porte: "Une histoire de famille à Hollywood",
    questions: [
      {
        type: "vf", texte: "Nicolas Cage est le neveu de Francis Ford Coppola.", reponse: true,
        explication: "Son père, August Coppola, est le frère de Francis Ford Coppola. Nicolas Cage est donc le cousin germain de la réalisatrice Sofia Coppola. Il est né Nicolas Coppola.",
      },
    ],
    sources: [S.britCage, S.britCageBio],
    liens: [{ vers: "trump", porte: "Un autre visage connu, là où on ne l'attend pas", transition: "À Hollywood, les liens de famille et les apparitions surprises ne manquent pas." }],
  },
  {
    id: "trump", cat: "pop", objet: "vhs", nom: "Cassette vidéo",
    porte: "Une apparition éclair dans un film de Noël",
    questions: [
      {
        type: "vf", texte: "Donald Trump fait une apparition dans Maman, j'ai encore raté l'avion (1992).", reponse: true,
        explication: "Il croise brièvement Kevin dans le hall de l'hôtel Plaza, qui lui appartenait à l'époque. Le réalisateur Chris Columbus a raconté que cette apparition était la condition pour pouvoir tourner dans l'hôtel.",
      },
    ],
    saviezVous: "À la télévision aussi : on le croise dans Le Prince de Bel-Air, Nounou d'enfer et Sex and the City.",
    sources: [S.scmpTrump, S.irishTrump, S.wikiTrumpFilms],
    liens: [{ vers: "cage", porte: "Une autre histoire de cinéma" }],
  },
  {
    id: "mclain", cat: "pop", objet: "micro", nom: "Micro de studio",
    porte: "Une voix que les joueurs reconnaissent",
    questions: [
      {
        type: "vf", texte: "La voix de GLaDOS, l'intelligence artificielle du jeu Portal, se retrouve aussi dans le film Pacific Rim.", reponse: true,
        explication: "L'actrice Ellen McLain, voix originale de GLaDOS, prête aussi sa voix aux ordinateurs de bord des robots géants de Pacific Rim (2013). Les joueurs l'ont reconnue dès la première bande-annonce.",
      },
    ],
    sources: [S.pcgMcLain],
    liens: [{ vers: "mouthwashing", porte: "Un jeu plus récent, et plus inquiétant" }],
  },
  {
    id: "mouthwashing", cat: "pop", objet: "manette:noir", nom: "Manette noire",
    porte: "Un vaisseau en perdition, en low poly",
    questions: [
      {
        type: "qcm", texte: "Quel studio a créé le jeu d'horreur Mouthwashing (2024) ?",
        choix: ["Critical Reflex", "Wrong Organ", "Puppet Combo", "Team Cherry"], reponse: 1,
        explication: "Wrong Organ. Critical Reflex en est l'éditeur, ce qui explique que son nom apparaisse souvent à côté de celui du jeu.",
      },
    ],
    sources: [S.gdMouth],
    liens: [{ vers: "forhonor", porte: "Une idée refusée pendant des années" }],
  },
  {
    id: "forhonor", cat: "pop", objet: "manette:acier", nom: "Manette de chevalier",
    porte: "Un cours d'escrime et beaucoup de refus",
    questions: [
      {
        type: "vf", texte: "L'idée du jeu For Honor est née d'un cours d'épée longue allemande.", reponse: true,
        explication: "Son directeur créatif, Jason VandenBerghe, a eu l'idée après avoir suivi un cours d'épée longue allemande : il voulait reproduire ces gardes avec le stick droit de la manette.",
      },
    ],
    saviezVous: "Il a présenté son idée pendant des années sans convaincre : la réponse a été « non » pendant environ une décennie, avant qu'Ubisoft Montréal ne se lance. Le jeu est sorti en 2017.",
    sources: [S.pcgHonor],
    liens: [{ vers: "ecureuil", porte: "Un jeu au titre très littéral" }],
  },
  {
    id: "ecureuil", cat: "pop", objet: "manette:roux", nom: "Manette rousse",
    porte: "Un titre qui dit tout",
    questions: [
      {
        type: "vf", texte: "Il existe un vrai jeu vidéo intitulé Squirrel with a Gun (« écureuil avec un flingue »).", reponse: true,
        explication: "Développé par Dee Dee Creations et édité par Maximum Entertainment, il est sorti sur PC le 29 août 2024. On y incarne, comme promis, un écureuil armé.",
      },
    ],
    sources: [S.gematsuEcureuil],
    liens: [{ vers: "justin", porte: "Là où on regarde les autres jouer" }],
  },
  {
    id: "justin", cat: "pop", objet: "micro:cam", nom: "Webcam d'époque",
    porte: "Une plateforme née d'une autre",
    questions: [
      {
        type: "qcm", texte: "De quel site est né Twitch ?",
        choix: ["Ustream", "Justin.tv", "Dailymotion", "Livestream"], reponse: 1,
        explication: "Justin.tv. Twitch a d'abord été la catégorie « jeux vidéo » de ce site de diffusion en direct. Elle attirait plus de spectateurs que toutes les autres réunies, et elle est devenue un service à part en 2011.",
      },
    ],
    saviezVous: "Justin.tv a fermé le 5 août 2014, pour que l'entreprise se concentre sur Twitch.",
    sources: [S.tcJustin],
    liens: [{ vers: "mclain", porte: "Une voix bien connue des joueurs" }],
  },
  {
    id: "eswc", cat: "pop", objet: "souris", nom: "Souris de joueuse",
    porte: "Des joueuses, une coupe du monde",
    questions: [],
    sources: [S.esrEswc2003, S.gdEswc2005, S.aaaEswc],
    liens: [{ vers: "justin", porte: "Une plateforme née d'une autre" }],
  },
  {
    id: "baseball", cat: "pop", objet: "balle", nom: "Balle de baseball",
    porte: "Une saison qui n'en finit pas",
    questions: [
      {
        type: "qcm", texte: "Combien de matchs chaque équipe de la MLB joue-t-elle pendant la saison régulière ?",
        choix: ["82", "120", "162", "200"], reponse: 2,
        explication: "162 matchs, à peu près un par jour pendant six mois. 82, c'est le nombre de matchs d'une saison régulière en NBA ou en NHL.",
      },
    ],
    sources: [S.britMlb],
    liens: [{ vers: "fifa", porte: "L'autre football" }],
  },

  /* ---------- Musique ---------- */
  {
    id: "around", cat: "musique", objet: "vinyle:bleu", nom: "Vinyle de Homework",
    porte: "Une chanson de trois mots",
    questions: [
      {
        type: "qcm", texte: "Combien de fois la phrase « Around the world » est-elle répétée dans le morceau de Daft Punk ?",
        choix: ["44 fois", "88 fois", "144 fois", "200 fois"], reponse: 2,
        explication: "144 fois, selon le décompte le plus souvent cité pour la version de l'album Homework (1997). Ce sont les seules paroles du morceau.",
      },
    ],
    note: "Les décomptes varient légèrement selon les versions (single, album, montage radio). 144 correspond à la version album.",
    sources: [S.songfacts],
    liens: [{ vers: "bestof", porte: "Un autre disque, un autre duo" }],
  },
  {
    id: "bestof", cat: "musique", objet: "vinyle:or", nom: "Vinyle à deux voix",
    porte: "Un duo qui a mal vieilli",
    questions: [
      {
        type: "qcm", texte: "The Best of Both Worlds (2002) est un album commun de…",
        choix: ["Dieudonné et Élie", "Richard Pryor et Bill Cosby", "R. Kelly et Jay-Z", "Hitler et Mussolini"], reponse: 2,
        explication: "R. Kelly et Jay-Z. L'album est sorti en 2002 ; le duo a publié une suite, Unfinished Business, en 2004.",
      },
    ],
    sources: [S.slantBest],
    liens: [{ vers: "around", porte: "Une chanson très répétitive" }, { vers: "ritz", porte: "Un biographe devenu parolier" }],
  },

  {
    id: "ritz", cat: "musique", objet: "vinyle:rouge", nom: "Vinyle de Midnight Love",
    porte: "Un biographe qui a fini dans les crédits",
    questions: [
      {
        type: "vf", texte: "Le biographe de Marvin Gaye est crédité comme coauteur de Sexual Healing.", reponse: true,
        explication: "David Ritz travaillait avec Marvin Gaye, alors installé en Belgique, sur sa biographie, quand il lui a suggéré l'expression « sexual healing ». Gaye l'a remercié sur l'album Midnight Love (1982). Ritz n'a obtenu son crédit de coauteur, aux côtés de Gaye et d'Odell Brown, qu'après un procès réglé avec la succession du chanteur.",
      },
    ],
    saviezVous: "Ritz a coécrit 36 autobiographies, dont celles de Ray Charles, B.B. King, Etta James, Janet Jackson ou Willie Nelson. Sa biographie de Marvin Gaye s'intitule Divided Soul.",
    note: "Le rôle exact de Ritz reste discuté : selon une autre version, Gaye aurait écrit seul les paroles, en s'inspirant du titre proposé par Ritz.",
    sources: [S.asRitz, S.wikiRitz, S.wikiDivided],
    liens: [{ vers: "bestof", porte: "Un autre duo, beaucoup moins tendre" }],
  },
  {
    id: "zoubida", cat: "musique", objet: "vinyle:rose", nom: "45 tours de 1991",
    porte: "Le tube de l'été 1991",
    questions: [
      {
        type: "vf", texte: "La Zoubida de Lagaf' a été certifiée disque de platine.", reponse: true,
        explication: "Sortie en mai 1991, la chanson a été certifiée disque de platine par le SNEP. Elle est restée onze semaines, non consécutives, en tête du classement français des singles.",
      },
    ],
    sources: [S.wikiZoubida],
    liens: [{ vers: "around", porte: "Une autre chanson répétitive" }],
  },

  {
    id: "grenoble", cat: "musique", objet: "vinyle:vert", nom: "Disque grenoblois",
    porte: "Deux artistes, une même ville",
    questions: [],
    sources: [S.wikiFugain, S.wikiMisterV],
    liens: [{ vers: "zoubida", porte: "Un tube des années 1990" }],
  },

  /* ---------- Mots rares ---------- */
  {
    id: "glabre", cat: "mots", objet: "livre:vert", nom: "Dictionnaire, tome G",
    porte: "Un adjectif qui se rase",
    questions: [
      {
        type: "qcm", texte: "Que veut dire « glabre » ?",
        choix: ["Sans poils", "Très pâle", "Collant", "Timide"], reponse: 0,
        explication: "Glabre se dit d'une peau, d'un visage ou d'une plante dépourvus de poils. Un visage glabre est imberbe ou rasé de près.",
      },
    ],
    sources: [S.cnrtlGlabre],
    liens: [{ vers: "laudatif", porte: "Un autre mot rare" }],
  },
  {
    id: "laudatif", cat: "mots", objet: "livre:rouge", nom: "Dictionnaire, tome L",
    porte: "Un mot qui dit du bien",
    questions: [
      {
        type: "qcm", texte: "Un discours « laudatif »…",
        choix: ["fait l'éloge de quelqu'un", "se moque de quelqu'un", "dure très longtemps", "n'a aucun sens"], reponse: 0,
        explication: "Laudatif signifie « qui contient un éloge, qui loue ». Le mot vient du latin laudare, « louer ».",
      },
    ],
    sources: [S.cnrtlLaudatif],
    liens: [{ vers: "berezina", porte: "Un mot qui vient d'une rivière" }],
  },
  {
    id: "berezina", cat: "mots", objet: "livre:bleu", nom: "Dictionnaire, tome B",
    porte: "Un nom de rivière devenu un mot",
    questions: [
      {
        type: "qcm", texte: "Que veut dire « c'est la bérézina » ?",
        choix: ["Il fait un froid glacial", "C'est un désastre complet", "C'est la fête", "C'est très loin"], reponse: 1,
        explication: "C'est un désastre, un échec total. L'expression vient de la Bérézina, rivière de l'actuelle Biélorussie, que l'armée de Napoléon a franchie en novembre 1812, au prix de très lourdes pertes, pendant la retraite de Russie.",
      },
    ],
    sources: [S.larousseBerezina],
    liens: [{ vers: "noosphere", porte: "Une sphère que personne ne voit" }],
  },
  {
    id: "noosphere", cat: "mots", objet: "livre:violet", nom: "Dictionnaire, tome N",
    porte: "Une sphère que personne ne voit",
    questions: [
      {
        type: "qcm", texte: "La « noosphère », c'est…",
        choix: ["Une couche de l'atmosphère", "La sphère de la pensée humaine", "Une partie de l'œil", "Une figure de géométrie"], reponse: 1,
        explication: "La sphère de la pensée humaine : l'idée que la pensée et les connaissances humaines forment une couche qui enveloppe la Terre, au même titre que la biosphère. Le mot vient du grec noos, « esprit ».",
      },
    ],
    saviezVous: "Le concept est associé au paléontologue et philosophe Pierre Teilhard de Chardin et au scientifique russe Vladimir Vernadsky, dans les années 1920.",
    sources: [S.wikiNoo],
    liens: [{ vers: "poioumenon", porte: "Un mot grec encore plus rare" }],
  },
  {
    id: "poioumenon", cat: "mots", objet: "livre:noir", nom: "Livre qui s'écrit lui-même",
    porte: "Une histoire qui parle d'elle-même",
    questions: [
      {
        type: "qcm", texte: "Un « poioumenon », c'est…",
        choix: ["Un poème sans rimes", "Une œuvre qui raconte sa propre création", "Un personnage secondaire", "Une faute de traduction"], reponse: 1,
        explication: "Une œuvre de métafiction qui raconte le processus de sa création, parfois l'écriture de l'œuvre elle-même. Le terme a été proposé par le critique Alastair Fowler.",
      },
    ],
    sources: [S.wikiMeta],
    liens: [{ vers: "manicule", porte: "Un signe que tout le monde connaît" }],
  },
  {
    id: "manicule", cat: "mots", objet: "livre:ocre", nom: "Manuscrit annoté",
    porte: "Un signe que tout le monde connaît sans le nommer",
    questions: [
      {
        type: "vf", texte: "La petite main à l'index tendu (☞) a un nom : la manicule.", reponse: true,
        explication: "Les lecteurs du Moyen Âge et de la Renaissance dessinaient des manicules dans la marge des manuscrits et des livres pour signaler un passage important.",
      },
    ],
    sources: [S.unimelbManicule],
    liens: [{ vers: "eigengrau", porte: "Une couleur que tu vois tous les soirs" }],
  },
  {
    id: "eigengrau", cat: "mots", objet: "livre:gris", nom: "Nuancier du noir",
    porte: "La couleur du noir complet",
    questions: [
      {
        type: "vf", texte: "Dans l'obscurité totale, l'œil voit un noir parfait.", reponse: false,
        explication: "Il voit un gris très foncé, appelé eigengrau (« gris intrinsèque » en allemand). Même sans lumière, le nerf optique continue de transmettre des signaux : une sorte de bruit de fond visuel.",
      },
    ],
    saviezVous: "Un ciel nocturne paraît plus noir que l'eigengrau : les étoiles créent du contraste, et c'est le contraste qui guide notre perception.",
    sources: [S.viceEigengrau],
    liens: [{ vers: "glabre", porte: "Un autre mot rare" }],
  },
  {
    id: "naute", cat: "mots", objet: "casque", nom: "Casque de spationaute",
    porte: "Un même métier, plusieurs noms",
    questions: [
      {
        type: "qcm", texte: "Comment appelle-t-on, en français, un astronaute chinois ?",
        choix: ["Un cosmonaute", "Un spationaute", "Un taïkonaute", "Un sinonaute"], reponse: 2,
        explication: "Un taïkonaute. Les autres mots désignent le même métier : on parle surtout d'astronautes pour les Américains, de cosmonautes pour les Russes et de spationautes pour les Français.",
      },
    ],
    note: "Selon le Larousse, ces distinctions s'effacent avec les équipages internationaux, et « astronaute » s'impose de plus en plus pour tout le monde.",
    sources: [S.larousseSpatio, S.larousseTaiko],
    liens: [],
  },
  {
    id: "albanais", cat: "mots", objet: "livre:rouge2", nom: "Grammaire albanaise",
    porte: "Une langue coupée en deux par un fleuve",
    questions: [
      {
        type: "vf", texte: "En Albanie, les deux grands dialectes de la langue sont séparés par un fleuve.", reponse: true,
        explication: "Le guègue, au nord, et le tosque, au sud, sont séparés à peu près par le fleuve Shkumbin. L'albanais standard s'est d'abord appuyé sur un parler guègue du sud, avant d'être remanié sur la base du tosque.",
      },
    ],
    sources: [S.britTosk],
    liens: [],
  },
  {
    id: "charolais", cat: "mots", objet: "fromage", nom: "Charolais sur planche",
    porte: "Un mot, deux spécialités",
    questions: [
      {
        type: "vf", texte: "Le charolais est à la fois une race de vache et un fromage.", reponse: true,
        explication: "La race bovine charolaise est connue dans le monde entier, mais le charolais est aussi un fromage de chèvre de Bourgogne, protégé par une appellation d'origine (AOP).",
      },
    ],
    sources: [S.reussirCharolais],
    liens: [],
  },
];

export const FRISE_NOTES = [
  { id: "melos", texte: "Le siège de Mélos par Athènes", date: -416, affichage: "416 av. J.-C.", salle: "melos", source: S.britMelos },
  { id: "londres", texte: "Le Grand Incendie de Londres", date: 1666, affichage: "1666", salle: "farriner", source: S.blHubert },
  { id: "berezina", texte: "Le passage de la Bérézina par l'armée de Napoléon", date: 1812, affichage: "1812", salle: "berezina", source: S.larousseBerezina },
  { id: "ile", texte: "La première version de L'Île des morts", date: 1880, affichage: "1880", salle: "bocklin", source: S.wikiBocklin },
  { id: "fifa", texte: "La fondation de la FIFA, à Paris", date: 1904, affichage: "1904", salle: "fifa", source: S.fifaMusee },
  { id: "tumbler", texte: "L'opération Tumbler-Snapper, au Nevada", date: 1952, affichage: "1952", salle: "tumbler", source: S.ropeTrick },
  { id: "femto", texte: "L'adoption du préfixe « femto »", date: 1964, affichage: "1964", salle: "femto", source: S.bipm1964 },
  { id: "beksinski", texte: "La naissance de Zdzisław Beksiński", date: 1929, affichage: "1929", salle: "beksinski", source: S.wikiBeksinski },
  { id: "healing", texte: "La sortie de Sexual Healing, de Marvin Gaye", date: 1982, affichage: "1982", salle: "ritz", source: S.asRitz },
  { id: "escroc", texte: "La sortie du film Le Plus Escroc des deux", date: 1988, affichage: "1988", salle: "quebec", source: S.wikiEscroc },
  { id: "zoubida", texte: "La sortie de La Zoubida, de Lagaf'", date: 1991, affichage: "1991", salle: "zoubida", source: S.wikiZoubida },
  { id: "homework", texte: "La sortie de Homework, l'album de « Around the World »", date: 1997, affichage: "1997", salle: "around", source: S.songfacts },
  { id: "bestof", texte: "La sortie de The Best of Both Worlds", date: 2002, affichage: "2002", salle: "bestof", source: S.slantBest },
  { id: "twitch", texte: "Twitch devient un service à part entière", date: 2011, affichage: "2011", salle: "justin", source: S.tcJustin },
  { id: "honor", texte: "La sortie de For Honor", date: 2017, affichage: "2017", salle: "forhonor", source: S.pcgHonor },
  { id: "unite", texte: "L'inauguration de la statue de l'Unité", date: 2018, affichage: "2018", salle: "statue", source: S.wikiStatue },
  { id: "ecureuil", texte: "La sortie de Squirrel with a Gun", date: 2024, affichage: "2024", salle: "ecureuil", source: S.gematsuEcureuil },
];
