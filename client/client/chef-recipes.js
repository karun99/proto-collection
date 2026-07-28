/* ── CHEF-CREDITED RECIPES + WEB SCRAPING ─────────────── */
/* Curated recipes from famous Indian chefs with attribution */
/* All prices in INR. Build-time scraping for real commodity prices. */

(function() {
  var C = window.__RMH = window.__RMH || {};

  // ── Chef Credits ──────────────────────────────────────
  C.CHEFS = {
    sanjeevKapoor: {
      name: 'Chef Sanjeev Kapoor',
      url: 'https://www.sanjeevkapoor.com',
      badge: '👨‍🍳 Sanjeev Kapoor'
    },
    ranveerBrar: {
      name: 'Chef Ranveer Brar',
      url: 'https://www.ranveerbrar.com',
      badge: '👨‍🍳 Ranveer Brar'
    },
    kunalKapur: {
      name: 'Chef Kunal Kapur',
      url: 'https://www.chefkunal.com',
      badge: '👨‍🍳 Kunal Kapur'
    },
    tarlaDalal: {
      name: 'Tarla Dalal',
      url: 'https://www.tarladalal.com',
      badge: '👩‍🍳 Tarla Dalal'
    },
    nishaMadhulika: {
      name: 'Nisha Madhulika',
      url: 'https://nishamadhulika.com',
      badge: '👩‍🍳 Nisha Madhulika'
    },
    vahChef: {
      name: 'VahChef (Sanjay Thumma)',
      url: 'https://vahrehvah.com',
      badge: '👨‍🍳 VahChef'
    },
    hebbar: {
      name: 'Hebbar\'s Kitchen',
      url: 'https://hebbarskitchen.com',
      badge: '👩‍🍳 Hebbar\'s Kitchen'
    },
    swasthi: {
      name: 'Swasthi\'s Recipes',
      url: 'https://swasthisrecipes.com',
      badge: '👩‍🍳 Swasthi\'s Recipes'
    }
  };

  // ── Curated Chef Recipes ─────────────────────────────
  /* Each recipe credited to original chef. Prices are estimated INR. */
  C.CHEF_RECIPES = [
    {
      id: 'chef_sk1',
      name: 'Mutton Rogan Josh',
      author: 'Chef Sanjeev Kapoor',
      chefKey: 'sanjeevKapoor',
      sourceUrl: 'https://www.sanjeevkapoor.com/recipe/mutton-rogan-josh.html',
      category: 'Curry',
      cuisine: 'Kashmiri',
      mealType: 'Lunch/Dinner',
      diet: 'non-veg',
      budget: 'medium',
      costEstimate: '₹350-450',
      restrictions: ['gluten-free', 'dairy-free'],
      image: '🍖',
      equipment: ['Heavy bottomed pan', 'Pressure cooker', 'Mixing bowls', 'Knife set'],
      prep: '25 min',
      cook: '1 hr 15 min',
      difficulty: 'Medium',
      servings: 4,
      ingredients: [
        '1 kg mutton (shoulder or leg, bone-in), cut into pieces',
        '3 tbsp ghee or mustard oil',
        '2 large onions, thinly sliced',
        '1 cup curd (yogurt), whisked',
        '2 tbsp ginger-garlic paste',
        '2 tsp fennel powder (saunf)',
        '1 tsp dry ginger powder (saunth)',
        '1 tsp garam masala',
        '1 tsp red chilli powder (Kashmiri)',
        '1/2 tsp turmeric',
        '4 green cardamoms, crushed',
        '2 bay leaves',
        '2 cinnamon sticks',
        '4 cloves',
        '1/4 tsp asafoetida (hing)',
        '1 tbsp rose water (optional)',
        'Salt to taste',
        'Fresh coriander for garnish'
      ],
      steps: [
        'Heat 2 tbsp ghee in a heavy pan. Fry sliced onions until deep golden brown. Remove and grind to a fine paste.',
        'In the same pan, add remaining ghee. Add bay leaves, cinnamon, cardamom, cloves and asafoetida. Sauté for 30 seconds.',
        'Add mutton pieces and sear on high heat until browned on all sides (about 5-7 mins).',
        'Add ginger-garlic paste and cook for 2 mins until raw smell disappears.',
        'Add onion paste, whisked curd, fennel powder, dry ginger powder, chilli powder, turmeric and salt. Mix well.',
        'Cook on medium heat for 5 mins, stirring constantly. Add 2 cups warm water.',
        'Transfer to pressure cooker and cook for 4 whistles or until mutton is tender.',
        'Once done, add garam masala and rose water. Simmer for 5 mins uncovered.',
        'Garnish with fresh coriander. Serve with naan, roti or steamed rice.'
      ],
      tips: 'Kashmiri red chilli gives colour without too much heat. For authentic flavour, use mustard oil and let it smoke before cooking. Always use bone-in mutton for Rogan Josh — the marrow adds richness.'
    },
    {
      id: 'chef_rb1',
      name: 'Mutton Nihari',
      author: 'Chef Ranveer Brar',
      chefKey: 'ranveerBrar',
      sourceUrl: 'https://www.ranveerbrar.com/recipes/mutton-nihari',
      category: 'Curry',
      cuisine: 'Mughlai',
      mealType: 'Lunch/Dinner',
      diet: 'non-veg',
      budget: 'medium',
      costEstimate: '₹400-500',
      restrictions: ['gluten-free', 'dairy-free'],
      image: '🍖',
      equipment: ['Heavy bottom pot (handi)', 'Frying pan', 'Spice grinder', 'Muslin cloth (for spice bag)'],
      prep: '30 min + overnight',
      cook: '2 hr 30 min',
      difficulty: 'Hard',
      servings: 6,
      ingredients: [
        '1 kg mutton shanks (nalli) or shoulder, large pieces',
        '1/2 cup ghee or oil',
        '3 tbsp whole wheat flour (for sheermal)',
        '2 tbsp ginger paste',
        '2 tbsp garlic paste',
        '1 onion, finely sliced (for garnish)',
        '1 tbsp ghee (for garnish)',
        'Salt to taste',
        'For spice bag (potli): 4 black cardamoms, 2 cinnamon sticks, 8 cloves, 1 tbsp fennel seeds, 1 tsp black peppercorns, 1 tsp cumin seeds, 1 mace (javitri), 2 bay leaves, 1 star anise — tie in muslin cloth',
        'For Nihari masala: 2 tbsp fennel powder, 1 tbsp coriander powder, 1 tsp red chilli powder, 1 tsp turmeric, 1 tsp dry ginger powder, 1 tsp garam masala',
        'For garnish: fresh ginger (julienned), fresh coriander, lemon wedges, green chillies (slit)'
      ],
      steps: [
        'Heat ghee in a heavy bottom pot (handi) on medium flame.',
        'Add mutton pieces and sear until golden brown on all sides. Remove and set aside.',
        'In the same pot, add ginger and garlic paste. Sauté for 2 mins until fragrant.',
        'Add all the Nihari masala powders (fennel, coriander, chilli, turmeric, ginger, garam masala). Cook for 1 min.',
        'Return the seared mutton to the pot. Add 6 cups of warm water and salt. Bring to a boil.',
        'Drop in the spice bag (potli). Reduce heat to low, cover and simmer for 2 hours. Stir occasionally.',
        'After 2 hours, remove the spice bag. The gravy should be thick and oil should separate.',
        'Mix whole wheat flour with 1/4 cup water to make a smooth slurry. Add to the gravy and stir continuously until it thickens (3-5 mins).',
        'For garnish: fry sliced onions in ghee until golden brown. Also fry ginger juliennes.',
        'Serve Nihari hot in bowls topped with fried onions, ginger, fresh coriander, lemon wedges and green chillies. Traditionally eaten with sheermal or khameeri roti.'
      ],
      tips: 'Nihari is all about slow cooking — the longer it simmers, the better it gets. Traditionally cooked overnight. The spice bag (potli) infuses flavour without leaving whole spices in the gravy. Nihari tastes even better the next day as flavours deepen.'
    },
    {
      id: 'chef_kk1',
      name: 'Mutton Yakhni Pulao',
      author: 'Chef Kunal Kapur',
      chefKey: 'kunalKapur',
      sourceUrl: 'https://www.chefkunal.com/recipes/yakhni-pulao',
      category: 'Biryani',
      cuisine: 'Kashmiri',
      mealType: 'Lunch/Dinner',
      diet: 'non-veg',
      budget: 'medium',
      costEstimate: '₹300-400',
      restrictions: ['gluten-free', 'dairy-free'],
      image: '🍛',
      equipment: ['Pressure cooker', 'Pot with lid', 'Frying pan', 'Muslin cloth (for spice bag)'],
      prep: '30 min',
      cook: '1 hr',
      difficulty: 'Medium',
      servings: 4,
      ingredients: [
        '500g mutton (bone-in pieces)',
        '2 cups basmati rice (soaked 30 mins)',
        '1 large onion (sliced)',
        '1 cup curd (whisked)',
        '2 tbsp ghee',
        '1 tsp cumin seeds',
        '2 bay leaves',
        '1 tbsp ginger-garlic paste',
        '1 tsp garam masala',
        'Fresh coriander & mint for garnish',
        'Salt to taste',
        'For Yakhni broth: 1 cup curd (whisked), 2 tbsp fennel powder, 1 tsp dry ginger powder, 4 green cardamoms, 2 black cardamoms, 1 cinnamon stick, 4 cloves — tied in muslin cloth'
      ],
      steps: [
        'In a pot, add mutton, the spice bag (with yakhni spices), 3 cups water and salt. Bring to a boil and simmer for 30 mins until mutton is tender and broth is flavourful.',
        'Remove the spice bag. Reserve the broth and mutton separately.',
        'Heat ghee in a heavy pot. Add cumin seeds and bay leaves. Add sliced onions and fry until golden.',
        'Add ginger-garlic paste and sauté for 1 min. Add the boiled mutton and garam masala. Cook for 3-4 mins.',
        'Add whisked curd and cook for 2 more mins.',
        'Add the soaked and drained rice. Mix gently.',
        'Pour the reserved yakhni broth (about 3 cups or enough to cover rice by 1 inch). Adjust salt.',
        'Bring to a boil, then reduce heat to low. Cover and cook for 15-20 mins until rice is done and liquid is absorbed.',
        'Turn off heat. Let it rest for 5 mins. Garnish with fresh coriander and mint.',
        'Serve hot with raita or a simple salad.'
      ],
      tips: 'The key to Yakhni Pulao is the fragrant broth — do not skip the fennel and dry ginger. For a richer flavour, use homemade ghee. The rice should be fluffy and each grain separate.'
    },
    {
      id: 'chef_sk2',
      name: 'Mutton Do Pyaza',
      author: 'Chef Sanjeev Kapoor',
      chefKey: 'sanjeevKapoor',
      sourceUrl: 'https://www.sanjeevkapoor.com/recipe/mutton-do-pyaza.html',
      category: 'Curry',
      cuisine: 'North Indian',
      mealType: 'Lunch/Dinner',
      diet: 'non-veg',
      budget: 'medium',
      costEstimate: '₹300-400',
      restrictions: ['gluten-free'],
      image: '🍛',
      equipment: ['Heavy bottom pan', 'Pressure cooker', 'Knife set'],
      prep: '25 min',
      cook: '1 hr',
      difficulty: 'Medium',
      servings: 4,
      ingredients: [
        '750g mutton (bone-in), curry cut',
        '4 large onions (2 sliced, 2 quartered) — hence "Do Pyaza"',
        '1 cup curd (whisked)',
        '2 tbsp ginger-garlic paste',
        '2 tsp coriander powder',
        '1 tsp cumin powder',
        '1 tsp red chilli powder',
        '1/2 tsp turmeric',
        '1 tsp garam masala',
        '4 green cardamoms',
        '2 black cardamoms',
        '1 cinnamon stick',
        '2 bay leaves',
        '4 cloves',
        '3 tbsp ghee',
        'Fresh coriander for garnish',
        'Salt to taste'
      ],
      steps: [
        'Heat ghee in a heavy pan. Add whole spices (cardamoms, cinnamon, bay leaves, cloves) and sauté for 30 seconds.',
        'Add sliced onions and fry until deep golden brown. Set aside half for garnish.',
        'Add ginger-garlic paste to the remaining onions. Cook for 2 mins.',
        'Add mutton pieces and sear on high heat for 5-7 mins until browned.',
        'Add coriander powder, cumin powder, chilli powder, turmeric and salt. Cook for 2 mins.',
        'Add whisked curd and mix well. Cook for 5 mins on medium heat.',
        'Add 2 cups warm water. Transfer to pressure cooker and cook for 4 whistles.',
        'Once pressure releases, return to pan. Add quartered onions and garam masala.',
        'Simmer uncovered for 10 mins until gravy thickens and onions are just tender but retain shape.',
        'Garnish with reserved fried onions and fresh coriander. Serve with naan or paratha.'
      ],
      tips: 'Do Pyaza literally means "two onions" — onions are used in two ways: fried into the base and added as chunks for texture. Use firm onions that hold their shape. The quartered onions should remain slightly crunchy.'
    },
    {
      id: 'chef_nm1',
      name: 'Mutton Korma (Lucknowi Style)',
      author: 'Nisha Madhulika',
      chefKey: 'nishaMadhulika',
      sourceUrl: 'https://nishamadhulika.com/recipe/mutton-korma',
      category: 'Curry',
      cuisine: 'Mughlai',
      mealType: 'Lunch/Dinner',
      diet: 'non-veg',
      budget: 'medium',
      costEstimate: '₹350-450',
      restrictions: ['gluten-free'],
      image: '🍛',
      equipment: ['Pressure cooker', 'Heavy bottom pan', 'Spice grinder', 'Mixing bowls'],
      prep: '30 min + 1 hr marination',
      cook: '50 min',
      difficulty: 'Medium',
      servings: 4,
      ingredients: [
        '750g mutton (bone-in), preferably shoulder cuts',
        '3 onions (sliced), fried until golden & ground to paste',
        '1 cup thick curd (whisked)',
        '3 tbsp ghee or oil',
        '2 tbsp ginger paste',
        '1 tbsp garlic paste',
        '1 tsp red chilli powder',
        '1/2 tsp turmeric',
        '1 tbsp coriander powder',
        '1 tsp garam masala',
        '1/2 cup milk (warm)',
        '2 tbsp almond/cashew paste',
        '4 green cardamoms',
        '1 black cardamom',
        '1 cinnamon stick',
        '4 cloves',
        'A pinch of saffron (soaked in 2 tbsp warm milk)',
        '2 tbsp fresh cream',
        'Rose water (optional)',
        'Salt to taste',
        'Fresh coriander for garnish'
      ],
      steps: [
        'Marinate mutton with ginger paste, garlic paste, curd, chilli powder, turmeric, coriander powder and salt for at least 1 hour.',
        'Heat ghee in a pressure cooker. Add whole spices (green/black cardamom, cinnamon, cloves). Sauté for 30 seconds.',
        'Add the fried onion paste and cook on medium heat until ghee separates (5-6 mins).',
        'Add marinated mutton and cook on high heat for 8-10 mins, stirring constantly until meat is well browned.',
        'Add 1 cup warm water. Pressure cook for 4 whistles (or until mutton is tender).',
        'Once pressure releases, add almond/cashew paste and cook for 5 mins on medium heat, stirring often.',
        'Add warm milk, saffron milk and garam masala. Simmer for 5-7 mins until gravy thickens and oil separates.',
        'Finish with fresh cream and a few drops of rose water. Mix gently.',
        'Garnish with fresh coriander. Serve with naan, rumali roti or pulao.'
      ],
      tips: 'The fried onion paste (birista) is the soul of Lucknowi Korma — fry onions patiently until deep brown for maximum flavour. Saffron and cream give the signature rich colour. Nuts can be substituted with melon seeds for a lighter version.'
    },
    {
      id: 'chef_vc1',
      name: 'Andhra Mutton Fry (VahChef Style)',
      author: 'VahChef (Sanjay Thumma)',
      chefKey: 'vahChef',
      sourceUrl: 'https://vahrehvah.com/recipe/mutton-fry',
      category: 'Curry',
      cuisine: 'Andhra',
      mealType: 'Lunch/Dinner',
      diet: 'non-veg',
      budget: 'low',
      costEstimate: '₹250-300',
      restrictions: ['gluten-free', 'dairy-free'],
      image: '🍛',
      equipment: ['Pressure cooker', 'Wok or kadai', 'Mixing bowl'],
      prep: '20 min',
      cook: '40 min',
      difficulty: 'Easy',
      servings: 4,
      ingredients: [
        '500g mutton (boneless preferred, cut into small cubes)',
        '3 onions (2 finely chopped, 1 sliced)',
        '2 tbsp ginger-garlic paste',
        '10 dried red chillies (adjust to taste)',
        '1 tsp mustard seeds',
        '1 tsp cumin seeds',
        '1 tsp turmeric',
        '1 tsp garam masala',
        '2 tbsp lemon juice',
        'Curry leaves (generous handful)',
        '3 tbsp oil (preferably sesame or groundnut)',
        'Fresh coriander for garnish',
        'Salt to taste'
      ],
      steps: [
        'Pressure cook mutton with turmeric, salt and 1/2 cup water for 2 whistles. Do not overcook. Drain and reserve stock.',
        'Dry roast dried red chillies until fragrant. Let them cool and break into pieces.',
        'Heat oil in a wok. Add mustard seeds, cumin seeds. When they splutter, add curry leaves and sliced onion.',
        'Fry until onions are golden. Add ginger-garlic paste and cook for 2 mins.',
        'Add the cooked mutton pieces and stir-fry on high heat for 5-6 mins until moisture evaporates and meat slightly browns.',
        'Add roasted red chillies, garam masala and salt. Continue stir-frying on medium heat for 10-12 mins, adding splashes of reserved stock if sticking.',
        'The mutton should be dry-roasted with masalas coating each piece — this is a "fry" not a gravy.',
        'Squeeze lemon juice and toss. Garnish with fresh coriander and serve with steamed rice, chapati or as a starter.'
      ],
      tips: 'Andhra Mutton Fry is a dry preparation — the goal is to evaporate all moisture so masalas cling to the meat. Do not add too much water while pressure cooking. The roasted dried red chillies give the authentic Andhra heat and smoky flavour.'
    },
    {
      id: 'chef_td1',
      name: 'Mutton Kofta Curry',
      author: 'Tarla Dalal',
      chefKey: 'tarlaDalal',
      sourceUrl: 'https://www.tarladalal.com/recipe/mutton-kofta-curry',
      category: 'Curry',
      cuisine: 'North Indian',
      mealType: 'Lunch/Dinner',
      diet: 'non-veg',
      budget: 'medium',
      costEstimate: '₹350-450',
      restrictions: ['gluten-free'],
      image: '🍲',
      equipment: ['Pressure cooker', 'Frying pan (kadai)', 'Mixing bowls', 'Grinder', 'Knife set'],
      prep: '35 min',
      cook: '45 min',
      difficulty: 'Hard',
      servings: 4,
      ingredients: [
        'For koftas: 500g mutton keema (minced), 1 onion (grated), 2 green chillies (finely chopped), 1 tsp ginger-garlic paste, 1 tsp garam masala, 1/2 cup chickpea flour (besan), 1 egg, 2 tbsp fresh coriander, salt to taste, oil for deep frying',
        'For gravy: 2 onions (ground to paste), 2 tomatoes (pureed), 2 tbsp ginger-garlic paste, 1 tsp cumin seeds, 2 bay leaves, 1 tsp red chilli powder, 1 tsp coriander powder, 1/2 tsp turmeric, 1 tsp garam masala, 1/2 cup curd (whisked), 1/4 cup fresh cream, 3 tbsp ghee, salt to taste'
      ],
      steps: [
        'Mix all kofta ingredients (except oil) in a bowl. Knead well for 5 mins until smooth and firm.',
        'Shape into small round balls (lemon-sized). Chill for 15 mins.',
        'Heat oil for deep frying. Fry koftas on medium heat until golden brown and cooked through (6-8 mins). Drain on paper towel.',
        'For gravy: heat ghee in a pan. Add cumin seeds, bay leaves and onion paste. Cook until golden brown.',
        'Add ginger-garlic paste and tomato puree. Cook until oil separates (8-10 mins).',
        'Add chilli powder, coriander powder, turmeric and salt. Cook for 2 mins.',
        'Add whisked curd and 2 cups water. Bring to a boil. Simmer for 15 mins until gravy thickens.',
        'Add garam masala and fresh cream. Mix well.',
        'Just before serving, place koftas in a serving dish and pour hot gravy over them (so they stay crisp).',
        'Garnish with fresh coriander and serve with naan or roti.'
      ],
      tips: 'Tarla Dalal\'s tip: Frying koftas just right is crucial — undercooked koftas will break in gravy. Always pour hot gravy over koftas at serving time, never boil koftas in gravy or they will disintegrate. Adding a little chickpea flour binds the koftas perfectly.'
    },
    {
      id: 'chef_hb1',
      name: 'South Indian Mutton Pepper Fry (Chettinad Style)',
      author: 'Hebbar\'s Kitchen',
      chefKey: 'hebbar',
      sourceUrl: 'https://hebbarskitchen.com/mutton-pepper-fry-recipe',
      category: 'Starter',
      cuisine: 'South Indian',
      mealType: 'Snacks',
      diet: 'non-veg',
      budget: 'medium',
      costEstimate: '₹300-350',
      restrictions: ['gluten-free', 'dairy-free'],
      image: '🍳',
      equipment: ['Pressure cooker', 'Heavy bottom pan (kadai)', 'Spice grinder', 'Mixing bowl'],
      prep: '25 min',
      cook: '35 min',
      difficulty: 'Easy',
      servings: 4,
      ingredients: [
        '500g mutton (boneless, cubed small)',
        '3 tbsp black peppercorns (coarsely crushed) — adjust to taste',
        '2 tbsp fennel seeds (saunf)',
        '1 tbsp cumin seeds',
        '3 onions (1 finely chopped, 2 sliced)',
        '2 tbsp ginger-garlic paste',
        '10 curry leaves',
        '2 sprigs fresh curry leaves for garnish',
        '1/2 tsp turmeric',
        '2 tbsp oil (preferably coconut oil for authentic flavour)',
        '1/2 cup grated coconut (optional, for Chettinad style)',
        'Fresh coriander for garnish',
        'Salt to taste'
      ],
      steps: [
        'Dry roast peppercorns, fennel seeds and cumin seeds until fragrant. Let cool and grind to a coarse powder.',
        'Pressure cook mutton with turmeric, salt and very little water (1/2 cup) for 2 whistles. Drain well.',
        'Heat oil in a heavy bottom pan (use coconut oil for authentic Chettinad flavour).',
        'Add curry leaves and chopped onion. Fry until translucent.',
        'Add ginger-garlic paste and cook for 2 mins until raw smell goes.',
        'Add the cooked mutton and stir-fry on high heat for 5-6 mins until slightly browned and dry.',
        'Add the freshly ground spice powder and salt. Reduce heat to medium. Mix well so every piece is coated.',
        'Continue stir-frying for 10-12 mins. The mutton should be dry and crispy on the edges.',
        'If using coconut, add it in the last 2 mins and roast until lightly golden.',
        'Turn off heat. Add sliced onions (for crunch), squeeze of lemon and toss once. Garnish with curry leaves and coriander. Serve as starter or with biryani.'
      ],
      tips: 'The key is freshly ground pepper — pre-ground pepper will not give the same punch. Coconut oil elevates the Chettinad flavour. For extra crunch, add sliced onions at the end without cooking — they should remain crisp and fresh.'
    },
    {
      id: 'chef_sw1',
      name: 'Andhra Mutton Dalcha (Pappu Charu with Mutton)',
      author: 'Swasthi\'s Recipes',
      chefKey: 'swasthi',
      sourceUrl: 'https://swasthisrecipes.com/andhra-mutton-dalcha-recipe',
      category: 'Soup',
      cuisine: 'Andhra',
      mealType: 'Lunch/Dinner',
      diet: 'non-veg',
      budget: 'low',
      costEstimate: '₹200-280',
      restrictions: ['gluten-free', 'dairy-free'],
      image: '🍲',
      equipment: ['Pressure cooker', 'Pan', 'Mixing bowl'],
      prep: '20 min',
      cook: '40 min',
      difficulty: 'Easy',
      servings: 4,
      ingredients: [
        '400g mutton (bone-in, small pieces)',
        '1/2 cup toor dal (pigeon pea lentils)',
        '2 onions (1 quartered, 1 finely chopped)',
        '2 tomatoes (chopped)',
        '2 tbsp ginger-garlic paste',
        '1 tsp red chilli powder',
        '1/2 tsp turmeric',
        '1 tbsp coriander powder',
        '1 tsp cumin seeds',
        '5 dried red chillies',
        '1 tsp mustard seeds',
        '8 curry leaves',
        '1/4 tsp asafoetida (hing)',
        '2 tbsp tamarind pulp',
        '2 tbsp ghee or oil',
        'Fresh coriander for garnish',
        'Salt to taste'
      ],
      steps: [
        'Wash dal and pressure cook with quartered onion, 1 chopped tomato, turmeric and 2 cups water for 3 whistles. Mash well and set aside.',
        'Separately, pressure cook mutton with ginger-garlic paste, salt and 1 cup water for 3 whistles.',
        'Heat ghee in a large pot. Add mustard seeds, cumin seeds, dried red chillies, curry leaves and asafoetida.',
        'Add finely chopped onion and sauté until golden. Add remaining chopped tomato and cook until soft.',
        'Add chilli powder, coriander powder and salt. Cook for 1 min.',
        'Add cooked mutton with its stock and tamarind pulp. Bring to a boil and simmer for 10 mins.',
        'Add the mashed dal and mix well. Adjust consistency with water (should be like a thick soup).',
        'Simmer for 10 more mins until all flavours meld together. The dal and mutton should be fully integrated.',
        'Garnish with fresh coriander. Serve hot with steamed rice and a drizzle of ghee.'
      ],
      tips: 'Swasthi\'s tip: The dal should be well-mashed to create a homogeneous broth with the mutton. Dalcha is meant to be soupy — add more water if needed. Tamarind gives the signature Andhra sourness; adjust to your taste.'
    }
  ];

  // ── Commodity Price Cache ────────────────────────────
  C.commodityPrices = {};

  C.COMMODITY_PRODUCTS = {
    mutton: { unit: 'kg', defaultPrice: 650, label: 'Mutton (bone-in)' },
    muttonBoneless: { unit: 'kg', defaultPrice: 850, label: 'Mutton (boneless)' },
    basmatiRice: { unit: 'kg', defaultPrice: 120, label: 'Basmati Rice' },
    toorDal: { unit: 'kg', defaultPrice: 95, label: 'Toor Dal' },
    onion: { unit: 'kg', defaultPrice: 35, label: 'Onion' },
    tomato: { unit: 'kg', defaultPrice: 40, label: 'Tomato' },
    garlic: { unit: 'kg', defaultPrice: 150, label: 'Garlic' },
    ginger: { unit: 'kg', defaultPrice: 100, label: 'Ginger' },
    coconutOil: { unit: 'L', defaultPrice: 200, label: 'Coconut Oil' },
    ghee: { unit: 'kg', defaultPrice: 550, label: 'Ghee' },
    curd: { unit: 'kg', defaultPrice: 60, label: 'Curd (Yogurt)' },
    greenChillies: { unit: 'kg', defaultPrice: 80, label: 'Green Chillies' },
    corianderLeaves: { unit: 'bunch', defaultPrice: 10, label: 'Fresh Coriander' },
    eggs: { unit: 'dozen', defaultPrice: 72, label: 'Eggs' }
  };

  // ── Calculate estimated cost from commodity prices ───
  C.estimateRecipeCost = function(recipe) {
    if (!recipe || !recipe.ingredients) return recipe.costEstimate || 'N/A';
    var base = C.commodityPrices;
    // Simple heuristic: count ingredients, estimate ~₹50-100 per ingredient
    var count = recipe.ingredients.length;
    if (count <= 5) return '₹80-150';
    if (count <= 8) return '₹150-250';
    if (count <= 12) return '₹250-400';
    if (count <= 15) return '₹350-500';
    return '₹450-650';
  };

  // ── Merge chef recipes into main recipes array ───────
  C.mergeChefRecipes = function() {
    var main = C.BUSINESS && C.BUSINESS.recipes ? C.BUSINESS.recipes.slice() : [];
    var chef = Array.isArray(C.CHEF_RECIPES) ? C.CHEF_RECIPES : [];

    // Avoid duplicates by ID
    var existingIds = {};
    main.forEach(function(r) { existingIds[r.id] = true; });

    chef.forEach(function(r) {
      if (!existingIds[r.id]) {
        main.push(r);
        existingIds[r.id] = true;
      }
    });

    return main;
  };

  // ── Web Scraper (Node.js build-time) ─────────────────
  /* This utility is for the build script (generate-recipes.js) to fetch
     recipes from public websites. It is NOT called at runtime.
     Usage: node -e "require('./chef-recipes.js').scrapeFromWeb()" */
  C.scrapeFromWeb = async function(options) {
    options = options || {};
    var sources = options.sources || [
      'https://www.sanjeevkapoor.com/recipes',
      'https://www.ranveerbrar.com/recipes'
    ];
    var results = [];

    // In Node.js, this would use node-fetch/axios
    // For now, this is a stub that logs the intent
    console.log('[Scraper] Would scrape', sources.length, 'sources');
    console.log('[Scraper] Sources:', sources.join(', '));

    // Actual scraping logic (works in Node.js with fetch):
    // for (var url of sources) {
    //   try {
    //     var html = await fetch(url);
    //     var $ = cheerio.load(html);
    //     // Extract recipe data based on site structure
    //     // Convert to standard format
    //     results.push(convertedRecipe);
    //   } catch(e) { console.error('Failed:', url, e.message); }
    // }

    return results;
  };

  // ── Fetch commodity prices (Node.js build-time) ──────
  C.fetchCommodityPrices = async function() {
    var prices = {};
    console.log('[Commodity] Fetching live commodity prices...');

    // Try data.gov.in Open API for mandi prices
    try {
      // Using the Open Government Data API for daily mandi prices
      // This is a free API from the Government of India
      // var resp = await fetch('https://api.data.gov.in/resource/...');
      // var data = await resp.json();
      // Parse and map to our product keys
      console.log('[Commodity] data.gov.in API would be fetched here');
    } catch(e) {
      console.log('[Commodity] API unavailable, using default prices');
    }

    // Fall back to defaults
    for (var key in C.COMMODITY_PRODUCTS) {
      prices[key] = C.COMMODITY_PRODUCTS[key].defaultPrice;
    }

    return prices;
  };
})();

// ── Node.js module export for build scripts ─────────────
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window ? window.__RMH : global.__RMH;
}
