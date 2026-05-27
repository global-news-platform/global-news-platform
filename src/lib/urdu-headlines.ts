import { PERSON_URDU, LOCATION_URDU, removeEnglishFromUrdu } from "./urdu-ai"

const MANUAL_HEADLINE_OVERRIDES: Record<string, string> = {
  "Sun, superstars and other takeaways from Radio 1's Big Weekend":
    "ریڈیو 1 کے بگ ویک اینڈ سے سورج، سپر اسٹارز اور دیگر یادگار لمحات",
  "Olivia Dean brings the curtain down on Radio 1's Big Weekend with 'magic' set":
    "اولیویا ڈین نے ریڈیو 1 کے بگ ویک اینڈ میں شاندار پرفارمنس سے سب کو مسحور کر دیا",
  "It wasn't all about the music at Radio 1's Big Weekend":
    "ریڈیو 1 کے بگ ویک اینڈ میں صرف موسیقی ہی نہیں، اور بھی کچھ تھا",
  "Olivia Dean, Zara Larsson and Fatboy Slim topped the bill - but it wasn't all about the music.":
    "اولیویا ڈین، زارا لارسن اور فیٹ بوائے سلم نے مرکزی اسٹیج سنبھالا لیکن یہ صرف موسیقی ہی نہیں تھی۔",
  "Author of Rivals told writers to stop making her 'macho men' cry":
    "مصنفہ نے مصنفین سے کہا کہ ان کے 'مردانہ' کرداروں کو رلانا بند کریں",
  "BTS win big as Black Eyed Peas reunite at American Music Awards":
    "بلیک آئیڈ پیز کی واپسی اور بی ٹی ایس کی شاندار کامیابی",
  "Drake's surprise three-album drop makes UK chart history":
    "ڈریک کے اچانک تین البمز نے برطانیہ کے چارٹس میں تاریخ رقم کر دی",
  "Girls Aloud star Nicola Roberts announces birth of baby girl":
    "گرلز الاؤڈ کی اسٹار نکولا رابرٹس نے بیٹی کی پیدائش کا اعلان کر دیا",
  "Unseen Rik Mayall material to be shown at festival":
    "رک مائیل کا غیر دیکھا ہوا مواد فیسٹیول میں پیش کیا جائے گا",
  "Love factually: Dating start-ups promise to cut the cheats":
    "محبت حقیقت میں: ڈیٹنگ اسٹارٹ اپس نے دھوکہ بازوں کو روکنے کا وعدہ کر لیا",
  "New James Bond game shows more vulnerable side to iconic British spy":
    "نئے جیمز بانڈ گیم میں برطانوی جاسوس کا کمزور پہلو دکھایا گیا ہے",
  "How Panorama exposed rape allegations on Married at First Sight UK":
    "پینوراما نے میرج ایٹ فرسٹ سائٹ یوکے میں ریپ کے الزامات سے پردہ اٹھا دیا",
  "Jordan leads star names at Guardiola leaving party":
    "جورڈن نے گارڈیولا کی الوداعی پارٹی میں اسٹارز کی قیادت کی",

  "Four killed as school minibus collides with train in Belgium":
    "بیلجیم میں اسکول منی بس اور ٹرین کے تصادم میں چار افراد ہلاک",
  "Train Hits School Minibus in Belgium, Leaving at Least 4 Dead":
    "بیلجیم میں ٹرین اور اسکول منی بس تصادم، چار اموات",
  "After Defeat, Massie Opens Door to a 2028 Run. Which Office Is Unclear.":
    "شکست کے بعد میسی نے دوبارہ انتخابات میں حصہ لینے کا امکان ظاہر کر دیا",
  "Maryland Democrats Want to Redistrict in 2028, but Are Divided Over How":
    "میری لینڈ ڈیموکریٹس نئے حلقہ بندیوں کے خواہاں لیکن طریقہ کار پر متفق نہیں",
  "In the Georgia Governor's Race, an Election Denier is the G.O.P. Front-Runner":
    "جارجیا گورنر ریس میں انتخابات سے انکار کرنے والا امیدوار سب سے آگے",
  "How Saudi Arabia's spending spree reached the end of the line":
    "سعودی عرب کے اخراجات میں کمی: نئے معاشی منصوبوں کا آغاز",
  "Evolving Warfare Connects the Conflicts in Ukraine and Iran":
    "یوکرین اور ایران میں جنگی حکمت عملی کے نئے ربط",
  "Iran War Live Updates: Negotiations to End the War Resume in Qatar":
    "ایران جنگ: قطر میں امن مذاکرات کا نیا دور",
  "Iran War Live Updates: Tensions Rise as Iran Threatens to Retaliate Against U.S. Strikes":
    "ایران کشیدگی: ایرانی دھمکیوں کے بعد امریکی حملوں کا خطرہ",
  "Iran War Live Updates: Top Iranian Negotiators Arrive in Qatar for Talks on Peace Deal":
    "ایران امن مذاکرات: ایرانی نمائندوں کی قطر آمد",
  "Regional Mediators Rush to Save U.S.-Iran Cease-Fire":
    "علاقائی ثالث ایران اور امریکہ کے درمیان جنگ بندی بچانے میں مصروف",
  "U.S.-Iran Peace Deal Nearer but Could Take Days to Nail Down, U.S. Official Says":
    "امریکی ایران امن معاہدہ قریب، حتمی شکل دینے میں مزید وقت درکار",
}

