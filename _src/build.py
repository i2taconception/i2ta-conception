#!/usr/bin/env python3
"""Génère index.html (FR) et en/index.html (EN) du site I2TA Conception.

Le dossier _src/ n'est pas publié par GitHub Pages (Jekyll ignore les dossiers « _ »).
Usage : python3 _src/build.py  (depuis la racine du dépôt)
Règles : aucun nom ni photo de personne, aucun tiret cadratin dans le texte visible.
"""
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent

# Réalisations : fichier, largeur, hauteur, catégorie, plan (affichage entier)
WORKS = [
    ("agitateur-de-cuve-inox-3-cadres-tubulaires-moto-reducteur.webp", 1400, 1050, "assy", False),
    ("retro-ingenierie-outillage-machine-releve-pied-a-coulisse-modele-solidworks.webp", 1400, 1050, "retro", False),
    ("retro-ingenierie-d-une-piece-mecanique-maillage-brut-de.webp", 1400, 1050, "retro", False),
    ("conversion-d-un-fichier-stl-maille-en-modele-step-solid.webp", 1400, 1050, "retro", False),
    ("escalier-telescopique-mecano-soude-pour-scene.webp", 1099, 1083, "struct", False),
    ("tribune-complete-avec-habillage.webp", 1230, 748, "struct", False),
    ("suspension-et-train-avant-de-velo-tricycle.webp", 1217, 1010, "assy", False),
    ("potence-de-velo-enfant-reglable.webp", 957, 1043, "assy", False),
    ("integration-moteur-electrique-karting-enfant.webp", 1384, 998, "assy", False),
    ("etude-fea-von-mises-sur-structure-pliee.webp", 1400, 782, "calc", False),
    ("plan-d-ensemble-torque-slipping-jig-avec-nomenclature.webp", 1400, 1027, "assy", True),
    ("plan-cote-frame-base.webp", 1400, 980, "plan", True),
    ("plan-cote-main-frame-avec-coupe-a-a.webp", 1400, 984, "plan", True),
    ("plan-d-ensemble-mandrin-de-controle-ecr.webp", 1400, 980, "assy", True),
    ("plan-cote-tube-coulisse-tolerances-h7.webp", 1400, 977, "plan", True),
    ("plan-cote-piece-nitruree-avec-specifications-de-surface.webp", 1400, 1007, "plan", True),
    ("plan-cote-centreur-pignon-outillage-de-presse.webp", 1400, 975, "plan", True),
    ("coupe-d-un-atomiseur-de-cigarette-electronique.webp", 658, 1045, "calc", True),
    ("rendu-keyshot-d-un-abreuvoir-a-poule-en-inox.webp", 1400, 1751, "render", False),
]

C = {}

