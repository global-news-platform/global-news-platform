/**
 * Multi-Layer Smart Category Classifier v2
 * ==========================================
 * Analyzes article title, excerpt, body, and source metadata
 * to determine the best-fit category with weighted scoring.
 *
 * Architecture:
 *   1. Source awareness (known URL/label patterns → +10 bonus)
 *   2. Multi-tier keyword scoring (STRONG 5pt / MEDIUM 3pt / WEAK 1pt)
 *   3. Title weighting (3x)
 *   4. Entity detection (known people/orgs → +8 title / +5 body)
 *   5. Negative demotions (heavy -25 for conflicting signal pairs)
 *   6. Confidence scoring with gap analysis
 *   7. General News fallback (< 30 confidence → "general")
 *   8. Debug logging full decision trail
 */

const CATEGORIES = ["sports", "technology", "business", "politics", "science", "health", "climate", "culture", "world", "opinion"]

// ─── Source Pattern Map ────────────────────────────────────────
const SOURCE_MAP = [
  [/espn|sports|athletic|bleacher report|goal\.com|transfermarkt|eurosport|nfl\.com|nba\.com|mlb\.com|bbc sport|guardian sport|sky sport/i, "sports"],
  [/techcrunch|the verge|wired|ars technica|engadget|gizmodo|zdnet|cnet|theregister|techradar|venturebeat|9to5mac|androidauthority|xda-developers|hacker news|techmeme|thenextweb/i, "technology"],
  [/politico|the hill|realclearpolitics|fivethirtyeight|c-span|house\.gov|senate\.gov|washington post politics/i, "politics"],
  [/bloomberg|financial times|wall street journal|business insider|forbes|inc\.com|marketwatch|investing\.com|cnbc|economist|reuters.*market|barrons/i, "business"],
  [/nature|science magazine|new scientist|scientific american|phys\.org|space\.com|national geographic|science daily|newscientist/i, "science"],
  [/webmd|healthline|mayo clinic|medical news today|who\.int|cdc\.gov|medscape|everyday health|verywell/i, "health"],
  [/climate central|inside climate news|grist|carbon brief|insideclimatenews/i, "climate"],
  [/variety|hollywood reporter|pitchfork|rolling stone|billboard|deadline|the guardian culture|ew\.com/i, "culture"],
]

