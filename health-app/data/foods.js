// HAPP — Food Pairing Data
// 10 foods, all pairings from David's personalised food guide (March 2026)
// Conditions: GERD / LES dysfunction / NAFLD / Insulin resistance / Psoriasis / H. pylori history

const FOOD_DATA = [
  {
    id: 'eggs', name: 'Eggs', emoji: '🥚',
    context: 'One of your best foods. High protein, fat for supplement absorption, anti-inflammatory choline, zero GERD trigger. Eggs + olive oil is the gold-standard breakfast for your supplement stack.'
  },
  {
    id: 'chicken', name: 'Chicken', emoji: '🍗',
    context: 'Your primary protein — lean, versatile, no GERD trigger, no nightshade, no uric acid concern. Best protein source for your profile. Should be a daily staple.'
  },
  {
    id: 'beef', name: 'Beef / Pork', emoji: '🥩',
    context: 'Limit to 2–3× per week. High in L-carnitine (counteracts Mildronat at high portions), raises uric acid if excessive, higher saturated fat burden on NAFLD liver. Not bad — just needs frequency management.'
  },
  {
    id: 'oats', name: 'Oats', emoji: '🌾',
    context: 'One of your best carbohydrate sources. Beta-glucan fibre is directly therapeutic for insulin resistance and HDL. Neutral on GERD. Neutral on psoriasis. Low uric acid load. Should be a daily staple.'
  },
  {
    id: 'rice', name: 'Rice / Pasta', emoji: '🍚',
    context: 'Acceptable in small portions, always paired with protein and fat. The danger is solo consumption or large portions — rapid glucose spike worsens insulin resistance. Neither is a GERD trigger. Neutral on psoriasis.'
  },
  {
    id: 'potatoes', name: 'Potatoes', emoji: '🥔',
    context: 'Specific concern — nightshade family. Monitor psoriasis response. Otherwise nutritionally fine (complex carb, potassium). Not a GERD trigger. Not a liver issue. Sweet potatoes are the safer substitute (not nightshade).'
  },
  {
    id: 'greek_yogurt', name: 'Greek Yogurt', emoji: '🫙',
    context: 'Your preferred dairy — much better than regular yogurt (higher protein, lower lactose, live cultures). Excellent for your profile. During the 3-week dairy elimination trial: stop completely. Contains probiotics, protein, and calcium.'
  },
  {
    id: 'cottage_cheese', name: 'Cottage Cheese', emoji: '🧀',
    context: 'Excellent high-protein, lower-fat dairy. Casein protein is slow-releasing — good for hitting 120–150g/day target. Same dairy elimination caveat as Greek yogurt — pause during trial.'
  },
  {
    id: 'cheese', name: 'Cheese', emoji: '🧈',
    context: 'Hard cheese is lower in lactose, acceptable in moderation. Two concerns: (1) saturated fat adding to NAFLD burden if daily, and (2) dairy elimination trial — stop during it. Not a significant GERD trigger in small portions.'
  },
  {
    id: 'olive_oil', name: 'Olive Oil', emoji: '🫒',
    context: 'Your most important cooking and dressing fat. Actively therapeutic for every one of your conditions — NAFLD, psoriasis, insulin resistance, GERD. Anti-inflammatory foundation of your diet. Use 1–2 tbsp/day minimum.'
  }
];