C["fr"] = dict(
    lang="fr", base="", other="en/", other_label="EN", other_name="English version",
    title="Bureau d'études mécanique &amp; SolidWorks | I2TA Conception, Marseille",
    desc="Bureau d'études mécanique à Marseille : conception SolidWorks, plans cotés GD&amp;T, optimisation DFM, rétro-ingénierie STL/STEP. Retour de faisabilité sous 24 h ouvrées.",
    keywords="rétro-ingénierie, rétro-conception, reverse engineering mécanique, STL vers STEP, conversion STL STEP, scan 3D pièce mécanique, nuage de points, ingénierie mécanique, bureau d'études, SolidWorks, GD&amp;T, tolérancement, DFM, Marseille, Provence, usinage, conception mécanique, conception pour l'impression 3D, vue 3D produit, fichier GLB",
    canonical="https://i2ta-conception.fr/", locale="fr_FR", og_img="og-i2ta-conception.jpg",
    og_title="Bureau d'études mécanique &amp; SolidWorks | I2TA Conception",
    og_desc="Conception SolidWorks, plans cotés GD&amp;T, optimisation DFM et rétro-ingénierie 3D. Bureau d'études mécanique basé à Marseille.",
    ld_desc="Bureau d'études en ingénierie mécanique à Marseille : modélisation 3D SolidWorks, plans cotés GD&T, optimisation DFM, rétro-ingénierie 3D (scan 3D, STL vers STEP paramétrique) et conception pour l'impression 3D.",
    ld_area=["Marseille", "Provence-Alpes-Côte d'Azur", "France"],
    skip="Aller au contenu",
    nav=[("#realisations", "Réalisations"), ("#savoir-faire", "Savoir-faire"), ("#methode", "Méthode"), ("#contact", "Contact")],
    nav_cta="Démarrer un projet", menu="Menu",
    eyebrow="Bureau d'études mécanique · Marseille",
    h1="Chaque pièce a une <em>raison d'être.</em>",
    hero_p="Conception SolidWorks, mises en plan GD&amp;T, optimisation DFM et rétro-ingénierie pour les usineurs, chaudronniers et bureaux d'études. Retour de faisabilité sous 24 h ouvrées.",
    cta1="Envoyer un plan", cta2="Voir les réalisations", hint="Faites défiler",
    poster_alt="Train planétaire en vue éclatée : carter, porte-satellites, couronne, satellites, solaire et flasque",
    chapters=[
        ("Conception mécanique", "Pièces, assemblages, mécano-soudé et tôlerie, modélisés sous SolidWorks du croquis au modèle prêt pour la production.", "Pièce : porte-satellites"),
        ("Mises en plan GD&amp;T", "Entraxes, jeux et ajustements cotés au juste nécessaire : le micron là où il compte, la tolérance courante ailleurs.", "Pièce : satellites"),
        ("Optimisation DFM", "Une géométrie pensée pour le procédé, l'outil et le montage, pour éviter les reprises en atelier.", "Pièce : couronne"),
        ("Rétro-ingénierie", "Pièce sans plan, scan 3D ou fichier STL reconstruits en solide STEP propre, coté et modifiable.", "Pièce : carter"),
        ("Conception pour l'impression 3D", "Modèles prêts à imprimer, avec les épaisseurs, les jeux et l'orientation adaptés au procédé.", "Pièce : flasque"),
    ],
    end="Assemblé. <span>Prêt pour l'atelier.</span>",
    facts=[("10 ans", "d'usinage et de conception automobile"), ("24 h", "ouvrées pour un retour de faisabilité"), ("2", "itérations incluses par défaut dans le devis")],
    cases_eyebrow="Études de cas", cases_h2="Du besoin au livrable",
    cases_lead="Deux missions récentes, présentées comme un dossier : le contexte, mon intervention, ce que le client a reçu.",
    dl=("Contexte", "Intervention", "Livrables"),
    cases=[
        ("agitateur-de-cuve-inox-3-cadres-tubulaires-moto-reducteur.webp", "Agitateur de cuve inox à trois cadres tubulaires, moto-réducteur en tête, guidage en fond de cuve",
         "Assemblage · inox 304L", "Agitateur de cuve inox, liaisons et guidage",
         "Cuve Ø 3 m, trois cadres de brassage tubulaires décalés de 120° définis par le client, moto-réducteur 19 tr/min.",
         "Liaison arbre et réducteur, châssis moteur, guidage radial en fond de cuve, pièces inox 304L.",
         "Modèle 3D et mises en plan pour fabrication."),
        ("retro-ingenierie-outillage-machine-releve-pied-a-coulisse-modele-solidworks.webp", "Outillage de machine démonté et relevé au pied à coulisse, puis modélisé en assemblage SolidWorks",
         "Rétro-ingénierie", "Outillage machine sans plan, du relevé à la mise en plan",
         "Outillage de machine à refabriquer en usinage, sans plan d'origine.",
         "Pièces démontées, cotes relevées au pied à coulisse, assemblage reconstruit sous SolidWorks.",
         "Modèle 3D et mise en plan cotée, prêts pour l'usinage."),
    ],
    works_eyebrow="Réalisations", works_h2="Des pièces qui sortent de l'atelier",
    works_lead="De l'industrie lourde au produit grand public : événementiel, cycles, jouets motorisés, vapotage. Faites glisser, cliquez pour agrandir.",
    filters=[("all", "Tout"), ("assy", "Assemblages"), ("plan", "Plans cotés"), ("calc", "Calcul &amp; FEA"), ("struct", "Structures"), ("retro", "Rétro-ingénierie"), ("render", "Rendus produit")],
    filter_label="Filtrer les réalisations", film_label="Réalisations, faire défiler horizontalement",
    prev="Réalisations précédentes", next="Réalisations suivantes", zoom="Agrandir",
    cats={"assy": "Assemblage", "plan": "Plan coté", "calc": "Calcul et produit", "struct": "Structure", "retro": "Rétro-ingénierie", "render": "Rendu produit"},
    works=[
        ("Agitateur de cuve inox à trois cadres tubulaires, moto-réducteur en tête", "Agitateur de cuve inox", "Liaison arbre et réducteur, châssis moteur, guidage radial en fond de cuve Ø 3 m, pièces inox 304L."),
        ("Outillage de machine relevé au pied à coulisse puis modélisé sous SolidWorks", "Outillage machine sans plan", "Cotes relevées, assemblage reconstruit sous SolidWorks, mise en plan cotée pour refabrication."),
        ("Maillage brut de numérisation 3D à gauche, modèle STEP reconstruit à droite", "Du scan 3D aux surfaces", "Maillage brut aux arêtes déchirées repris en surfaces continues, puis fermé en volume STEP."),
        ("Fichier STL maillé converti en modèle STEP solide", "STL → STEP, maillage converti en solide", "Arêtes et congés rétablis : un fichier que l'usineur ouvre et usine directement."),
        ("Escalier télescopique mécano-soudé pour scène", "Escalier de scène télescopique", "Structure mécano-soudée pour accès scène, profilés assemblés, garde-corps intégrés."),
        ("Tribune complète avec habillage", "Tribune complète", "Ensemble gradins, structure porteuse et habillage périphérique."),
        ("Suspension et train avant de vélo tricycle", "Train avant, vélo tricycle", "Suspension et mécanisme multi-liaisons, triangulation, articulations rotulées."),
        ("Potence de vélo enfant réglable", "Potence de vélo enfant réglable", "Serrage par collier fendu, goupille de sécurité, ajustement multi-axes."),
        ("Intégration d'un moteur électrique sur un karting enfant", "Intégration moteur, karting enfant", "Support en tôlerie pliée, entraînement par poulie et courroie sur arbre."),
        ("Étude FEA, contraintes de von Mises sur une structure pliée", "Validation FEA, von Mises", "Vérification de tenue mécanique avant fabrication, marge à la limite d'élasticité."),
        ("Plan d'ensemble Torque Slipping Jig avec nomenclature", "Torque Slipping Jig, ensemble", "Vue éclatée avec nomenclature complète, coupe de fonctionnement."),
        ("Plan coté Frame Base", "Frame Base, plan coté", "Pièce de bâti, perçages positionnés, traitement brunissage."),
        ("Plan coté Main Frame avec coupe A-A", "Main Frame, plan coté", "Logement d'arbre, coupe A-A, tolérances de perçage serrées."),
        ("Plan d'ensemble du mandrin de contrôle ECR", "Mandrin de contrôle ECR", "Outillage de contrôle roue et vis, coupe complète, 19 composants référencés."),
        ("Plan coté du tube coulisse, tolérances H7", "Tube coulisse, Ø 79 H7", "Trempe-revenu 58-60 HRC, tolérances H7, contrôle de coaxialité."),
        ("Plan coté d'une pièce nitrurée avec spécifications de surface", "Puits CMP, pièce nitrurée", "Nitruration HV &gt; 700, Ra 0,8, ajustements g6/H7."),
        ("Plan coté du centreur pignon, outillage de presse", "Centreur pignon, outillage", "Outillage de contrôle de presse, trempé 58-60 HRC."),
        ("Coupe d'un atomiseur de cigarette électronique", "Atomiseur, cigarette électronique", "Développement produit, jeux de fonctionnement et liaisons internes."),
        ("Rendu KeyShot d'un abreuvoir à poule en inox", "Abreuvoir à poule, rendu KeyShot", "Visualisation photoréaliste pour présentation produit, inox brossé."),
    ],
    skills_eyebrow="Savoir-faire", skills_h2="Le micron quand il sert, pas par principe",
    skills_lead="Tolérancer serré coûte cher à fabriquer. Savoir où ça compte vraiment, et où ça ne sert à rien, c'est ce qui tient un projet dans son budget.",
    skills=[
        ("Conception mécanique", "Pièces, assemblages, mécano-soudé, tôlerie",
         ["Pièces et assemblages SolidWorks, du croquis au modèle paramétrique prêt pour la production : mécanismes, structures mécano-soudées, tôlerie pliée."],
         ("conception-mecanique-solidworks/", "Découvrir la conception mécanique SolidWorks →")),
        ("Mises en plan GD&amp;T", "Plans normés, tolérancement fonctionnel",
         ["Plans de définition normés ISO, tolérancement GD&amp;T et nomenclatures, prêts pour vos fournisseurs. Reprise de vos plans 2D pour les modéliser en 3D.",
          "Je dimensionne pour le jeu de fonctionnement réellement nécessaire, je calcule les chaînes de cotes en amont, et je ne tolère serré que là où ça change le comportement de l'assemblage. Le reste reste en tolérance courante : ça se voit directement sur le devis d'usinage."], None),
        ("Optimisation DFM", "Le bon procédé, la bonne nuance",
         ["Choix de nuance selon l'application réelle : propriétés mécaniques, traitement thermique, usinabilité, coût. Une pièce nitrurée à 700 HV n'a pas le même cahier des charges qu'une pièce brunie.",
          "Usinage, tôlerie, soudure, chaudronnerie : selon la pièce, j'oriente vers le bon procédé, ce qui évite de sur-spécifier une pièce qui aurait simplement dû être pliée ou soudée."], None),
        ("Rétro-ingénierie", "Scan, STL ou pièce sans plan → STEP",
         ["Un STL ou un nuage de points, ce n'est pas de la CAO : c'est une peau triangulée qu'aucun convertisseur automatique ne transforme en pièce usinable. Je reprends la géométrie à la main (surfaces, axes, congés, perçages) pour livrer un STEP solide, coté et modifiable.",
          "Pièce obsolète, existant sans plan, modèle de designer à rendre fabricable : le livrable est un fichier que l'usineur ouvre sans se plaindre."],
         ("retro-ingenierie-stl-step/", "Découvrir la rétro-ingénierie →")),
        ("Conception pour l'impression 3D", "Modèles prêts à imprimer",
         ["Épaisseurs de paroi, orientation d'impression, supports, jeux et tolérances d'assemblage selon le procédé. Je livre le modèle (STEP ou STL) prêt à imprimer, pour un prototype, une petite série ou un gabarit : l'impression est réalisée par vos soins ou par votre prestataire."], None),
        ("Outillages et gabarits", "Montages, gabarits de contrôle",
         ["Conception d'outillages machine et de gabarits de contrôle, avec la culture de la production réelle : accessibilité, prise de pièce, contrôle."], None),
        ("Rendus et vues 3D", "KeyShot, GLB pour la vente en ligne",
         ["Rendus photoréalistes KeyShot pour vos présentations produit, et vues 3D interactives (fichier GLB) à intégrer sur votre boutique : rotation, zoom, choix de matière."], None),
    ],
    trades="Tous corps de métier : <b>usinage</b> · <b>chaudronnerie</b> · <b>tôlerie</b> · <b>soudure</b> · <b>découpe laser</b> · <b>impression 3D</b>",
    v3d_eyebrow="Vue 3D interactive", v3d_h2="Essayez-la vous-même",
    v3d_p="Un fichier GLB par produit : vos clients tournent, zooment et changent de matière directement sur votre site. Ici, un décapsuleur conçu et rendu par I2TA, en trois finitions.",
    v3d_btn="Charger la vue 3D (5 Mo)", v3d_alt="Décapsuleur en 3D, modèle interactif (cuivre, laiton, aluminium)",
    v3d_img_alt="Décapsuleur en cuivre, aperçu de la vue 3D interactive", v3d_mats_label="Matière",
    mats=[("Cuivre", "#c98f78"), ("Laiton", "#d9b46f"), ("Aluminium", "#cfd3d8")],
    v3d_cta="Demander une vue 3D", v3d_dl="Télécharger la démo GLB",
    method_eyebrow="Méthode", method_h2="Trois étapes, pas de surprise",
    steps=[("Vous envoyez le besoin", "Plan 2D, STEP, STL, croquis, photo ou simple description, par e-mail ou formulaire."),
           ("Retour de faisabilité", "Je vous dis si c'est faisable, et comment, sous 24 h ouvrées."),
           ("Chiffrage et livrables", "Chiffrage en heures, livrables, itérations et délai validés avant tout démarrage.")],
    formats_label="Formats acceptés", formats=["STEP", "STL", "DWG", "DXF", "PDF", "SLDPRT", "Photos"],
    profile_eyebrow="Profil", profile_h2="Un ingénieur, un seul interlocuteur",
    profile_lead="Structure indépendante récente, mais dix ans d'usinage et de conception automobile derrière chaque plan : une expérience industrielle directement utile à votre projet. Pas une promesse, un parcours.",
    points=[("10 ans", "En industrie automobile", "Conception et suivi de production en conditions réelles, pas seulement en bureau d'études."),
            ("1", "Seul interlocuteur", "La personne qui chiffre est celle qui conçoit et dessine. Ingénieur Matériaux et Mécanique."),
            ("24 h", "Retour de faisabilité", "En jours ouvrés, avec les bonnes questions techniques dès le départ.")],
    profile_note="La conception ne s'arrête pas à l'écran : passionné de mécanique, de la restauration de tracteurs anciens à la géométrie de machines d'usinage, je sais ce qu'une pièce doit endurer parce que je l'ai souvent réparée moi-même.",
    contact_h2="Un plan à sortir ? Parlons-en.",
    contact_p="Décrivez votre besoin : je vous dis sous 24 h ouvrées si c'est faisable, et comment. Fichiers par e-mail ou lien de partage.",
    zone="Marseille · toute la France",
    f_name="Nom", f_name_ph="Prénom Nom", f_email="E-mail", f_email_ph="vous@entreprise.fr", f_type="Type de projet", f_select="Sélectionner",
    f_types=["Conception mécanique", "Mise en plan / GD&amp;T", "Optimisation DFM", "Rétro-ingénierie", "Conception pour l'impression 3D", "Rendu ou vue 3D", "Autre"],
    f_msg="Votre besoin", f_msg_ph="Pièce, procédé, quantité, délai, lien vers vos fichiers",
    f_hint="Pas de pièce jointe ici : envoyez vos fichiers par e-mail ou lien de partage.",
    f_send="Envoyer", f_ok="✓ Message envoyé. Réponse sous 24 h ouvrées.",
    footer="© 2026 I2TA Conception · Ingénierie mécanique · Marseille · SIREN 978 741 023",
    legal=("mentions-legales/", "Mentions légales"), close="Fermer", lb_label="Image agrandie",
)