// ─── Tier 1: STRONG keywords (category-defining, 5 points each) ─
const STRONG = {
  sports: [
    "nfl", "nba", "mlb", "nhl", "epl", "uefa", "champions league",
    "premier league", "la liga", "serie a", "bundesliga", "ligue 1",
    "super bowl", "world cup", "grand slam", "formula 1", "f1",
    "playoff", "quarterback", "touchdown", "hat-trick", "hat trick",
    "transfer window", "free kick", "penalty kick", "goal kick",
    "world series", "stanley cup", "ncaa tournament", "march madness",
    "olympic gold", "world championship", "grand prix",
    "wimbledon", "us open", "french open", "australian open",
    "test match", "odi", "t20", "ipl", "ashes",
    "mma", "ufc", "boxing match", "wrestling",
    "striker", "midfielder", "defender", "goalkeeper",
    "pitcher", "batter", "inning", "home run",
    "alley-oop", "slam dunk", "three-pointer", "fast break",
    "ace", "love", "deuce", "birdie", "eagle", "hole-in-one",
    "penalty box", "face-off", "power play", "hat trick",
    "try", "conversion", "scrum", "lineout",
    "yellow card", "red card", "offside",
    "free throw", "field goal", "extra time", "stoppage time",
    "semi-final", "quarter-final", "relegation", "promotion",
    "le bron", "lebron", "curry", "durant", "messi", "ronaldo",
    "neymar", "mbappe", "haaland", "salah", "federer", "nadal",
    "djokovic", "serena", "tiger woods", "hail mary", "pick six",
  ],
  technology: [
    "artificial intelligence", "machine learning", "deep learning",
    "llm", "large language model", "gpt", "neural network",
    "self-driving", "autonomous vehicle", "quantum computing",
    "blockchain", "cryptocurrency", "nft", "defi", "web3",
    "cybersecurity", "ransomware", "data breach", "zero-day",
    "semiconductor", "microchip", "processor", "gpu", "cpu",
    "openai", "google deepmind", "anthropic", "meta ai",
    "software update", "operating system", "ios", "android",
    "cloud computing", "saas", "api", "microservice",
    "startup funding", "series a", "series b", "venture capital",
    "robotics", "drone", "autonomous", "spacex", "starship",
    "augmented reality", "virtual reality", "metaverse",
    "5g", "6g", "internet of things", "iot",
    "app store", "google play", "algorithm", "encryption",
    "big tech", "tech giant", "silicon valley",
    "programming", "coding", "developer", "software engineer",
    "data science", "big data", "database", "analytics",
    "chatbot", "generative ai", "computer vision", "nlp",
  ],
  business: [
    "stock market", "wall street", "dow jones", "s&p 500", "nasdaq",
    "interest rate", "federal reserve", "central bank", "monetary policy",
    "inflation", "recession", "gdp", "gross domestic product",
    "initial public offering", "ipo", "merger", "acquisition",
    "earnings report", "quarterly earnings", "fiscal year",
    "bond yield", "treasury yield", "bull market", "bear market",
    "trade war", "tariff", "trade deficit", "trade agreement",
    "bitcoin price", "crypto market", "forex", "currency market",
    "ceo", "chief executive", "chief financial", "board of directors",
    "shareholder", "dividend", "buyback", "market cap",
    "real estate", "housing market", "mortgage rate",
    "supply chain", "logistics", "manufacturing",
    "fortune 500", "multinational", "conglomerate",
    "antitrust", "monopoly", "oligopoly",
    "commercial bank", "investment bank", "hedge fund",
    "private equity", "venture capital", "angel investor",
  ],
  politics: [
    "president", "prime minister", "chancellor", "senator",
    "congress", "parliament", "house of representatives",
    "election", "campaign", "presidential", "midterm",
    "democrat", "republican", "bipartisan", "filibuster",
    "legislation", "bill passed", "executive order", "veto",
    "supreme court", "federal judge", "constitutional",
    "diplomacy", "sanctions", "embassy", "ambassador",
    "treaty", "summit", "negotiation", "ceasefire",
    "political party", "candidate", "primary election", "caucus",
    "impeachment", "indictment", "investigation", "hearing",
    "lobby", "lobbyist", "campaign finance", "pac",
    "governor", "mayor", "attorney general", "secretary of state",
    "white house", "capitol hill", "downing street", "kremlin",
    "electoral college", "swing state", "battleground",
    "political action committee", "super pac",
    "trump", "biden", "putin", "modi", "xi jinping", "macron",
    "scholz", "sunak", "orban", "meloni",
  ],
  science: [
    "nasa", "esa", "cern", "james webb", "hubble",
    "space exploration", "mars rover", "space mission",
    "black hole", "exoplanet", "asteroid", "galaxy",
    "quantum physics", "particle physics", "dark matter",
    "dna sequencing", "gene editing", "crispr", "genome",
    "clinical trial", "peer review", "scientific study",
    "evolution", "natural selection", "species discovery",
    "paleontology", "fossil", "dinosaur", "archaeology",
    "telescope", "observatory", "space station",
    "nobel prize", "scientific breakthrough",
    "climate science", "global warming", "sea level rise",
    "vaccine development", "mrna", "immunotherapy",
    "particle accelerator", "quantum entanglement",
    "supernova", "neutron star", "gravitational wave",
  ],
  health: [
    "fda", "cdc", "who", "world health organization",
    "covid", "pandemic", "epidemic", "outbreak",
    "vaccine", "booster", "vaccination",
    "cancer research", "tumor", "oncology", "chemotherapy",
    "heart disease", "cardiovascular", "stroke",
    "mental health", "depression", "anxiety", "therapy",
    "alzheimer", "dementia", "parkinson", "autism",
    "diabetes", "obesity", "hypertension", "cholesterol",
    "drug approval", "pharmaceutical",
    "medical device", "surgery", "transplant",
    "hospital", "emergency room", "intensive care",
    "medicare", "medicaid", "health insurance",
    "opioid", "prescription drug",
    "gene therapy", "stem cell", "biotech",
    "antibiotic", "antiviral", "immunization",
  ],
  climate: [
    "climate change", "global warming", "climate crisis",
    "carbon emission", "carbon neutral", "net zero",
    "renewable energy", "solar farm", "wind turbine",
    "fossil fuel", "coal plant", "oil drilling",
    "greenhouse gas", "carbon footprint", "carbon tax",
    "paris agreement", "cop28", "climate summit",
    "deforestation", "reforestation", "biodiversity",
    "extreme weather", "hurricane", "wildfire", "drought",
    "sea level", "glacier melt", "arctic ice",
    "electric vehicle", "ev", "clean energy",
    "sustainable", "green technology", "eco-friendly",
    "pollution", "air quality", "plastic waste",
    "conservation", "endangered species", "wildlife",
    "environmental regulation", "epa",
  ],
  culture: [
    "film festival", "movie review", "box office",
    "album release", "concert tour", "music festival",
    "museum exhibition", "art gallery", "contemporary art",
    "book review", "bestseller", "literary prize",
    "broadway", "west end", "theatre", "performing arts",
    "fashion week", "haute couture", "designer",
    "documentary", "series premiere", "netflix",
    "oscar", "grammy", "emmy", "tony", "bafta",
    "hollywood", "bollywood", "film industry",
    "artist", "musician", "painting", "sculpture",
    "dance performance", "ballet", "opera", "symphony",
    "archaeological", "heritage", "cultural",
    "social media", "influencer", "viral",
    "architecture", "photography", "animation",
  ],
  world: [
    "international court", "united nations", "security council",
    "war", "conflict", "invasion", "military strike",
    "refugee", "humanitarian", "aid worker",
    "geopolitical", "superpower", "hegemony",
    "nato", "european union", "brexit",
    "border dispute", "territorial", "annexation",
    "migration crisis", "asylum", "deportation",
    "genocide", "war crime", "human rights",
    "terrorism", "extremism", "insurgency",
    "civil war", "rebellion", "coup",
    "sanctions", "embargo", "trade restriction",
    "disarmament", "nuclear program", "weapons inspection",
    "ukraine", "russia", "china", "middle east", "iran",
    "gaza", "israel", "palestine", "afghanistan",
    "myanmar", "sudan", "ethiopia", "yemen",
  ],
  opinion: [
    "opinion", "commentary", "analysis:", "editorial",
    "op-ed", "op ed", "perspective", "viewpoint",
    "columnist", "contributor", "guest essay",
    "i think", "in my view", "argues that",
    "the case for", "the case against",
    "in defense of", "critique of", "reflections on",
  ],
}

