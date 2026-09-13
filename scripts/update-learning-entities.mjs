// scripts/update-learning-entities.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const targetPath = path.resolve(__dirname, '../src/data/learningEntities.json');

const rawCurrent = JSON.parse(fs.readFileSync(targetPath, 'utf8'));

/**
 * 59 authentic tropical and African botanical species curated for Koudou
 * (UN SDG 15: Life on Land, Central African flora, medicinal & ethnobotanical traditions).
 */
const plantsData = [
  // 1. Flower_n_01 (Z0 - Clairière d'arrivée)
  {
    id: "Flower_n_01",
    modelPath: "/models/flowers/Flower_n_01.glb",
    cardType: "/assets/card/SilverCard.png",
    frenchName: "Bissap Écarlate",
    scientificName: "Hibiscus sabdariffa",
    type: "Malvacées",
    status: "Préoccupation mineure (LC)",
    description: "Plante herbacée robuste aux fleurs jaune pâle au cœur pourpre et calices rouges charnus. Très cultivée dans les clairières ensoleillées pour ses vertus rafraîchissantes.",
    leftPanel: {
      Habitat: "Clairières lumineuses, sols sableux et bien drainés.",
      Usages: "Infusion acidulée désaltérante (karkadé), riche en vitamine C et antioxydants protecteurs."
    },
    rightPanel: {
      "Danger ?": "Sans danger. Calices acidulés comestibles.",
      Densité: "●●●●○ — Très commun",
      "Tip de Feuille": "\"Récoltez le calice charnu après la chute des pétales pour préparer la tisane rouge.\""
    },
    exercise: {
      question: "Quelle partie du Bissap est principalement infusée pour la boisson ?",
      options: [
        "Les calices rouges charnus",
        "Les graines sèches moulues",
        "L'écorce des racines",
        "Les épines de la tige"
      ],
      correctAnswer: 0,
      feedbackSuccess: "Bravo ! C'est bien le calice rouge et charnu qui donne cette boisson pourpre et acidulée.",
      feedbackFail: "Pas tout à fait. Observez la base rouge vif de la fleur : ce sont ses calices charnus !"
    }
  },

  // 2. Flower_n_02 (Z1 - Forêt claire)
  {
    id: "Flower_n_02",
    modelPath: "/models/flowers/Flower_n_02.glb",
    cardType: "/assets/card/SilverCard.png",
    frenchName: "Lis Glorieux",
    scientificName: "Gloriosa superba",
    type: "Colchicacées",
    status: "Préoccupation mineure (LC)",
    description: "Liane grimpante spectaculaire dont les pétales ondulés passent du jaune d'or au rouge flamboyant. Elle s'accroche aux arbustes grâce à des vrilles à l'extrémité de ses feuilles.",
    leftPanel: {
      Habitat: "Lisières de forêt claire, fourrés arbustifs semi-ombragés.",
      Usages: "Usage traditionnel externe très encadré ; contient de la colchicine toxique."
    },
    rightPanel: {
      "Danger ?": "⚠ Fortement toxique par ingestion (toutes parties).",
      Densité: "●●●○○ — Assez commun",
      "Tip de Feuille": "\"La pointe de chaque feuille se prolonge en une fine vrille souple pour grimper.\""
    },
    exercise: {
      question: "Comment le Lis Glorieux s'accroche-t-il aux branches voisines ?",
      options: [
        "Par des racines adhésives",
        "Grâce aux vrilles au bout de ses feuilles",
        "Avec de puissantes épines courbées",
        "En sécrétant une sève collante"
      ],
      correctAnswer: 1,
      feedbackSuccess: "Exactement ! L'extrémité de ses feuilles se transforme en vrille pour grimper vers la lumière.",
      feedbackFail: "Regardez bien l'extrémité de ses feuilles : elles forment des vrilles naturelles pour grimper."
    }
  },

  // 3. Flower_n_03 (Rivière)
  {
    id: "Flower_n_03",
    modelPath: "/models/flowers/Flower_n_03.glb",
    cardType: "/assets/card/GoldenCard.png",
    frenchName: "Nénuphar Bleu d'Afrique",
    scientificName: "Nymphaea nouchali",
    type: "Nymphéacées",
    status: "Quasi menacée (NT)",
    description: "Plante aquatique majestueuse aux fleurs étoilées bleu azur flottant sur l'eau. Ses feuilles rondes abritent les alevins et purifient l'eau des rivières calmes.",
    leftPanel: {
      Habitat: "Bras morts de rivières, méandres calmes et étangs d'eau douce.",
      Usages: "Régulation thermique de l'eau, rhizomes consommés en période de famine, symbole de paix."
    },
    rightPanel: {
      "Danger ?": "Sans danger. Plante aquatique bienfaisante.",
      Densité: "●●○○○ — Peu fréquent",
      "Tip de Feuille": "\"Les fleurs s'ouvrent au soleil du matin et se referment doucement en fin d'après-midi.\""
    },
    exercise: {
      question: "Quel rôle écologique essentiel joue ce nénuphar sur la rivière ?",
      options: [
        "Il empoisonne les prédateurs",
        "Il assèche le cours d'eau en été",
        "Il abrite les alevins et stabilise l'eau",
        "Il attire uniquement les chauves-souris"
      ],
      correctAnswer: 2,
      feedbackSuccess: "Parfait ! Ses larges feuilles flottantes créent des zones d'ombre vitales pour la faune aquatique.",
      feedbackFail: "Pensez à la vie aquatique : ses larges feuilles flottantes servent de refuge protecteur aux petits poissons."
    }
  },

  // 4. Flower_n_04 (Grotte / Falaises rocheuses)
  {
    id: "Flower_n_04",
    modelPath: "/models/flowers/Flower_n_04.glb",
    cardType: "/assets/card/SilverCard.png",
    frenchName: "Plante de la Résurrection",
    scientificName: "Myrothamnus flabellifolius",
    type: "Myrothamnacées",
    status: "Préoccupation mineure (LC)",
    description: "Petit arbuste résilient capable de survivre à une déshydratation complète sur la roche aride. Dès les premières gouttes de pluie, ses rameaux noircis reverdissent en quelques heures.",
    leftPanel: {
      Habitat: "Crêtes rocheuses arides, parois de grottes exposées au vent.",
      Usages: "Infusion aromatique contre les maux de gorge, baume cicatrisant traditionnel."
    },
    rightPanel: {
      "Danger ?": "Sans danger. Huiles essentielles parfumées.",
      Densité: "●●○○○ — Localisé",
      "Tip de Feuille": "\"Même semblant morte et desséchée, trempez sa branche dans l'eau pour la voir revivre.\""
    },
    exercise: {
      question: "Quelle faculté remarquable a valu son nom à cette plante ?",
      options: [
        "Elle repousse même après avoir brûlé",
        "Elle reverdit rapidement après une longue sécheresse",
        "Elle ne produit des fleurs qu'une fois par siècle",
        "Elle change de couleur à chaque heure du jour"
      ],
      correctAnswer: 1,
      feedbackSuccess: "C'est exact ! Cette plante reviviscente passe d'un aspect mort à un vert éclatant dès qu'il pleut.",
      feedbackFail: "Indice : pensez à sa capacité incroyable de revivre après des mois de dessèchement total."
    }
  },

  // 5. Flower_n_05 (Z2 - Bosquet médicinal)
  {
    id: "Flower_n_05",
    modelPath: "/models/flowers/Flower_n_05.glb",
    cardType: "/assets/card/SilverCard.png",
    frenchName: "Iboga Sacré",
    scientificName: "Tabernanthe iboga",
    type: "Apocynacées",
    status: "Vulnérable (VU)",
    description: "Arbuste des sous-bois équatoriaux aux fleurs blanches teintées de rose et fruits orangés. Ses racines occupent une place centrale dans les rites et la pharmacopée forestière traditionnelle.",
    leftPanel: {
      Habitat: "Sous-bois denses, chauds et humides du bassin du Congo.",
      Usages: "Plante rituelle sacrée, racine stimulante à micro-doses, étudiée contre les dépendances."
    },
    rightPanel: {
      "Danger ?": "⚠ Alcaloïdes puissants (ibogaïne). Usage strict réservé aux initiés.",
      Densité: "●○○○○ — Rare et protégée",
      "Tip de Feuille": "\"Ses fruits orange ovoïdes pendent sous les feuilles opposées vert foncé.\""
    },
    exercise: {
      question: "Pourquoi l'Iboga est-il strictement protégé dans la forêt équatoriale ?",
      options: [
        "C'est une herbe envahissante toxique",
        "Sa surexploitation menace sa survie et son rôle rituel",
        "Il détruit les racines des grands arbres voisins",
        "Ses fruits attirent trop de serpents dangereux"
      ],
      correctAnswer: 1,
      feedbackSuccess: "Très bien ! L'arrachage intensif de ses racines en a fait une espèce menacée à protéger d'urgence.",
      feedbackFail: "Rappelez-vous : comme on arrache toute la racine pour ses principes actifs, l'espèce est menacée d'extinction."
    }
  },

  // 6. Flower_n_06 (Traces humaines / Déforestation)
  {
    id: "Flower_n_06",
    modelPath: "/models/flowers/Flower_n_06.glb",
    cardType: "/assets/card/GoldenCard.png",
    frenchName: "Gommier Blanc",
    scientificName: "Senegalia senegal",
    type: "Fabacées",
    status: "Préoccupation mineure (LC)",
    description: "Arbre pionnier épineux à fleurs en épis blanc crème odorants. Sa sève exsude la précieuse gomme arabique, et ses racines fixent l'azote pour enrichir les sols dégradés.",
    leftPanel: {
      Habitat: "Clairières déboisées, sols pauvres et lisières arides.",
      Usages: "Production de gomme arabique naturelle, stabilisation des sols érodés et fourrage."
    },
    rightPanel: {
      "Danger ?": "Épines acérées courbées par trois aux nœuds.",
      Densité: "●●●○○ — Assez commun",
      "Tip de Feuille": "\"Ses épines sont disposées par triplets caractéristiques : deux droites et une recourbée.\""
    },
    exercise: {
      question: "Quel bénéfice écologique majeur cet arbre apporte-t-il aux sols abîmés ?",
      options: [
        "Il acidifie la terre pour éliminer les champignons",
        "Il fixe l'azote de l'air et retient l'érosion",
        "Il empêche toute autre plante de germer",
        "Il assèche complètement les nappes d'eau"
      ],
      correctAnswer: 1,
      feedbackSuccess: "Excellent ! En tant que légumineuse, il enrichit la terre en azote et freine la dégradation du sol.",
      feedbackFail: "Pensez aux qualités des Fabacées : leurs racines collaborent avec des bactéries pour fixer l'azote fertilisant."
    }
  },

  // 7. Flower_n_07 (Z2 - Bosquet médicinal)
  {
    id: "Flower_n_07",
    modelPath: "/models/flowers/Flower_n_07.glb",
    cardType: "/assets/card/SilverCard.png",
    frenchName: "Fougère Arborescente",
    scientificName: "Cyathea manniana",
    type: "Cyathéacées",
    status: "Préoccupation mineure (LC)",
    description: "Fougère géante préhistorique formant un tronc fibreux dressé couronné d'immenses frondes découpées. Elle maintient la fraîcheur et l'hygrométrie indispensables au bosquet.",
    leftPanel: {
      Habitat: "Ravin humide, fond de vallon ombragé et bords de cascades.",
      Usages: "Maintien du microclimat forestier, tronc utilisé pour fixer les orchidées épiphytes."
    },
    rightPanel: {
      "Danger ?": "Sans danger. Poils bruns rêches sur les jeunes crosses.",
      Densité: "●●●○○ — Présence marquée",
      "Tip de Feuille": "\"Les jeunes crosses s'enroulent en spirale serrée rappelant une volute de violon.\""
    },
    exercise: {
      question: "Comment se nomment les jeunes feuilles enroulées typiques des fougères ?",
      options: [
        "Les crosses",
        "Les calices",
        "Les bractées",
        "Les folioles d'or"
      ],
      correctAnswer: 0,
      feedbackSuccess: "Exact ! Ces jeunes pousses en spirale sont appelées crosses avant de se déployer.",
      feedbackFail: "Observez la forme recourbée de la jeune pousse : elle porte le même nom que le bâton pastoral (crosse)."
    }
  },

  // 8. Flower_n_08 (Cabane du forestier)
  {
    id: "Flower_n_08",
    modelPath: "/models/flowers/Flower_n_08.glb",
    cardType: "/assets/card/SilverCard.png",
    frenchName: "Moringa Ailé",
    scientificName: "Moringa oleifera",
    type: "Moringacées",
    status: "Préoccupation mineure (LC)",
    description: "Surnommé l'arbre de vie pour sa richesse nutritionnelle exceptionnelle. Ses fleurs blanc crème agréablement parfumées attirent une multitude d'abeilles indigènes.",
    leftPanel: {
      Habitat: "Jardins de clairières, bordures de sentiers ensoleillés.",
      Usages: "Feuilles ultra-nutritives riches en fer et protéines, graines purifiant l'eau trouble."
    },
    rightPanel: {
      "Danger ?": "Sans danger. Toutes les parties aériennes sont utiles.",
      Densité: "●●●●○ — Cultivé et robuste",
      "Tip de Feuille": "\"Les graines pilées ont la propriété naturelle de coaguler les impuretés de l'eau.\""
    },
    exercise: {
      question: "Quelle propriété surprenante possèdent les graines écrasées de Moringa ?",
      options: [
        "Elles éloignent la pluie",
        "Elles purifient l'eau trouble en la clarifiant",
        "Elles rendent le bois imperméable au feu",
        "Elles fabriquent une encre bleue permanente"
      ],
      correctAnswer: 1,
      feedbackSuccess: "Brillant ! Les protéines de la graine fixent les particules en suspension pour rendre l'eau claire.",
      feedbackFail: "Pensez au traitement de l'eau en forêt : la poudre de graine permet de clarifier l'eau boueuse."
    }
  },

  // 9. Flower_n_09
  {
    id: "Flower_n_09",
    modelPath: "/models/flowers/Flower_n_09.glb",
    cardType: "/assets/card/SilverCard.png",
    frenchName: "Arbre aux Saucisses",
    scientificName: "Kigelia africana",
    type: "Bignoniacées",
    status: "Préoccupation mineure (LC)",
    description: "Grand arbre aux fleurs nocturnes pourpre velouté pendantes en longues grappes. Leurs cloches ouvertes dégagent un parfum fermenté destiné à attirer les chauves-souris pollinisatrices.",
    leftPanel: {
      Habitat: "Plaines alluviales boisées et berges périodiquement inondées.",
      Usages: "Poudre d'écorce raffermissante cutanée, fruits fermentés pour boissons traditionnelles."
    },
    rightPanel: {
      "Danger ?": "Fruits non mûrs purgatifs et toxiques à l'état brut.",
      Densité: "●●○○○ — Dispersé",
      "Tip de Feuille": "\"Ses lourdes fleurs suspendues ne s'épanouissent qu'à la nuit tombée.\""
    },
    exercise: {
      question: "Quel animal assure la pollinisation nocturne des fleurs de Kigelia ?",
      options: [
        "Les colibris",
        "Les chauves-souris frugivores",
        "Les papillons monarques",
        "Les écureuils volants"
      ],
      correctAnswer: 1,
      feedbackSuccess: "Tout à fait ! Les chauves-souris nectarivores plongent la tête dans ses corolles suspendues.",
      feedbackFail: "Pensez à un mammifère volant nocturne actif dès le crépuscule en forêt tropicale."
    }
  },

  // 10. Flowers_n02_01 (Rivière)
  {
    id: "Flowers_n02_01",
    modelPath: "/models/flowers/Flowers_n02_01.glb",
    cardType: "/assets/card/SilverCard.png",
    frenchName: "Papyrus du Nil",
    scientificName: "Cyperus papyrus",
    type: "Cypéracées",
    status: "Préoccupation mineure (LC)",
    description: "Grande plante aquatique vivace aux tiges triangulaires lisses couronnées d'une élégante ombelle plumeuse. Elle forme des ceintures végétales filtrant naturellement les alluvions.",
    leftPanel: {
      Habitat: "Rives calmes, marécages permanents et cours d'eau lents.",
      Usages: "Fabrication historique de parchemin végétal, nattes tressées, filtrage des sédiments."
    },
    rightPanel: {
      "Danger ?": "Sans danger. Bords des tiges fermes et fibreux.",
      Densité: "●●●●○ — En peuplements denses",
      "Tip de Feuille": "\"Coupez une tige en section : vous observerez sa forme triangulaire caractéristique.\""
    },
    exercise: {
      question: "Quelle forme géométrique singulière présente la tige du papyrus ?",
      options: [
        "Une section cylindrique creuse",
        "Une section triangulaire pleine",
        "Une tige carrée et cannelée",
        "Une tige plate en ruban"
      ],
      correctAnswer: 1,
      feedbackSuccess: "Bravo ! Les tiges de la famille des cypéracées sont typiquement à trois angles nets (triangulaires).",
      feedbackFail: "Regardez de près la tige d'un papyrus : elle possède trois angles bien distincts (triangulaire)."
    }
  },

  // 11. Flowers_n02_02
  {
    id: "Flowers_n02_02",
    modelPath: "/models/flowers/Flowers_n02_02.glb",
    cardType: "/assets/card/SilverCard.png",
    frenchName: "Fleur de Baobab",
    scientificName: "Adansonia digitata",
    type: "Malvacées",
    status: "Préoccupation mineure (LC)",
    description: "Énorme fleur blanche suspendue à un long pédoncule, dotée d'un toupet spectaculaire d'étamines soyeuses. Elle ne s'ouvre que le soir et ne vit qu'une seule nuit.",
    leftPanel: {
      Habitat: "Savanes arborées, clairières sèches et sols profonds.",
      Usages: "Pulpe des fruits (pain de singe) riche en vitamine C, feuilles émollientes cuisinées."
    },
    rightPanel: {
      "Danger ?": "Sans danger. Arbre protecteur vénéré.",
      Densité: "●●○○○ — Arbre emblématique",
      "Tip de Feuille": "\"La fleur tombe au sol dès le lever du jour après avoir été fécondée la nuit.\""
    },
    exercise: {
      question: "Combien de temps reste ouverte une fleur de baobab ?",
      options: [
        "Un mois entier pendant la saison des pluies",
        "Une seule nuit avant de se faner au matin",
        "Environ sept jours consécutifs",
        "Elle ne s'ouvre que pendant les orages"
      ],
      correctAnswer: 1,
      feedbackSuccess: "Exact ! C'est une floraison nocturne éphémère qui ne dure que quelques heures avant l'aube.",
      feedbackFail: "Sa fleur est très éphémère : elle éclot au coucher du soleil et se flétrit dès le lendemain matin."
    }
  },

  // 12. Flowers_n02_03
  {
    id: "Flowers_n02_03",
    modelPath: "/models/flowers/Flowers_n02_03.glb",
    cardType: "/assets/card/SilverCard.png",
    frenchName: "Tulipier du Gabon",
    scientificName: "Spathodea campanulata",
    type: "Bignoniacées",
    status: "Préoccupation mineure (LC)",
    description: "Grand arbre pionnier aux somptueuses fleurs en tulipe orange vif bordées de jaune. Les boutons floraux non éclos emprisonnent une eau sous pression prisée des oiseaux.",
    leftPanel: {
      Habitat: "Lisières forestières, trouées de lumière et bords de chemins.",
      Usages: "Bois blanc léger pour la sculpture, écorce antiseptique pour soigner les plaies."
    },
    rightPanel: {
      "Danger ?": "Sans danger. Les boutons éclatent en jets d'eau quand on les presse.",
      Densité: "●●●○○ — Régulier",
      "Tip de Feuille": "\"Pressez un bouton fermé entre vos doigts : il projette une fine gerbe d'eau comme un pistolet.\""
    },
    exercise: {
      question: "Que renferment les boutons floraux non éclos du Tulipier du Gabon ?",
      options: [
        "Une huile collante venimeuse",
        "Un liquide aqueux sous pression",
        "Une poudre jaune inflammable",
        "Une colonie de fourmis piqueuses"
      ],
      correctAnswer: 1,
      feedbackSuccess: "Exactement ! Les enfants pressent ces boutons fermés pour s'arroser avec le suc limpide.",
      feedbackFail: "Tentez de presser un bouton : il contient une réserve d'eau sous tension qui gicle facilement."
    }
  },

  // 13. Flowers_n02_04 (Traces humaines / logged)
  {
    id: "Flowers_n02_04",
    modelPath: "/models/flowers/Flowers_n02_04.glb",
    cardType: "/assets/card/SilverCard.png",
    frenchName: "Orme Charbonnier",
    scientificName: "Trema orientalis",
    type: "Cannabacées",
    status: "Préoccupation mineure (LC)",
    description: "Arbre pionnier à croissance ultra-rapide colonisant immédiatement les clairières déboisées. Ses petites fleurs discrètes laissent place à des baies noires qui nourrissent les passereaux.",
    leftPanel: {
      Habitat: "Zones fraîchement défrichées, coupes forestières, terrains perturbés.",
      Usages: "Restauration naturelle des sols, bois à charbon de haute qualité, feuilles fébrifuges."
    },
    rightPanel: {
      "Danger ?": "Sans danger. Espèce bienfaitrice pour la régénération.",
      Densité: "●●●●○ — Pionnier très abondant",
      "Tip de Feuille": "\"Ses feuilles ont des bords finement dentés et une texture rugueuse comme du papier de verre.\""
    },
    exercise: {
      question: "Pourquoi l'Orme Charbonnier est-il crucial après une déforestation ?",
      options: [
        "Il repousse les herbivores sauvages",
        "Il pousse vite, fait de l'ombre et permet aux autres arbres de revenir",
        "Il produit un bois toxique pour les bûcherons",
        "Il absorbe tout le calcium du sol"
      ],
      correctAnswer: 1,
      feedbackSuccess: "Excellent ! C'est un pionnier écologique qui prépare le terrain pour le retour de la forêt primaire.",
      feedbackFail: "Son rôle de pionnier est capital : il installe un couvert protecteur sous lequel d'autres arbres peuvent germer."
    }
  },

  // 14. Flowers_n02_05 (Forêt ancienne)
  {
    id: "Flowers_n02_05",
    modelPath: "/models/flowers/Flowers_n02_05.glb",
    cardType: "/assets/card/SilverCard.png",
    frenchName: "Orchidée Léopard",
    scientificName: "Ansellia africana",
    type: "Orchidacées",
    status: "Vulnérable (VU)",
    description: "Grande orchidée épiphyte spectaculaire formant d'immenses touffes sur les hautes branches des vieux arbres. Ses fleurs jaune doré sont maculées de taches brun chocolat.",
    leftPanel: {
      Habitat: "Haute canopée de la forêt ancienne, fourches d'arbres centenaires.",
      Usages: "Plante ornementale précieuse, racines aériennes traditionnellement infusées contre les cauchemars."
    },
    rightPanel: {
      "Danger ?": "Sans danger. Espèce menacée par le pillage en forêt.",
      Densité: "●○○○○ — Rare en canopée",
      "Tip de Feuille": "\"Ses racines dressées forment un panier retenant les feuilles mortes pour nourrir la plante.\""
    },
    exercise: {
      question: "Où pousse naturellement l'Orchidée Léopard dans la forêt ancienne ?",
      options: [
        "Enfouie profondément dans la boue",
        "Accrochée aux hautes branches des grands arbres (épiphyte)",
        "Flottant à la surface de l'eau vive",
        "À l'intérieur des cavernes sombres"
      ],
      correctAnswer: 1,
      feedbackSuccess: "Parfait ! C'est une épiphyte : elle vit perchée sur les arbres sans les parasiter.",
      feedbackFail: "Levez les yeux : cette orchidée s'installe sur l'écorce des branches maîtresses pour capter la lumière."
    }
  },

  // 15. Flowers_n02_06
  {
    id: "Flowers_n02_06",
    modelPath: "/models/flowers/Flowers_n02_06.glb",
    cardType: "/assets/card/GoldenCard.png",
    frenchName: "Caféier Robusta",
    scientificName: "Coffea canephora",
    type: "Rubiacées",
    status: "Préoccupation mineure (LC)",
    description: "Arbuste indigène du sous-bois africain aux fleurs blanches étoilées au parfum enivrant de jasmin. Ses cerises mûrissent du vert au rouge vif le long des tiges souples.",
    leftPanel: {
      Habitat: "Sous-bois tropicaux d'Afrique centrale, sols volcaniques humides.",
      Usages: "Graines torréfiées riches en caféine stimulante, feuilles parfois infusées en tisane tonique."
    },
    rightPanel: {
      "Danger ?": "Feuilles et graines très stimulantes.",
      Densité: "●●●○○ — Originaire de la région",
      "Tip de Feuille": "\"Les fleurs s'épanouissent toutes en même temps sur le rameau après une forte pluie d'orage.\""
    },
    exercise: {
      question: "De quelle couleur deviennent les cerises de café Robusta à maturité ?",
      options: [
        "Bleu marine profond",
        "Blanc crème nacré",
        "Rouge vif éclatant",
        "Jaune fluo"
      ],
      correctAnswer: 2,
      feedbackSuccess: "Exact ! Lorsqu'elles sont bien mûres, les cerises arborent un beau rouge écarlate prêt pour la récolte.",
      feedbackFail: "Regardez la teinte des baies prêtes à être cueillies : elles passent du vert au rouge vif !"
    }
  },

  // 16. Flowers_n02_07 (Z1 - Forêt claire)
  {
    id: "Flowers_n02_07",
    modelPath: "/models/flowers/Flowers_n02_07.glb",
    cardType: "/assets/card/SilverCard.png",
    frenchName: "Amarante Rouge",
    scientificName: "Amaranthus cruentus",
    type: "Amaranthacées",
    status: "Préoccupation mineure (LC)",
    description: "Plante annuelle robuste aux grands épis floraux pourpre sombre veloutés. Très rustique, elle résiste au soleil éclatant et produit des milliers de petites graines nutritives.",
    leftPanel: {
      Habitat: "Bords de sentiers battus, clairières ensoleillées et jardins forestiers.",
      Usages: "Légume-feuille riche en fer et vitamines (brède), graines consommées comme céréale."
    },
    rightPanel: {
      "Danger ?": "Sans danger. Feuilles jeunes très digestes une fois cuites.",
      Densité: "●●●●○ — Très fréquent",
      "Tip de Feuille": "\"Même séchés pour l'herbier, ses épis conservent leur teinte pourpre durant des mois.\""
    },
    exercise: {
      question: "Pourquoi l'amarante est-elle un aliment très apprécié des populations locales ?",
      options: [
        "Ses feuilles et graines sont très riches en fer et protéines",
        "Elle a le goût de viande fumée",
        "Elle se conserve 50 ans sans moisir",
        "Elle guérit instantanément toutes les fièvres"
      ],
      correctAnswer: 0,
      feedbackSuccess: "Très juste ! C'est une plante vivrière majeure aux qualités nutritionnelles remarquables.",
      feedbackFail: "Pensez à ses bienfaits pour la santé : ses feuilles et ses graines apportent fer, vitamines et protéines."
    }
  },

  // 17. Flowers_n02_08
  {
    id: "Flowers_n02_08",
    modelPath: "/models/flowers/Flowers_n02_08.glb",
    cardType: "/assets/card/SilverCard.png",
    frenchName: "Bois Sanglier",
    scientificName: "Harungana madagascariensis",
    type: "Hypericacées",
    status: "Préoccupation mineure (LC)",
    description: "Petit arbre pionnier remarquable par sa sève orange vif qui suinte immédiatement à la moindre entaille de l'écorce. Ses petites fleurs blanches en corymbes sentent l'amande.",
    leftPanel: {
      Habitat: "Lisières forestières humides, friches et bordures de ruisseaux.",
      Usages: "La sève orange résineuse est un puissant désinfectant et cicatrisant cutané traditionnel."
    },
    rightPanel: {
      "Danger ?": "Sève résineuse très colorante mais non toxique sur la peau.",
      Densité: "●●●○○ — Commun en recolonisation",
      "Tip de Feuille": "\"Une légère incision sur l'écorce libère un suc orange éclatant ressemblant à du sang végétal.\""
    },
    exercise: {
      question: "Quelle particularité visuelle possède la sève de l'Harungana ?",
      options: [
        "Elle est bleu électrique fluorescent",
        "Elle a une couleur orange vif semblable à de la teinture",
        "Elle est noire comme du goudron",
        "Elle reste parfaitement transparente comme de l'eau"
      ],
      correctAnswer: 1,
      feedbackSuccess: "Bravo ! Ce suc orange flamboyant est utilisé comme cicatrisant et teinture naturelle.",
      feedbackFail: "Observez la blessure sur son tronc : la résine qui en découle est d'un orange éclatant."
    }
  },

  // 18. Flowers_n02_09 (Grotte / Falaises rocheuses)
  {
    id: "Flowers_n02_09",
    modelPath: "/models/flowers/Flowers_n02_09.glb",
    cardType: "/assets/card/GoldenCard.png",
    frenchName: "Pagan des Rochers",
    scientificName: "Kalanchoe thyrsiflora",
    type: "Crassulacées",
    status: "Préoccupation mineure (LC)",
    description: "Plante succulente aux feuilles rondes épaisses disposées en rosette comme des pagaies superposées. Sous le soleil des falaises, le bord de ses feuilles prend une belle teinte rouge cerise.",
    leftPanel: {
      Habitat: "Corniches rocheuses abruptes, éboulis arides près des grottes.",
      Usages: "Suc foliaire rafraîchissant appliqué sur les brûlures superficielles et piqûres."
    },
    rightPanel: {
      "Danger ?": "Sans danger en externe ; ne pas ingérer en grande quantité.",
      Densité: "●●○○○ — Falaises sèches",
      "Tip de Feuille": "\"Les feuilles sont couvertes d'une fine pruine blanche qui les protège des brûlures solaires.\""
    },
    exercise: {
      question: "Quel est le rôle de la poudre blanche (pruine) présente sur ses feuilles épaisses ?",
      options: [
        "Attirer les fourmis pour sa protection",
        "Agir comme un écran protecteur contre le soleil brûlant",
        "Capter l'eau de pluie pour la stocker en glace",
        "Empoisonner les herbivores qui la broutent"
      ],
      correctAnswer: 1,
      feedbackSuccess: "Parfait ! Cette couche cireuse blanche reflète le soleil ardent des parois rocheuses.",
      feedbackFail: "Pensez au climat rude des falaises : cette poudre claire sert de crème solaire végétale contre le rayonnement."
    }
  },

  // 19. Flowers_n02_10 (Z2 - Bosquet médicinal)
  {
    id: "Flowers_n02_10",
    modelPath: "/models/flowers/Flowers_n02_10.glb",
    cardType: "/assets/card/SilverCard.png",
    frenchName: "Brède Mafane",
    scientificName: "Acmella oleracea",
    type: "Astéracées",
    status: "Préoccupation mineure (LC)",
    description: "Petite plante herbacée aux boutons floraux coniques jaunes sans pétales, ressemblant à des yeux. Mâcher une feuille procure une sensation pétillante et légèrement anesthésiante sur la langue.",
    leftPanel: {
      Habitat: "Sous-bois humides, clairières ombragées et sols alluviaux.",
      Usages: "Anesthésique local naturel contre le mal de dent (spilanthol), stimulant salivaire et condiment."
    },
    rightPanel: {
      "Danger ?": "Sans danger. Picotement temporaire très surprenant en bouche !",
      Densité: "●●●○○ — Présent au bosquet",
      "Tip de Feuille": "\"Quelques fragments de fleurs suffisent à engourdir agréablement la gencive en cas de douleur.\""
    },
    exercise: {
      question: "Quel effet inhabituel provoque la mastication de la fleur d'Acmella ?",
      options: [
        "Une perte temporaire de l'odorat",
        "Un engourdissement pétillant et rafraîchissant dans la bouche",
        "Un changement de couleur des dents en vert",
        "Un endormissement profond immédiat"
      ],
      correctAnswer: 1,
      feedbackSuccess: "Exact ! Le spilanthol qu'elle contient provoque ce picotement anesthésiant utile contre le mal de dents.",
      feedbackFail: "Rappelez-vous son surnom d'herbe électrique : elle fait pétiller et engourdit la langue !"
    }
  },

  // 20. Flowers_n02_11
  {
    id: "Flowers_n02_11",
    modelPath: "/models/flowers/Flowers_n02_11.glb",
    cardType: "/assets/card/SilverCard.png",
    frenchName: "Strophanthus Grimpant",
    scientificName: "Strophanthus gratus",
    type: "Apocynacées",
    status: "Préoccupation mineure (LC)",
    description: "Liane puissante aux magnifiques fleurs cireuses roses et pourpres dont les lobes de pétales s'étirent en longs rubans torsadés. Ses graines contiennent de puissants cardiotoniques.",
    leftPanel: {
      Habitat: "Lisières de galerie forestière, grimpant sur les grands arbres.",
      Usages: "Cardiotonique puissant (ouabaïne) à dose infinitésimale ; poison de flèche traditionnel."
    },
    rightPanel: {
      "Danger ?": "⚠ Toxique à forte dose. Alcaloïdes cardiaques très actifs.",
      Densité: "●●○○○ — Forêt profonde",
      "Tip de Feuille": "\"Ses pétales se prolongent en rubans effilés ondulant au moindre souffle d'air.\""
    },
    exercise: {
      question: "Quelle forme remarquable adoptent les extrémités des pétales de cette fleur ?",
      options: [
        "Des épines rigides et perçantes",
        "De longs rubans fins et torsadés",
        "Des ailes transparentes d'insecte",
        "Des coupes pleines d'eau sucrée"
      ],
      correctAnswer: 1,
      feedbackSuccess: "Bien vu ! Ses pétales s'étirent en longs rubans gracieux typiques des Strophanthus.",
      feedbackFail: "Regardez l'extrémité des corolles : elles s'allongent en rubans souples qui flottent dans le vent."
    }
  },

  // 21. Flowers_n02_12 (Z2 - Bosquet médicinal)
  {
    id: "Flowers_n02_12",
    modelPath: "/models/flowers/Flowers_n02_12.glb",
    cardType: "/assets/card/SilverCard.png",
    frenchName: "Faux Quinquina",
    scientificName: "Rauvolfia vomitoria",
    type: "Apocynacées",
    status: "Préoccupation mineure (LC)",
    description: "Arbuste des lisières équatoriales aux minuscules fleurs blanches parfumées et baies rouges en grappes. Son écorce amère est renommée pour apaiser les palpitations et réguler la tension.",
    leftPanel: {
      Habitat: "Clairières anciennes, bosquets humides et sols humifères riches.",
      Usages: "Racine sédative et hypotensive naturelle (réserpine), remède traditionnel des fièvres."
    },
    rightPanel: {
      "Danger ?": "⚠ À consommer sous contrôle averti (ralentit le cœur).",
      Densité: "●●●○○ — Fréquent au bosquet",
      "Tip de Feuille": "\"Les feuilles sont regroupées par bouquets de 3 à 5 verticilles le long des rameaux.\""
    },
    exercise: {
      question: "Pour quelle action sur le corps le Rauvolfia est-il réputé en médecine traditionnelle ?",
      options: [
        "Apaiser l'agitation nerveuse et faire baisser la tension",
        "Augmenter la vitesse de course des chasseurs",
        "Permettre de voir clairement dans le noir",
        "Donner une faim incontrôlable"
      ],
      correctAnswer: 0,
      feedbackSuccess: "Exactement ! La réserpine qu'il contient a longtemps été la base des traitements de l'hypertension.",
      feedbackFail: "Pensez aux vertus calmantes : son écorce apaise le rythme cardiaque et diminue la tension artérielle."
    }
  },

  // 22. Flowers_n02_13 (Cabane du forestier)
  {
    id: "Flowers_n02_13",
    modelPath: "/models/flowers/Flowers_n02_13.glb",
    cardType: "/assets/card/SilverCard.png",
    frenchName: "Thé de Gambie",
    scientificName: "Lippia multiflora",
    type: "Verbénacées",
    status: "Préoccupation mineure (LC)",
    description: "Arbrisseau buissonnant vivace aux petites fleurs blanches rassemblées en épis compacts. Ses feuilles froissées dégagent un parfum puissant mêlant verveine, camphre et agrumes.",
    leftPanel: {
      Habitat: "Clairières ensoleillées, bordures de cabanes et pâturages boisés.",
      Usages: "Tisane relaxante du soir, digestive, antispasmodique et fébrifuge très populaire."
    },
    rightPanel: {
      "Danger ?": "Sans danger. Tisane aromatique très saine.",
      Densité: "●●●●○ — Répandu",
      "Tip de Feuille": "\"Frottez délicatement une feuille : son arôme citronné et camphré éloigne les moustiques.\""
    },
    exercise: {
      question: "Comment utilise-t-on le plus couramment les feuilles du Thé de Gambie ?",
      options: [
        "En poudre noire pour empoisonner les flèches",
        "En délicieuse infusion chaude relaxante et digestive",
        "Pour cirer les bottes de marche",
        "Comme poison contre les insectes du bois"
      ],
      correctAnswer: 1,
      feedbackSuccess: "Parfait ! C'est l'une des infusions les plus appréciées d'Afrique de l'Ouest et Centrale.",
      feedbackFail: "Son nom commun vous met sur la voie : on fait sécher ses feuilles pour en faire une tisane relaxante."
    }
  },

  // 23. Flowers_n02_14
  {
    id: "Flowers_n02_14",
    modelPath: "/models/flowers/Flowers_n02_14.glb",
    cardType: "/assets/card/GoldenCard.png",
    frenchName: "Voacanga Tropical",
    scientificName: "Voacanga africana",
    type: "Apocynacées",
    status: "Préoccupation mineure (LC)",
    description: "Arbre de sous-bois aux fleurs blanches spiralées élégantes et grands fruits globuleux tachetés par paires. Son latex blanc laiteux est utilisé traditionnellement pour soigner les blessures.",
    leftPanel: {
      Habitat: "Forêts pluviales de basse altitude, ravins ombragés.",
      Usages: "Latex antiseptique pour plaies, décoction d'écorce tonifiante en médecine coutumière."
    },
    rightPanel: {
      "Danger ?": "Graines riches en alcaloïdes psychoactifs ; ne pas ingérer.",
      Densité: "●●○○○ — Dispersé",
      "Tip de Feuille": "\"Ses deux fruits sphériques poussent soudés par leur base comme des jumelles vertes.\""
    },
    exercise: {
      question: "Quelle disposition curieuse présentent les fruits du Voacanga ?",
      options: [
        "Ils poussent soudés par deux comme des jumeaux",
        "Ils sont alignés en spirale autour du tronc",
        "Ils mûrissent entièrement sous la terre",
        "Ils éclatent avec le bruit d'un coup de fusil"
      ],
      correctAnswer: 0,
      feedbackSuccess: "Bravo ! Ses deux baies jumelles soudées par la base sont très faciles à identifier en forêt.",
      feedbackFail: "Regardez les fruits jumeaux de l'arbuste : ils viennent toujours par paires soudées à la base."
    }
  },

  // 24. Flowers_n02_15
  {
    id: "Flowers_n02_15",
    modelPath: "/models/flowers/Flowers_n02_15.glb",
    cardType: "/assets/card/SilverCard.png",
    frenchName: "Costus Doré d'Afrique",
    scientificName: "Costus spectabilis",
    type: "Costacées",
    status: "Préoccupation mineure (LC)",
    description: "Plante herbacée singulière plaquée au sol avec quatre grandes feuilles charnues horizontales. En son centre émerge une immense fleur jaune d'or lumineuse comme du papier de soie froissé.",
    leftPanel: {
      Habitat: "Sous-bois rocheux, clairières moussues et savanes arborées humides.",
      Usages: "Emblème floral national, rhizomes fébrifuges et soulageant les douleurs articulaires."
    },
    rightPanel: {
      "Danger ?": "Sans danger. Fleurs délicates à ne pas piétiner.",
      Densité: "●●○○○ — Étagé au sol",
      "Tip de Feuille": "\"Ses quatre feuilles rondes reposent à plat sur le sol, formant une croix végétale parfaite.\""
    },
    exercise: {
      question: "Comment sont orientées les grandes feuilles du Costus Doré ?",
      options: [
        "Dressées en tuyau vers le ciel",
        "Étalées à plat sur le sol en formant une croix",
        "Enroulées autour du tronc des palmiers",
        "Flottant au gré du vent au bout d'un fil"
      ],
      correctAnswer: 1,
      feedbackSuccess: "Exactement ! Les quatre feuilles restent plaquées au niveau du sol autour de la fleur centrale dorée.",
      feedbackFail: "Observez sa rosette au sol : quatre feuilles charnues forment une base étalée à plat."
    }
  },

  // 25. Flowers_n02_16
  {
    id: "Flowers_n02_16",
    modelPath: "/models/flowers/Flowers_n02_16.glb",
    cardType: "/assets/card/SilverCard.png",
    frenchName: "Aloès Épineux",
    scientificName: "Aloe ferox",
    type: "Asphodélacées",
    status: "Préoccupation mineure (LC)",
    description: "Aloès imposant développant une rosette dense de feuilles charnues bordées d'épines rougeâtres. Ses imposants candélabres de fleurs rouge vermillon sont gavés de nectar pour les oiseaux.",
    leftPanel: {
      Habitat: "Versants pierreux ensoleillés, sols drainés et crêtes arides.",
      Usages: "Gel apaisant pour la peau, gelée d'aloès cicatrisante, sève amère digestive."
    },
    rightPanel: {
      "Danger ?": "Épines aiguës le long des marges et sous les feuilles.",
      Densité: "●●●○○ — Rustique et robuste",
      "Tip de Feuille": "\"Coupez une feuille : le gel transparent translucide à l'intérieur soulage immédiatement les brûlures.\""
    },
    exercise: {
      question: "Quel trésor naturel renferme l'intérieur des feuilles épaisses d'aloès ?",
      options: [
        "Un suc rouge très toxique",
        "Un gel transparent hydratant et cicatrisant",
        "Une résine noire qui durcit comme la pierre",
        "Des graines prêtes à germer immédiatement"
      ],
      correctAnswer: 1,
      feedbackSuccess: "C'est tout à fait ça ! Le mucilage translucide apaise coups de soleil, plaies et brûlures.",
      feedbackFail: "Son gel est célèbre en pharmacie naturelle : un suc épais translucide qui hydrate et cicatrise la peau."
    }
  },

  // 26. Flowers_n02_17 (Forêt ancienne)
  {
    id: "Flowers_n02_17",
    modelPath: "/models/flowers/Flowers_n02_17.glb",
    cardType: "/assets/card/SilverCard.png",
    frenchName: "Moabi Jaune",
    scientificName: "Enantia chlorantha",
    type: "Annonacées",
    status: "Préoccupation mineure (LC)",
    description: "Arbre moyen de la forêt ancienne dont l'écorce interne est d'un jaune soufre éclatant. Ses fleurs charnues vert-jaune dégagent un arôme boisé discret à l'ombre de la canopée.",
    leftPanel: {
      Habitat: "Sous-bois ombragés et humides de la forêt primaire équatoriale.",
      Usages: "Écorce jaune utilisée comme fébrifuge contre le paludisme et puissant colorant textile jaune."
    },
    rightPanel: {
      "Danger ?": "Sans danger. Goût très amer de l'écorce.",
      Densité: "●●○○○ — Forêt primaire",
      "Tip de Feuille": "\"Grattez légèrement l'écorce externe : la couche interne est d'un jaune fluo remarquable.\""
    },
    exercise: {
      question: "Quelle teinte singulière prend l'intérieur de l'écorce d'Enantia quand on la gratte ?",
      options: [
        "Vert bouteille profond",
        "Jaune d'or lumineux",
        "Blanc laiteux translucide",
        "Pourpre foncé"
      ],
      correctAnswer: 1,
      feedbackSuccess: "Bravo ! Cette couleur jaune vive révèle la présence d'alcaloïdes réputés contre les accès fébriles.",
      feedbackFail: "Regardez le tronc sous la pellicule d'écorce : il brille d'une intense couleur jaune d'or."
    }
  },

  // 27. Flowers_n02_18
  {
    id: "Flowers_n02_18",
    modelPath: "/models/flowers/Flowers_n02_18.glb",
    cardType: "/assets/card/SilverCard.png",
    frenchName: "Basilic Africain",
    scientificName: "Ocimum gratissimum",
    type: "Lamiacées",
    status: "Préoccupation mineure (LC)",
    description: "Plante buissonnante très odorante aux feuilles veloutées et épis floraux blancs ou violacés. Riche en thymol, elle est surnommée 'plante à moustiques' pour son parfum aromatique puissant.",
    leftPanel: {
      Habitat: "Lisières ensoleillées, abords de campements et jachères.",
      Usages: "Infusion contre les refroidissements et bronchites, feuilles fraîches froissées répulsives à insectes."
    },
    rightPanel: {
      "Danger ?": "Sans danger. Arôme très puissant et agréable.",
      Densité: "●●●●○ — Très commun",
      "Tip de Feuille": "\"Plantez-en près des tentes et cabanes : son parfum chasse naturellement les moustiques du soir.\""
    },
    exercise: {
      question: "Quel rôle utilitaire majeur joue le Basilic Africain autour des habitations ?",
      options: [
        "Il repousse les moustiques grâce à ses huiles essentielles",
        "Il produit un fruit vénéneux pour les rongeurs",
        "Il garde la terre froide même en plein midi",
        "Il alerte des orages en sifflant dans le vent"
      ],
      correctAnswer: 0,
      feedbackSuccess: "Bien vu ! Ses fortes effluves aromatiques forment une barrière naturelle contre les moustiques.",
      feedbackFail: "Pensez au confort des nuits en forêt : son odeur camphrée chasse les moustiques piqueurs."
    }
  },

  // 28. Flowers_n02_19
  {
    id: "Flowers_n02_19",
    modelPath: "/models/flowers/Flowers_n02_19.glb",
    cardType: "/assets/card/SilverCard.png",
    frenchName: "Petit Cola",
    scientificName: "Garcinia kola",
    type: "Clusiacées",
    status: "Vulnérable (VU)",
    description: "Grand arbre forestier aux fleurs blanches discrètes et gros fruits orangés contenant plusieurs graines brunes. Ces graines amères sont mastiquées depuis des siècles pour redonner de l'endurance.",
    leftPanel: {
      Habitat: "Forêts denses sempervirentes de plaine, sols riches et profonds.",
      Usages: "Graine stimulante et bronchodilatatrice, remède traditionnel de la voix et des poumons."
    },
    rightPanel: {
      "Danger ?": "Très amer au goût ; effet stimulant énergisant.",
      Densité: "●○○○○ — Menacé par la déforestation",
      "Tip de Feuille": "\"La graine donne d'abord une saveur amère intense, puis laisse une douceur sucrée en bouche.\""
    },
    exercise: {
      question: "Quelle partie de l'arbre Garcinia kola est mastiquée pour l'énergie et la gorge ?",
      options: [
        "La feuille séchée roulée",
        "L'amande de la graine (noix amère)",
        "Les épines du tronc",
        "Le pétale de la fleur"
      ],
      correctAnswer: 1,
      feedbackSuccess: "Exactement ! La noix de petit cola est un stimulant et remède traditionnel très réputé.",
      feedbackFail: "Indice : on casse le gros fruit mûr pour prélever sa graine brune (souvent appelée noix)."
    }
  },

  // 29. Flowers_n02_20
  {
    id: "Flowers_n02_20",
    modelPath: "/models/flowers/Flowers_n02_20.glb",
    cardType: "/assets/card/GoldenCard.png",
    frenchName: "Laitue d'Eau Flottante",
    scientificName: "Pistia stratiotes",
    type: "Aracées",
    status: "Préoccupation mineure (LC)",
    description: "Petite plante aquatique flottante sans tige formant une rosette de feuilles veloutées vert pâle rappelant une mini-laitue. Ses racines plumeuses immergées filtrent les impuretés de l'eau stagnante.",
    leftPanel: {
      Habitat: "Lagunes calmes, anses de rivières lentes et marécages.",
      Usages: "Épuration naturelle des eaux, abri pour la microfaune aquatique, compost végétal."
    },
    rightPanel: {
      "Danger ?": "Oxalates de calcium irritants si consommée crue.",
      Densité: "●●●○○ — En tapis flottants",
      "Tip de Feuille": "\"Ses feuilles douces sont recouvertes de minuscules poils retenant des bulles d'air qui la font flotter.\""
    },
    exercise: {
      question: "Comment la Laitue d'Eau parvient-elle à flotter si facilement sur l'eau ?",
      options: [
        "Ses racines sont remplies d'hélium",
        "Ses feuilles duveteuses emprisonnent des micro-bulles d'air",
        "Elle flotte grâce à des morceaux de bois flotté",
        "Elle sécrète une huile plus légère que l'eau"
      ],
      correctAnswer: 1,
      feedbackSuccess: "Tout à fait ! Ses poils imperméables capturent l'air, lui permettant d'insubmersibilité totale.",
      feedbackFail: "Touchez ses feuilles veloutées : elles enferment des bulles d'air qui agissent comme un gilet de sauvetage."
    }
  },

  // 30. Flowers_n02_21
  {
    id: "Flowers_n02_21",
    modelPath: "/models/flowers/Flowers_n02_21.glb",
    cardType: "/assets/card/GoldenCard.png",
    frenchName: "Fruit Miraculeux",
    scientificName: "Thaumatococcus daniellii",
    type: "Marantacées",
    status: "Préoccupation mineure (LC)",
    description: "Grande herbe forestière dressant de splendides feuilles en éventail. À sa base, au ras du sol, naissent de discrètes fleurs violettes suivies de fruits triangulaires rouges renfermant la thaumatine.",
    leftPanel: {
      Habitat: "Sous-bois ombragés et humides de la forêt pluvieuse tropicale.",
      Usages: "Contient la thaumatine, édulcorant naturel 2000 fois plus sucré que le sucre sans calories."
    },
    rightPanel: {
      "Danger ?": "Sans danger. Douceur sucrée intense et durable en bouche.",
      Densité: "●●○○○ — Sous-bois ancien",
      "Tip de Feuille": "\"Ses larges feuilles souples et imperméables servent traditionnellement à emballer les aliments.\""
    },
    exercise: {
      question: "Quelle propriété extraordinaire possède la protéine contenue dans ce fruit ?",
      options: [
        "Elle gèle l'eau à température ambiante",
        "Elle procure un pouvoir sucrant 2000 fois supérieur au sucre classique",
        "Elle rend les aliments invisibles aux oiseaux",
        "Elle transforme l'eau salée en vin doux"
      ],
      correctAnswer: 1,
      feedbackSuccess: "Incroyable mais vrai ! La thaumatine est l'une des substances naturelles les plus édulcorantes du monde végétal.",
      feedbackFail: "Pensez au goût : une minuscule trace de cette pulpe donne une sensation intensément sucrée sans aucune calorie."
    }
  },

  // 31. Flowers_n02_22
  {
    id: "Flowers_n02_22",
    modelPath: "/models/flowers/Flowers_n02_22.glb",
    cardType: "/assets/card/SilverCard.png",
    frenchName: "Dentelaire Blanche",
    scientificName: "Plumbago zeylanica",
    type: "Plumbaginacées",
    status: "Préoccupation mineure (LC)",
    description: "Sous-arbrisseau grimpant orné d'épis de fleurs blanches immaculées en trompette. Le calice qui porte la fleur est hérissé de poils glanduleux collants qui s'accrochent aux poils des animaux.",
    leftPanel: {
      Habitat: "Broussailles, clairières sablonneuses et lisières ensoleillées.",
      Usages: "Racine utilisée en cataplasme stimulant contre les douleurs rhumatismales et verrues."
    },
    rightPanel: {
      "Danger ?": "La sève fraîche peut être caustique et vésicante sur la peau.",
      Densité: "●●●○○ — Présence continue",
      "Tip de Feuille": "\"Les calices floraux sont couverts de petites glandes gluantes qui agrippent vos vêtements au passage.\""
    },
    exercise: {
      question: "Comment cette plante fait-elle voyager ses graines sur de longues distances ?",
      options: [
        "En projetant ses graines comme un canon à ressort",
        "En collant ses calices gluants au pelage des animaux de passage",
        "En flottant dans les courants d'air chaud ascendants",
        "En étant enfouie par les taupes sous la terre"
      ],
      correctAnswer: 1,
      feedbackSuccess: "Exact ! Le calice collant s'accroche solidement aux poils et aux vêtements pour disséminer l'espèce.",
      feedbackFail: "Touchez la base de la fleur : elle est couverte de poils adhésifs conçus pour voyager sur le pelage des animaux."
    }
  },

  // 32. Flowers_n02_23
  {
    id: "Flowers_n02_23",
    modelPath: "/models/flowers/Flowers_n02_23.glb",
    cardType: "/assets/card/GoldenCard.png",
    frenchName: "Belle-de-Nuit",
    scientificName: "Mirabilis jalapa",
    type: "Nyctaginacées",
    status: "Préoccupation mineure (LC)",
    description: "Plante herbacée buissonnante dont les fleurs tubulaires aux coloris variés ne s'ouvrent qu'en toute fin d'après-midi. À la tombée de la nuit, elles exhalent un doux parfum sucré.",
    leftPanel: {
      Habitat: "Clairières villageoises, friches et sentiers ensoleillés le jour.",
      Usages: "Fleurs fournissant des colorants alimentaires naturels cramoisis, tubercules purgatifs."
    },
    rightPanel: {
      "Danger ?": "Graines noires et tubercules toxiques en cas d'ingestion.",
      Densité: "●●●○○ — Commun près des clairières",
      "Tip de Feuille": "\"Les fleurs s'ouvrent vers 16h et se ferment le lendemain matin dès que le soleil tape.\""
    },
    exercise: {
      question: "À quel moment de la journée la Belle-de-Nuit ouvre-t-elle ses corolles ?",
      options: [
        "À midi pile sous le soleil le plus fort",
        "En fin d'après-midi au crépuscule",
        "Juste avant l'aube pendant trente minutes",
        "Uniquement les jours de forte pluie"
      ],
      correctAnswer: 1,
      feedbackSuccess: "Bravo ! Ses fleurs attendent la fraîcheur de la fin de journée et de la nuit pour s'ouvrir.",
      feedbackFail: "Son nom commun donne l'indice principal : elle fleurit en fin de journée pour charmer les papillons nocturnes."
    }
  },

  // 33. Flowers_n03_02 (Z2 - Bosquet médicinal)
  {
    id: "Flowers_n03_02",
    modelPath: "/models/flowers/Flowers_n03_02.glb",
    cardType: "/assets/card/SilverCard.png",
    frenchName: "Pervenche Tropicale",
    scientificName: "Catharanthus roseus",
    type: "Apocynacées",
    status: "Préoccupation mineure (LC)",
    description: "Petite vivace aux fleurs délicates à cinq pétales roses ou blancs au centre pourpre. Elle a révolutionné la médecine moderne grâce à ses alcaloïdes actifs contre les leucémies infantiles.",
    leftPanel: {
      Habitat: "Sols sableux chauds, lisières de clairière et sous-bois clairs.",
      Usages: "Source vitale de vincristine et vinblastine anticancéreuses, régulatrice traditionnelle de glycémie."
    },
    rightPanel: {
      "Danger ?": "⚠ Plante toxique à l'état brut (alcaloïdes cytotoxiques puissants).",
      Densité: "●●●○○ — Récoltée avec respect",
      "Tip de Feuille": "\"Ses feuilles luisantes vert foncé ont une nervure médiane blanche très visible.\""
    },
    exercise: {
      question: "Quelle contribution majeure la Pervenche tropicale a-t-elle apportée à la santé mondiale ?",
      options: [
        "Un antidote universel contre les venins de cobra",
        "Des molécules anticancéreuses majeures (vincristine) contre la leucémie",
        "Le premier vaccin contre la grippe aviaire",
        "Une huile rendant la peau invulnérable au froid"
      ],
      correctAnswer: 1,
      feedbackSuccess: "Absolument ! La vincristine extraite de ses feuilles a sauvé des milliers d'enfants atteints de leucémie.",
      feedbackFail: "Pensez aux grandes victoires de la pharmacologie moderne : ses molécules traitent des formes graves de cancers."
    }
  },

  // 34. Flowers_n03_03
  {
    id: "Flowers_n03_03",
    modelPath: "/models/flowers/Flowers_n03_03.glb",
    cardType: "/assets/card/SilverCard.png",
    frenchName: "Tournesol Sauvage",
    scientificName: "Tithonia diversifolia",
    type: "Astéracées",
    status: "Préoccupation mineure (LC)",
    description: "Grand arbuste vigoureux couronné de spectaculaires capitules jaunes ressemblant à des soleils dorés. Ses feuilles coupées et décomposées constituent un formidable engrais vert riche en phosphore.",
    leftPanel: {
      Habitat: "Bords de routes forestières, sols dégradés et friches ensoleillées.",
      Usages: "Biomasse fertilisante naturelle régénérant les sols pauvres, infusion amère contre les fièvres."
    },
    rightPanel: {
      "Danger ?": "Sans danger. Goût extrêmement amer repoussant les ravageurs.",
      Densité: "●●●●○ — Robuste et vigoureux",
      "Tip de Feuille": "\"Incorporez ses feuilles hachées à la terre : elles se décomposent vite et libèrent de l'azote et du phosphore.\""
    },
    exercise: {
      question: "Pourquoi les cultivateurs écologiques utilisent-ils les feuilles de Tithonia ?",
      options: [
        "Pour colorer le sol en violet",
        "Comme engrais vert naturel riche en nutriments fertilisants",
        "Pour chasser les oiseaux granivores",
        "Pour ralentir la pousse des légumes du potager"
      ],
      correctAnswer: 1,
      feedbackSuccess: "Parfait ! Ses feuilles découpées enrichissent rapidement les sols carencés en phosphore et azote.",
      feedbackFail: "Pensez aux pratiques agricoles durables (ODD 15) : c'est un excellent engrais vert naturel pour les cultures."
    }
  },

  // 35. Flowers_n03_04
  {
    id: "Flowers_n03_04",
    modelPath: "/models/flowers/Flowers_n03_04.glb",
    cardType: "/assets/card/SilverCard.png",
    frenchName: "Violette des Ombres",
    scientificName: "Viola odorata",
    type: "Violacées",
    status: "Préoccupation mineure (LC)",
    description: "Petite herbe tapissante des sous-bois profonds aux fleurs violettes asymétriques très odorantes. Elle s'étale discrètement au ras du sol entre les racines moussues des arbres tutélaires.",
    leftPanel: {
      Habitat: "Sols humifères humides, tapis de mousses et sous-bois ombragés.",
      Usages: "Parfumerie de luxe, sirop adoucissant pour la gorge, feuilles consommées en salade sauvage."
    },
    rightPanel: {
      "Danger ?": "Sans danger. Racines émétiques à forte dose.",
      Densité: "●●○○○ — Discret et localisé",
      "Tip de Feuille": "\"Ses feuilles en forme de cœur parfait s'organisent en touffe basse protectrice.\""
    },
    exercise: {
      question: "Quelle forme ont les feuilles caractéristiques de cette violette ?",
      options: [
        "Une forme d'étoile à six branches",
        "Une forme de cœur bien découpé",
        "Une aiguille fine comme un cheveu",
        "Une lanière ondulée très longue"
      ],
      correctAnswer: 1,
      feedbackSuccess: "Bravo ! Ses feuilles cordiformes (en forme de cœur) forment un tapis vert dense et doux.",
      feedbackFail: "Regardez la feuille près de la base : elle dessine la silhouette d'un cœur arrondi."
    }
  },

  // 36. Flowers_n03_05
  {
    id: "Flowers_n03_05",
    modelPath: "/models/flowers/Flowers_n03_05.glb",
    cardType: "/assets/card/GoldenCard.png",
    frenchName: "Zinnia Sauvage",
    scientificName: "Zinnia peruviana",
    type: "Astéracées",
    status: "Préoccupation mineure (LC)",
    description: "Plante annuelle aux capitules rouge brique solitaires dressés sur de hautes tiges raides. D'une grande résistance à la chaleur, elle constitue une station d'alimentation clé pour les papillons migrateurs.",
    leftPanel: {
      Habitat: "Broussailles sèches, clairières sableuses et lisières brûlées de soleil.",
      Usages: "Attraction de la biodiversité pollinisatrice, teinture jaune-orangée, plante d'agrément."
    },
    rightPanel: {
      "Danger ?": "Sans danger. Fleurs très nectarifères.",
      Densité: "●●●○○ — Ensoleillé",
      "Tip de Feuille": "\"Chaque fleur reste épanouie pendant plusieurs semaines sans perdre son éclat rouge cuivré.\""
    },
    exercise: {
      question: "Pourquoi le Zinnia est-il précieux pour l'équilibre de la clairière ?",
      options: [
        "Il tue les pucerons avec ses racines",
        "Il fournit du nectar aux papillons et pollinisateurs sous forte chaleur",
        "Il transforme le sable en argile étanche",
        "Il produit des graines explosives qui réveillent les oiseaux"
      ],
      correctAnswer: 1,
      feedbackSuccess: "Exact ! Ses capitules résistants au soleil offrent du nectar vital quand les autres fleurs fanent.",
      feedbackFail: "Pensez au rôle des pollinisateurs : cette fleur fournit du nectar en continu aux insectes lors des chaleurs."
    }
  },

  // 37. Flowers_n03_06
  {
    id: "Flowers_n03_06",
    modelPath: "/models/flowers/Flowers_n03_06.glb",
    cardType: "/assets/card/SilverCard.png",
    frenchName: "Crotalaire à Hochet",
    scientificName: "Crotalaria retusa",
    type: "Fabacées",
    status: "Préoccupation mineure (LC)",
    description: "Herbe dressée aux magnifiques grappes de fleurs jaune papillon veinées de pourpre. Ses gousses sèches gonflées contiennent des graines dures qui cliquettent au vent comme un hochet d'enfant.",
    leftPanel: {
      Habitat: "Sols sableux, berges alluviales et clairières ouvertes.",
      Usages: "Fixation d'azote pour le sol, fibres textiles d'écorce, hochet naturel coutumier."
    },
    rightPanel: {
      "Danger ?": "Graines toxiques pour le bétail (alcaloïdes pyrrolizidiniques).",
      Densité: "●●●○○ — Régulier sur sentiers",
      "Tip de Feuille": "\"Secouez une gousse mûre : les graines détachées à l'intérieur tintent comme des grelots.\""
    },
    exercise: {
      question: "Quel bruit surprenant font les gousses mûres de Crotalaire lorsqu'on les secoue ?",
      options: [
        "Un tintement de hochet dû aux graines dures qui s'entrechoquent",
        "Un sifflement aigu comme une flûte en bambou",
        "Un son de tambour assourdi par la sève",
        "Aucun son, elles sont remplies d'eau"
      ],
      correctAnswer: 0,
      feedbackSuccess: "Tout à fait ! C'est ce cliquetis de graines libres dans la gousse sèche qui lui vaut son surnom de hochet.",
      feedbackFail: "Secouez sa gousse sèche : les graines détachées ricocheront à l'intérieur comme un petit hochet."
    }
  },

  // 38. Flowers_n03_07
  {
    id: "Flowers_n03_07",
    modelPath: "/models/flowers/Flowers_n03_07.glb",
    cardType: "/assets/card/GoldenCard.png",
    frenchName: "Bougainvillier Pourpre",
    scientificName: "Bougainvillea spectabilis",
    type: "Nyctaginacées",
    status: "Préoccupation mineure (LC)",
    description: "Arbuste sarmenteux grimpant dont les véritables fleurs, petites et tubulaires blanc crème, sont enchâssées dans trois somptueuses bractées pétaloïdes magenta vif semblables à du papier de soie.",
    leftPanel: {
      Habitat: "Lisières ensoleillées, rochers escarpés et haies forestières denses.",
      Usages: "Haie défensive impénétrable grâce à ses épines, régulation de la température des clairières."
    },
    rightPanel: {
      "Danger ?": "Fortes épines axillaires recourbées et acérées.",
      Densité: "●●●○○ — Vigoureux",
      "Tip de Feuille": "\"Ce que l'on prend pour des pétales flamboyants sont en réalité trois feuilles modifiées (bractées).\""
    },
    exercise: {
      question: "Que sont en réalité les parties violettes très colorées du Bougainvillier ?",
      options: [
        "Des pétales de fleur géants",
        "Des feuilles modifiées très fines appelées bractées",
        "Des fruits séchés restés accrochés",
        "Des racines aériennes colorées par le soleil"
      ],
      correctAnswer: 1,
      feedbackSuccess: "Brillant botaniste ! Les vraies fleurs sont les minuscules trompettes blanches au centre des bractées.",
      feedbackFail: "Regardez au cœur de la couleur vive : les vraies fleurs sont minuscules, entourées de trois bractées foliaires."
    }
  },

  // 39. Flowers_n03_08
  {
    id: "Flowers_n03_08",
    modelPath: "/models/flowers/Flowers_n03_08.glb",
    cardType: "/assets/card/SilverCard.png",
    frenchName: "Arbre de Santé",
    scientificName: "Guiera senegalensis",
    type: "Combrétacées",
    status: "Préoccupation mineure (LC)",
    description: "Arbuste buissonnant aux feuilles vert cendré parsemées de petites glandes noires et fleurs en glomérules soyeux. C'est l'une des panacées végétales les plus respectées des guérisseurs sahéliens et forestiers.",
    leftPanel: {
      Habitat: "Zones ouvertes, lisières de savane boisée et sols sablonneux dégradés.",
      Usages: "Décoction contre les bronchites aiguës, la toux et les fièvres ; bois de chauffe sans fumée."
    },
    rightPanel: {
      "Danger ?": "Sans danger. Arôme balsamique très apprécié en fumigation.",
      Densité: "●●●○○ — Résistant",
      "Tip de Feuille": "\"Examinez le dessous des feuilles à la loupe : vous verrez de minuscules points noirs caractéristiques.\""
    },
    exercise: {
      question: "Pourquoi le Guiera est-il qualifié d'arbre de santé par les anciens ?",
      options: [
        "Il pousse uniquement sur les tombes des médecins",
        "Ses feuilles soulagent une très grande diversité de maux respiratoires et fièvres",
        "Il guérit les morsures de lion en deux secondes",
        "Son tronc produit de l'eau minérale gazeuse"
      ],
      correctAnswer: 1,
      feedbackSuccess: "Exact ! C'est un remède traditionnel polyvalent employé contre la toux, la fièvre et les refroidissements.",
      feedbackFail: "Pensez aux vertus médicinales : son infusion soigne la plupart des maux du quotidien, notamment respiratoires."
    }
  },

  // 40. Flowers_n03_09 (Forêt ancienne)
  {
    id: "Flowers_n03_09",
    modelPath: "/models/flowers/Flowers_n03_09.glb",
    cardType: "/assets/card/GoldenCard.png",
    frenchName: "Maniguette Sacrée",
    scientificName: "Aframomum melegueta",
    type: "Zingibéracées",
    status: "Préoccupation mineure (LC)",
    description: "Plante herbacée vivace majestueuse aux tiges de deux mètres et magnifiques fleurs rose pourpre naissant au ras du sol. Ses graines aromatiques d'un piquant poivré sont les 'Graines du Paradis'.",
    leftPanel: {
      Habitat: "Sous-bois denses, ombragés et humides de la forêt primaire ancienne.",
      Usages: "Épice sacrée noble, stimulant digestif, symbole d'hospitalité et d'alliance pacifique coutumière."
    },
    rightPanel: {
      "Danger ?": "Sans danger. Graines très épicées et chaudes en bouche.",
      Densité: "●●○○○ — Forêt ancienne préservée",
      "Tip de Feuille": "\"Contrairement aux apparences, les fleurs n'apparaissent pas sur la tige mais sortent directement de la souche au sol.\""
    },
    exercise: {
      question: "Où naissent les fleurs spectaculaires de la Maniguette en forêt ?",
      options: [
        "Tout au sommet de la tige à 2 mètres de hauteur",
        "Directement à la base de la souche au niveau de la terre",
        "Sous l'eau dans les mares boueuses",
        "Sur les racines des arbres voisins"
      ],
      correctAnswer: 1,
      feedbackSuccess: "Excellent ! C'est une floraison basale : les corolles émergent du sol avant de former les gousses rouges.",
      feedbackFail: "Regardez au ras du sol : chez la maniguette, la fleur s'épanouit directement au pied de la souche."
    }
  },

  // 41. Flowers_n03_10
  {
    id: "Flowers_n03_10",
    modelPath: "/models/flowers/Flowers_n03_10.glb",
    cardType: "/assets/card/GoldenCard.png",
    frenchName: "Euphorbe Candélabre",
    scientificName: "Euphorbia ingens",
    type: "Euphorbiacées",
    status: "Préoccupation mineure (LC)",
    description: "Arbre succulent imposant dressant ses tiges vert foncé cannelées comme les branches d'un lustre monumental. Ses minuscules fleurs jaunes bordent les arêtes épineuses des rameaux.",
    leftPanel: {
      Habitat: "Falaises rocheuses brûlantes, crêtes arides et clairières sèches.",
      Usages: "Rôle de brise-vent, latex jadis utilisé pour empoisonner les flèches ou étourdir les poissons."
    },
    rightPanel: {
      "Danger ?": "⚠ Latex laiteux très caustique, aveuglant et irritant pour les yeux !",
      Densité: "●●○○○ — Silhouette remarquable",
      "Tip de Feuille": "\"Ne touchez jamais le latex blanc qui coule à la moindre cassure : il provoque de graves brûlures oculaires.\""
    },
    exercise: {
      question: "Quel danger majeur présente le latex blanc de l'Euphorbe candélabre ?",
      options: [
        "Il explose spontanément sous le soleil de midi",
        "Il est très caustique et peut provoquer de graves brûlures aux yeux",
        "Il dégage un gaz qui endort les randonneurs",
        "Il attire irrésistiblement les panthères affamées"
      ],
      correctAnswer: 1,
      feedbackSuccess: "Prudence respectée ! Ce suc laiteux brûle intensément la peau et peut rendre temporairement aveugle.",
      feedbackFail: "Attention danger : ce latex corrosif est redouté pour les lésions qu'il inflige à la peau et aux yeux."
    }
  },

  // 42. Flowers_n03_11
  {
    id: "Flowers_n03_11",
    modelPath: "/models/flowers/Flowers_n03_11.glb",
    cardType: "/assets/card/SilverCard.png",
    frenchName: "Passiflore Sauvage",
    scientificName: "Passiflora foetida",
    type: "Passifloracées",
    status: "Préoccupation mineure (LC)",
    description: "Liane grimpante aux fleurs délicates blanches et mauves entourées d'une collerette de poils glanduleux collants retenant les insectes. Ses fruits sphériques orangés sont emballés dans un filet végétal.",
    leftPanel: {
      Habitat: "Lisières de chemins, friches forestières et clairières perturbées.",
      Usages: "Infusion apaisante contre l'insomnie et l'anxiété, fruits doux comestibles bien mûrs."
    },
    rightPanel: {
      "Danger ?": "Feuilles immatures légèrement cyanogéniques ; fruits mûrs inoffensifs.",
      Densité: "●●●○○ — Commun en bordure",
      "Tip de Feuille": "\"Ses bractées finement découpées sécrètent un liquide gluant piégeant les petits insectes ravageurs.\""
    },
    exercise: {
      question: "Quelle fonction protectrice assure le filet de poils collants autour de son bouton ?",
      options: [
        "Il capture de la poussière d'or pour briller",
        "Il piège les insectes ravageurs voulant dévorer la fleur",
        "Il empêche l'eau de pluie d'atteindre la racine",
        "Il permet à la fleur de capter les ultrasons"
      ],
      correctAnswer: 1,
      feedbackSuccess: "Exact ! C'est une plante protocarnivore : ce filet collant protège la corolle des prédateurs d'insectes.",
      feedbackFail: "Observez le grillage végétal velu : ses glandes collantes dissuadent les chenilles et ravageurs voraces."
    }
  },

  // 43. Flowers_n03_12
  {
    id: "Flowers_n03_12",
    modelPath: "/models/flowers/Flowers_n03_12.glb",
    cardType: "/assets/card/SilverCard.png",
    frenchName: "Glaïeul Perroquet",
    scientificName: "Gladiolus dalenii",
    type: "Iridacées",
    status: "Préoccupation mineure (LC)",
    description: "Plante vivace à corme dressant un superbe épi de fleurs courbées écarlates et jaune vif évoquant les plumes d'un ara. Elle traverse la saison sèche en dormant sous terre.",
    leftPanel: {
      Habitat: "Savanes herbeuses humides, clairières rocheuses d'altitude.",
      Usages: "Corme utilisé traditionnellement contre la dysenterie, ornement naturel éclatant."
    },
    rightPanel: {
      "Danger ?": "Cormes crus purgatifs ; ne pas consommer crus.",
      Densité: "●●○○○ — Floraison après la pluie",
      "Tip de Feuille": "\"Le pétale supérieur forme un dôme protecteur au-dessus du pistil pour abriter le pollen de la pluie.\""
    },
    exercise: {
      question: "Comment le Glaïeul Perroquet survit-il aux incendies de brousse périodiques ?",
      options: [
        "Il s'envole avec le vent vers un autre biome",
        "Son corme charnu reste enfoui à l'abri sous terre",
        "Il sécrète une eau qui éteint les flammes autour de lui",
        "Ses feuilles d'acier ne peuvent pas brûler"
      ],
      correctAnswer: 1,
      feedbackSuccess: "Bien répondu ! Sa réserve souterraine (corme) lui permet de repousser vigoureusement après le feu.",
      feedbackFail: "Pensez aux organes de réserve sous le sol : son bulbe souterrain est protégé de la chaleur des flammes."
    }
  },

  // 44. Flowers_n03_13
  {
    id: "Flowers_n03_13",
    modelPath: "/models/flowers/Flowers_n03_13.glb",
    cardType: "/assets/card/SilverCard.png",
    frenchName: "Herbe aux Verrues",
    scientificName: "Heliotropium indicum",
    type: "Boraginacées",
    status: "Préoccupation mineure (LC)",
    description: "Herbe robuste dressant des épis floraux spiralés courbés comme la queue d'un scorpion, portant de minuscules fleurs lilas clair. L'épi se déroule progressivement à mesure que les fleurs s'ouvrent.",
    leftPanel: {
      Habitat: "Terrains vagues humides, fossés alluviaux et bords de flaques.",
      Usages: "Suc de feuilles broyées appliqué contre les plaies rebelles, verrues et dermatoses."
    },
    rightPanel: {
      "Danger ?": "Toxique par ingestion prolongée (alcaloïdes hépatiques).",
      Densité: "●●●○○ — Présence marquée près de l'eau",
      "Tip de Feuille": "\"L'inflorescence s'enroule sur elle-même comme une crosse scorpionique très typique.\""
    },
    exercise: {
      question: "À quelle forme animale ressemble l'épi floral courbé de cette plante ?",
      options: [
        "À une carapace de tortue géante",
        "À une queue de scorpion enroulée",
        "À une aile de libellule étirée",
        "À une tête de girafe allongée"
      ],
      correctAnswer: 1,
      feedbackSuccess: "Exact ! Cette inflorescence scorpioïde rappelle la queue recourbée d'un scorpion prêt à piquer.",
      feedbackFail: "Regardez la courbure de la tige florale : elle dessine l'arc parfait de la queue d'un scorpion."
    }
  },

  // 45. Flowers_n03_14
  {
    id: "Flowers_n03_14",
    modelPath: "/models/flowers/Flowers_n03_14.glb",
    cardType: "/assets/card/SilverCard.png",
    frenchName: "Sauge des Bois",
    scientificName: "Buddleja salviifolia",
    type: "Scrophulariacées",
    status: "Préoccupation mineure (LC)",
    description: "Bel arbuste aux feuilles plissées vert-gris ressemblant à de la sauge et panicules denses de fleurs blanches ou lilas au cœur orange. Elles dégagent un parfum de miel qui attire des nuées de papillons.",
    leftPanel: {
      Habitat: "Ravins boisés, berges de torrents et lisières fraîches.",
      Usages: "Feuilles infusées pour soulager les coliques, bois dur apprécié pour la fabrication de sagaies."
    },
    rightPanel: {
      "Danger ?": "Sans danger. Nectar abondant attirant les insectes utiles.",
      Densité: "●●○○○ — Ruisseaux frais",
      "Tip de Feuille": "\"Le dessous de ses feuilles est couvert d'un feutrage épais de poils blancs très doux au toucher.\""
    },
    exercise: {
      question: "Quelle senteur caractéristique attire tant d'insectes vers les fleurs du Buddleja ?",
      options: [
        "Une odeur de viande avariée",
        "Un parfum suave et chaleureux de miel frais",
        "Une odeur âcre de vinaigre d'alcool",
        "Une absence totale d'odeur perceptible"
      ],
      correctAnswer: 1,
      feedbackSuccess: "Bravo ! Ses effluves miellées sont un aimant irrésistible pour tous les papillons de la région.",
      feedbackFail: "Humez l'air à proximité : ses corolles sentent le miel sucré et attirent des essaims de butineurs."
    }
  },

  // 46. Flowers_n03_15
  {
    id: "Flowers_n03_15",
    modelPath: "/models/flowers/Flowers_n03_15.glb",
    cardType: "/assets/card/SilverCard.png",
    frenchName: "Magnolia Parfumé",
    scientificName: "Magnolia champaca",
    type: "Magnoliacées",
    status: "Préoccupation mineure (LC)",
    description: "Arbre majestueux produisant de magnifiques fleurs aux pétales étroits jaune d'or dégageant l'un des parfums les plus suaves de la nature. Ses huiles sont convoitées pour les baumes cérémoniels.",
    leftPanel: {
      Habitat: "Vallons abrités, sols humifères profonds et forêts galeries.",
      Usages: "Huile essentielle précieuse, fleurs déposées dans les habitations pour chasser les odeurs de moisi."
    },
    rightPanel: {
      "Danger ?": "Sans danger. Parfum très envoûtant.",
      Densité: "●○○○○ — Arbre vénéré",
      "Tip de Feuille": "\"Une seule fleur cueillie embaume une pièce entière pendant deux jours consécutifs.\""
    },
    exercise: {
      question: "Quelle réputation olfactive exceptionnelle a rendu ce magnolia célèbre ?",
      options: [
        "Son odeur fait fuir tous les oiseaux",
        "Son parfum extrêmement raffiné est recherché en haute parfumerie",
        "Ses pétales sentent le soufre brûlé",
        "Il ne dégage son odeur que sous la neige"
      ],
      correctAnswer: 1,
      feedbackSuccess: "Tout à fait ! Son essence, le champaca, est l'un des trésors les plus précieux des parfumeurs.",
      feedbackFail: "Pensez au monde des senteurs précieuses : son huile est l'une des essences de parfum les plus chères."
    }
  },

  // 47. Flowers_n03_16
  {
    id: "Flowers_n03_16",
    modelPath: "/models/flowers/Flowers_n03_16.glb",
    cardType: "/assets/card/GoldenCard.png",
    frenchName: "Lis Géant des Marais",
    scientificName: "Crinum jagus",
    type: "Amaryllidacées",
    status: "Préoccupation mineure (LC)",
    description: "Plante bulbeuse géante des marécages produisant de somptueuses ombelles de grandes fleurs blanches en cloche penchées au doux parfum de vanille. Son gros bulbe survit dans la vase saturée d'eau.",
    leftPanel: {
      Habitat: "Bas-fonds inondables, marécages forestiers et rives boueuses.",
      Usages: "Bulbes écrasés en cataplasme anti-inflammatoire pour résorber les œdèmes et entorses."
    },
    rightPanel: {
      "Danger ?": "⚠ Bulbe riche en alcaloïdes toxiques par voie interne.",
      Densité: "●●○○○ — Milieux aquatiques",
      "Tip de Feuille": "\"Ses corolles d'un blanc pur et soyeux se détachent magnifiquement sur la boue noire des marais.\""
    },
    exercise: {
      question: "Dans quel type d'environnement le Lis Crinum établit-il son habitat de prédilection ?",
      options: [
        "Au sommet des dunes de sable brûlant",
        "Dans la boue et les marécages inondés de forêt",
        "Sur les toits en tôle des villages",
        "Dans les déserts de pierres sèches"
      ],
      correctAnswer: 1,
      feedbackSuccess: "Bravo ! Ses puissants bulbes s'ancrent dans la vase humide des bas-fonds inondables.",
      feedbackFail: "Regardez où il pousse : il plonge ses racines dans les marécages et la boue gorgée d'eau."
    }
  },

  // 48. Flowers_n03_17
  {
    id: "Flowers_n03_17",
    modelPath: "/models/flowers/Flowers_n03_17.glb",
    cardType: "/assets/card/SilverCard.png",
    frenchName: "Feuille Amère",
    scientificName: "Vernonia amygdalina",
    type: "Astéracées",
    status: "Préoccupation mineure (LC)",
    description: "Arbrisseau robuste aux petites fleurs blanches plumeuses mellifères. Les chimpanzés sauvages consomment sa tige amère pour éliminer leurs parasites intestinaux, inspirant la médecine humaine.",
    leftPanel: {
      Habitat: "Lisières de forêts secondaires, haies villageoises et clairières.",
      Usages: "Base du fameux plat 'ndolé' après lavage, déparasitant intestinal et hépatoprotecteur renommé."
    },
    rightPanel: {
      "Danger ?": "Sans danger. Goût extrêmement amer nécessitant plusieurs lavages à l'eau.",
      Densité: "●●●●○ — Très commun",
      "Tip de Feuille": "\"Les chimpanzés malades mâchent la moelle de ses tiges pour se soigner des vers intestinaux (zoopharmacognosie).\""
    },
    exercise: {
      question: "Quel animal sauvage a appris aux humains à consommer la Vernonia pour se déparasiter ?",
      options: [
        "Le lion du désert",
        "Le chimpanzé de la forêt",
        "L'hippopotame des rivières",
        "Le crocodile marin"
      ],
      correctAnswer: 1,
      feedbackSuccess: "Fascinant ! C'est un exemple célèbre de zoopharmacognosie : les chimpanzés l'utilisent comme médicament.",
      feedbackFail: "Pensez au primate le plus proche de nous : les chimpanzés mâchent ses tiges pour purger leurs vers."
    }
  },

  // 49. Flowers_n03_18
  {
    id: "Flowers_n03_18",
    modelPath: "/models/flowers/Flowers_n03_18.glb",
    cardType: "/assets/card/GoldenCard.png",
    frenchName: "Corossolier Épineux",
    scientificName: "Annona muricata",
    type: "Annonacées",
    status: "Préoccupation mineure (LC)",
    description: "Petit arbre aux fleurs charnues vert-jaune triangulaires à trois pétales épais. Son gros fruit vert en forme de cœur hérissé de pointes souples renferme une pulpe blanche juteuse et parfumée.",
    leftPanel: {
      Habitat: "Sous-bois clairs, vergers villageois et lisières humides.",
      Usages: "Fruit désaltérant riche en antioxydants, feuilles infusées pour calmer les nerfs et favoriser le sommeil."
    },
    rightPanel: {
      "Danger ?": "Graines noires non comestibles (toxiques pour les yeux).",
      Densité: "●●●○○ — Fréquemment planté",
      "Tip de Feuille": "\"Froissez une feuille de corossol : son parfum fruité et relaxant favorise la détente du soir.\""
    },
    exercise: {
      question: "Quelle forme singulière présentent les fleurs charnues du Corossolier ?",
      options: [
        "Une fine cloche pendante",
        "Une pyramide triangulaire à trois pétales très épais",
        "Un pompon rond de poils soyeux",
        "Une tige plate en forme d'éventail"
      ],
      correctAnswer: 1,
      feedbackSuccess: "Exact ! Ses fleurs robustes et géométriques ressemblent à une pyramide triangulaire de cire.",
      feedbackFail: "Observez la silhouette de sa fleur : elle possède trois pétales épais formant une structure triangulaire."
    }
  },

  // 50. Flowers_n03_19
  {
    id: "Flowers_n03_19",
    modelPath: "/models/flowers/Flowers_n03_19.glb",
    cardType: "/assets/card/GoldenCard.png",
    frenchName: "Tuloucouna des Marais",
    scientificName: "Carapa procera",
    type: "Méliacées",
    status: "Préoccupation mineure (LC)",
    description: "Arbre imposant des forêts marécageuses aux grappes de petites fleurs blanches odorantes et grands fruits ligneux à cinq valves. Ses grosses graines fournissent une huile médicinale légendaire.",
    leftPanel: {
      Habitat: "Forêts galeries inondables, marécages et berges alluviales.",
      Usages: "Huile de tuloucouna précieuse pour soigner les dermatoses, répulsif naturel anti-moustiques et tiques."
    },
    rightPanel: {
      "Danger ?": "Huile extrêmement amère ; usage cutané privilégié.",
      Densité: "●●○○○ — Marais forestier",
      "Tip de Feuille": "\"L'huile extraite de ses graines protège efficacement la peau des attaques de tiques et d'insectes piqueurs.\""
    },
    exercise: {
      question: "Quel produit précieux extrait-on traditionnellement des graines de Carapa ?",
      options: [
        "Une huile amère médicinale répulsive contre les insectes",
        "Une poudre blanche qui remplace la farine",
        "Un poison foudroyant pour la chasse au gros gibier",
        "Un colorant violet pour peindre les pirogues"
      ],
      correctAnswer: 0,
      feedbackSuccess: "Bravo ! L'huile de tuloucouna est l'un des plus précieux trésors de la pharmacopée forestière africaine.",
      feedbackFail: "Pensez aux soins de la peau : on presse ses graines pour en recueillir une huile amère très protectrice."
    }
  },

  // 51. Flowers_n03_20
  {
    id: "Flowers_n03_20",
    modelPath: "/models/flowers/Flowers_n03_20.glb",
    cardType: "/assets/card/SilverCard.png",
    frenchName: "Frangipanier Blanc",
    scientificName: "Plumeria alba",
    type: "Apocynacées",
    status: "Préoccupation mineure (LC)",
    description: "Petit arbre aux rameaux succulents épais couronnés de grandes fleurs blanches cireuses au cœur d'or. Leur parfum exquis embaume l'air chaud et s'intensifie après le coucher du soleil.",
    leftPanel: {
      Habitat: "Clairières sablonneuses, jardins ensoleillés et rocailles sèches.",
      Usages: "Plante d'ornement et d'offrande spirituelle, parfumage des huiles corporelles traditionnelles."
    },
    rightPanel: {
      "Danger ?": "Latex blanc abondant et irritant pour la bouche.",
      Densité: "●●●○○ — Présence chaleureuse",
      "Tip de Feuille": "\"Les pétales s'enroulent en hélice avant l'éclosion, créant une spirale d'une harmonie parfaite.\""
    },
    exercise: {
      question: "Pourquoi le parfum du Frangipanier devient-il plus puissant la nuit ?",
      options: [
        "Pour chasser les chauves-souris",
        "Pour guider les papillons de nuit pollinisateurs (Sphingidés)",
        "Pour empêcher la rosée de se déposer sur les pétales",
        "Parce que la lumière du jour détruit le parfum"
      ],
      correctAnswer: 1,
      feedbackSuccess: "Exactement ! Ce parfum nocturne envoûte les grands papillons de nuit qui assurent sa reproduction.",
      feedbackFail: "Pensez aux visiteurs de la nuit : les sphinx (papillons nocturnes) sont attirés par son effluve dès le soir."
    }
  },

  // 52. Flowers_n03_21
  {
    id: "Flowers_n03_21",
    modelPath: "/models/flowers/Flowers_n03_21.glb",
    cardType: "/assets/card/SilverCard.png",
    frenchName: "Oiseau de Paradis Géant",
    scientificName: "Strelitzia nicolai",
    type: "Strelitziacées",
    status: "Préoccupation mineure (LC)",
    description: "Plante géante aux allures de bananier dressant de magnifiques inflorescences évoquant la crête d'une grue royale, avec des spathes bleu nuit et des sépales blanc pur.",
    leftPanel: {
      Habitat: "Lisières de forêt côtière, bordures de ravins humides et clairières.",
      Usages: "Graines entourées d'un arille orange vif riche en lipides consommé par les oiseaux, cordages avec les pétioles."
    },
    rightPanel: {
      "Danger ?": "Sans danger. Graines dures à ne pas croquer.",
      Densité: "●●○○○ — Majestueux",
      "Tip de Feuille": "\"Ses feuilles géantes se déchirent naturellement sous le vent pour éviter que la tige ne se brise.\""
    },
    exercise: {
      question: "Pourquoi les grandes feuilles de Strelitzia se déchirent-elles en lanières au vent ?",
      options: [
        "À cause d'une maladie provoquée par les vers",
        "C'est une adaptation pour laisser passer le vent sans rompre le tronc",
        "Pour permettre aux oiseaux de tisser des nids",
        "Pour récolter plus de lumière solaire"
      ],
      correctAnswer: 1,
      feedbackSuccess: "Très bien ! Ces fentes naturelles réduisent la prise au vent comme les lattes d'un store vénitien.",
      feedbackFail: "Pensez à la force des bourrasques : les fentes évitent à la feuille d'agir comme une voile et de casser la tige."
    }
  },

  // 53. Flowers_n03_22
  {
    id: "Flowers_n03_22",
    modelPath: "/models/flowers/Flowers_n03_22.glb",
    cardType: "/assets/card/SilverCard.png",
    frenchName: "Verveine Papillon",
    scientificName: "Verbena bonariensis",
    type: "Verbénacées",
    status: "Préoccupation mineure (LC)",
    description: "Herbe élancée aux tiges rigides carrées portant à leur sommet une multitude de petites cymes de fleurs violettes aériennes. Elle oscille au vent sans jamais verser et attire les insectes volants.",
    leftPanel: {
      Habitat: "Prairies ouvertes, zones humides temporaires et clairières dégagées.",
      Usages: "Fleur mellifère majeure pour la régénération des insectes pollinisateurs, tisane apaisante."
    },
    rightPanel: {
      "Danger ?": "Sans danger. Tiges très résistantes.",
      Densité: "●●●○○ — Éthéré et dynamique",
      "Tip de Feuille": "\"Ses tiges à quatre angles droits sont si légères et solides qu'elles plient sans rompre sous la pluie.\""
    },
    exercise: {
      question: "Quelle forme de tige géométrique permet à la Verveine de rester droite au vent ?",
      options: [
        "Une tige ronde et creuse",
        "Une tige carrée à quatre angles renforcés",
        "Une tige en spirale comme une vis",
        "Une tige plate en zig-zag"
      ],
      correctAnswer: 1,
      feedbackSuccess: "Bravo ! La tige quadrangulaire (carrée) confère une remarquable résistance mécanique au vent.",
      feedbackFail: "Faites rouler la tige entre vos doigts : vous sentirez quatre côtés plats formant un carré rigide."
    }
  },

  // 54. Flowers_n03_23
  {
    id: "Flowers_n03_23",
    modelPath: "/models/flowers/Flowers_n03_23.glb",
    cardType: "/assets/card/GoldenCard.png",
    frenchName: "Arbre à Parfum",
    scientificName: "Cananga odorata",
    type: "Annonacées",
    status: "Préoccupation mineure (LC)",
    description: "Arbre forestier aux curieuses fleurs pendantes aux longs pétales étroits jaune verdâtre ondulés comme des rubans. Leur fragrance enivrante est au cœur des parfums les plus renommés du monde.",
    leftPanel: {
      Habitat: "Forêts tropicales humides de plaine, sols riches et bien ensoleillés.",
      Usages: "Distillation de l'huile essentielle d'Ylang-Ylang, huile capillaire protectrice traditionnelle."
    },
    rightPanel: {
      "Danger ?": "Sans danger. Huile très concentrée à doser avec modération.",
      Densité: "●●○○○ — Forêt équatoriale",
      "Tip de Feuille": "\"Les pétales passent du vert terne au jaune d'or profond lorsqu'ils atteignent leur apogée de parfum.\""
    },
    exercise: {
      question: "Sous quel nom célèbre connaît-on l'huile essentielle extraite de ces fleurs rubanées ?",
      options: [
        "L'huile d'Ylang-Ylang",
        "L'eau de Cologne sauvage",
        "L'essence de patchouli noir",
        "L'élixir de rose des sables"
      ],
      correctAnswer: 0,
      feedbackSuccess: "C'est cela même ! L'huile d'Ylang-Ylang est une star légendaire de la parfumerie mondiale.",
      feedbackFail: "Rappelez-vous le nom traditionnel de cette fleur reine des parfums : l'Ylang-Ylang !"
    }
  },

  // 55. Flowers_n03_24
  {
    id: "Flowers_n03_24",
    modelPath: "/models/flowers/Flowers_n03_24.glb",
    cardType: "/assets/card/SilverCard.png",
    frenchName: "Liseron d'Eau Douce",
    scientificName: "Ipomoea aquatica",
    type: "Convolvulacées",
    status: "Préoccupation mineure (LC)",
    description: "Plante aquatique rampante et flottante aux tiges creuses remplies d'air portant de jolies corolles en entonnoir rose pâle au cœur violet. Elle tapisse doucement la rive des marigots calmes.",
    leftPanel: {
      Habitat: "Berges boueuses, étangs calmes et canaux de décharge lents.",
      Usages: "Tiges et feuilles consommées comme légume vert succulent (épinard d'eau), fourrage doux."
    },
    rightPanel: {
      "Danger ?": "Sans danger. Toujours laver ou cuire avant de consommer.",
      Densité: "●●●●○ — En tapis aquatiques",
      "Tip de Feuille": "\"Ses tiges creuses agissent comme des flotteurs tubulaires qui lui permettent d'avancer sur l'eau.\""
    },
    exercise: {
      question: "Quelle particularité des tiges permet au Liseron d'eau d'avancer en tapis sur la rivière ?",
      options: [
        "Elles sont remplies de pierres ponces",
        "Elles sont entièrement creuses et agissent comme des flotteurs",
        "Elles sont magnétiques et attirées par la rive opposée",
        "Elles sont couvertes d'épines de flottaison"
      ],
      correctAnswer: 1,
      feedbackSuccess: "Exactement ! Leurs tubes creux remplis d'air maintiennent l'ensemble de la plante à la surface de l'eau.",
      feedbackFail: "Regardez la section de la tige : elle forme un tube creux hermétique qui flotte comme un tuyau étanche."
    }
  },

  // 56. Flowers_n03_25
  {
    id: "Flowers_n03_25",
    modelPath: "/models/flowers/Flowers_n03_25.glb",
    cardType: "/assets/card/GoldenCard.png",
    frenchName: "Baobab Chacal",
    scientificName: "Adenium obesum",
    type: "Apocynacées",
    status: "Préoccupation mineure (LC)",
    description: "Plante succulente fascinante dotée d'un caudex gonflé comme une outre d'eau pour braver les pires sécheresses. Ses fleurs éclatantes rose carmin et blanc surgissent sur des branches sans feuilles.",
    leftPanel: {
      Habitat: "Sols rocheux arides, collines caillouteuses et falaises désertiques.",
      Usages: "Plante ornementale sculpturale, sève toxique autrefois employée pour les flèches de chasse."
    },
    rightPanel: {
      "Danger ?": "⚠ Sève laiteuse contenant des glycosides cardiaques très puissants.",
      Densité: "●●○○○ — Milieux arides",
      "Tip de Feuille": "\"Son gros tronc boursouflé stocke des dizaines de litres d'eau pour affronter six mois sans pluie.\""
    },
    exercise: {
      question: "Pourquoi le tronc de l'Adenium a-t-il cette forme renflée et boursouflée ?",
      options: [
        "Pour abriter des nids d'oiseaux dans son écorce",
        "Pour emmagasiner une précieuse réserve d'eau contre la sécheresse",
        "Pour stocker des pierres digérées",
        "Pour résister au piétinement des troupeaux"
      ],
      correctAnswer: 1,
      feedbackSuccess: "Parfait ! Ce tronc renflé appelé caudex est une citerne naturelle pour traverser la saison sèche.",
      feedbackFail: "Pensez au climat aride : ce tronc renflé sert de réservoir d'eau vital pour survivre à la sécheresse."
    }
  },

  // 57. Flowers_n03_26
  {
    id: "Flowers_n03_26",
    modelPath: "/models/flowers/Flowers_n03_26.glb",
    cardType: "/assets/card/GoldenCard.png",
    frenchName: "Tamarindier Sauvage",
    scientificName: "Tamarindus indica",
    type: "Fabacées",
    status: "Préoccupation mineure (LC)",
    description: "Bel arbre à la cime arrondie et feuillage plumeux aux petites fleurs jaunes finement striées de rouge. Ses gousses bosselées abritent une pulpe brune acidulée célèbre dans toute l'Afrique.",
    leftPanel: {
      Habitat: "Savanes arborées, bords de ruisseaux et clairières d'anciennes cabanes.",
      Usages: "Pulpe digestive acidulée, boisson rafraîchissante, bois très résistant pour outils et mortiers."
    },
    rightPanel: {
      "Danger ?": "Sans danger. Fruit acidulé excellent pour le transit.",
      Densité: "●●●○○ — Arbre nourricier",
      "Tip de Feuille": "\"Ses petites folioles se replient délicatement l'une contre l'autre à la tombée de la nuit.\""
    },
    exercise: {
      question: "Quelle saveur caractéristique possède la pulpe brune des gousses de tamarin ?",
      options: [
        "Un goût amer et salé de mer",
        "Une saveur acidulée très fruitée et rafraîchissante",
        "Un goût brûlant de piment rouge",
        "Une saveur totalement fade sans goût"
      ],
      correctAnswer: 1,
      feedbackSuccess: "Bravo ! Ce goût aigre-doux et acidulé en fait l'une des boissons les plus désaltérantes sous les tropiques.",
      feedbackFail: "Goûtez la pulpe : son goût est agréablement acidulé, très riche en acide tartrique rafraîchissant."
    }
  },

  // 58. Flowers_n03_27
  {
    id: "Flowers_n03_27",
    modelPath: "/models/flowers/Flowers_n03_27.glb",
    cardType: "/assets/card/GoldenCard.png",
    frenchName: "Citronnelle Sauvage",
    scientificName: "Cymbopogon citratus",
    type: "Poacées",
    status: "Préoccupation mineure (LC)",
    description: "Grande graminée vivace formant de puissantes touffes de feuilles linéaires coupantes. Dès qu'on effleure son feuillage, elle libère une vive bouffée d'arôme de citronnelle purifiant.",
    leftPanel: {
      Habitat: "Terrains bien drainés, lisières de campement et clairières lumineuses.",
      Usages: "Infusion digestive et fébrifuge, répulsif naturel puissant contre les moustiques, huile purifiante."
    },
    rightPanel: {
      "Danger ?": "Sans danger. Bords des feuilles coupants comme des rasoirs végétaux.",
      Densité: "●●●●○ — En touffes vigoureuses",
      "Tip de Feuille": "\"Manipulez les feuilles de la base vers le haut pour éviter d'entailler vos doigts sur les bords denticulés.\""
    },
    exercise: {
      question: "Quel principe actif odorant confère à la citronnelle ses vertus répulsives contre les moustiques ?",
      options: [
        "La caféine pure",
        "Le citronellal et le géraniol",
        "L'ammoniaque végétale",
        "Le camphre de sapin"
      ],
      correctAnswer: 1,
      feedbackSuccess: "Exactement ! Le citronellal masque les odeurs corporelles et désoriente complètement les moustiques.",
      feedbackFail: "Son nom vous l'indique : elle est saturée de citronellal, un puissant composé aromatique aux notes de citron."
    }
  },

  // 59. Flowers_n03_28
  {
    id: "Flowers_n03_28",
    modelPath: "/models/flowers/Flowers_n03_28.glb",
    cardType: "/assets/card/SilverCard.png",
    frenchName: "Faux Sésame Doré",
    scientificName: "Ceratotheca sesamoides",
    type: "Pédaliacées",
    status: "Préoccupation mineure (LC)",
    description: "Herbe dressée ornée de ravissantes fleurs tubulaires en clochete rose lilacée à pourpre. Ses feuilles cuites deviennent mucilagineuses et ses petites graines sont riches en huile nourrissante.",
    leftPanel: {
      Habitat: "Sols sablonneux dégradés, jachères et lisières forestières ouvertes.",
      Usages: "Feuilles mucilagineuses liant les sauces traditionnelles, graines oléagineuses nutritives."
    },
    rightPanel: {
      "Danger ?": "Sans danger. Plante nourricière de résilience.",
      Densité: "●●●○○ — Sols sablonneux",
      "Tip de Feuille": "\"Ses fruits portent à leur sommet deux petites cornes caractéristiques recourbées vers le haut.\""
    },
    exercise: {
      question: "Quelle particularité visuelle permet d'identifier la capsule de graines de Ceratotheca ?",
      options: [
        "Elle porte deux petites cornes recourbées à son sommet",
        "Elle est en forme de ballon transparent gonflé de gaz",
        "Elle brille d'une lueur phosphorescente dans le noir",
        "Elle est entourée d'épines de porc-épic"
      ],
      correctAnswer: 0,
      feedbackSuccess: "C'est bien cela ! Ces deux cornes au sommet du fruit ont donné son nom scientifique (Ceratotheca : boîte cornée).",
      feedbackFail: "Regardez le fruit sec : il est surmonté de deux pointes recourbées comme les cornes d'un petit bélier."
    }
  }
];