C["en"] = dict(
    lang="en", base="../", other="../", other_label="FR", other_name="Version française",
    title="Mechanical Design Office &amp; SolidWorks Engineering | I2TA Conception, France",
    desc="Mechanical design office in Marseille, France: SolidWorks engineering, toleranced drawings (GD&amp;T), DFM optimization and 3D reverse engineering (STL/STEP). Feasibility feedback within 24 working hours.",
    keywords="reverse engineering, STL to STEP, mesh to solid CAD, 3D scan to CAD, point cloud to STEP, mechanical engineering, design office, SolidWorks, GD&amp;T, tolerancing, DFM, Marseille, France, machining, mechanical design, design for 3D printing, 3D product viewer, GLB file",
    canonical="https://i2ta-conception.fr/en/", locale="en_US", og_img="og-i2ta-conception-en.jpg",
    og_title="Mechanical Design Office &amp; SolidWorks Engineering | I2TA Conception",
    og_desc="SolidWorks design, toleranced drawings (GD&amp;T), DFM optimization and 3D reverse engineering. Mechanical design office based in Marseille, France.",
    ld_desc="Mechanical engineering design office in Marseille, France: SolidWorks 3D modeling, GD&T toleranced drawings, DFM optimization, 3D reverse engineering (3D scan, STL to parametric STEP) and design for 3D printing.",
    ld_area=["Marseille", "France", "Belgium", "United Kingdom", "United States"],
    skip="Skip to content",
    nav=[("#realisations", "Portfolio"), ("#savoir-faire", "Expertise"), ("#methode", "Process"), ("#contact", "Contact")],
    nav_cta="Start a project", menu="Menu",
    eyebrow="Mechanical design office · Marseille, France",
    h1="Every part has a <em>reason to exist.</em>",
    hero_p="SolidWorks design, GD&amp;T drawings, DFM optimization and reverse engineering for machine shops, fabricators and design offices. Feasibility feedback within 24 working hours.",
    cta1="Send a drawing", cta2="View the portfolio", hint="Scroll",
    poster_alt="Exploded planetary gearbox: housing, planet carrier, ring gear, planet gears, sun gear and cover",
    chapters=[
        ("Mechanical design", "Parts, assemblies, weldments and sheet metal, modeled in SolidWorks from sketch to production-ready model.", "Part: planet carrier"),
        ("GD&amp;T drawings", "Center distances, clearances and fits dimensioned to what is needed: the micron where it matters, standard tolerances elsewhere.", "Part: planet gears"),
        ("DFM optimization", "Geometry designed around the process, the tool and the assembly, to avoid rework on the shop floor.", "Part: ring gear"),
        ("Reverse engineering", "A part with no drawing, a 3D scan or an STL file rebuilt as a clean, dimensioned, editable STEP solid.", "Part: housing"),
        ("Design for 3D printing", "Print-ready models, with wall thicknesses, clearances and orientation suited to the process.", "Part: cover"),
    ],
    end="Assembled. <span>Ready for the shop floor.</span>",
    facts=[("10 years", "of automotive machining and design"), ("24 h", "working hours for feasibility feedback"), ("2", "revisions included by default in the quote")],
    cases_eyebrow="Case studies", cases_h2="From brief to deliverable",
    cases_lead="Two recent projects, presented like a file: the context, my work, what the client received.",
    dl=("Context", "My work", "Deliverables"),
    cases=[
        ("agitateur-de-cuve-inox-3-cadres-tubulaires-moto-reducteur.webp", "Stainless steel tank agitator with three tubular frames, gearmotor on top, bottom guide",
         "Assembly · 304L stainless", "Stainless tank agitator, shaft coupling and guide",
         "3 m diameter tank, three tubular mixing frames offset by 120° specified by the client, 19 rpm gearmotor.",
         "Shaft-to-gearbox coupling, motor frame, radial bottom guide, 304L stainless parts.",
         "3D model and manufacturing drawings."),
        ("retro-ingenierie-outillage-machine-releve-pied-a-coulisse-modele-solidworks.webp", "Machine tooling disassembled and measured with calipers, then rebuilt as a SolidWorks assembly",
         "Reverse engineering", "Machine tooling with no drawing, from measurement to drawing",
         "Machine tooling to be machined again, with no original drawing.",
         "Parts disassembled, dimensions taken with calipers, assembly rebuilt in SolidWorks.",
         "3D model and dimensioned drawing, ready for machining."),
    ],
    works_eyebrow="Portfolio", works_h2="Parts straight from the shop floor",
    works_lead="From heavy industry to consumer products: events, cycling, motorized toys, vaping. Drag to browse, click to zoom.",
    filters=[("all", "All"), ("assy", "Assemblies"), ("plan", "Toleranced drawings"), ("calc", "Calc &amp; FEA"), ("struct", "Structures"), ("retro", "Reverse engineering"), ("render", "Product renders")],
    filter_label="Filter the portfolio", film_label="Portfolio, scroll horizontally",
    prev="Previous projects", next="Next projects", zoom="Zoom",
    cats={"assy": "Assembly", "plan": "Toleranced drawing", "calc": "Calculation and product", "struct": "Structure", "retro": "Reverse engineering", "render": "Product render"},
    works=[
        ("Stainless steel tank agitator with three tubular frames, gearmotor on top", "Stainless tank agitator", "Shaft-to-gearbox coupling, motor frame, radial bottom guide for a 3 m tank, 304L stainless parts."),
        ("Machine tooling measured with calipers, then modeled in SolidWorks", "Machine tooling with no drawing", "Dimensions taken, assembly rebuilt in SolidWorks, dimensioned drawing for remanufacturing."),
        ("Raw 3D scan mesh on the left, rebuilt STEP model on the right", "From 3D scan to surfaces", "Raw mesh with torn edges rebuilt as continuous surfaces, then closed into a STEP solid."),
        ("Triangulated STL file converted into a solid STEP model", "STL → STEP, mesh rebuilt as a solid", "Edges and fillets restored: a file the machinist can open and cut straight away."),
        ("Welded telescopic stage staircase", "Telescopic stage staircase", "Welded structure for stage access, assembled profiles, integrated guardrails."),
        ("Complete grandstand with cladding", "Complete grandstand", "Tiered seating, load-bearing structure and perimeter cladding."),
        ("Suspension and front axle of a tricycle", "Front axle, cargo tricycle", "Suspension and multi-link mechanism, triangulation, ball-joint articulations."),
        ("Adjustable child bike stem", "Adjustable child bike stem", "Split-collar clamping, safety pin, multi-axis adjustment."),
        ("Electric motor integration on a kids' go-kart", "Motor integration, kids' go-kart", "Folded sheet-metal mount, belt-and-pulley shaft drive."),
        ("Von Mises FEA study on a folded structure", "FEA validation, von Mises", "Structural strength check before manufacturing, margin to yield strength."),
        ("Torque Slipping Jig assembly drawing with bill of materials", "Torque Slipping Jig, assembly", "Exploded view with full bill of materials, functional cross-section."),
        ("Frame Base toleranced drawing", "Frame Base, toleranced drawing", "Base frame part, positioned drilling, black oxide finish."),
        ("Main Frame toleranced drawing with section A-A", "Main Frame, toleranced drawing", "Shaft housing, section A-A, tight drilling tolerances."),
        ("ECR inspection mandrel assembly drawing", "ECR inspection mandrel", "Worm-gear inspection tooling, full cross-section, 19 referenced components."),
        ("Sliding tube toleranced drawing, H7 tolerances", "Sliding tube, Ø 79 H7", "Quench-and-temper 58-60 HRC, H7 tolerances, coaxiality control."),
        ("Nitrided part toleranced drawing with surface specifications", "CMP well, nitrided part", "Nitriding HV &gt; 700, Ra 0.8, g6/H7 fits."),
        ("Gear centering tool toleranced drawing, press tooling", "Gear centering tool", "Press inspection tooling, hardened 58-60 HRC."),
        ("Cross-section of an e-cigarette atomizer", "Atomizer, e-cigarette", "Product development, operating clearances and internal joints."),
        ("KeyShot render of a stainless steel chicken waterer", "Chicken waterer, KeyShot render", "Photorealistic visualization for product presentation, brushed stainless."),
    ],
    skills_eyebrow="Expertise", skills_h2="The micron when it matters, not as a habit",
    skills_lead="Tight tolerancing is expensive to manufacture. Knowing where it really matters, and where it doesn't, is what keeps a project on budget.",
    skills=[
        ("Mechanical design", "Parts, assemblies, weldments, sheet metal",
         ["SolidWorks parts and assemblies, from sketch to production-ready parametric model: mechanisms, welded structures, folded sheet metal."], None),
        ("GD&amp;T drawings", "Standard drawings, functional tolerancing",
         ["ISO-standard detail drawings, GD&amp;T tolerancing and bills of materials, ready for your suppliers. Your 2D drawings rebuilt as 3D models.",
          "I size parts for the clearance actually needed, calculate tolerance stacks upfront, and only tolerance tightly where it changes how the assembly behaves. Everything else stays at standard tolerance: it shows directly on the machining quote."], None),
        ("DFM optimization", "The right process, the right grade",
         ["Material grade chosen for the real application: mechanical properties, heat treatment, machinability, cost. A part nitrided to 700 HV does not have the same specification as a black-oxide part.",
          "Machining, sheet metal, welding, fabrication: depending on the part, I point to the right process, which avoids over-specifying a part that should simply have been bent or welded."], None),
        ("Reverse engineering", "Scan, STL or undocumented part → STEP",
         ["An STL or a point cloud is not CAD: it is a triangulated skin that no automatic converter turns into a machinable part. I rebuild the geometry by hand (surfaces, axes, fillets, holes) to deliver a solid, dimensioned, editable STEP.",
          "Obsolete part, undocumented existing part, designer model to make manufacturable: the deliverable is a file the machinist opens without complaining."], None),
        ("Design for 3D printing", "Print-ready models",
         ["Wall thicknesses, print orientation, supports, assembly clearances and tolerances suited to the process. I deliver the print-ready model (STEP or STL) for a prototype, a short run or a jig: printing is done by you or your supplier."], None),
        ("Tooling and jigs", "Fixtures, inspection gauges",
         ["Design of machine tooling and inspection gauges, with a real production mindset: accessibility, part holding, inspection."], None),
        ("Renders and 3D views", "KeyShot, GLB for online stores",
         ["Photorealistic KeyShot renders for product presentations, and interactive 3D views (GLB file) to embed in your online store: rotate, zoom, switch material."], None),
    ],
    trades="Any trade: <b>machining</b> · <b>fabrication</b> · <b>sheet metal</b> · <b>welding</b> · <b>laser cutting</b> · <b>3D printing</b>",
    v3d_eyebrow="Interactive 3D view", v3d_h2="Try it yourself",
    v3d_p="One GLB file per product: your customers rotate, zoom and switch material right on your website. Here, a bottle opener designed and rendered by I2TA, in three finishes.",
    v3d_btn="Load the 3D view (5 MB)", v3d_alt="Bottle opener in 3D, interactive model (copper, brass, aluminum)",
    v3d_img_alt="Copper bottle opener, preview of the interactive 3D view", v3d_mats_label="Material",
    mats=[("Cuivre", "#c98f78", "Copper"), ("Laiton", "#d9b46f", "Brass"), ("Aluminium", "#cfd3d8", "Aluminum")],
    v3d_cta="Request a 3D view", v3d_dl="Download the GLB demo",
    method_eyebrow="Process", method_h2="Three steps, no surprises",
    steps=[("You send the brief", "2D drawing, STEP, STL, sketch, photo or a simple description, by email or form."),
           ("Feasibility feedback", "I tell you whether it's feasible, and how, within 24 working hours."),
           ("Estimate and deliverables", "Hours-based estimate, deliverables, revisions and lead time agreed before any work starts.")],
    formats_label="Accepted formats", formats=["STEP", "STL", "DWG", "DXF", "PDF", "SLDPRT", "Photos"],
    profile_eyebrow="About", profile_h2="One engineer, one point of contact",
    profile_lead="A recent independent company, but ten years of machining and automotive design behind every drawing: industrial experience that directly benefits your project. Not a promise, a track record.",
    points=[("10 yrs", "In the automotive industry", "Design and production follow-up in real conditions, not just in a design office."),
            ("1", "Single point of contact", "The person who quotes is the one who designs and draws. Materials and Mechanical Engineer."),
            ("24 h", "Feasibility feedback", "In working hours, with the right technical questions from the start.")],
    profile_note="Design doesn't stop at the screen: a lifelong mechanics enthusiast, from restoring vintage tractors to machine-tool geometry work, I know what a part has to endure because I've often repaired it myself.",
    contact_h2="A part to get made? Let's talk.",
    contact_p="Describe your need: within 24 working hours I'll tell you whether it's feasible, and how. Files by email or share link.",
    zone="Marseille, France · remote worldwide",
    f_name="Name", f_name_ph="First Last", f_email="Email", f_email_ph="you@company.com", f_type="Project type", f_select="Select",
    f_types=["Mechanical design", "Drawings / GD&amp;T", "DFM optimization", "Reverse engineering", "Design for 3D printing", "Render or 3D view", "Other"],
    f_msg="Your need", f_msg_ph="Part, process, quantity, lead time, link to your files",
    f_hint="No attachments here: send your files by email or share link.",
    f_send="Send", f_ok="✓ Message sent. Reply within 24 working hours.",
    footer="© 2026 I2TA Conception · Mechanical engineering · Marseille, France · SIREN 978 741 023",
    legal=("legal-notice/", "Legal notice"), close="Close", lb_label="Enlarged image",
)