const MANUAL_EXCERPT_OVERRIDES: Record<string, string> = {
  "Olivia Dean, Zara Larsson and Fatboy Slim topped the bill - but it wasn't all about the music.":
    "اولیویا ڈین، زارا لارسن اور فیٹ بوائے سلم نے مرکزی اسٹیج سنبھالا۔ لیکن یہ صرف موسیقی ہی نہیں تھی بلکہ اس میں اور بھی بہت کچھ تھا۔",
  "Author of Rivals told writers to stop making her 'macho men' cry":
    "ایک مشہور مصنفہ نے دوسرے مصنفین سے درخواست کی ہے کہ وہ ان کے مضبوط مردانہ کرداروں کو کمزور اور رونے والے نہ دکھائیں۔",
  "BTS win big as Black Eyed Peas reunite at American Music Awards":
    "ای ایم اے ایوارڈز میں بلیک آئیڈ پیز کی شاندار واپسی اور بی ٹی ایس نے کئی کیٹیگریز میں بڑی کامیابی حاصل کی۔",
  "Drake's surprise three-album drop makes UK chart history":
    "ریپر ڈریک نے ایک ساتھ تین البمز ریلیز کر کے برطانیہ کے میوزک چارٹس میں نیا ریکارڈ قائم کر دیا۔",
  "Sun, superstars and other takeaways from Radio 1's Big Weekend":
    "ریڈیو 1 کے بگ ویک اینڈ میں سورج، سپر اسٹارز اور موسیقی کے علاوہ بھی بہت کچھ تھا۔",
  "Olivia Dean brings the curtain down on Radio 1's Big Weekend with 'magic' set":
    "اولیویا ڈین نے ریڈیو 1 کے بگ ویک اینڈ کے آخری دن اپنی جادوئی آواز سے سب کو مسحور کر دیا۔",

  "Four killed as school minibus collides with train in Belgium":
    "بیلجیم میں اسکول کی منی بس اور ٹرین کے درمیان خوفناک تصادم میں دو طلبہ اور دو اساتذہ سمیت چار افراد جاں بحق ہو گئے ہیں۔",
  "After Defeat, Massie Opens Door to a 2028 Run. Which Office Is Unclear.":
    "حالیہ شکست کے بعد نمایاں سیاست دان نے آئندہ انتخابات میں حصہ لینے کے امکانات ظاہر کر دیے ہیں، تاہم ان کے عہدے کے بارے میں وضاحت نہیں کی گئی۔",
  "In the Georgia Governor's Race, an Election Denier is the G.O.P. Front-Runner":
    "جارجیا میں گورنر کے انتخابی مقابلے میں ایک متنازع امیدوار جو انتخابی نتائج کو چیلنج کرتا رہا ہے، ابتدائی سروے میں نمایاں برتری حاصل کر گیا ہے۔",
  "How Saudi Arabia's spending spree reached the end of the line":
    "سعودی عرب میں معاشی اصلاحات کے بعد اخراجات میں کمی واقع ہوئی ہے اور نئے مالیاتی منصوبوں کا آغاز کیا جا رہا ہے۔",
  "Iran War Live Updates: Negotiations to End the War Resume in Qatar":
    "قطر میں ایران جنگ کے خاتمے کے لیے امن مذاکرات کا نیا دور شروع ہو گیا ہے جس میں دونوں فریقین کے اعلیٰ سطح کے نمائندے شریک ہیں۔",
}

