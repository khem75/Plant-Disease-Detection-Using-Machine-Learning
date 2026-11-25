import type { DiseaseInfo } from "../types/analysis";

export const DISEASE_CATALOG: Record<string, DiseaseInfo> = {
  "Apple___Apple_scab": {
    plant: "Apple",
    disease: "Apple Scab",
    pathogen: "Venturia inaequalis (fungus)",
    description: "A prevalent fungal infection that forms dark, velvety olive-green lesions on apple foliage and fruit, causing leaf distortion and premature defoliation.",
    symptoms: [
      "Velvety olive-green to dark brown circular spots on leaf blades",
      "Puckered, distorted leaf texture surrounding expanding lesions",
      "Premature foliage drop weakening tree carbohydrate reserves",
      "Corky, cracked brown scabs on developing fruit"
    ],
    prevention: [
      "Rake, chop, or compost fallen autumn leaves to eliminate overwintering ascopores",
      "Prune dense canopies during dormancy to optimize sunlight and fast wind drying",
      "Avoid overhead irrigation to minimize prolonged hours of leaf wetness",
      "Apply preventative bio-fungicides or protective sprays during early bud break"
    ],
  },
  "Apple___Black_rot": {
    plant: "Apple",
    disease: "Black Rot",
    pathogen: "Botryosphaeria obtusa (fungus)",
    description: "Causes frogeye leaf spots, branch cankers, and dark mummified fruit rot. It weakens orchard wood and significantly impacts commercial fruit quality.",
    symptoms: [
      "Circular 'frogeye' spots with purple margins and tan/brown centers",
      "Sunken reddish-brown cankers girdling small branches and twigs",
      "Firm, rotting fruit with concentric dark rings that dry into black mummies",
      "Yellowing leaves dropping prematurely from affected branches"
    ],
    prevention: [
      "Prune out dead shoots, fire blight strikes, and mummies during winter pruning",
      "Bury or burn pruned infected wood away from productive trees",
      "Maintain tree vigor with balanced nutrition and avoid trunk nicking",
      "Scout orchards closely during warm, humid spring rain periods"
    ],
  },
  "Apple___Cedar_apple_rust": {
    plant: "Apple",
    disease: "Cedar Apple Rust",
    pathogen: "Gymnosporangium juniperi-virginianae (fungus)",
    description: "A two-host fungal disease requiring junipers (eastern red cedar) and apples to complete its life cycle. Produces vibrant orange-yellow spots on foliage.",
    symptoms: [
      "Bright orange-yellow circular spots on upper leaf surfaces in late spring",
      "Tiny black raised fruiting bodies (pycnia) in the center of yellow lesions",
      "Slender tube-like spore horns (aecia) protruding on leaf undersides",
      "Early defoliation and fruit blemishes in severe seasons"
    ],
    prevention: [
      "Remove eastern red cedars and wild juniper galls within 1-2 miles if feasible",
      "Plant rust-resistant apple cultivars (such as Liberty, Enterprise, or Freedom)",
      "Apply protective treatments during the critical spring galls gelatinization period",
      "Monitor orchards after warm spring rain events"
    ],
  },
  "Apple___healthy": {
    plant: "Apple",
    disease: "Healthy Leaf",
    pathogen: "None (Healthy)",
    description: "The apple leaf shows healthy physiological development with uniform coloration, robust leaf venation, intact cuticle, and no visible necrotic or fungal symptoms.",
    symptoms: [
      "Uniform vibrant green blade without lesions, chlorosis, or necrotic margins",
      "Intact leaf lamina with normal surface texture and vein architecture",
      "Absence of fungal sporulation, powdery residue, or rust pustules"
    ],
    prevention: [
      "Maintain routine scouting and balanced seasonal soil fertilization",
      "Ensure regular drip irrigation during hot dry spells without wetting foliage",
      "Continue standard integrated pest management (IPM) monitoring"
    ],
  },
  "Cherry_(including_sour)___Powdery_mildew": {
    plant: "Cherry",
    disease: "Powdery Mildew",
    pathogen: "Podosphaera clandestina (fungus)",
    description: "Attacks young expanding cherry leaves and succulent shoots, producing white patches of talcum-powder-like mycelial growth that curl foliage.",
    symptoms: [
      "White superficial powdery fungal patches on lower leaf surfaces and new shoots",
      "Upward leaf curling, twisting, and puckering of young terminal leaves",
      "Stunted new shoot elongation and premature yellowing of affected leaves",
      "Fruit surface blemishes with possible russeting in severe infestations"
    ],
    prevention: [
      "Prune trees to open inner canopy and increase air movement",
      "Avoid excessive late-season nitrogen applications which stimulate susceptible growth",
      "Apply sulfur or horticultural oils early at first sign of powdery patches",
      "Water root zone directly without sprinkler contact on foliage"
    ],
  },
  "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": {
    plant: "Corn (Maize)",
    disease: "Gray Leaf Spot",
    pathogen: "Cercospora zeae-maydis (fungus)",
    description: "A destructive foliar disease of maize favored by warm, humid, overcast weather. Rectangular lesions run parallel between leaf veins, causing extensive photosynthetic loss.",
    symptoms: [
      "Small tan spots expanding into distinct rectangular lesions delimited by leaf veins",
      "Lesions turning gray during high humidity as spores develop",
      "Extensive blighting of lower leaves progressing upward toward the ear leaf",
      "Stalk lodging and reduced grain fill in severe outbreaks"
    ],
    prevention: [
      "Plant corn hybrids with high genetic tolerance or resistance to gray leaf spot",
      "Rotate crops with non-grass crops such as soybeans to interrupt spore survival",
      "Till infected residue into soil where appropriate to accelerate decomposition",
      "Scout fields around tasseling and apply targeted fungicides if threshold is reached"
    ],
  },
  "Corn_(maize)___Common_rust_": {
    plant: "Corn (Maize)",
    disease: "Common Rust",
    pathogen: "Puccinia sorghi (fungus)",
    description: "Common rust appears as cinnamon-brown powdery pustules scattered across both leaf surfaces, spreading quickly in cool, wet environments and reducing plant vigor.",
    symptoms: [
      "Oval to elongate cinnamon-brown pustules (uredinia) on upper and lower leaf surfaces",
      "Pustules rupturing leaf epidermis to release powdery brown spores upon touch",
      "Chlorosis and yellow halos surrounding dense pustule clusters",
      "Leaf tissue senescence and early drying under heavy spore loads"
    ],
    prevention: [
      "Utilize resistant or tolerant maize hybrid varieties",
      "Plant early in the season to avoid peak summer windborne spore migrations",
      "Monitor canopy development before silking stage",
      "Consider foliar fungicide applications only if severe rust appears before tasseling"
    ],
  },
  "Corn_(maize)___Northern_Leaf_Blight": {
    plant: "Corn (Maize)",
    disease: "Northern Leaf Blight",
    pathogen: "Exserohilum turcicum (fungus)",
    description: "Northern corn leaf blight causes long, elliptical, grayish-green or tan lesions ('cigar-shaped') that destroy significant leaf area, impacting yield when developing before grain fill.",
    symptoms: [
      "Long, elliptical, grayish-green or tan 'cigar-shaped' lesions (1 to 6 inches long)",
      "Dark, olive-green fungal sporulation within lesions during damp conditions",
      "Lesions coalescing to burn large sections of leaf tissue",
      "Premature plant death and reduced kernel test weight"
    ],
    prevention: [
      "Select resistant hybrids carrying specific Ht resistance genes",
      "Practice two-year crop rotation away from continuous maize monoculture",
      "Manage field residues to reduce initial spore inoculum",
      "Apply protective foliar fungicides if disease reaches third leaf below ear leaf before silking"
    ],
  },
  "Grape___Black_rot": {
    plant: "Grape",
    disease: "Black Rot",
    pathogen: "Guignardia bidwellii (fungus)",
    description: "Black rot attacks all green parts of the grapevine, including young leaves, petioles, shoots, and fruit clusters. It turns berries into hard, shriveled black mummies.",
    symptoms: [
      "Small circular reddish-brown leaf spots with dark borders and tiny black pycnidia pimples",
      "Elongated dark cankers on young shoots and petioles",
      "Infected fruit turning pale, rotting, then shriveling into hard black wrinkled mummies",
      "Loss of entire grape clusters under warm, wet conditions"
    ],
    prevention: [
      "Collect and destroy all dried mummified berries from vines and ground during winter pruning",
      "Prune and train vines to open leaf canopies and reduce drying time",
      "Apply preventative protective fungicides starting at early shoot growth (bud break to fruit set)",
      "Maintain clean vineyard floor with proper weed control"
    ],
  },
  "Grape___Esca_(Black_Measles)": {
    plant: "Grape",
    disease: "Esca (Black Measles)",
    pathogen: "Complex of fungi (Phaeomoniella, Fomitiporia)",
    description: "A serious grapevine trunk disease causing characteristic 'tiger-striped' leaf discoloration, internal wood decay, and spotted dark berries known as black measles.",
    symptoms: [
      "Interveinal chlorosis and necrosis creating a distinctive 'tiger-stripe' pattern on leaves",
      "Small dark purple/brown spots ('measles') appearing on berry skin",
      "Sudden vine wilting (apoplexy) during hot dry summer periods",
      "Dark vascular streaking and spongy white heart rot in trunk cross-sections"
    ],
    prevention: [
      "Protect pruning wounds with wound sealants or biocontrol agents immediately after cutting",
      "Avoid making large pruning wounds during wet weather when fungal spores are airborne",
      "Mark symptomatic vines and prune them last to prevent mechanical cross-contamination",
      "Remove and destroy severely collapsed or dead vine trunks"
    ],
  },
  "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": {
    plant: "Grape",
    disease: "Leaf Blight (Isariopsis Leaf Spot)",
    pathogen: "Pseudocercospora vitis / Phaeoisariopsis vitis (fungus)",
    description: "Isariopsis leaf spot causes irregular dark brown necrotic spots on grape leaves late in the season, leading to defoliation, weakened cane maturation, and reduced vine cold hardiness.",
    symptoms: [
      "Irregular, angular dark brown or reddish-brown lesions on leaf surfaces",
      "Distinct yellow halos surrounding leaf spots",
      "Velvety gray or olive fungal tufts on lesion undersides in high humidity",
      "Premature defoliation starting from basal leaves toward vine tips"
    ],
    prevention: [
      "Prune properly to reduce canopy density and enhance airflow",
      "Remove fallen leaf debris in late autumn to reduce overwintering fungi",
      "Apply protective copper or broad-spectrum fungicides if disease pressure is high",
      "Ensure balanced fertilization and avoid excessive irrigation late in the season"
    ],
  },
  "Orange___Haunglongbing_(Citrus_greening)": {
    plant: "Orange (Citrus)",
    disease: "Huanglongbing (Citrus Greening)",
    pathogen: "Candidatus Liberibacter asiaticus (bacterium vectored by psyllids)",
    description: "Huanglongbing (HLB) is one of the most destructive citrus diseases in the world. It disrupts vascular phloem flow, producing blotchy asymmetrical leaf mottling, yellow shoots, and bitter, lopsided fruit.",
    symptoms: [
      "Asymmetric, blotchy chlorotic mottling across leaf veins (one side differs from other)",
      "Yellowing of individual branches ('yellow dragon shoots') contrasting with green canopy",
      "Thickened, corky leaf veins with upright, leathery leaves resembling nutrient deficiency",
      "Small, lopsided, poorly colored fruit with bitter juice and aborted seeds"
    ],
    prevention: [
      "Control Asian citrus psyllid (Diaphorina citri) insect vectors aggressively",
      "Plant only certified disease-free nursery stock from registered nurseries",
      "Promptly remove and destroy confirmed infected trees to protect surrounding orchards",
      "Provide enhanced foliar micronutrient nutrition to support root and canopy vitality"
    ],
  },
  "Peach___Bacterial_spot": {
    plant: "Peach",
    disease: "Bacterial Spot",
    pathogen: "Xanthomonas arboricola pv. pruni (bacterium)",
    description: "Bacterial spot causes water-soaked angular leaf spots that drop out to create a 'shot-hole' appearance. It also causes deep pitted lesions on peach fruit that crack open.",
    symptoms: [
      "Small angular, water-soaked spots on leaves turning purple, brown, or black",
      "Dead centers falling out of leaf spots giving a characteristic 'shot-hole' effect",
      "Leaf tip yellowing and substantial premature leaf drop",
      "Pitted, sunken, cracked lesions on peach fruit exuding gum"
    ],
    prevention: [
      "Plant bacterial-spot resistant or tolerant peach varieties",
      "Avoid sandy orchard sites with windblown abrasive dust where possible",
      "Apply protective copper or oxytetracycline sprays starting at petal fall",
      "Maintain windbreaks around orchards to reduce wind-driven rain inoculation"
    ],
  },
  "Pepper,_bell___Bacterial_spot": {
    plant: "Bell Pepper",
    disease: "Bacterial Spot",
    pathogen: "Xanthomonas euvesicatoria (bacterium)",
    description: "Bacterial spot on bell peppers appears as water-soaked circular lesions that turn dark brown with chlorotic halos, causing defoliation, sunburn on exposed fruit, and yield loss.",
    symptoms: [
      "Small circular water-soaked spots on undersides of leaves expanding to brown lesions",
      "Yellow halo surrounding dark brown necrotic leaf lesions",
      "Rapid leaf yellowing and defoliation leaving peppers exposed to sunscald",
      "Rough, raised, warty brown lesions on developing bell peppers"
    ],
    prevention: [
      "Use certified disease-free pepper seeds and resistant hybrid cultivars",
      "Avoid handling plants or working in the field when foliage is wet",
      "Sterilize garden stakes, tools, and seedling trays between growing cycles",
      "Apply preventative fixed copper bactericides combined with mancozeb as needed"
    ],
  },
  "Potato___Early_blight": {
    plant: "Potato",
    disease: "Early Blight",
    pathogen: "Alternaria solani (fungus)",
    description: "Early blight is a common potato disease characterized by brown circular to angular lesions with distinct concentric rings ('target-board' appearance) on older lower leaves.",
    symptoms: [
      "Dark brown to black spots with concentric rings resembling a target board",
      "Chlorotic yellow halos surrounding expanding lesions",
      "Lower older leaves becoming necrotic, drying up, and drooping on the stem",
      "Tuber rot showing dry, dark, sunken surface lesions with corky flesh beneath"
    ],
    prevention: [
      "Plant certified disease-free seed tubers with high vigor",
      "Maintain adequate nitrogen and potassium fertilization to prevent premature vine stress",
      "Ensure uniform irrigation; avoid drought stress followed by heavy watering",
      "Apply protective fungicides (e.g., chlorothalonil, azoxystrobin) before canopy closure"
    ],
  },
  "Potato___Late_blight": {
    plant: "Potato",
    disease: "Late Blight",
    pathogen: "Phytophthora infestans (oomycete)",
    description: "Late blight is the catastrophic pathogen responsible for the Irish potato famine. It spreads with explosive speed in cool, wet weather, causing water-soaked rot across foliage and tubers.",
    symptoms: [
      "Large, irregular water-soaked pale to dark green lesions turning rapidly brown-black",
      "Delicate white fungal-like mildew on leaf undersides at the border of lesions during humidity",
      "Entire stems collapsing with foul odor as foliage rots in wet conditions",
      "Tubers developing a granular, reddish-brown dry rot extending into the flesh"
    ],
    prevention: [
      "Plant only certified late-blight-free seed potatoes",
      "Destroy all cull piles and volunteer potato sprouts before the season begins",
      "Monitor regional late-blight forecast alerts and apply preventative treatments before rain",
      "Kill potato vines completely 2 weeks before harvest to prevent tuber contamination"
    ],
  },
  "Squash___Powdery_mildew": {
    plant: "Squash",
    disease: "Powdery Mildew",
    pathogen: "Podosphaera xanthii (fungus)",
    description: "Powdery mildew on squash produces conspicuous white talcum-powder spots on both sides of leaves, petioles, and stems, causing foliage to yellow, dry out, and die prematurely.",
    symptoms: [
      "Circular white, powdery fungal patches on upper and lower leaf surfaces",
      "Powdery coating rapidly expanding to cover entire leaves and petioles",
      "Infected leaves turning yellow, then brown, brittle, and papery",
      "Premature vine loss resulting in sunscalded, poorly flavored squash fruit"
    ],
    prevention: [
      "Plant powdery mildew-resistant squash and pumpkin varieties",
      "Allow generous plant spacing between rows to maximize sunlight and airflow",
      "Apply horticultural oils, potassium bicarbonate, or neem oil at first detection",
      "Avoid excess nitrogen fertilizer which stimulates susceptible tender leaves"
    ],
  },
  "Strawberry___Leaf_scorch": {
    plant: "Strawberry",
    disease: "Leaf Scorch",
    pathogen: "Diplocarpon earlianum (fungus)",
    description: "Strawberry leaf scorch causes numerous small, dark purple to brownish irregular blotches on leaves that enlarge and coalesce, giving the foliage a scorched or burned look.",
    symptoms: [
      "Small dark purple, irregular spots on upper leaf surfaces without light centers",
      "Spots coalescing to turn entire leaves dark reddish-purple then brown",
      "Leaf margins curling upward and drying out, appearing scorched by heat or fire",
      "Weakened crowns, reduced runner production, and stunted fruit"
    ],
    prevention: [
      "Plant certified disease-free strawberry crowns",
      "Renovate June-bearing strawberry beds immediately after harvest by mowing old foliage",
      "Avoid overhead irrigation; use drip tapes under plastic or straw mulch",
      "Remove and burn severely infected foliage to reduce overwintering fungi"
    ],
  },
  "Tomato___Bacterial_spot": {
    plant: "Tomato",
    disease: "Bacterial Spot",
    pathogen: "Xanthomonas spp. (bacterium)",
    description: "Bacterial spot on tomato produces small, greasy water-soaked circular lesions on leaves and stems that turn dark brown with yellow halos, leading to severe defoliation.",
    symptoms: [
      "Small (1/8 inch), water-soaked, dark brown to black circular lesions on leaves",
      "Yellow halos developing around lesions under warm, wet conditions",
      "Severe blighting, leaf drying, and defoliation starting from the lower canopy",
      "Small raised black scab-like pustules on green tomato fruit"
    ],
    prevention: [
      "Use certified pathogen-free tomato seed and disease-free transplants",
      "Never work or prune in tomato patches when plants are wet with dew or rain",
      "Sanitize tomato stakes, cages, and pruning tools in a 10% bleach solution",
      "Apply preventative fixed copper sprays mixed with mancozeb early in the season"
    ],
  },
  "Tomato___Early_blight": {
    plant: "Tomato",
    disease: "Early Blight",
    pathogen: "Alternaria solani (fungus)",
    description: "Early blight is one of the most common tomato diseases. It starts on the oldest lower leaves with brown lesions that develop concentric rings, yellow halos, and progressive defoliation.",
    symptoms: [
      "Circular brown lesions with distinctive concentric rings ('target board' pattern)",
      "Pronounced yellowing (chlorosis) of leaf tissue surrounding lesions",
      "Lower leaves drying up, turning brown, and hanging down against the main stem",
      "Dark, leathery sunken cankers on stems and around fruit calyx"
    ],
    prevention: [
      "Prune off lower foliage (bottom 12-18 inches) to eliminate soil splash contact",
      "Apply organic mulch (straw, woodchips, or paper) under tomato plants",
      "Stake or cage tomatoes to keep foliage upright and well-ventilated",
      "Rotate garden plots away from tomatoes, potatoes, and eggplants for 3 years"
    ],
  },
  "Tomato___Late_blight": {
    plant: "Tomato",
    disease: "Late Blight",
    pathogen: "Phytophthora infestans (oomycete)",
    description: "Late blight is an aggressive, destructive water mold that spreads rapidly during cool, damp weather, turning healthy tomato vines into black rotting foliage within days.",
    symptoms: [
      "Large, irregular water-soaked pale green or dark gray spots on leaves and stems",
      "White, velvety fungal-like down on the undersides of leaves during humid mornings",
      "Rapid stem collapse, blackened petioles, and foul decaying odor",
      "Firm, greasy olive-brown to dark lesions on tomato fruit rotting the harvest"
    ],
    prevention: [
      "Scout plants closely during persistent overcast, cool, rainy periods",
      "Remove and seal infected plants in plastic bags immediately at first sign",
      "Avoid overhead watering; irrigate strictly at the base in early morning",
      "Select resistant cultivars such as Mountain Magic, Defiant, or Iron Lady"
    ],
  },
  "Tomato___Leaf_Mold": {
    plant: "Tomato",
    disease: "Leaf Mold",
    pathogen: "Passalora fulva (fungus)",
    description: "Tomato leaf mold thrives in high-humidity greenhouse and polytunnel conditions, producing pale yellow spots on upper leaf surfaces and dense olive-brown velvety mold beneath.",
    symptoms: [
      "Pale green to yellowish indistinct spots on upper surfaces of older leaves",
      "Dense, velvety olive-green to brown fungal growth directly on leaf undersides",
      "Infected leaves curling, withering, and dropping prematurely",
      "Infestation progressing from bottom leaves toward upper canopy"
    ],
    prevention: [
      "Maximize greenhouse ventilation with fans and ridge vents to keep humidity below 85%",
      "Increase plant spacing and prune suckers to promote air circulation",
      "Heat greenhouse slightly at dusk to prevent condensation on leaf surfaces",
      "Utilize resistant greenhouse tomato varieties with Cf resistance genes"
    ],
  },
  "Tomato___Septoria_leaf_spot": {
    plant: "Tomato",
    disease: "Septoria Leaf Spot",
    pathogen: "Septoria lycopersici (fungus)",
    description: "Septoria leaf spot causes numerous tiny circular spots with dark brown margins and grayish-white centers dotted with black pycnidia, causing early foliage loss.",
    symptoms: [
      "Numerous tiny circular spots (1/16 to 1/8 inch) on lower leaves",
      "Distinct dark brown margins surrounding pale gray or white centers",
      "Tiny black pepper-like fruiting bodies (pycnidia) visible inside spot centers",
      "Leaves yellowing rapidly, drying out, and dropping, exposing fruit to sunscald"
    ],
    prevention: [
      "Remove lower infected leaves as soon as first spots appear on bottom branches",
      "Mulch soil beneath plants to prevent fungal spores from splashing upward",
      "Clean and sanitize all garden trellises and cages before each growing season",
      "Apply protective bio-fungicide or copper treatments during rainy spells"
    ],
  },
  "Tomato___Spider_mites Two-spotted_spider_mite": {
    plant: "Tomato",
    disease: "Two-Spotted Spider Mite Damage",
    pathogen: "Tetranychus urticae (arachnid pest)",
    description: "Two-spotted spider mites suck plant sap from leaf cells in hot, dry conditions, producing fine stippling, bronze discoloration, delicate silken webbing, and leaf desiccation.",
    symptoms: [
      "Fine yellow or white speckled stippling on upper leaf surfaces",
      "Leaves taking on a faded, dusty, bronzed, or bleached appearance",
      "Fine silken webbing across leaf undersides, stems, and growing tips",
      "Brittle, curled leaves that dry up and drop in severe infestations"
    ],
    prevention: [
      "Spray leaf undersides with a strong jet of water to dislodge mite colonies and webs",
      "Avoid water-stressing plants; keep soil consistently moist in high summer",
      "Release predatory mites (such as Phytoseiulus persimilis) in enclosed gardens",
      "Apply insecticidal soap or horticultural oil thoroughly to leaf undersides"
    ],
  },
  "Tomato___Target_Spot": {
    plant: "Tomato",
    disease: "Target Spot",
    pathogen: "Corynespora cassiicola (fungus)",
    description: "Target spot affects leaves, stems, and fruit, producing circular brown lesions with subtle concentric rings and yellow margins that coalesce into extensive blights.",
    symptoms: [
      "Pinpoint brown spots expanding into circular lesions with light brown centers",
      "Concentric rings with dark margins and chlorotic yellow halos",
      "Lesions coalescing to cause large ragged necrotic patches on leaflets",
      "Sunken circular brown lesions on tomato fruit with crater-like appearance"
    ],
    prevention: [
      "Improve field air drainage by increasing in-row plant spacing",
      "Prune inner suckers and lower leaves to reduce microclimate humidity",
      "Avoid overhead sprinkler irrigation and use drip systems instead",
      "Apply preventative fungicides when weather is warm and persistently wet"
    ],
  },
  "Tomato___Tomato_mosaic_virus": {
    plant: "Tomato",
    disease: "Tomato Mosaic Virus (ToMV)",
    pathogen: "Tomato Mosaic Virus (virion)",
    description: "Tomato mosaic virus is an extremely stable virus transmitted mechanically by hands, pruning tools, and infected seed. It causes mottled green mosaic patterns and distorted foliage.",
    symptoms: [
      "Light and dark green mottled mosaic patterns on leaves",
      "Leaf distortion, blistering, curling, or strap-like 'shoestring' narrowing",
      "Stunted plant growth and reduced fruit set with internal browning",
      "Yellowing and mottled appearance on developing tomato fruit"
    ],
    prevention: [
      "Wash hands thoroughly with soap and water before handling plants (especially tobacco users)",
      "Disinfect pruning tools frequently in a 20% non-fat dry milk solution or 10% bleach",
      "Select ToMV-resistant cultivars (indicated by 'T' or 'ToMV' on seed packets)",
      "Rogue out and destroy infected plants immediately; do not compost them"
    ],
  },
  "Tomato___Tomato_Yellow_Leaf_Curl_Virus": {
    plant: "Tomato",
    disease: "Tomato Yellow Leaf Curl Virus (TYLCV)",
    pathogen: "Tomato Yellow Leaf Curl Begomovirus",
    description: "TYLCV is a devastating virus transmitted by sweetpotato whiteflies. It severely stunts tomato plants, causing leaves to curl upward with chlorotic yellow margins and preventing fruit set.",
    symptoms: [
      "Dramatic upward cupping and curling of leaf margins ('spooning')",
      "Prominent yellowing (chlorosis) along leaflet margins and interveinal areas",
      "Substantial stunting of plant height and bush-like bunched apical growth",
      "Severe flower drop with little to no marketable fruit production"
    ],
    prevention: [
      "Control silverleaf/sweetpotato whitefly (Bemisia tabaci) populations using yellow sticky traps and row covers",
      "Plant certified TYLCV-resistant tomato hybrids",
      "Use reflective silver mulches to repel incoming whiteflies in early plant stages",
      "Remove and destroy infected plants promptly to prevent them from acting as virus reservoirs"
    ],
  },
  "Tomato___healthy": {
    plant: "Tomato",
    disease: "Healthy Leaf",
    pathogen: "None (Healthy)",
    description: "Healthy tomato foliage displaying vigorous compound leaves, deep green chlorophyll saturation, clear venation, intact glandular trichomes, and no visible lesions or virus mottling.",
    symptoms: [
      "Vibrant, uniform green coloration across all leaflets",
      "Strong turgor pressure and intact serrated leaflet margins",
      "No necrotic lesions, concentric rings, powdery mold, or virus mosaics"
    ],
    prevention: [
      "Maintain consistent drip irrigation and mulch beds to protect foliage",
      "Prune bottom suckers to maintain optimal airflow beneath the canopy",
      "Inspect weekly for early signs of hornworms, mites, and foliar spots"
    ],
  },
  "Blueberry___healthy": {
    plant: "Blueberry",
    disease: "Healthy Leaf",
    pathogen: "None (Healthy)",
    description: "The blueberry foliage displays optimal vegetative vigor with deep green leaves, smooth leaf margins, and no signs of bacterial scorch, rust, or mummy berry blights.",
    symptoms: [
      "Clean glossy foliage with uniform green pigmentation",
      "Normal vascular coloration along main and lateral veins",
      "No leaf tip necrosis, marginal browning, or interveinal chlorosis"
    ],
    prevention: [
      "Maintain acidic soil pH (ideally 4.5 to 5.2) with organic pine bark mulch",
      "Provide consistent moisture through drip emitters to prevent drought stress",
      "Monitor periodically for spotted-wing drosophila and leaf spot symptoms"
    ],
  },
  "Cherry_(including_sour)___healthy": {
    plant: "Cherry",
    disease: "Healthy Leaf",
    pathogen: "None (Healthy)",
    description: "The cherry foliage exhibits healthy cell structure, rich chlorophyll content, and normal serrated leaf margins without fungal spots or powdery colonies.",
    symptoms: [
      "Uniform green leaf color with healthy serrated margin",
      "No shot-hole perforations, leaf curl, or chlorotic patches",
      "Clean leaf undersides without white mycelial growth or rust spots"
    ],
    prevention: [
      "Ensure good orchard drainage and annual canopy thinning for light penetration",
      "Apply balanced nitrogen fertilizer avoid excessive vegetative flush",
      "Scout weekly during warm humid periods"
    ],
  },
  "Corn_(maize)___healthy": {
    plant: "Corn (Maize)",
    disease: "Healthy Leaf",
    pathogen: "None (Healthy)",
    description: "Healthy maize foliage with clean parallel venation, uniform deep green hue, and no fungal pustules, striping, or necrotic blights.",
    symptoms: [
      "Uniform green leaf blade with intact margins and healthy ligule attachment",
      "Absence of chlorotic striping, necrotic spots, or fungal spore eruptions",
      "Strong turgor pressure and vigorous leaf expansion"
    ],
    prevention: [
      "Maintain soil fertility according to soil test recommendations",
      "Ensure weed management to eliminate competitive reservoir plants",
      "Scout at V6, V12, and R1 reproductive stages"
    ],
  },
  "Grape___healthy": {
    plant: "Grape",
    disease: "Healthy Leaf",
    pathogen: "None (Healthy)",
    description: "Healthy grapevine foliage with well-defined leaf lobes, clear venation, intact cuticle, and no signs of mildew, anthracnose, or wood-rot stripe patterns.",
    symptoms: [
      "Lush green leaf blade with normal lobed structure and serration",
      "Absence of interveinal striping, powdery deposits, or necrotic spots",
      "Clean leaf petioles without dark cankers or fungal lesions"
    ],
    prevention: [
      "Practice regular canopy management, shoot thinning, and leaf pulling",
      "Monitor vineyard microclimate and leaf wetness duration",
      "Maintain soil drainage and balanced potassium/nitrogen nutrition"
    ],
  },
  "Peach___healthy": {
    plant: "Peach",
    disease: "Healthy Leaf",
    pathogen: "None (Healthy)",
    description: "The peach leaf displays healthy lanceolate morphology, vibrant green coloring, smooth surface texture, and absence of bacterial pitting or leaf curl deformities.",
    symptoms: [
      "Smooth lanceolate leaf blade with bright green pigmentation",
      "No shot-hole perforations, leaf curling, or water-soaked lesions",
      "Intact leaf margins and healthy petiole attachment"
    ],
    prevention: [
      "Follow a preventative dormant copper wash for peach leaf curl control",
      "Maintain balanced pruning to ensure adequate sunlight in the center canopy",
      "Ensure regular deep irrigation during fruit development stages"
    ],
  },
  "Pepper,_bell___healthy": {
    plant: "Bell Pepper",
    disease: "Healthy Leaf",
    pathogen: "None (Healthy)",
    description: "The bell pepper leaf exhibits rich dark green color, smooth surface, prominent veins, and absence of water-soaked lesions, aphid mottling, or fungal spots.",
    symptoms: [
      "Lush uniform green color across entire leaf surface",
      "Smooth, intact leaf blade free of necrotic margins or spots",
      "Healthy vascular structure with no virus-induced mosaic patterns"
    ],
    prevention: [
      "Ensure steady drip irrigation and avoid soil splashing onto lower foliage",
      "Mulch beds with clean straw or plastic to suppress soil-borne pathogens",
      "Scout underside of leaves weekly for early thrips, aphids, and mites"
    ],
  },
  "Potato___healthy": {
    plant: "Potato",
    disease: "Healthy Leaf",
    pathogen: "None (Healthy)",
    description: "Healthy potato foliage displaying vigorous compound leaves, vibrant emerald green coloration, and no signs of target-shaped spots or water-soaked blights.",
    symptoms: [
      "Healthy compound leaves with glossy green leaflets",
      "No necrotic spots, target rings, or white sporulation",
      "Turgid erect stems with vigorous canopy growth"
    ],
    prevention: [
      "Hill potatoes properly to protect tubers from light exposure and spore wash",
      "Rotate potato fields on a minimum 3-year cycle with non-solanaceous crops",
      "Maintain soil moisture without allowing standing water in furrows"
    ],
  },
  "Raspberry___healthy": {
    plant: "Raspberry",
    disease: "Healthy Leaf",
    pathogen: "None (Healthy)",
    description: "Healthy raspberry leaf with typical compound structure, fine serrated margins, clean silvery undersides, and absence of cane blight or rust pustules.",
    symptoms: [
      "Uniform green upper surface and clean whitish-green underside",
      "Serrated edges intact with no leaf scorch, mottling, or necrosis",
      "Vigorous cane petioles without spur blight or anthracnose cankers"
    ],
    prevention: [
      "Trellis canes to improve air movement and sun exposure",
      "Prune out spent floricanes immediately after harvest at ground level",
      "Mulch rows to prevent weed competition and reduce soil splashing"
    ],
  },
  "Soybean___healthy": {
    plant: "Soybean",
    disease: "Healthy Leaf",
    pathogen: "None (Healthy)",
    description: "Healthy trifoliate soybean leaf with optimal chlorophyll balance, uniform leaflet development, and absence of frogeye leaf spots, downy mildew, or rust pustules.",
    symptoms: [
      "Clean trifoliate leaves with vibrant green coloration",
      "No vein necrosis, rust pustules, or chlorotic mosaic mottling",
      "Strong leaflet structure and smooth lamina"
    ],
    prevention: [
      "Select high-yielding seed varieties with resistance to soybean cyst nematode and Phytophthora",
      "Practice crop rotation with corn or small grains",
      "Scout canopy at R1 (flowering) and R3 (pod development) stages"
    ],
  },
  "Strawberry___healthy": {
    plant: "Strawberry",
    disease: "Healthy Leaf",
    pathogen: "None (Healthy)",
    description: "The strawberry foliage displays healthy trifoliate leaves, rich emerald green color, crisp serrated edges, and no signs of leaf spot, scorch, or botrytis mold.",
    symptoms: [
      "Lush trifoliate green leaves with clean serrations",
      "No purple blotches, powdery coating, or necrotic margins",
      "Healthy petiole connection and vigorous crown emergence"
    ],
    prevention: [
      "Mulch with clean dry straw to keep leaves and fruit elevated off soil",
      "Ensure good bed drainage and avoid soil saturation",
      "Rotate strawberry plantings every 3 to 4 years to break disease cycles"
    ],
  },
};

export function getLocalDiseaseMetadata(className: string): DiseaseInfo {
  if (DISEASE_CATALOG[className]) {
    return DISEASE_CATALOG[className];
  }

  // Graceful fallback for any other class
  let plant = "Plant";
  let disease = "Unspecified Condition";
  if (className.includes("___")) {
    const parts = className.split("___");
    const p = parts[0] || "Plant";
    const d = parts.slice(1).join(" ") || "Condition";
    plant = p.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    disease = d.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return {
    plant,
    disease,
    pathogen: "Unspecified",
    description: "Detailed agronomic information for this classification is not currently cataloged in the local knowledge base.",
    symptoms: [
      "Visual reference symptoms are currently being documented for this specific plant species.",
      "Compare with university or local agricultural extension plant pathology reference manuals."
    ],
    prevention: [
      "Isolate or closely monitor the symptomatic leaf for rapid spread or tissue collapse.",
      "Take secondary photographs under bright, even, non-direct natural lighting.",
      "Consult an agronomist or local plant extension office before initiating chemical interventions."
    ],
  };
}