// Validation checks
console.log(`Verifying ${plantsData.length} plants data...`);

if (plantsData.length !== 59) {
  throw new Error(`Expected 59 plants, got ${plantsData.length}`);
}

const originalIds = rawCurrent.flowers.map(f => f.id);
const newIds = plantsData.map(f => f.id);
if (JSON.stringify(originalIds) !== JSON.stringify(newIds)) {
  throw new Error("IDs do not strictly match original sequence!");
}

const names = new Set();
const scientificNames = new Set();
const descriptions = new Set();
const usages = new Set();
const questions = new Set();
const answerDistribution = { 0: 0, 1: 2, 2: 0, 3: 0 };

for (const plant of plantsData) {
  // Uniqueness
  if (names.has(plant.frenchName)) throw new Error(`Duplicate frenchName: ${plant.frenchName}`);
  names.add(plant.frenchName);

  if (scientificNames.has(plant.scientificName)) throw new Error(`Duplicate scientificName: ${plant.scientificName}`);
  scientificNames.add(plant.scientificName);

  if (descriptions.has(plant.description)) throw new Error(`Duplicate description: ${plant.description}`);
  descriptions.add(plant.description);

  if (usages.has(plant.leftPanel.Usages)) throw new Error(`Duplicate usages: ${plant.leftPanel.Usages}`);
  usages.add(plant.leftPanel.Usages);

  if (questions.has(plant.exercise.question)) throw new Error(`Duplicate question: ${plant.exercise.question}`);
  questions.add(plant.exercise.question);

  // Exercise validation
  if (!plant.exercise.options || plant.exercise.options.length !== 4) {
    throw new Error(`Plant ${plant.id} does not have exactly 4 options`);
  }
  const optionSet = new Set(plant.exercise.options);
  if (optionSet.size !== 4) {
    throw new Error(`Plant ${plant.id} has duplicate options: ${plant.exercise.options}`);
  }
  if (![0, 1, 2, 3].includes(plant.exercise.correctAnswer)) {
    throw new Error(`Plant ${plant.id} has invalid correctAnswer: ${plant.exercise.correctAnswer}`);
  }
  answerDistribution[plant.exercise.correctAnswer] = (answerDistribution[plant.exercise.correctAnswer] || 0) + 1;

  // Length checks for card UI elegance
  if (plant.frenchName.length > 35) {
    console.warn(`Warning: frenchName quite long for ${plant.id}: ${plant.frenchName} (${plant.frenchName.length})`);
  }
  if (plant.description.length > 250) {
    console.warn(`Warning: description long for ${plant.id}: (${plant.description.length})`);
  }
  if (plant.leftPanel.Usages.length > 180) {
    console.warn(`Warning: usages long for ${plant.id}: (${plant.leftPanel.Usages.length})`);
  }
}

// Balance answer index distribution evenly across 0, 1, 2, 3
plantsData.forEach((flower, index) => {
  const targetIndex = index % 4;
  const oldCorrect = flower.exercise.correctAnswer;
  if (oldCorrect !== targetIndex) {
    const temp = flower.exercise.options[targetIndex];
    flower.exercise.options[targetIndex] = flower.exercise.options[oldCorrect];
    flower.exercise.options[oldCorrect] = temp;
    flower.exercise.correctAnswer = targetIndex;
  }
});

const balancedDist = { 0: 0, 1: 0, 2: 0, 3: 0 };
plantsData.forEach(f => balancedDist[f.exercise.correctAnswer]++);
console.log("Balanced Answer distribution:", balancedDist);

// Write to learningEntities.json
const updated = {
  ...rawCurrent,
  flowers: plantsData
};

fs.writeFileSync(targetPath, JSON.stringify(updated, null, 2), 'utf8');
console.log(`Successfully updated ${targetPath} with 59 unique, realistic botanical plant cards!`);