const WORD_TRANSLATION: Record<string, string> = {
  "Artificial Intelligence": "مصنوعی ذہانت",
  "Climate Change": "موسمیاتی تبدیلی",
  "Climate Crisis": "موسمیاتی بحران",
  "Human Rights": "انسانی حقوق",
  "Nuclear Weapon": "جوہری ہتھیار",
  "Stock Market": "اسٹاک مارکیٹ",
  "United Nations": "اقوام متحدہ",
  "Supreme Court": "سپریم کورٹ",
  "High Court": "ہائی کورٹ",
  "White House": "وائٹ ہاؤس",
  "Prime Minister": "وزیراعظم",
  "Chief Minister": "وزیر اعلیٰ",
  "Foreign Minister": "وزیر خارجہ",
  "Defense Minister": "وزیر دفاع",
  "Finance Minister": "وزیر خزانہ",
  "Chief Justice": "چیف جسٹس",
  "Election Commission": "الیکشن کمیشن",
  "National Assembly": "قومی اسمبلی",
  "Provincial Assembly": "صوبائی اسمبلی",
  "Local Government": "مقامی حکومت",
  "Military Operation": "فوجی آپریشن",
  "Peace Process": "امن عمل",
  "Diplomatic Relations": "سفارتی تعلقات",
  "Trade War": "تجارتی جنگ",
  "Interest Rate": "سود کی شرح",
  "Central Bank": "مرکزی بینک",
  "Foreign Policy": "خارجہ پالیسی",
  "Public Health": "عوامی صحت",
  "Mental Health": "ذہنی صحت",
  "Natural Disaster": "قدرتی آفت",
  "Social Media": "سوشل میڈیا",
  "Tech Company": "ٹیک کمپنی",
  "Cyber Attack": "سائبر حملہ",
  "Data Privacy": "ڈیٹا پرائیویسی",
  "Space Program": "خلائی پروگرام",
  "World Cup": "ورلڈ کپ",
  "Gold Medal": "گولڈ میڈل",
  "Press Conference": "پریس کانفرنس",
  "Intelligence": "ذہانت",
  "Pakistan": "پاکستان",
  "India": "بھارت",
  "China": "چین",
  "US": "امریکہ",
  "USA": "امریکہ",
  "UK": "برطانیہ",
  "World": "دنیا",
  "Global": "عالمی",
  "International": "بین الاقوامی",
  "National": "قومی",
  "Local": "مقامی",
  "Regional": "علاقائی",
  "Election": "انتخابات",
  "Vote": "ووٹ",
  "Campaign": "مہم",
  "Candidate": "امیدوار",
  "War": "جنگ",
  "Peace": "امن",
  "Crisis": "بحران",
  "Attack": "حملہ",
  "Strike": "ہڑتال",
  "Protest": "احتجاج",
  "Rebel": "باغی",
  "Rebellion": "بغاوت",
  "Revolution": "انقلاب",
  "Sanctions": "پابندیاں",
  "Ceasefire": "جنگ بندی",
  "Truce": "جنگ بندی",
  "Treaty": "معاہدہ",
  "Alliance": "اتحاد",
  "Summit": "سربراہی اجلاس",
  "Meeting": "اجلاس",
  "Talks": "مذاکرات",
  "Negotiation": "مذاکرات",
  "Agreement": "معاہدہ",
  "Accord": "معاہدہ",
  "Resolution": "قرارداد",
  "Budget": "بجٹ",
  "Economy": "معیشت",
  "Economic": "معاشی",
  "Market": "مارکیٹ",
  "Trade": "تجارت",
  "Business": "کاروبار",
  "Finance": "فنانس",
  "Financial": "مالی",
  "Investment": "سرمایہ کاری",
  "Investor": "سرمایہ کار",
  "Stock": "اسٹاک",
  "Share": "حصص",
  "Bank": "بینک",
  "Banking": "بینکاری",
  "Loan": "قرض",
  "Debt": "قرض",
  "Deficit": "خسارہ",
  "Inflation": "مہنگائی",
  "Tax": "ٹیکس",
  "Tariff": "ٹیرف",
  "Revenue": "آمدنی",
  "Profit": "منافع",
  "Loss": "نقصان",
  "Oil": "تیل",
  "Gas": "گیس",
  "Energy": "توانائی",
  "Power": "بجلی",
  "Electricity": "بجلی",
  "Nuclear": "جوہری",
  "Solar": "شمسی",
  "Health": "صحت",
  "Medical": "طبی",
  "Medicine": "طب",
  "Drug": "منشیات",
  "Vaccine": "ویکسین",
  "Virus": "وائرس",
  "Disease": "بیماری",
  "Epidemic": "وبا",
  "Pandemic": "وبا",
  "Hospital": "ہسپتال",
  "Doctor": "ڈاکٹر",
  "Patient": "مریض",
  "Surgery": "سرجری",
  "Treatment": "علاج",
  "Cancer": "کینسر",
  "Death": "ہلاکت",
  "Dead": "ہلاک",
  "Killed": "ہلاک",
  "Died": "وفات",
  "Injured": "زخمی",
  "Wounded": "زخمی",
  "Rescue": "ریسکیو",
  "Emergency": "ایمرجنسی",
  "Disaster": "آفت",
  "Flood": "سیلاب",
  "Earthquake": "زلزلہ",
  "Storm": "طوفان",
  "Hurricane": "سمندری طوفان",
  "Tornado": "طوفان",
  "Wildfire": "جنگل کی آگ",
  "Drought": "خشک سالی",
  "Famine": "قحط",
  "Climate": "موسم",
  "Weather": "موسم",
  "Environment": "ماحول",
  "Pollution": "آلودگی",
  "Science": "سائنس",
  "Space": "خلاء",
  "Research": "تحقیق",
  "Study": "مطالعہ",
  "Discovery": "دریافت",
  "Experiment": "تجربہ",
  "Technology": "ٹیکنالوجی",
  "Tech": "ٹیکنالوجی",
  "Digital": "ڈیجیٹل",
  "Internet": "انٹرنیٹ",
  "Online": "آن لائن",
  "Cyber": "سائبر",
  "AI": "مصنوعی ذہانت",
  "Artificial": "مصنوعی",
  "Robot": "روبوٹ",
  "Software": "سافٹ ویئر",
  "Hardware": "ہارڈ ویئر",
  "Computer": "کمپیوٹر",
  "Smartphone": "اسمارٹ فون",
  "App": "ایپ",
  "Data": "ڈیٹا",
  "Network": "نیٹ ورک",
  "Security": "سیکیورٹی",
  "Privacy": "پرائیویسی",
  "Sports": "کھیل",
  "Game": "کھیل",
  "Match": "میچ",
  "Tournament": "ٹورنامنٹ",
  "Championship": "چیمپئن شپ",
  "League": "لیگ",
  "Cricket": "کرکٹ",
  "Football": "فٹ بال",
  "Soccer": "فٹ بال",
  "Tennis": "ٹینس",
  "Hockey": "ہاکی",
  "Olympics": "اولمپکس",
  "Athlete": "کھلاڑی",
  "Player": "کھلاڑی",
  "Team": "ٹیم",
  "Coach": "کوچ",
  "Captain": "کپتان",
  "Win": "جیت",
  "Victory": "فتح",
  "Defeat": "شکست",
  "Score": "اسکور",
  "Education": "تعلیم",
  "School": "اسکول",
  "College": "کالج",
  "University": "یونیورسٹی",
  "Student": "طلبہ",
  "Teacher": "استاد",
  "Professor": "پروفیسر",
  "Film": "فلم",
  "Movie": "فلم",
  "Cinema": "سینما",
  "Music": "موسیقی",
  "Singer": "گلوکار",
  "Actor": "اداکار",
  "Actress": "اداکارہ",
  "Director": "ہدایت کار",
  "Show": "شو",
  "Award": "ایوارڈ",
  "Festival": "تہوار",
  "Entertainment": "شوبز",
  "Celebrity": "مشہور شخصیت",
  "Fashion": "فیشن",
  "Art": "فن",
  "Artist": "فنکار",
  "Culture": "ثقافت",
  "Heritage": "ورثہ",
  "History": "تاریخ",
  "Government": "حکومت",
  "President": "صدر",
  "Minister": "وزیر",
  "Governor": "گورنر",
  "Mayor": "میئر",
  "Parliament": "پارلیمنٹ",
  "Senate": "سینٹ",
  "Assembly": "اسمبلی",
  "Court": "عدالت",
  "Justice": "انصاف",
  "Judge": "جج",
  "Law": "قانون",
  "Legal": "قانونی",
  "Lawyer": "وکیل",
  "Trial": "مقدمہ",
  "Case": "کیس",
  "Verdict": "فیصلہ",
  "Sentence": "سزا",
  "Prison": "جیل",
  "Jail": "جیل",
  "Police": "پولیس",
  "Crime": "جرائم",
  "Criminal": "مجرم",
  "Fraud": "دھوکہ دہی",
  "Corruption": "بدعنوانی",
  "Scandal": "سکینڈل",
  "Investigation": "تفتیش",
  "Arrest": "گرفتاری",
  "Arrested": "گرفتار",
  "Charge": "الزام",
  "Charged": "الزام عائد",
  "Guilty": "مجرم",
  "Innocent": "بے گناہ",
  "Border": "سرحد",
  "Refugee": "پناہ گزین",
  "Immigrant": "تارک وطن",
  "Migration": "نقل مکانی",
  "Army": "فوج",
  "Military": "فوجی",
  "Navy": "بحریہ",
  "Air Force": "فضائیہ",
  "Soldier": "سپاہی",
  "General": "جرنیل",
  "Chief": "سربراہ",
  "Officer": "افسر",
  "Defence": "دفاع",
  "Defense": "دفاع",
  "Weapon": "ہتھیار",
  "Missile": "میزائل",
  "Drone": "ڈرون",
  "Bomb": "بم",
  "Explosion": "دھماکہ",
  "Terrorist": "دہشت گرد",
  "Terrorism": "دہشت گردی",
  "Militant": "عسکریت پسند",
  "Report": "رپورٹ",
  "Analysis": "تجزیہ",
  "Survey": "سروے",
  "Update": "اپ ڈیٹ",
  "Statement": "بیان",
  "Announcement": "اعلان",
  "Declaration": "اعلان",
  "Decision": "فیصلہ",
  "Policy": "پالیسی",
  "Plan": "منصوبہ",
  "Project": "منصوبہ",
  "Program": "پروگرام",
  "Development": "ترقی",
  "Progress": "پیشرفت",
  "Reform": "اصلاحات",
  "Change": "تبدیلی",
  "Warning": "انتباہ",
  "Challenge": "چیلنج",
  "Opportunity": "موقع",
  "Future": "مستقبل",
  "New": "نئی",
  "Major": "اہم",
  "Top": "سرفہرست",
  "Breaking": "بریکنگ",
  "Latest": "تازہ ترین",
  "Exclusive": "خصوصی",
  "Special": "خصوصی",
  "Important": "اہم",
  "Key": "اہم",
  "Big": "بڑی",
  "Massive": "بڑے پیمانے پر",
  "Huge": "بہت بڑا",
  "Historic": "تاریخی",
  "Landmark": "اہم سنگ میل",
  "First": "پہلا",
  "Last": "آخری",
  "Final": "آخری",
  "Early": "ابتدائی",
  "Late": "تاخیر",
  "Former": "سابق",
  "Current": "موجودہ",
  "Recent": "حالیہ",
  "Annual": "سالانہ",
  "People": "عوام",
  "Public": "عوامی",
  "Community": "برادری",
  "Family": "خاندان",
  "Child": "بچہ",
  "Children": "بچے",
  "Woman": "خاتون",
  "Women": "خواتین",
  "Man": "مرد",
  "Men": "مرد",
  "Youth": "نوجوان",
  "Leader": "رہنما",
  "Official": "سرکاری",
  "Authority": "حکام",
  "Department": "محکمہ",
  "Agency": "ایجنسی",
  "Commission": "کمیشن",
  "Committee": "کمیٹی",
  "Council": "کونسل",
  "Group": "گروپ",
  "Party": "جماعت",
  "Union": "یونین",
  "Organization": "تنظیم",
  "Company": "کمپنی",
  "Firm": "فرم",
  "Industry": "صنعت",
  "Factory": "فیکٹری",
  "Agriculture": "زراعت",
  "Farm": "کھیت",
  "Food": "خوراک",
  "Water": "پانی",
  "Housing": "ہاؤسنگ",
  "Construction": "تعمیرات",
  "Road": "سڑک",
  "Bridge": "پل",
  "Railway": "ریلوے",
  "Airport": "ہوائی اڈہ",
  "Port": "بندرگاہ",
  "Transport": "نقل و حمل",
  "Vehicle": "گاڑی",
  "Car": "کار",
  "Bus": "بس",
  "Train": "ٹرین",
  "Plane": "طیارہ",
  "Ship": "جہاز",
  "Flight": "پرواز",
  "Tourism": "سیاحت",
  "Travel": "سفر",
  "Hotel": "ہوٹل",
  "Restaurant": "ریستوراں",
  "Media": "میڈیا",
  "News": "خبر",
  "Press": "پریس",
  "Newspaper": "اخبار",
  "Journalist": "صحافی",
  "Editor": "ایڈیٹر",
  "Interview": "انٹرویو",
  "Coverage": "کوریج",
  "Broadcast": "نشریات",
  "Television": "ٹیلی ویژن",
  "TV": "ٹی وی",
  "Radio": "ریڈیو",
  "Platform": "پلیٹ فارم",
  "Website": "ویب سائٹ",
  "Search": "تلاش",
  "Google": "گوگل",
  "Apple": "ایپل",
  "Amazon": "ایمیزون",
  "Microsoft": "مائیکروسافٹ",
  "Meta": "میٹا",
  "Twitter": "ٹوئٹر",
  "X": "ایکس",
  "YouTube": "یوٹیوب",
  "Facebook": "فیس بک",
  "Instagram": "انسٹاگرام",
  "WhatsApp": "واٹس ایپ",
  "ChatGPT": "چیٹ جی پی ٹی",
  "OpenAI": "اوپن اے آئی",
  "Billion": "ارب",
  "Million": "ملین",
  "Thousand": "ہزار",
  "Percent": "فیصد",
  "Rate": "شرح",
  "Average": "اوسط",
  "Total": "کل",
  "Record": "ریکارڈ",
  "Highest": "سب سے زیادہ",
  "Lowest": "سب سے کم",
  "Increase": "اضافہ",
  "Decrease": "کمی",
  "Rise": "اضافہ",
  "Fall": "کمی",
  "Drop": "کمی",
  "Growth": "ترقی",
  "Recovery": "بحالی",
  "Recession": "کساد بازاری",
  "Job": "نوکری",
  "Employment": "روزگار",
  "Unemployment": "بے روزگاری",
  "Worker": "مزدور",
  "Labor": "محنت",
  "Wage": "اجرت",
  "Salary": "تنخواہ",
  "Pension": "پنشن",
  "Benefit": "فائدہ",
  "Insurance": "انشورنس",
  "Fund": "فنڈ",
  "Donation": "عطیہ",
  "Aid": "امداد",
  "Relief": "ریلیف",
  "Support": "حمایت",
  "Opposition": "اپوزیشن",
  "Rival": "حریف",
  "Enemy": "دشمن",
  "Friend": "دوست",
  "Ally": "اتحادی",
  "Coalition": "اتحاد",
  "Demonstration": "مظاہرہ",
  "March": "مارچ",
  "Lockdown": "لاک ڈاؤن",
  "Curfew": "کرفیو",
  "Murder": "قتل",
  "Assassination": "قتل",
  "Execution": "پھانسی",
  "Kidnapping": "اغوا",
  "Robbery": "ڈکیتی",
  "Theft": "چوری",
  "Burglary": "چوری",
  "Smuggling": "سمگلنگ",
  "Trafficking": "سمگلنگ",
  "Alcohol": "شراب",
  "Piracy": "قزاقی",
  "Copyright": "کاپی رائٹ",
  "Patent": "پیٹنٹ",
  "Trademark": "ٹریڈ مارک",
  "Price": "قیمت",
  "Cost": "لاگت",
}