// Pairing lookup — key is always alphabetical food1+food2
// ratings: 'excellent' | 'good' | 'caution' | 'bad'
const PAIRINGS = {
  'beef+cheese': {
    rating: 'caution',
    what: 'Highest NAFLD burden combination on your food list. Saturated fat from red meat + saturated fat from cheese simultaneously.',
    reason: 'Occasional burger with cheese = fine. Daily red meat + dairy = liver fat accumulation. Limit this specific combination.'
  },
  'beef+chicken': {
    rating: 'caution',
    what: 'Mixed animal proteins — two dense proteins at the same meal increases digestive enzyme demand.',
    reason: 'Elevated amylase (107.9 U/L) is already a signal. Pick one protein per meal. Occasional mixed grill fine, daily habit is not ideal.'
  },
  'beef+cottage_cheese': {
    rating: 'caution',
    what: 'Two complete proteins + saturated fat. Increased digestive load.',
    reason: 'Red meat + dairy at the same meal requires different enzyme environments. Manageable occasionally. Not a daily pairing.'
  },
  'beef+eggs': {
    rating: 'caution',
    what: 'Two dense proteins at one sitting — heavy pancreatic enzyme demand.',
    reason: 'Creon covers you right now, but chronically stressing the pancreas is not ideal given elevated amylase. Fine occasionally — not a daily pairing.'
  },
  'beef+greek_yogurt': {
    rating: 'caution',
    what: 'Red meat + dairy at the same meal = significant digestive load.',
    reason: 'Separated by several hours = fine. At the same meal = pancreatic enzyme demand increases. Georgian walnut-cream dishes with beef are fine occasionally, not a daily habit.'
  },
  'beef+oats': {
    rating: 'good',
    what: 'Eaten at different meals. Beta-glucan helps buffer the saturated fat\'s effect on cholesterol.',
    reason: 'No gut conflict. Good metabolic combination across separate meal times.'
  },
  'beef+olive_oil': {
    rating: 'good',
    what: 'Always cook red meat in olive oil rather than seed oils. Partially offsets the saturated fat + inflammatory meat cooking concerns.',
    reason: 'EVOO\'s polyphenols partially counteract the pro-inflammatory effect of saturated fat from red meat. Important pairing.'
  },
  'beef+potatoes': {
    rating: 'good',
    what: 'Classic pairing. Manageable glycaemic response when beef is adequate portion.',
    reason: 'Watch psoriasis response — monitor skin specifically after this combination as it tends to be a regular weekly meal. Nightshade concern for potatoes.'
  },
  'beef+rice': {
    rating: 'good',
    what: 'Standard combination. Red meat + rice in balanced portions = fine.',
    reason: 'Watch portion — red meat is denser in calories and fat than chicken. 120g beef + 80g rice = good. 300g beef + 200g pasta = liver overload.'
  },
  'cheese+chicken': {
    rating: 'caution',
    what: 'Chicken with cheese in moderation is fine. Daily chicken-cheese meals add up to significant dairy load.',
    reason: 'Relevant to your planned dairy elimination trial. Melted cheese on chicken = mild GERD trigger potential from high-temperature dairy fat.'
  },
  'cheese+cottage_cheese': {
    rating: 'good',
    what: 'Two dairy sources — fine occasionally. Neither is a conflict with the other.',
    reason: 'During dairy elimination trial: avoid both simultaneously to get a clean result. Outside the trial: manageable.'
  },
  'cheese+eggs': {
    rating: 'caution',
    what: 'Classic combination. Adds significant saturated fat on top of egg fat.',
    reason: 'Fine in moderation — not a daily staple. Combined fat load adds unnecessary liver burden given NAFLD. 1 egg + 30g cheese = fine. Cheese omelette every day = fat accumulation.'
  },
  'cheese+greek_yogurt': {
    rating: 'caution',
    what: 'Two dairy sources in one meal — moderate dairy burden.',
    reason: 'During dairy trial: avoid both. Outside trial: fine in moderation. Three dairy sources in one day (yogurt + cottage cheese + cheese) = too much for your NAFLD profile.'
  },
  'cheese+oats': {
    rating: 'caution',
    what: 'Savoury oats with cheese — unusual pairing. Saturated fat load on an otherwise liver-friendly breakfast.',
    reason: 'Occasional = fine. Not daily. The whole point of oats is their metabolic benefit for insulin resistance — don\'t undermine it with daily saturated fat addition.'
  },
  'cheese+olive_oil': {
    rating: 'good',
    what: 'No conflict. Olive oil\'s anti-inflammatory properties complement cheese when used together in cooking.',
    reason: 'Use olive oil as the primary fat alongside cheese rather than additional butter or cream. Keeps the saturated fat burden manageable.'
  },
  'cheese+potatoes': {
    rating: 'caution',
    what: 'Cheese on potato = fine occasionally. Saturated fat + starch accumulation if daily.',
    reason: 'Cheesy potato dishes are GERD-risky due to slow gastric emptying from combined fat + carb. Occasional = fine. Not a daily habit.'
  },
  'cheese+rice': {
    rating: 'caution',
    what: 'Pasta with parmesan = fine occasionally. Creamy cheese sauce = significant liver burden.',
    reason: 'Saturated fat + refined carbs = direct liver stress for NAFLD. Use olive oil on pasta as a daily habit, parmesan as occasional flavouring only.'
  },
  'chicken+cottage_cheese': {
    rating: 'good',
    what: 'Cottage cheese as a side or dip with chicken = fine. Protein stacking.',
    reason: 'No GERD issue. No gut conflict. Good for hitting your 120–150g/day protein target efficiently.'
  },
  'chicken+eggs': {
    rating: 'good',
    what: 'Double protein — efficient way to hit daily protein target. No conflict.',
    reason: 'Both are lean proteins. No digestive conflict. Good for lunch or dinner protein loading.'
  },
  'chicken+greek_yogurt': {
    rating: 'good',
    what: 'Yogurt-based marinades or sauces with chicken = traditional and fine. Protein stacking.',
    reason: 'No GERD issue. No gut conflict. Tandoor-style or walnut-yogurt chicken dishes are appropriate. Pause during dairy elimination trial.'
  },
  'chicken+oats': {
    rating: 'good',
    what: 'Not typical at the same meal but fine. As a savoury grain bowl: protein + beta-glucan = excellent blood sugar response.',
    reason: 'No conflict. Each serves its purpose. Chicken provides protein to balance oat\'s carbohydrate load.'
  },
  'chicken+olive_oil': {
    rating: 'excellent',
    what: 'Anti-inflammatory combination. Best way to cook chicken for your profile.',
    reason: 'EVOO\'s oleocanthal reduces the inflammatory effect of high-heat cooking and reduces NF-kB signalling relevant to psoriasis. Always use olive oil — not seed oils (sunflower, corn).'
  },
  'chicken+potatoes': {
    rating: 'good',
    what: 'Chicken + boiled/baked potato = solid balanced meal. Protein buffers glucose response from potato.',
    reason: 'Watch psoriasis response — if skin worsens after regular potato weeks, chicken is not the issue, potato is. Nightshade concern applies to potatoes specifically.'
  },
  'chicken+rice': {
    rating: 'good',
    what: 'Classic combination. Chicken protein + complex carb = balanced macros. Blood sugar well managed when chicken is the dominant component.',
    reason: 'Key: chicken portion should be at least equal to carb portion by weight. 150g chicken + 80g rice = good. 50g chicken + 200g pasta = blood sugar problem.'
  },
  'cottage_cheese+eggs': {
    rating: 'good',
    what: 'High protein combination. Casein from cottage cheese + egg albumin = slow + fast protein release.',
    reason: 'Good for body composition and satiety. No gut issues for your profile. Efficient way to hit 120–150g/day protein target.'
  },
  'cottage_cheese+greek_yogurt': {
    rating: 'good',
    what: 'Complementary dairy proteins. Fine to eat at the same meal or same day.',
    reason: 'During dairy elimination trial: avoid BOTH simultaneously. They are both dairy and need to be excluded at the same time to get a clean psoriasis result.'
  },
  'cottage_cheese+oats': {
    rating: 'good',
    what: 'High protein, moderate carb, good blood sugar management.',
    reason: 'Less common pairing but valid. Casein protein slows the glycaemic response to oats. Good for insulin resistance.'
  },
  'cottage_cheese+olive_oil': {
    rating: 'good',
    what: 'No conflict. Olive oil\'s fat enhances absorption of any fat-soluble supplements taken with the same meal.',
    reason: 'Using olive oil alongside cottage cheese keeps the fat profile healthy (monounsaturated) without adding to the saturated fat load from dairy.'
  },
  'cottage_cheese+potatoes': {
    rating: 'good',
    what: 'Cottage cheese stuffed potato = good protein-carb balance.',
    reason: 'Casein protein slows absorption of potato\'s starch. Better than adding butter or sour cream. Nightshade concern for psoriasis still applies to the potato itself.'
  },
  'cottage_cheese+rice': {
    rating: 'good',
    what: 'Cottage cheese with pasta/rice = good protein pairing. Casein slows carb absorption.',
    reason: 'Better than hard cheese on pasta for NAFLD — lower saturated fat. Protein-enriched pasta dish is a valid approach.'
  },
  'eggs+greek_yogurt': {
    rating: 'good',
    what: 'Protein stacking — efficient way to hit daily target. Probiotics in yogurt + egg protein = complementary.',
    reason: 'No conflict. Yogurt\'s live cultures are not affected by egg protein. Useful breakfast add-on. Pause during dairy elimination trial.'
  },
  'eggs+oats': {
    rating: 'excellent',
    what: 'Best breakfast combination for your profile. Protein + beta-glucan + fat = minimal blood sugar spike, maximum supplement absorption.',
    reason: 'Oat fibre blunts the glycaemic response to the entire meal — critical for insulin resistance. Egg fat increases absorption of fat-soluble supplements (D3, K2, Omega-3).'
  },
  'eggs+olive_oil': {
    rating: 'excellent',
    what: 'Gold-standard breakfast pair for your supplement stack. Maximum fat-soluble supplement absorption. Anti-inflammatory synergy.',
    reason: 'Egg fat + olive oil fat = optimal D3, K2, Omega-3, Legalon absorption. Oleocanthal in EVOO reduces inflammation. Non-negotiable daily habit for your profile.'
  },
  'eggs+potatoes': {
    rating: 'caution',
    what: 'Fine in balanced portions. Boiled or baked preparation preferred. Fried combination = avoid.',
    reason: 'Fried eggs + fried potatoes = high fat + high carb + nightshade combination that worsens GERD and liver. Boiled/baked potato with egg is actually decent. Monitor psoriasis.'
  },
  'eggs+rice': {
    rating: 'caution',
    what: 'Acceptable if egg is the dominant component. Risk: glucose spike if rice/pasta portions are large.',
    reason: 'Eggs help buffer the glycaemic load of starchy carbs — but only if protein-to-carb ratio stays high. 2 eggs + 50g rice = fine. 2 eggs + 200g rice = blood sugar problem.'
  },
  'greek_yogurt+oats': {
    rating: 'excellent',
    what: 'Beta-glucan + casein + live cultures = excellent breakfast combination for blood sugar and gut health.',
    reason: 'One of the best breakfasts for your insulin resistance. Casein protein + oat fibre together = very stable blood sugar response. Pause during dairy elimination trial.'
  },
  'greek_yogurt+olive_oil': {
    rating: 'good',
    what: 'No conflict. Olive oil alongside yogurt-based dishes is fine and provides the fat needed for supplement absorption.',
    reason: 'EVOO\'s anti-inflammatory properties complement yogurt\'s probiotic benefit. Good combination for supplement absorption context.'
  },
  'greek_yogurt+potatoes': {
    rating: 'good',
    what: 'Yogurt-topped potato = fine. Protein + complex carb balance.',
    reason: 'Yogurt\'s protein slows potato\'s starch digestion. Better than sour cream (lower fat). Monitor psoriasis response to potatoes specifically. Pause during dairy trial.'
  },
  'greek_yogurt+rice': {
    rating: 'good',
    what: 'Rice with yogurt-based sauce = valid. Protein buffer prevents blood sugar spike.',
    reason: 'Casein protein slows gastric emptying, blunting the glucose response to rice. Pause during dairy elimination trial.'
  },
  'oats+olive_oil': {
    rating: 'excellent',
    what: '1 tsp EVOO stirred into oats = dramatically improves D3, K2, Omega-3 absorption at breakfast.',
    reason: 'Pharmacologically documented — fat-soluble supplements need dietary fat in the stomach. Sounds unusual but is the right move. Oleocanthal in EVOO adds anti-inflammatory benefit.'
  },
  'oats+potatoes': {
    rating: 'bad',
    what: 'Double carbohydrate — starch on starch at the same meal. Blood sugar spike then crash.',
    reason: 'Critical to avoid for your HOMA-IR 2.26. Never combine two starchy carb sources at the same meal. Always pick ONE carb source per meal and pair it with protein.'
  },
  'oats+rice': {
    rating: 'bad',
    what: 'Double carbohydrate — the most problematic pairing for your insulin resistance.',
    reason: 'Two starchy sources at the same meal with no added protein benefit from either. Blood sugar spike, then crash. Never eat oats + rice or oats + pasta at the same meal.'
  },
  'olive_oil+potatoes': {
    rating: 'good',
    what: 'Roasted potato in EVOO = significantly better than fried in seed oil.',
    reason: 'Olive oil\'s phenols reduce the inflammatory starch-fat combination. Always roast or sauté in EVOO. Never fry in seed oils (sunflower, corn). Nightshade concern still applies.'
  },
  'olive_oil+rice': {
    rating: 'good',
    what: 'Olive oil on pasta/rice = traditional and correct. Partially blunts glycaemic response.',
    reason: 'Fat slows gastric emptying, reducing blood sugar spike from rice/pasta. Better than butter or cream for your liver. Anti-inflammatory benefit added.'
  },
  'potatoes+rice': {
    rating: 'bad',
    what: 'Double starch at the same meal — the worst blood sugar scenario for your HOMA-IR.',
    reason: 'Rice/pasta + potatoes together = most critical combination to avoid for insulin resistance. Never combine. The combined glucose load directly worsens your HOMA-IR 2.26.'
  }
};

// Utility — get pairing for any two food IDs (order-independent)
function getFoodPairing(id1, id2) {
  const key = [id1, id2].sort().join('+');
  return PAIRINGS[key] || null;
}