// ─── Tier 2: MEDIUM keywords (strong signal, 3 points each) ────
const MEDIUM = {
  sports: [
    "soccer", "football", "cricket", "basketball", "tennis",
    "golf", "baseball", "hockey", "rugby", "athletics",
    "swimming", "cycling", "skiing", "boxing",
    "match", "fixture", "score", "goal", "winner",
    "player", "coach", "manager", "captain", "substitute",
    "stadium", "arena", "pitch", "court", "track",
    "league", "tournament", "championship", "final",
    "medal", "record", "title", "defeat", "victory",
    "training", "practice", "squad", "lineup",
    "transfer", "contract", "signed", "bid",
  ],
  technology: [
    "technology", "digital", "software", "hardware",
    "app", "application", "platform", "device", "gadget",
    "smartphone", "laptop", "tablet", "wearable",
    "ai", "artificial intelligence", "chatbot",
    "data", "database", "analytics",
    "startup", "tech company",
    "innovation", "disrupt", "breakthrough",
    "server", "network", "infrastructure",
    "user", "customer", "experience",
    "launch", "update", "release", "beta",
  ],
  business: [
    "economy", "economic", "market", "finance", "financial",
    "bank", "banking", "investor", "investment",
    "stock", "share", "bond", "commodity",
    "trade", "trading", "export", "import",
    "company", "corporation", "enterprise", "firm",
    "revenue", "profit", "loss", "earnings",
    "growth", "decline", "forecast", "outlook",
    "industry", "sector", "market share",
    "consumer", "customer", "retail", "wholesale",
    "price", "cost", "value", "asset", "debt",
    "startup", "entrepreneur", "business",
    "fiscal", "budget", "deficit", "surplus",
  ],
  politics: [
    "political", "politics", "government", "governing",
    "policy", "policymaker", "legislative",
    "vote", "voter", "voting", "ballot",
    "law", "legal", "constitution", "amendment",
    "senate", "congressional", "parliamentary",
    "minister", "secretary", "official", "administration",
    "party", "coalition", "opposition", "faction",
    "candidate", "nominee", "incumbent", "challenger",
    "debate", "forum", "town hall", "rally",
    "poll", "approval rating", "survey",
    "democracy", "republic", "regime", "authoritarian",
    "speech", "address", "statement", "press conference",
  ],
  science: [
    "science", "scientific", "research", "researcher",
    "study", "experiment", "laboratory", "lab",
    "discovery", "breakthrough", "finding",
    "space", "astronomy", "astrophysics", "cosmos",
    "planet", "star", "galaxy", "universe",
    "biology", "chemistry", "physics", "geology",
    "dna", "rna", "gene", "protein", "cell",
    "species", "organism", "ecosystem", "habitat",
    "mathematics", "engineering",
    "university", "institute", "academic",
    "theory", "hypothesis", "evidence", "analysis",
    "scientist", "professor", "doctor", "researcher",
  ],
  health: [
    "health", "medical", "medicine", "healthcare",
    "patient", "doctor", "physician", "nurse", "surgeon",
    "hospital", "clinic", "pharmacy", "prescription",
    "drug", "medication", "treatment", "therapy",
    "disease", "illness", "condition", "symptom",
    "diagnosis", "prognosis", "screening", "test",
    "pain", "injury", "wound", "infection",
    "mental", "psychological", "psychiatric",
    "nutrition", "diet", "exercise", "wellness",
    "insurance", "coverage", "premium", "claim",
    "research", "clinical", "trial", "study",
  ],
  climate: [
    "climate", "weather", "environment", "environmental",
    "temperature", "warming", "heat", "flood",
    "storm", "hurricane", "tornado", "typhoon",
    "rainfall", "precipitation", "drought",
    "emission", "carbon", "co2", "methane",
    "energy", "power", "electricity", "grid",
    "solar", "wind", "hydro", "geothermal",
    "green", "sustainable", "renewable", "clean",
    "recycle", "waste", "plastic", "ocean",
    "forest", "tree", "wildlife", "animal",
    "pollution", "smog", "contamination", "toxin",
    "activist", "protest", "movement", "advocacy",
  ],
  culture: [
    "culture", "cultural", "arts", "artistic",
    "music", "musical", "song", "album", "single",
    "film", "movie", "cinema", "screen",
    "television", "tv", "show", "series", "episode",
    "book", "novel", "author", "writer", "publisher",
    "fashion", "style", "design", "designer",
    "architecture", "building",
    "food", "restaurant", "chef", "cuisine",
    "travel", "tourism", "destination", "hotel",
    "game", "gaming", "video game", "console",
    "trend", "pop culture", "celebrity",
    "museum", "gallery", "exhibition", "collection",
  ],
  world: [
    "world", "global", "international", "foreign",
    "country", "nation", "region", "province",
    "overseas", "abroad", "transnational",
    "diplomatic", "diplomacy", "foreign policy",
    "military", "army", "navy", "air force",
    "weapon", "arms", "missile", "bomb", "drone",
    "attack", "strike", "assault", "offensive",
    "peace", "ceasefire", "truce", "accord",
    "protest", "demonstration", "uprising", "riot",
    "crisis", "emergency", "disaster", "catastrophe",
    "africa", "asia", "europe", "americas", "middle east",
    "aid", "assistance", "development", "relief",
  ],
  opinion: [
    "argue", "argument", "debate", "discussion",
    "believe", "think", "suggest",
    "perspective", "view", "viewpoint", "standpoint",
    "essay", "article", "column", "piece",
    "criticism", "critique", "analysis",
    "proposal", "proposition", "idea",
    "reflection", "thought", "consideration",
    "explore", "examine", "question",
    "insight", "take", "interpretation",
    "controversial", "provocative", "thought-provoking",
    "must", "should", "ought", "need to",
    "problem", "solution", "challenge", "opportunity",
  ],
}