const PHRASE_PATTERNS: [RegExp, (matches: RegExpMatchArray) => string][] = [
  [/(\w+) says (\w+) is (\w+)/gi, (m) => `${m[1]} نے کہا کہ ${m[2]} ${m[3]} ہے`],
  [/(\w+) warns (\w+) about (\w+)/gi, (m) => `${m[1]} نے ${m[2]} کو ${m[3]} سے خبردار کیا`],
  [/(\w+) calls for (\w+)/gi, (m) => `${m[1]} نے ${m[2]} کا مطالبہ کیا`],
  [/(\w+) rejects (\w+)/gi, (m) => `${m[1]} نے ${m[2]} کو مسترد کیا`],
  [/(\w+) faces (\w+) over (\w+)/gi, (m) => `${m[1]} کو ${m[3]} پر ${m[2]} کا سامنا`],
  [/(\w+) to (\w+) in (\w+)/gi, (m) => `${m[3]} میں ${m[2]} کے لیے ${m[1]}`],
  [/^(?:How|Why|What|When|Where|Who)\s(.+?)\?$/i, (m) => `${m[1]}: ایک جائزہ`],
]

const USD_PATTERN = /\$(\d+(?:\.\d+)?)\s*(million|billion|trillion)?/gi
const PERCENT_PATTERN = /(\d+(?:\.\d+)?)\s*%/g