ARROW = '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
PLUS = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 2v12M2 8h12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
LEFT = '<svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M13 8H3M7 4L3 8l4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
RIGHT = '<svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'


def page(c):
    b = c["base"]
    ld = {
        "@context": "https://schema.org", "@type": "ProfessionalService", "name": "I2TA Conception",
        "logo": "https://i2ta-conception.fr/img/i2ta-conception.webp", "image": "https://i2ta-conception.fr/img/og-i2ta-conception.jpg",
        "description": c["ld_desc"], "areaServed": c["ld_area"],
        "address": {"@type": "PostalAddress", "addressLocality": "Marseille", "addressRegion": "PACA", "addressCountry": "FR"},
        "email": "i2ta.conception@gmail.com", "telephone": "+33636570981", "url": c["canonical"],
        "knowsAbout": ["SolidWorks", "Conception mécanique", "Tolérancement GD&T", "DFM", "Rétro-ingénierie", "Conversion STL vers STEP", "Conception pour l'impression 3D", "Rendu KeyShot", "Vue 3D GLB"],
    }
    o = []
    w = o.append
    w(f'''<!DOCTYPE html>
<html lang="{c['lang']}">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="google-site-verification" content="SdkOpDI-td5sDQu2qQpfXgcixX7vPaVQToPAnIWKJwA" />
<title>{c['title']}</title>
<meta name="description" content="{c['desc']}" />
<meta name="keywords" content="{c['keywords']}" />
<meta name="author" content="I2TA Conception" />
<meta name="robots" content="index, follow" />
<meta name="theme-color" content="#080808" />
<link rel="canonical" href="{c['canonical']}" />
<link rel="icon" href="{b}favicon.ico" sizes="any" />
<link rel="icon" href="{b}favicon-32.png" type="image/png" sizes="32x32" />
<link rel="apple-touch-icon" href="{b}apple-touch-icon.png" />
<link rel="alternate" hreflang="fr" href="https://i2ta-conception.fr/" />
<link rel="alternate" hreflang="en" href="https://i2ta-conception.fr/en/" />
<link rel="alternate" hreflang="x-default" href="https://i2ta-conception.fr/" />
<meta property="og:type" content="website" />
<meta property="og:locale" content="{c['locale']}" />
<meta property="og:url" content="{c['canonical']}" />
<meta property="og:title" content="{c['og_title']}" />
<meta property="og:description" content="{c['og_desc']}" />
<meta property="og:site_name" content="I2TA Conception" />
<meta property="og:image" content="https://i2ta-conception.fr/img/{c['og_img']}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="{c['og_title']}" />
<meta name="twitter:description" content="{c['og_desc']}" />
<meta name="twitter:image" content="https://i2ta-conception.fr/img/{c['og_img']}" />
<link rel="preload" href="{b}fonts/unbounded-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin />
<link rel="preload" href="{b}fonts/inter-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin />
<link rel="stylesheet" href="{b}css/site.css" />
<script type="application/ld+json">
{json.dumps(ld, ensure_ascii=False, indent=2)}
</script>
<script data-goatcounter="https://i2ta-conception.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>
</head>
<body>
<a class="skip" href="#contenu">{c['skip']}</a>

<header class="hdr">
  <div class="hdr-in">
    <a class="brand" href="#top" aria-label="I2TA Conception"><img src="{b}img/i2ta-conception-220.webp" width="220" height="220" alt="" />I2TA Conception</a>
    <nav class="nav" aria-label="Navigation">
''')
    for href, label in c["nav"]:
        w(f'      <a href="{href}">{label}</a>\n')
    w(f'''      <a class="lang" href="{c['other']}" hreflang="{'en' if c['lang'] == 'fr' else 'fr'}" aria-label="{c['other_name']}">{c['other_label']}</a>
    </nav>
    <a class="btn btn-cu" href="#contact">{c['nav_cta']}</a>
    <button class="burger" type="button" aria-label="{c['menu']}" aria-expanded="false" aria-controls="mnav"><span></span><span></span></button>
  </div>
</header>
<nav class="mnav" id="mnav" aria-label="{c['menu']}">
''')
    for href, label in c["nav"]:
        w(f'  <a href="{href}">{label}</a>\n')
    w(f'''  <a href="{c['other']}" hreflang="{'en' if c['lang'] == 'fr' else 'fr'}">{c['other_name']}</a>
  <a class="btn btn-cu" href="#contact">{c['nav_cta']}</a>
</nav>

<main id="contenu">
<section class="xp" id="top" aria-label="{c['eyebrow']}">
  <div class="xp-stage">
    <div class="xp-canvas"></div>
    <img class="xp-poster" src="{b}img/vue-eclatee-train-planetaire.webp" width="900" height="1253" alt="{c['poster_alt']}" fetchpriority="high" />
    <div class="xp-hero">
      <div class="eyebrow">{c['eyebrow']}</div>
      <h1>{c['h1']}</h1>
      <p>{c['hero_p']}</p>
      <div class="xp-cta">
        <a class="btn btn-cu" href="#contact">{c['cta1']} {ARROW}</a>
        <a class="btn btn-ghost" href="#realisations">{c['cta2']}</a>
      </div>
    </div>
    <div class="xp-hint" aria-hidden="true">{c['hint']}<i></i></div>
    <ol class="xp-chapters">
''')
    n = len(c["chapters"])
    for k, (t, p, part) in enumerate(c["chapters"]):
        w(f'''      <li class="xp-ch"><span class="num">{k + 1:02d} / {n:02d}</span><h2>{t}</h2><p>{p}</p><span class="part">{part}</span></li>
''')
    w(f'''    </ol>
    <div class="xp-rail" aria-hidden="true">{''.join('<span><i></i></span>' for _ in range(n))}</div>
    <p class="xp-end" aria-hidden="true">{c['end']}</p>
  </div>
</section>

<section class="facts" aria-label="{c['cases_eyebrow']}">
  <div class="wrap">
''')
    for big, small in c["facts"]:
        w(f'    <div class="fact rv"><b>{big}</b><span>{small}</span></div>\n')
    w(f'''  </div>
</section>

<section class="sec" id="cas">
  <div class="wrap">
    <div class="sec-head rv"><div><span class="eyebrow">{c['cases_eyebrow']}</span><h2 class="h2">{c['cases_h2']}</h2></div><p class="lead">{c['cases_lead']}</p></div>
    <div class="cases">
''')
    for img, alt, tag, title, ctx, work, deliv in c["cases"]:
        w(f'''      <article class="case rv">
        <div class="case-media"><img src="{b}img/{img}" width="1400" height="1050" alt="{alt}" loading="lazy" decoding="async" /></div>
        <div class="case-body">
          <span class="case-tag">{tag}</span>
          <h3>{title}</h3>
          <dl><dt>{c['dl'][0]}</dt><dd>{ctx}</dd><dt>{c['dl'][1]}</dt><dd>{work}</dd><dt>{c['dl'][2]}</dt><dd>{deliv}</dd></dl>
        </div>
      </article>
''')
    w(f'''    </div>
  </div>
</section>

<section class="sec" id="realisations" style="padding-top:0">
  <div class="wrap">
    <div class="sec-head rv"><div><span class="eyebrow">{c['works_eyebrow']}</span><h2 class="h2">{c['works_h2']}</h2><p class="lead">{c['works_lead']}</p></div>
      <div class="filters" role="group" aria-label="{c['filter_label']}">
''')
    for key, label in c["filters"]:
        w(f'        <button type="button" class="chip" data-filter="{key}" aria-pressed="{"true" if key == "all" else "false"}">{label}</button>\n')
    w(f'''      </div>
    </div>
  </div>
  <div class="film-wrap">
    <div class="film" tabindex="0" aria-label="{c['film_label']}">
''')
    total = len(WORKS)
    for k, ((fn, wd, ht, cat, contain), (alt, title, desc)) in enumerate(zip(WORKS, c["works"])):
        cls = "card-media contain" if contain else "card-media"
        w(f'''      <article class="card" data-cat="{cat}">
        <button type="button" class="{cls}" aria-label="{c['zoom']} : {title}"><img src="{b}img/{fn}" width="{wd}" height="{ht}" alt="{alt}" loading="lazy" decoding="async" /></button>
        <div class="card-meta"><span>{k + 1:02d} / {total:02d}</span><span>{c['cats'][cat]}</span></div>
        <h3>{title}</h3>
        <p>{desc}</p>
      </article>
''')
    w(f'''    </div>
  </div>
  <div class="wrap">
    <div class="film-ctrl">
      <button type="button" class="film-prev" aria-label="{c['prev']}">{LEFT}</button>
      <button type="button" class="film-next" aria-label="{c['next']}">{RIGHT}</button>
      <div class="film-bar" aria-hidden="true"><i></i></div>
      <span class="film-count" aria-live="polite"></span>
    </div>
  </div>
</section>

<section class="sec" id="savoir-faire" style="padding-top:0">
  <div class="wrap">
    <div class="sec-head rv"><div><span class="eyebrow">{c['skills_eyebrow']}</span><h2 class="h2">{c['skills_h2']}</h2></div><p class="lead">{c['skills_lead']}</p></div>
    <div class="skills">
''')
    for k, (t, s, paras, link) in enumerate(c["skills"]):
        body = "".join(f"<p>{p}</p>" for p in paras)
        if link:
            body += f'<p><a href="{link[0]}">{link[1]}</a></p>'
        w(f'''      <details class="skill rv"><summary><span class="k">{k + 1:02d}</span><span class="t">{t}</span><span class="s">{s}</span><span class="x">{PLUS}</span></summary><div class="skill-body"><div>{body}</div></div></details>
''')
    w(f'''    </div>
    <p class="trades rv">{c['trades']}</p>
  </div>
</section>

<section class="sec" id="vue-3d" style="padding-top:0">
  <div class="wrap v3d">
    <div class="v3d-stage rv" data-base="{b}" data-alt="{c['v3d_alt']}">
      <img src="{b}img/decapsuleur-vue-3d-glb-cuivre.webp" width="1400" height="1050" alt="{c['v3d_img_alt']}" loading="lazy" decoding="async" />
      <button type="button" class="btn btn-cu v3d-start">{c['v3d_btn']}</button>
      <div class="v3d-status" role="status" aria-live="polite"></div>
    </div>
    <div class="v3d-body rv">
      <span class="eyebrow">{c['v3d_eyebrow']}</span>
      <h2 class="h2">{c['v3d_h2']}</h2>
      <p class="lead">{c['v3d_p']}</p>
      <div class="mats" role="group" aria-label="{c['v3d_mats_label']}">
''')
    for k, mt in enumerate(c["mats"]):
        variant, color = mt[0], mt[1]
        label = mt[2] if len(mt) > 2 else mt[0]
        w(f'        <button type="button" class="mat" data-variant="{variant}" aria-pressed="{"true" if k == 0 else "false"}" disabled><i style="background:{color}"></i>{label}</button>\n')
    w(f'''      </div>
      <div class="xp-cta"><a class="btn btn-ghost" href="#contact">{c['v3d_cta']} {ARROW}</a><a class="btn btn-ghost" href="{b}3d/decapsuleur-finitions.glb" download="decapsuleur-demo.glb">{c['v3d_dl']}</a></div>
    </div>
  </div>
</section>

<section class="sec" id="methode" style="padding-top:0">
  <div class="wrap">
    <div class="sec-head rv"><div><span class="eyebrow">{c['method_eyebrow']}</span><h2 class="h2">{c['method_h2']}</h2></div></div>
    <ol class="steps">
''')
    for k, (t, p) in enumerate(c["steps"]):
        w(f'      <li class="step rv"><b>{k + 1:02d}</b><h3>{t}</h3><p>{p}</p></li>\n')
    w(f'''    </ol>
    <div class="formats rv"><span>{c['formats_label']}</span>{''.join(f'<span class="fmt">{f}</span>' for f in c['formats'])}</div>
  </div>
</section>

<section class="sec" id="profil" style="padding-top:0">
  <div class="wrap profile">
    <div class="rv" style="display:flex;flex-direction:column;gap:20px"><span class="eyebrow">{c['profile_eyebrow']}</span><h2 class="h2">{c['profile_h2']}</h2><p class="lead">{c['profile_lead']}</p></div>
    <div class="rv">
      <div class="pts">
''')
    for big, t, p in c["points"]:
        w(f'        <div class="pt"><b>{big}</b><div><h3>{t}</h3><p>{p}</p></div></div>\n')
    w(f'''      </div>
      <p class="note">{c['profile_note']}</p>
    </div>
  </div>
</section>

<section class="contact" id="contact">
  <div class="wrap">
    <div class="contact-l">
      <h2>{c['contact_h2']}</h2>
      <p>{c['contact_p']}</p>
      <div class="direct">
        <a href="mailto:i2ta.conception@gmail.com">i2ta.conception@gmail.com</a>
        <a href="tel:+33636570981">{'06&nbsp;36&nbsp;57&nbsp;09&nbsp;81' if c['lang'] == 'fr' else '+33&nbsp;6&nbsp;36&nbsp;57&nbsp;09&nbsp;81'}</a>
        <span>{c['zone']}</span>
      </div>
    </div>
    <form class="form" id="contactForm" action="https://formspree.io/f/mgobdnlz" method="POST">
      <input class="hp" type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true" />
      <div class="row">
        <label>{c['f_name']}<input type="text" name="name" autocomplete="name" placeholder="{c['f_name_ph']}" /></label>
        <label>{c['f_email']}<input type="email" name="email" autocomplete="email" placeholder="{c['f_email_ph']}" required /></label>
      </div>
      <label>{c['f_type']}<select name="type"><option value="">{c['f_select']}</option>{''.join(f'<option>{t}</option>' for t in c['f_types'])}</select></label>
      <label>{c['f_msg']}<textarea name="message" placeholder="{c['f_msg_ph']}" required></textarea></label>
      <p class="hint">{c['f_hint']}</p>
      <button type="submit" class="btn btn-cu">{c['f_send']} {ARROW}</button>
      <p class="ok" role="status">{c['f_ok']}</p>
    </form>
  </div>
</section>
</main>

<footer class="ftr">
  <div class="wrap"><span>{c['footer']}</span><span><a href="{c['legal'][0]}">{c['legal'][1]}</a> · <a href="{c['other']}" hreflang="{'en' if c['lang'] == 'fr' else 'fr'}">{c['other_name']}</a></span></div>
</footer>

<div class="lb" role="dialog" aria-modal="true" aria-label="{c['lb_label']}">
  <button type="button" class="lb-close" aria-label="{c['close']}">×</button>
  <img src="data:," alt="" />
  <p class="lb-cap"></p>
</div>

<script defer src="{b}js/three-r128.min.js"></script>
<script defer src="{b}js/eclate.js"></script>
<script defer src="{b}js/site.js"></script>
</body>
</html>
''')
    return "".join(o)


def main():
    (ROOT / "index.html").write_text(page(C["fr"]), encoding="utf-8")
    (ROOT / "en" / "index.html").write_text(page(C["en"]), encoding="utf-8")
    print("index.html et en/index.html générés")


if __name__ == "__main__":
    main()