// ─── Tier 3: WEAK keywords (low specificity, 1 point each) ────
const WEAK = {
  sports: ["sport", "game", "team", "win", "lose"],
  technology: ["phone", "app", "device", "startup", "online"],
  business: ["money", "pay", "price", "cost", "deal", "invest"],
  politics: ["power", "control", "leader", "state", "vote"],
  science: ["study", "research", "discovery", "experiment"],
  health: ["care", "risk", "drug", "treatment"],
  climate: ["earth", "planet", "future", "change"],
  culture: ["top", "list", "review", "watch", "story"],
  world: ["report", "official", "source"],
  opinion: ["opinion", "commentary"],
}

// ─── Entities mapped to categories ────────────────────────────
const ENTITIES = {
  // Sports figures
  "messi": "sports", "ronaldo": "sports", "neymar": "sports", "mbappe": "sports",
  "haaland": "sports", "salah": "sports", "kane": "sports", "de bruyne": "sports",
  "federer": "sports", "nadal": "sports", "djokovic": "sports", "serena williams": "sports",
  "lebron james": "sports", "stephen curry": "sports", "kevin durant": "sports",
  "giannis": "sports", "tom brady": "sports", "patrick mahomes": "sports",
  "usain bolt": "sports", "michael phelps": "sports", "tiger woods": "sports",
  "lewis hamilton": "sports", "max verstappen": "sports",
  "virat kohli": "sports", "dhoni": "sports", "babar azam": "sports",
  "canelo": "sports", "mcgregor": "sports",
  "zinedine zidane": "sports", "pep guardiola": "sports", "jurgen klopp": "sports",
  "cristiano": "sports",
  // Major sports teams (baseball, basketball, football, soccer, hockey)
  "yankees": "sports", "red sox": "sports", "dodgers": "sports", "cubs": "sports",
  "astros": "sports", "braves": "sports", "giants": "sports", "cardinals": "sports",
  "lakers": "sports", "celtics": "sports", "warriors": "sports", "bulls": "sports",
  "heat": "sports", "sixers": "sports", "bucks": "sports", "nuggets": "sports",
  "cowboys": "sports", "chiefs": "sports", "49ers": "sports", "packers": "sports",
  "patriots": "sports", "eagles": "sports", "ravens": "sports", "bills": "sports",
  "steelers": "sports", "seahawks": "sports", "vikings": "sports", "saints": "sports",
  "chelsea": "sports", "arsenal": "sports", "liverpool": "sports", "manchester united": "sports",
  "manchester city": "sports", "tottenham": "sports", "barcelona": "sports", "real madrid": "sports",
  "bayern munich": "sports", "juventus": "sports", "ac milan": "sports", "inter milan": "sports",
  "psg": "sports", "ajax": "sports", "dortmund": "sports", "atletico madrid": "sports",
  "maple leafs": "sports", "canadiens": "sports", "bruins": "sports", "rangers": "sports",
  // Political figures
  "donald trump": "politics", "joe biden": "politics", "vladimir putin": "politics",
  "xi jinping": "politics", "emmanuel macron": "politics", "olaf scholz": "politics",
  "rishi sunak": "politics", "narendra modi": "politics", "viktor orban": "politics",
  "kim jong un": "politics", "benjamin netanyahu": "politics",
  "volodymyr zelensky": "politics", "justin trudeau": "politics",
  "jair bolsonaro": "politics", "lula da silva": "politics",
  "bernie sanders": "politics", "elizabeth warren": "politics",
  "nancy pelosi": "politics", "mitch mcconnell": "politics",
  "chuck schumer": "politics", "kevin mccarthy": "politics",
  "vladimir zelensky": "politics", "recep tayyip": "politics",
  // Tech figures
  "elon musk": "technology", "jeff bezos": "technology", "mark zuckerberg": "technology",
  "sam altman": "technology", "tim cook": "technology", "bill gates": "technology",
  "satya nadella": "technology", "sundar pichai": "technology",
  "jack ma": "technology", "larry page": "technology", "sergey brin": "technology",
  "jensen huang": "technology", "linus torvalds": "technology",
  // Business figures
  "warren buffett": "business", "jamie dimon": "business", "ray dalio": "business",
  "jerome powell": "business", "christine lagarde": "business",
  "janet yellen": "business",
  // Science figures
  "neil degrasse tyson": "science", "stephen hawking": "science",
  "carl sagan": "science", "brian cox": "science",
  // Health figures
  "anthony fauci": "health", "tedros": "health",
  // Organizations
  "fifa": "sports", "uefa": "sports", "nba": "sports", "nfl": "sports",
  "mlb": "sports", "nhl": "sports", "epl": "sports", "ipl": "sports",
  "wwe": "sports", "ufc": "sports", "f1": "sports",
  "nasa": "science", "esa": "science", "cern": "science",
  "fda": "health", "cdc": "health", "who": "health",
  "fed": "business", "federal reserve": "business", "imf": "business", "world bank": "business",
  "united nations": "world", "nato": "world", "eu": "world", "european union": "world",
  "white house": "politics", "pentagon": "politics", "capitol hill": "politics",
  "supreme court": "politics",
  "nyse": "business", "nasdaq": "business", "london stock exchange": "business",
  "opec": "business", "wto": "business",
  "google": "technology", "apple": "technology", "microsoft": "technology",
  "amazon": "technology", "meta": "technology", "netflix": "technology",
  "tesla": "technology", "openai": "technology", "anthropic": "technology",
  "nvidia": "technology", "intel": "technology", "amd": "technology",
  "qualcomm": "technology", "broadcom": "technology", "tsmc": "technology",
  "spotify": "technology", "uber": "technology", "airbnb": "technology",
  "twitter": "technology", "x.ai": "technology",
  "tiktok": "technology", "instagram": "technology", "snapchat": "technology",
}