function formatNumberWithUrduSuffix(num: string, unit?: string): string {
  const suffix = unit ? ` ${WORD_TRANSLATION[unit] || unit}` : ""
  return `${num}${suffix}`
}

function stripCodeArtifacts(text: string): string {
  let result = text
  result = result.replace(/\+\s*\+/g, "")
  result = result.replace(/```[\s\S]*?```/g, "")
  result = result.replace(/`[^`]+`/g, "")
  result = result.replace(/\|[\u0600-\u06FF].*?\|/g, "")
  result = result.replace(/['']{2,}/g, "'")
  result = result.replace(/[""]{2,}/g, '"')
  result = result.replace(/\s{2,}/g, " ")
  result = result.replace(/^[,.\s]+|[,.\s]+$/g, "")
  result = result.replace(/<[^>]+>/g, "")
  result = result.replace(/&[a-z]+;/gi, " ")
  result = result.trim()
  return result
}

function preprocessText(text: string): string {
  let result = text

  result = stripCodeArtifacts(result)

  result = result.replace(USD_PATTERN, (_match, num, unit) => {
    return `ڈالر ${formatNumberWithUrduSuffix(num, unit)}`
  })

  result = result.replace(PERCENT_PATTERN, (_match, num) => {
    return `${num} فیصد`
  })

  result = result.replace(/'s\b/g, " کے ")
  result = result.replace(/\bcan't\b/gi, "نہیں کر سکتے")
  result = result.replace(/\bwon't\b/gi, "نہیں کریں گے")
  result = result.replace(/\bdon't\b/gi, "نہیں کرتے")
  result = result.replace(/\bdoesn't\b/gi, "نہیں کرتا")
  result = result.replace(/\bisn't\b/gi, "نہیں ہے")
  result = result.replace(/\baren't\b/gi, "نہیں ہیں")
  result = result.replace(/\bwasn't\b/gi, "نہیں تھا")
  result = result.replace(/\bweren't\b/gi, "نہیں تھے")

  result = result.replace(/--/g, " — ")
  result = result.replace(/[""''“”]/g, '"')

  return result
}

function tryPhraseTranslation(text: string): string | null {
  for (const [pattern, replacement] of PHRASE_PATTERNS) {
    const match = text.match(pattern)
    if (match) {
      try {
        return replacement(match)
      } catch {
        continue
      }
    }
  }
  return null
}

function translateText(text: string): string {
  let result = text

  const phraseResult = tryPhraseTranslation(result)
  if (phraseResult) {
    result = phraseResult
  }

  for (const [eng, ur] of Object.entries(PERSON_URDU)) {
    const regex = new RegExp(`\\b${escapeRegExp(eng)}\\b`, "gi")
    result = result.replace(regex, ur)
  }

  for (const [eng, ur] of Object.entries(LOCATION_URDU)) {
    const regex = new RegExp(`\\b${escapeRegExp(eng)}\\b`, "gi")
    result = result.replace(regex, ur)
  }

  const sortedWords = Object.entries(WORD_TRANSLATION).sort((a, b) => b[0].length - a[0].length)
  for (const [eng, ur] of sortedWords) {
    if (ur.length > 2) {
      const regex = new RegExp(`\\b${escapeRegExp(eng)}\\b`, "gi")
      result = result.replace(regex, ur)
    }
  }

  return result
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

export function hasSufficientUrdu(text: string): boolean {
  if (!text || text.length < 3) return false
  const urduChars = text.match(/[\u0600-\u06FF]/g) || []
  const nonSpaceChars = text.replace(/\s/g, "").length
  if (nonSpaceChars === 0) return false
  return urduChars.length / nonSpaceChars > 0.25
}

function cleanEnglishResidue(text: string): string {
  let result = text

  result = result.replace(/\b[A-Za-z]{1,3}\b/g, "")

  result = result.replace(/\s{2,}/g, " ").trim()

  result = result.replace(/^[\s,;:.]+/, "").replace(/[\s,;:.]+$/, "")

  return result
}

function hasTranslationQuality(text: string): boolean {
  if (!text || text.length < 10) return false
  if (!hasSufficientUrdu(text)) return false

  const brokenPatterns = [
    /\bکے\s+بڑی\b/i,
    /\bنے\s+کو\b/i,
    /\bنہیں\s+تھا\b/i,
    /\bمیں\s+میں\b/i,
    /\bکا\s+کا\b/i,
    /\bکی\s+کی\b/i,
    /\.۔/,
    /–\s*$/,
    /^[-–,;:.]+/,
    /[A-Za-z]{4,}[ء-ی]+[A-Za-z]{2,}/,
    /^\s*[-–]\s+\S{1,3}\s+/,
    /\+\s*\+/,
    /۔\s*[A-Za-z]/,
    /[A-Za-z]\s*۔/,
    /,\s*,/,
    /[A-Za-z]{15,}/,
    /^\d+\s/,
  ]

  const repeatedWordPattern = /\b(\w{3,})\s+\1\s+\1\b/i
  if (repeatedWordPattern.test(text)) return false

  for (const pattern of brokenPatterns) {
    if (pattern.test(text)) return false
  }

  const lines = text.split(/[.!?۔؟\n]+/).filter(Boolean)
  if (lines.length > 1) {
    const shortLines = lines.filter(l => l.trim().length < 4)
    if (shortLines.length > 0) return false
  }

  const commaCount = (text.match(/,/g) || []).length
  const urduWordCount = (text.match(/[\u0600-\u06FF]{2,}/g) || []).length
  if (commaCount > 0 && urduWordCount < 3) return false

  const urduWords = text.match(/[\u0600-\u06FF]{2,}/g) || []
  if (urduWords.length >= 3 && !text.match(/[\u0600-\u06FF]{2,}\s+(?:اور|کا|کی|کے|میں|سے|پر|پر|نے|کو|ہے|ہیں|تھا|تھی|تھے|ہوں|گا|گی|گے)\s+[\u0600-\u06FF]{2,}/i)) {
    const properNounPositions: number[] = []
    for (let i = 0; i < urduWords.length; i++) {
      if (i > 0 && !text.match(new RegExp(`${escapeRegExp(urduWords[i-1])}\\s+(?:اور|کا|کی|کے|میں|سے|پر|نے|کو|ہے|ہیں|تھا|تھی|تھے)\\s+${escapeRegExp(urduWords[i])}`))) {
      }
      if (i < urduWords.length - 1 && !text.match(new RegExp(`${escapeRegExp(urduWords[i])}\\s+(?:اور|کا|کی|کے|میں|سے|پر|نے|کو|ہے|ہیں|تھا|تھی|تھے)\\s+${escapeRegExp(urduWords[i+1])}`))) {
        if (/^[A-Z]/.test(text) || urduWords[i].length > 3) {
          properNounPositions.push(i)
        }
      }
    }
    const consecutiveProper = properNounPositions.filter((p, i, arr) => i === 0 || arr[i-1] === p - 1).length
    if (consecutiveProper >= 3 && urduWords.length <= 6) return false
  }

  const digitsBetweenUrdu = text.match(/[\u0600-\u06FF]\s+\d+\s+[\u0600-\u06FF]/)
  if (digitsBetweenUrdu) return false

  const urduParts = text.split(/[،,;:]/).map(s => s.trim()).filter(Boolean)
  if (urduParts.length >= 3) {
    const allHaveNoVerb = urduParts.every(part => {
      const hasVerb = /[\u0600-\u06FF]{2,}\s+(?:ہے|ہیں|تھا|تھی|تھے|ہوں|گا|گی|گے|ہوگا|ہوگی|ہوںگے|تھیں)\b/i.test(part)
      return !hasVerb
    })
    if (allHaveNoVerb && urduParts.length >= 3) {
      const totalChars = urduParts.reduce((s, p) => s + p.replace(/\s/g, "").length, 0)
      if (totalChars < 15) return false
    }
  }

  return true
}

function makeUrduHeadlineNatural(title: string): string {
  let result = title

  result = result.replace(/^کی\s+/i, "")
  result = result.replace(/^کا\s+/i, "")
  result = result.replace(/^کے\s+/i, "")

  result = result.replace(/\s+میں\s+$/i, "")

  if (!result.endsWith("۔") && !result.endsWith("?") && !result.endsWith("!")) {
    const lastChar = result.trim().slice(-1)
    if (/[\u0600-\u06FFa-zA-Z0-9]/.test(lastChar)) {
    }
  }

  return result.trim()
}

function isMostlyProperNouns(text: string): boolean {
  const words = text.split(/\s+/).filter(Boolean)
  if (words.length === 0) return false
  const properCount = words.filter((w) => /^[A-Z]/.test(w)).length
  return properCount / words.length > 0.6
}

function extractKeyPhrases(title: string): string[] {
  const words = title.split(/\s+/).filter(Boolean)
  const stopWords = new Set(["the", "a", "an", "is", "are", "was", "were", "to", "in", "for", "of", "and", "on", "at", "by", "with", "from", "as", "its", "it", "has", "have", "had", "be", "been", "being", "will", "would", "could", "should", "may", "might", "can", "shall", "do", "does", "did", "but", "or", "not", "no", "nor", "so", "if", "than", "that", "this", "these", "those"])
  return words.filter((w) => !stopWords.has(w.toLowerCase()) && w.length > 2)
}

function formatAsUrduHeadline(title: string, cleaned: string): string {
  if (cleaned.length > 15 && hasSufficientUrdu(cleaned)) {
    return makeUrduHeadlineNatural(cleaned)
  }

  const keyPhrases = extractKeyPhrases(title)
  if (isMostlyProperNouns(title) || keyPhrases.length <= 2) {
    const translatedPhrases = keyPhrases
      .map((p) => {
        const t = translateText(p)
        return removeEnglishFromUrdu(t)
      })
      .filter(Boolean)
    if (translatedPhrases.length > 0) {
      const joined = translatedPhrases.join(" • ")
      if (joined.includes("•")) {
        const checkText = joined.replace(/•/g, "").trim()
        if (checkText.length < 8 || !hasSufficientUrdu(checkText)) {
          return title
        }
      }
      return joined
    }
  }

  return title
}

export async function generateUrduHeadline(title: string): Promise<string> {
  if (!title || title.length < 5) return title

  if (MANUAL_HEADLINE_OVERRIDES[title]) {
    return MANUAL_HEADLINE_OVERRIDES[title]
  }

  const processed = preprocessText(title)

  const phraseTranslated = tryPhraseTranslation(processed)
  const baseForTranslation = phraseTranslated || processed

  const translated = translateText(baseForTranslation)
  const cleaned = removeEnglishFromUrdu(translated)

  if (cleaned.length > 8 && hasSufficientUrdu(cleaned) && hasTranslationQuality(cleaned)) {
    return makeUrduHeadlineNatural(cleaned)
  }

  const fallback = cleanEnglishResidue(translated)
  if (fallback.length > 8 && hasSufficientUrdu(fallback) && hasTranslationQuality(fallback)) {
    return makeUrduHeadlineNatural(fallback)
  }

  return formatAsUrduHeadline(title, cleaned)
}

export async function generateUrduExcerpt(title: string, excerpt: string, body?: string): Promise<string> {
  if (excerpt && MANUAL_EXCERPT_OVERRIDES[excerpt]) {
    return MANUAL_EXCERPT_OVERRIDES[excerpt]
  }

  const bodyText = (body || "").replace(/[#*`>\-\[\]]/g, " ").replace(/\s+/g, " ").trim()

  const sourceExcerpt = excerpt || bodyText.substring(0, 200) || title

  if (sourceExcerpt.length < 10) {
    const titleTranslated = translateText(title)
    const titleCleaned = removeEnglishFromUrdu(titleTranslated)
    if (titleCleaned.length > 15 && hasSufficientUrdu(titleCleaned)) {
      return `${titleCleaned.substring(0, 120)}۔`
    }
    return `${title.substring(0, 80)}۔`
  }

  if (/[\u0600-\u06FF]/.test(sourceExcerpt) && sourceExcerpt.length > 20) {
    const clean = sourceExcerpt.replace(/[.!?;:]+\s*$/, "").trim()
    const final = removeEnglishFromUrdu(clean)
    return final.length > 15 ? `${final}۔` : `${clean}۔`
  }

  const processed = preprocessText(sourceExcerpt)
  const translated = translateText(processed)
  const cleaned = removeEnglishFromUrdu(translated)

  if (cleaned.length > 15 && hasSufficientUrdu(cleaned)) {
    return `${cleaned.substring(0, 160)}۔`
  }

  if (bodyText.length > 40) {
    const bodyProcessed = preprocessText(bodyText)
    const bodyTranslated = translateText(bodyProcessed)
    const bodyCleaned = removeEnglishFromUrdu(bodyTranslated)
    if (bodyCleaned.length > 20 && hasSufficientUrdu(bodyCleaned)) {
      return `${bodyCleaned.substring(0, 160)}۔`
    }
  }

  const titleProcessed = preprocessText(title)
  const titleTranslated = translateText(titleProcessed)
  const titleCleaned = removeEnglishFromUrdu(titleTranslated)
  if (titleCleaned.length > 15 && hasSufficientUrdu(titleCleaned)) {
    return `${titleCleaned.substring(0, 120)}۔`
  }

  return `${removeEnglishFromUrdu(sourceExcerpt.replace(/[.!?;:]+\s*$/, "").trim()).substring(0, 150)}۔`
}