// ─── Negative demotion rules ──────────────────────────────────
// Each rule: { terms: [...], demoteCat, penalty }
// Terms are matched with word boundaries (\b) to avoid partial matches.
function buildDemotionRegex(terms) {
  const escaped = terms.map(t => {
    const e = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return '\\b' + e + '\\b'
  })
  return new RegExp(escaped.join('|'), 'i')
}

const DEMOTION_DEFS = [
  // Sports → demote technology, business, science
  { terms: ["football", "soccer", "cricket", "nfl", "nba", "mlb", "nhl", "uefa", "champions league", "premier league", "super bowl", "world cup", "grand slam", "playoff", "touchdown", "hat-trick", "striker", "goalkeeper", "pitcher", "inning", "home run", "slam dunk", "three-pointer"], demoteCat: "technology", penalty: 25 },
  { terms: ["football", "soccer", "cricket", "nfl", "nba", "mlb", "nhl", "uefa", "champions league", "premier league", "super bowl", "world cup", "grand slam", "playoff", "touchdown", "hat-trick", "striker", "goalkeeper", "pitcher", "inning", "home run", "slam dunk", "three-pointer"], demoteCat: "business", penalty: 20 },
  { terms: ["football", "soccer", "cricket", "nfl", "nba", "mlb", "nhl", "uefa", "champions league", "premier league", "super bowl", "world cup", "grand slam", "playoff", "touchdown", "hat-trick", "striker", "goalkeeper", "pitcher", "inning", "home run", "slam dunk", "three-pointer"], demoteCat: "science", penalty: 15 },

  // Technology → demote sports, politics
  { terms: ["ai", "algorithm", "chatbot", "software", "code", "programming", "developer", "api", "database", "encryption", "cybersecurity", "data breach", "server", "cloud", "app", "ios", "android", "startup", "silicon valley", "tech company", "big tech", "openai", "gpt", "llm", "neural network", "machine learning", "deep learning", "quantum computing", "blockchain", "cryptocurrency", "nft", "web3", "metaverse", "augmented reality", "virtual reality", "computer vision", "nlp", "generative ai"], demoteCat: "sports", penalty: 25 },
  { terms: ["ai", "algorithm", "chatbot", "software", "code", "programming", "developer", "api", "database", "encryption", "cybersecurity", "data breach", "server", "cloud", "app", "ios", "android", "startup", "silicon valley", "tech company", "big tech", "openai", "gpt", "llm", "neural network", "machine learning", "deep learning", "quantum computing", "blockchain", "cryptocurrency", "nft", "web3", "metaverse", "augmented reality", "virtual reality", "computer vision", "nlp", "generative ai"], demoteCat: "politics", penalty: 20 },

  // Politics → demote technology
  { terms: ["trump", "biden", "putin", "election", "campaign", "president", "senator", "congress", "parliament", "supreme court", "white house", "capitol hill", "democrat", "republican", "legislation", "bill", "executive order", "veto", "impeachment", "indictment", "hearing", "diplomacy", "sanctions", "embassy", "ambassador", "treaty", "summit", "governor", "mayor", "attorney general", "secretary of state", "electoral college", "swing state", "battleground", "party", "coalition", "opposition"], demoteCat: "technology", penalty: 25 },

  // Business → demote sports (for draft/trade/cup in financial context)
  { terms: ["stock market", "wall street", "dow jones", "nasdaq", "s&p 500", "interest rate", "federal reserve", "inflation", "recession", "gdp", "ipo", "merger", "acquisition", "earnings", "bond yield", "treasury", "bull market", "bear market", "tariff", "trade war", "ceo", "chief executive", "shareholder", "dividend", "buyback", "market cap", "hedge fund", "private equity", "venture capital", "antitrust"], demoteCat: "sports", penalty: 15 },

  // Video games → demote sports
  { terms: ["video game", "gaming", "esports", "twitch", "playstation", "xbox", "nintendo", "pc gaming", "nintendo switch", "steam", "epic games"], demoteCat: "sports", penalty: 20 },

  // General ambiguous patterns
  { terms: ["app store", "google play", "amazon marketplace", "e-commerce"], demoteCat: "business", penalty: 10 },
  { terms: ["music player", "video player", "media player", "blu-ray player", "dvd player"], demoteCat: "sports", penalty: 10 },
  { terms: ["corporate politics", "office politics", "company politics"], demoteCat: "politics", penalty: 15 },
  { terms: ["political science", "social science"], demoteCat: "science", penalty: 15 },
  { terms: ["fashion tech", "design tech"], demoteCat: "technology", penalty: 10 },
  { terms: ["sport utility", "suv", "sport model", "sport package"], demoteCat: "sports", penalty: 15 },
  { terms: ["sports card", "trading card", "baseball card", "basketball card"], demoteCat: "business", penalty: 10 },
  { terms: ["nightclub", "club scene", "comedy club", "dance club"], demoteCat: "sports", penalty: 10 },

  // Demote "world" for general travel content
  { terms: ["travel guide", "vacation", "holiday", "tourist", "tourism"], demoteCat: "world", penalty: 10 },

  // Health/medical terms → demote sports (prevents "blow" or "head" from triggering sports)
  { terms: ["microbiome", "bacteria", "virus", "infection", "disease", "patient", "clinical",
    "surgery", "diagnosis", "treatment", "therapy", "vaccine", "immune", "cancer", "tumor",
    "gene", "protein", "cell", "dna", "rna", "genome", "mutation", "pathogen",
    "hospital", "doctor", "medical", "health", "symptom", "chronic", "acute"], demoteCat: "sports", penalty: 20 },
]