export function categorizeEnglishCategory(cat: string): string {
  const map: Record<string, string> = {
    "health": "صحت",
    "technology": "ٹیکنالوجی",
    "tech": "ٹیکنالوجی",
    "politics": "سیاست",
    "world": "دنیا",
    "business": "کاروبار",
    "sports": "کھیل",
    "science": "سائنس",
    "climate": "موسم",
    "weather": "موسم",
    "culture": "ثقافت",
    "entertainment": "شوبز",
    "education": "تعلیم",
    "crime": "کرائم",
    "justice": "عدالت",
    "religion": "مذہب",
    "international": "بین الاقوامی",
    "opinion": "رائے",
    "travel": "سفر",
    "food": "کھانا",
    "fashion": "فیشن",
    "art": "فن",
    "music": "موسیقی",
    "film": "فلم",
    "economy": "معیشت",
    "defence": "دفاع",
    "national": "قومی",
    "regional": "علاقائی",
    "local": "مقامی",
    "breaking": "بریکنگ",
    "general": "جنرل",
    "pakistan": "پاکستان",
    "dunya": "دنیا",
    "siasat": "سیاست",
    "karobar": "کاروبار",
    "khel": "کھیل",
    "sehat": "صحت",
    "shobiz": "شوبز",
    "mazhab": "مذہب",
    "taleem": "تعلیم",
    "mausam": "موسم",
    "adalat": "عدالت",
    "baynalaqwami": "بین الاقوامی",
    "raye": "رائے",
  }
  return map[cat.toLowerCase().replace(/[""]/g, "").trim()] || "جنرل"
}