// Build compiled regexes once at module load
const DEMOTIONS = DEMOTION_DEFS.map(d => [buildDemotionRegex(d.terms), d.demoteCat, d.penalty])

// ─── Main classifier ──────────────────────────────────────────
function detectCategory(title, excerpt, body, { sourceCategory, sourceLabel, sourceUrl } = {}) {
  const titleLower = (title || "").toLowerCase()
  const excerptLower = (excerpt || "").toLowerCase()
  const bodyLower = (body || "").slice(0, 1500).toLowerCase()
  const allText = titleLower + " " + excerptLower + " " + bodyLower

  const scores = {}
  const strongCounts = {}  // track STRONG keyword hits per category for tie-breaking
  const debug = { entities: [], sourceMatch: null, demotions: [], topBeforeSource: [], topAfterSource: [] }
  for (const cat of CATEGORIES) { scores[cat] = 0; strongCounts[cat] = 0 }

  // Helper: score a text segment with a given weight multiplier
  function scoreText(text, weight) {
    for (const [category, patterns] of Object.entries(STRONG)) {
      for (const pattern of patterns) {
        const regex = new RegExp("\\b" + pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "gi")
        const matches = (text.match(regex) || []).length
        if (matches > 0) strongCounts[category] += matches
        scores[category] += matches * 5 * weight
      }
    }
    for (const [category, patterns] of Object.entries(MEDIUM)) {
      for (const pattern of patterns) {
        const regex = new RegExp("\\b" + pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "gi")
        const matches = (text.match(regex) || []).length
        scores[category] += matches * 3 * weight
      }
    }
    for (const [category, patterns] of Object.entries(WEAK)) {
      for (const pattern of patterns) {
        const regex = new RegExp("\\b" + pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "gi")
        const matches = (text.match(regex) || []).length
        scores[category] += matches * 1 * weight
      }
    }
  }

  // Layers 1-3: Title (3x), Excerpt (2x), Body (1x)
  scoreText(titleLower, 3)
  scoreText(excerptLower, 2)
  scoreText(bodyLower, 1)

  // Layer 4: Entity detection
  for (const [entity, category] of Object.entries(ENTITIES)) {
    const regex = new RegExp("\\b" + entity.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "gi")
    const matches = (allText.match(regex) || []).length
    if (matches > 0) {
      debug.entities.push({ entity, category, matches })
      const isInTitle = titleLower.includes(entity)
      const entityScore = isInTitle ? 8 : 5
      scores[category] += matches * entityScore
    }
  }

  // Layer 5: Negative demotions
  for (const [pattern, demoteCat, penalty] of DEMOTIONS) {
    if (pattern.test(allText)) {
      debug.demotions.push({ pattern: pattern.source.slice(0, 40), demoteCat, penalty })
      scores[demoteCat] = Math.max(-50, scores[demoteCat] - penalty)
    }
  }

  // Tie-breaking sort: score DESC, then strongCount DESC, then category name
  // This prevents alphabetically-first categories like "sports" from winning ties
  function sortEntries(arr) {
    return arr.sort((a, b) => {
      const scoreDiff = b[1] - a[1]
      if (scoreDiff !== 0) return scoreDiff
      const strongDiff = (strongCounts[b[0]] || 0) - (strongCounts[a[0]] || 0)
      if (strongDiff !== 0) return strongDiff
      return a[0].localeCompare(b[0])
    })
  }

  // Capture top categories before source bonus
  const sortedBefore = sortEntries(Object.entries(scores).filter(([, s]) => s > 0))
  debug.topBeforeSource = sortedBefore.slice(0, 5).map(([c, s]) => ({ category: c, score: Math.round(s) }))

  // Layer 6: Source awareness
  const sourcePriorityBonus = 10
  if (sourceLabel || sourceUrl) {
    const sourceText = (sourceLabel || "") + " " + (sourceUrl || "")
    for (const [pattern, cat] of SOURCE_MAP) {
      if (pattern.test(sourceText)) {
        debug.sourceMatch = { matched: cat, pattern: pattern.source.slice(0, 40) }
        scores[cat] += sourcePriorityBonus
        break
      }
    }
  }

  // Also apply original sourceCategory if provided and different
  if (sourceCategory && CATEGORIES.includes(sourceCategory)) {
    const existingScore = scores[sourceCategory]
    if (existingScore >= 0) {
      scores[sourceCategory] += 5
    }
  }

  // Capture top categories after source bonus
  const sortedAfter = sortEntries(Object.entries(scores).filter(([, s]) => s > 0))
  debug.topAfterSource = sortedAfter.slice(0, 5).map(([c, s]) => ({ category: c, score: Math.round(s) }))

  // ─── Decision logic ────────────────────────────────────────
  if (sortedAfter.length === 0) {
    return {
      category: sourceCategory || "world",
      confidence: 0,
      scores: Object.fromEntries(Object.entries(scores).map(([k, v]) => [k, Math.round(v)])),
      topCategories: [{ category: sourceCategory || "world", score: 0 }],
      method: "fallback",
      debug,
    }
  }

  const top = sortedAfter[0]
  const second = sortedAfter[1]

  const gap = top[1] - (second ? second[1] : 0)
  // Base confidence: each point of gap = 3% confidence, capped at 100
  let confidence = Math.min(gap * 3, 100)

  // Penalize when there's no competition and top score is low
  // e.g. a lone "lab" (6pts) shouldn't be confident
  if (!second) {
    const absoluteScoreRatio = Math.min(Math.max(top[1], 0) / 15, 1)
    confidence = Math.round(confidence * absoluteScoreRatio)
  }

  let finalCategory = top[0]
  let method = "keyword"

  // Opinion minimum confidence threshold
  if (finalCategory === "opinion" && confidence < 50) {
    finalCategory = second ? second[0] : sourceCategory || "world"
    method = "opinion-too-low"
  }

  // General News fallback: confidence < 30 and no strong source signal
  // NOTE: "World" is the catch-all so rendering never sees an invalid category
  if (confidence < 30 && !debug.sourceMatch) {
    finalCategory = sourceCategory || "world"
    method = "general-fallback"
  }

  // If source matched and is different from content pick, but content is very confident
  if (debug.sourceMatch && debug.sourceMatch.matched !== finalCategory && confidence >= 60) {
    method = "keyword"
  }

  // Final clamp
  confidence = Math.min(100, Math.max(0, confidence))

  // SAFETY: ensure final category is always one of the valid list
  if (!finalCategory || !CATEGORIES.includes(finalCategory)) {
    finalCategory = sourceCategory || "world"
    method = "invalid-category-fallback"
  }

  return {
    category: finalCategory,
    confidence,
    scores: Object.fromEntries(Object.entries(scores).map(([k, v]) => [k, Math.round(v)])),
    topCategories: debug.topAfterSource,
    method,
    debug,
  }
}

function summarizeCategory(title, excerpt, body) {
  const allText = (title + " " + excerpt + " " + (body || "").slice(0, 500)).toLowerCase()
  const found = []
  for (const [entity, cat] of Object.entries(ENTITIES)) {
    if (allText.includes(entity)) found.push(entity)
  }
  return found
}

module.exports = { detectCategory, summarizeCategory, ENTITIES, STRONG, MEDIUM, SOURCE_MAP, DEMOTIONS }