const SPORTS_KEYWORDS = new Set([
  "Messi", "Ronaldo", "Neymar", "Mbappe", "Salah", "Haaland",
  "football", "soccer", "cricket", "tennis", "basketball", "baseball",
  "World Cup", "Champions League", "Premier League", "La Liga", "Serie A",
  "Olympic", "Olympics", "FIFA", "UEFA", "NBA", "NFL",
  "match", "tournament", "championship", "league", "stadium",
  "goal", "penalty", "free kick", "corner", "offside",
  "player", "coach", "manager", "captain", "transfer",
  "پیر", "فٹبال", "کرکٹ", "ٹینس", "باسکٹ بال",
  "ورلڈ کپ", "چیمپئنز لیگ", "پریمیئر لیگ",
  "میچ", "ٹورنامنٹ", "چیمپئن شپ", "لیگ",
  "گول", "پنالٹی", "فری کک", "کھلاڑی", "کوچ",
])

const POLITICS_KEYWORDS = new Set([
  "re-election", "reelection", "campaign", "election", "vote",
  "انتخاب", "الیکشن", "ووٹ", "مہم", "سیاسی",
  "president", "prime minister", "congress", "senate", "parliament",
  "صدر", "وزیراعظم", "کانگریس", "سینیٹ", "پارلیمنٹ",
])

export function detectCategoryMismatch(title: string, categorySlug: string): string | null {
  if (!title) return null

  const titleLower = title.toLowerCase()
  const isSportsContent = [...SPORTS_KEYWORDS].some(k => titleLower.includes(k.toLowerCase()))
  const isPoliticsCategory = categorySlug === "siasat" || categorySlug === "politics" || categorySlug === "raye"

  if (isSportsContent && isPoliticsCategory) {
    return "khel"
  }

  const isPoliticsContent = [...POLITICS_KEYWORDS].some(k => titleLower.includes(k.toLowerCase()))
  const isSportsCategory = categorySlug === "khel" || categorySlug === "sports"

  if (isPoliticsContent && isSportsCategory) {
    return "siasat"
  }

  return null
}
