var fs = require('fs');
var path = require('path');

// ── Chef credit mapping ───────────────────────────────
var CHEF_CREDITS = {
  sanjeevKapoor: { name: 'Chef Sanjeev Kapoor', url: 'https://www.sanjeevkapoor.com', badge: '👨‍🍳 Sanjeev Kapoor' },
  ranveerBrar:    { name: 'Chef Ranveer Brar',    url: 'https://www.ranveerbrar.com',  badge: '👨‍🍳 Ranveer Brar' },
  kunalKapur:     { name: 'Chef Kunal Kapur',     url: 'https://www.chefkunal.com',   badge: '👨‍🍳 Kunal Kapur' },
  tarlaDalal:     { name: 'Tarla Dalal',          url: 'https://www.tarladalal.com',  badge: '👩‍🍳 Tarla Dalal' },
  nishaMadhulika: { name: 'Nisha Madhulika',      url: 'https://nishamadhulika.com',  badge: '👩‍🍳 Nisha Madhulika' },
  vahChef:        { name: 'VahChef (Sanjay Thumma)', url: 'https://vahrehvah.com',   badge: '👨‍🍳 VahChef' },
  hebbar:         { name: "Hebbar's Kitchen",     url: 'https://hebbarskitchen.com',  badge: '👩‍🍳 Hebbar\'s Kitchen' },
  swasthi:        { name: "Swasthi's Recipes",    url: 'https://swasthisrecipes.com', badge: '👩‍🍳 Swasthi\'s Recipes' }
};

// ── Read source files ─────────────────────────────────
var utils = fs.readFileSync('utils.js', 'utf8');

// Try to read chef-recipes.js (optional)
var chefContent = '';
try { chefContent = fs.readFileSync('chef-recipes.js', 'utf8'); } catch(e) {}

// Combine both sources for extraction
var combined = utils + '\n' + chefContent;

// Extract all recipe arrays: recipes:[...] and CHEF_RECIPES:[...]
var allRecipesData = '';
var mainRecipesMatch = combined.match(/recipes:\s*\[([\s\S]*?)\]\s*\};/);
var chefRecipesMatch = chefContent ? chefContent.match(/CHEF_RECIPES\s*=\s*\[([\s\S]*?)\]\s*;/) : null;

if (mainRecipesMatch) allRecipesData += mainRecipesMatch[1];
if (chefRecipesMatch) allRecipesData += '\n' + chefRecipesMatch[1];

if (!allRecipesData) { console.log('Could not extract recipes'); process.exit(1); }

// Quick eval-safe parse of recipe objects
var blocks = allRecipesData.split(/\{\s*id:/).filter(Boolean);
var recipes = [];

blocks.forEach(function(block) {
  var idMatch = block.match(/'([^']+)'/);
  var nameMatch = block.match(/name:\s*'([^']+)'/);
  var authorMatch = block.match(/author:\s*'([^']+)'/);
  var catMatch = block.match(/category:\s*'([^']+)'/);
  var cuisineMatch = block.match(/cuisine:\s*'([^']+)'/);
  var mealMatch = block.match(/mealType:\s*'([^']+)'/);
  var dietMatch = block.match(/diet:\s*'([^']+)'/);
  var budgetMatch = block.match(/budget:\s*'([^']+)'/);
  var costMatch = block.match(/costEstimate:\s*'([^']*)'/);
  var imageMatch = block.match(/image:\s*'([^']*)'/);
  var prepMatch = block.match(/prep:\s*'([^']+)'/);
  var cookMatch = block.match(/cook:\s*'([^']+)'/);
  var diffMatch = block.match(/difficulty:\s*'([^']+)'/);
  var servingsMatch = block.match(/servings:\s*([^,]+)/);
  var tipsMatch = block.match(/tips:\s*'([^']*)'/);
  var restrictionsMatch = block.match(/restrictions:\s*\[([^\]]*)\]/);
  var equipmentMatch = block.match(/equipment:\s*\[([^\]]*)\]/);
  var chefKeyMatch = block.match(/chefKey:\s*'([^']+)'/);
  var sourceUrlMatch = block.match(/sourceUrl:\s*'([^']+)'/);

  // Extract ingredients array
  var ingMatch = block.match(/ingredients:\s*\[([\s\S]*?)\],\s*steps/);
  var ingredients = [];
  if (ingMatch) {
    var ingItems = ingMatch[1].match(/'([^']+)'/g);
    if (ingItems) ingItems.forEach(function(i) { ingredients.push(i.replace(/'/g, '')); });
  }

  // Extract steps array
  var stepsMatch = block.match(/steps:\s*\[([\s\S]*?)\],\s*tips/);
  if (!stepsMatch) stepsMatch = block.match(/steps:\s*\[([\s\S]*?)\]\s*\}/);
  var steps = [];
  if (stepsMatch) {
    var stepItems = stepsMatch[1].match(/'([^']+)'/g);
    if (stepItems) stepItems.forEach(function(s) { steps.push(s.replace(/'/g, '')); });
  }

  if (idMatch && nameMatch) {
    // Parse restrictions array
    var restrictions = [];
    if (restrictionsMatch) {
      var rItems = restrictionsMatch[1].match(/'([^']+)'/g);
      if (rItems) rItems.forEach(function(r) { restrictions.push(r.replace(/'/g, '')); });
    }
    // Parse equipment array
    var equipment = [];
    if (equipmentMatch) {
      var eItems = equipmentMatch[1].match(/'([^']+)'/g);
      if (eItems) eItems.forEach(function(e) { equipment.push(e.replace(/'/g, '')); });
    }
    recipes.push({
      id: idMatch[1],
      name: nameMatch[1],
      author: authorMatch ? authorMatch[1] : 'Royal Mutton Hub Kitchen',
      category: catMatch ? catMatch[1] : '',
      cuisine: cuisineMatch ? cuisineMatch[1] : '',
      mealType: mealMatch ? mealMatch[1] : '',
      diet: dietMatch ? dietMatch[1] : '',
      budget: budgetMatch ? budgetMatch[1] : '',
      costEstimate: costMatch ? costMatch[1] : '',
      image: imageMatch ? imageMatch[1] : '',
      restrictions: restrictions,
      equipment: equipment,
      chefKey: chefKeyMatch ? chefKeyMatch[1] : null,
      sourceUrl: sourceUrlMatch ? sourceUrlMatch[1] : null,
      prep: prepMatch ? prepMatch[1] : '',
      cook: cookMatch ? cookMatch[1] : '',
      difficulty: diffMatch ? diffMatch[1] : '',
      servings: servingsMatch ? servingsMatch[1].trim() : '4',
      ingredients: ingredients,
      steps: steps,
      tips: tipsMatch ? tipsMatch[1] : ''
    });
  }
});

function slugify(str) { return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
function esc(str) { if (!str) return ''; return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function escAttr(str) { if (!str) return ''; return String(str).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function toMinutes(str) {
  if (!str) return 0;
  var hrs = parseInt((str.match(/(\d+)\s*hr/) || [])[1] || 0);
  var mins = parseInt((str.match(/(\d+)\s*min/) || [])[1] || 0);
  return hrs * 60 + mins;
}

function generateRecipePage(r, index, total) {
  var slug = slugify(r.name);
  var prevRecipe = index > 0 ? recipes[index - 1] : null;
  var nextRecipe = index < recipes.length - 1 ? recipes[index + 1] : null;
  var pageUrl = 'https://royal-mutton-hub.netlify.app/RecipeDB/' + slug + '.html';
  var shareText = encodeURIComponent(r.name + ' - Mutton recipe from Royal Mutton Hub. Try it!');
  var shareUrl = encodeURIComponent(pageUrl);

  var prepMins = toMinutes(r.prep);
  var cookMins = toMinutes(r.cook);
  var totalMins = prepMins + cookMins;

  // Build JSON-LD
  var jsonld = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    "name": r.name,
    "author": r.author,
    "recipeCategory": r.category,
    "prepTime": "PT" + prepMins + "M",
    "cookTime": "PT" + cookMins + "M",
    "totalTime": "PT" + totalMins + "M",
    "recipeYield": r.servings + " servings",
    "recipeIngredient": r.ingredients,
    "recipeInstructions": r.steps.map(function(s) { return { "@type": "HowToStep", "text": s }; }),
    "description": "Learn how to make " + r.name + " - a delicious " + r.category.toLowerCase() + " recipe from Royal Mutton Hub, Vijayawada's premier fresh mutton supplier."
  };

  var html = '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width,initial-scale=1.0">\n';
  html += '<title>' + esc(r.name) + ' | Royal Mutton Hub Recipe</title>\n';
  html += '<meta name="description" content="' + escAttr(r.name) + ' recipe - ' + escAttr(r.category) + ' made with fresh mutton. ' + escAttr(r.tips || 'Step-by-step cooking instructions.') + '">\n';
  html += '<meta name="keywords" content="' + escAttr(r.name.toLowerCase()) + ', mutton recipe, ' + escAttr(r.category.toLowerCase()) + ', andhra recipe, vijayawada, royal mutton hub">\n';
  html += '<meta property="og:title" content="' + escAttr(r.name) + ' | Royal Mutton Hub Recipe">\n';
  html += '<meta property="og:description" content="Learn how to make ' + escAttr(r.name) + ' - fresh mutton ' + escAttr(r.category.toLowerCase()) + ' recipe.">\n';
  html += '<meta property="og:url" content="' + escAttr(pageUrl) + '">\n';
  html += '<meta property="og:type" content="article">\n';
  html += '<meta name="twitter:card" content="summary">\n';
  html += '<link rel="canonical" href="' + escAttr(pageUrl) + '">\n';
  html += '<link rel="icon" href="data:image/svg+xml,<svg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 100 100%27><text y=%27.9em%27 font-size=%2790%27>\U0001F411</text></svg>">\n';
  html += '<script type="application/ld+json">' + JSON.stringify(jsonld) + '</script>\n';
  html += '<style>\n';
  html += '*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}\n';
  html += 'body{font-family:\'Segoe UI\',Tahoma,Geneva,Verdana,sans-serif;background:#0a0a0a;color:#f1f5f9;line-height:1.7;padding:20px}\n';
  html += '.container{max-width:750px;margin:0 auto}\n';
  html += '.header{text-align:center;padding:20px 0 10px}\n';
  html += '.header a{color:#d4a017;text-decoration:none;font-weight:600}\n';
  html += '.header a:hover{opacity:0.8}\n';
  html += '.badge{display:inline-block;padding:4px 14px;border-radius:50px;font-size:0.78rem;font-weight:600;background:rgba(212,160,23,0.12);color:#d4a017;margin-bottom:10px}\n';
  html += 'h1{font-size:1.8rem;font-weight:800;margin-bottom:6px;color:#d4a017}\n';
  html += '.author{font-size:0.85rem;color:#94a3b8;margin-bottom:4px}\n';
  html += '.author i{color:#d4a017;margin-right:4px}\n';
  html += '.meta{display:flex;flex-wrap:wrap;gap:12px;margin:14px 0 24px;padding-bottom:16px;border-bottom:1px solid rgba(255,255,255,0.06);justify-content:center}\n';
  html += '.meta span{font-size:0.82rem;color:#94a3b8;display:flex;align-items:center;gap:6px}\n';
  html += '.section{margin-bottom:20px}\n';
  html += '.section h2{color:#d4a017;font-size:1rem;margin-bottom:8px;display:flex;align-items:center;gap:8px}\n';
  html += '.section ul,.section ol{padding-left:20px;font-size:0.9rem;color:#cbd5e1;line-height:1.9}\n';
  html += '.section li{margin-bottom:2px}\n';
  html += '.tips{background:rgba(212,160,23,0.06);border-left:3px solid #d4a017;padding:14px 16px;border-radius:0 12px 12px 0;margin:20px 0;font-size:0.85rem;color:#94a3b8;line-height:1.6}\n';
  html += '.share{margin:28px 0;padding:20px 0;border-top:1px solid rgba(255,255,255,0.06);border-bottom:1px solid rgba(255,255,255,0.06);text-align:center}\n';
  html += '.share p{font-size:0.82rem;color:#94a3b8;margin-bottom:12px}\n';
  html += '.share-buttons{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}\n';
  html += '.share-btn{display:inline-flex;align-items:center;gap:6px;padding:10px 18px;border:none;border-radius:10px;font-size:0.82rem;font-weight:600;cursor:pointer;text-decoration:none;transition:all 0.2s;color:#fff}\n';
  html += '.share-btn:hover{transform:translateY(-2px);opacity:0.9}\n';
  html += '.share-btn.whatsapp{background:#25D366}\n';
  html += '.share-btn.facebook{background:#1877F2}\n';
  html += '.share-btn.twitter{background:#000}\n';
  html += '.share-btn.email{background:#64748b}\n';
  html += '.share-btn.copy{background:#d4a017;color:#0a0a0a}\n';
  html += '.back{margin:20px 0;text-align:center}\n';
  html += '.back a{display:inline-flex;align-items:center;gap:6px;padding:10px 20px;background:#d4a017;color:#0a0a0a;border-radius:10px;font-weight:600;text-decoration:none}\n';
  html += '.back a:hover{background:#c08e10}\n';
  html += '.nav-links{display:flex;justify-content:space-between;margin:20px 0;gap:10px}\n';
  html += '.nav-links a{color:#d4a017;font-size:0.85rem;text-decoration:none}\n';
  html += '.nav-links a:hover{text-decoration:underline}\n';
  html += '.footer-text{text-align:center;padding:20px 0;font-size:0.78rem;color:#475569;border-top:1px solid rgba(255,255,255,0.04);margin-top:20px}\n';
  html += '.footer-text a{color:#d4a017;text-decoration:none}\n';
  html += '</style>\n</head>\n<body>\n';

  html += '<div class="container">\n';
  var budgetIcon = r.budget === 'low' ? '&#128176;' : '&#128176;';
  var dietIcon = r.diet === 'veg' ? '&#127793; Veg' : '&#127853; Non-Veg';
  var imgEmoji = r.image || '&#127858;';
  var restrictionsStr = '';
  if (r.restrictions && r.restrictions.length > 0) {
    var rIcons = { 'vegan':'&#127793;','gluten-free':'&#127800;','dairy-free':'&#129374;','nut-free':'&#129372;','egg-free':'&#129370;' };
    restrictionsStr = r.restrictions.map(function(x) { return '<span style="display:inline-block;padding:2px 10px;border-radius:6px;background:rgba(255,255,255,0.05);font-size:0.75rem;margin-right:4px;margin-bottom:4px;">' + (rIcons[x]||'') + ' ' + esc(x.replace('-free','').replace('-',' ')) + ' friendly</span>'; }).join('');
  }
  html += '<div class="header"><a href="/"><i class="fas fa-crown" style="color:#d4a017;"></i> Royal Mutton Hub</a> <span style="font-size:0.72rem;color:#64748b;">| Indigenous Vijayawada Brand</span></div>\n';
  html += '<div style="font-size:3rem;text-align:center;margin-bottom:8px;line-height:1;">' + imgEmoji + '</div>\n';
  html += '<div style="text-align:center;margin-bottom:6px;">';
  html += '<span class="badge">' + esc(r.category) + '</span>&nbsp;';
  html += '<span class="badge" style="font-size:0.75rem;">' + dietIcon + '</span>&nbsp;';
  html += '<span class="badge" style="font-size:0.75rem;background:rgba(212,160,23,0.06);">' + esc(r.cuisine) + '</span>&nbsp;';
  html += '<span class="badge" style="font-size:0.75rem;">' + esc(r.mealType) + '</span>';
  html += '</div>\n';
  // Chef credit badge
  var creditBadge = '';
  if (r.chefKey && CHEF_CREDITS[r.chefKey]) {
    var cc = CHEF_CREDITS[r.chefKey];
    var sourceLink = r.sourceUrl ? ' <a href="' + escAttr(r.sourceUrl) + '" target="_blank" rel="noopener noreferrer" style="color:#64748b;font-size:0.72rem;text-decoration:none;">(source)</a>' : '';
    creditBadge = '<div style="text-align:center;margin-bottom:8px;"><span style="display:inline-block;padding:3px 10px;border-radius:50px;font-size:0.72rem;background:rgba(255,255,255,0.04);color:#d4a017;border:1px solid rgba(212,160,23,0.15);">' + cc.badge + '</span>' + sourceLink + '</div>\n';
  }
  html += creditBadge;
  html += '<h1 style="text-align:center;">' + esc(r.name) + '</h1>\n';
  html += '<div class="author" style="text-align:center;"><i class="fas fa-user"></i>' + esc(r.author) + '</div>\n';
  html += '<div class="meta" style="justify-content:center;">';
  html += '<span>&#9200; Prep: ' + esc(r.prep) + '</span>';
  html += '<span>&#9200; Cook: ' + esc(r.cook) + '</span>';
  html += '<span>&#127860; ' + esc(r.servings) + ' servings</span>';
  var diffIcon = r.difficulty.toLowerCase() === 'easy' ? '&#128994;' : (r.difficulty.toLowerCase() === 'medium' ? '&#128993;' : '&#128308;');
  html += '<span>' + diffIcon + ' ' + esc(r.difficulty) + '</span>';
  html += '<span style="color:#22c55e;">' + budgetIcon + ' ' + r.budget.charAt(0).toUpperCase() + r.budget.slice(1) + ' Budget</span>';
  if (r.costEstimate) html += '<span>&#128176; ' + esc(r.costEstimate) + '</span>';
  html += '</div>\n';
  if (restrictionsStr) html += '<div style="text-align:center;margin-bottom:14px;">' + restrictionsStr + '</div>\n';

  html += '<div class="section"><h2>&#128722; Ingredients</h2><ul>';
  r.ingredients.forEach(function(i) { html += '<li>' + esc(i) + '</li>'; });
  html += '</ul></div>\n';

  html += '<div class="section"><h2>&#128221; Instructions</h2><ol>';
  r.steps.forEach(function(s) { html += '<li>' + esc(s) + '</li>'; });
  html += '</ol></div>\n';

  if (r.tips) html += '<div class="tips"><strong style="color:#d4a017;">&#128161; Tip:</strong> ' + esc(r.tips) + '</div>\n';

  // Equipment
  if (r.equipment && r.equipment.length > 0) {
    html += '<div class="section" style="margin-top:16px;"><h2>&#128295; Kitchen Equipment Needed</h2><div style="display:flex;flex-wrap:wrap;gap:8px;">';
    r.equipment.forEach(function(e) { html += '<span style="display:inline-block;padding:4px 12px;border-radius:8px;background:rgba(255,255,255,0.05);font-size:0.82rem;color:#cbd5e1;">&#9881; ' + esc(e) + '</span>'; });
    html += '</div></div>\n';
  }

  // Share buttons
  html += '<div class="share"><p>&#128640; Share this recipe</p>\n<div class="share-buttons">\n';
  html += '<a class="share-btn whatsapp" href="https://wa.me/?text=' + shareText + '%20' + shareUrl + '" target="_blank" rel="noopener noreferrer"><i class="fab fa-whatsapp"></i> WhatsApp</a>\n';
  html += '<a class="share-btn facebook" href="https://www.facebook.com/sharer/sharer.php?u=' + shareUrl + '" target="_blank" rel="noopener noreferrer"><i class="fab fa-facebook"></i> Facebook</a>\n';
  html += '<a class="share-btn twitter" href="https://twitter.com/intent/tweet?text=' + shareText + '&url=' + shareUrl + '" target="_blank" rel="noopener noreferrer"><i class="fab fa-twitter"></i> X</a>\n';
  html += '<a class="share-btn email" href="mailto:?subject=' + encodeURIComponent(r.name + ' - Mutton Recipe') + '&body=' + encodeURIComponent('Check out this recipe: ' + r.name + '\n\n' + pageUrl) + '"><i class="fas fa-envelope"></i> Email</a>\n';
  html += '<button class="share-btn copy" onclick="navigator.clipboard.writeText(\'' + escAttr(pageUrl) + '\').then(function(){alert(\'Link copied!\')})"><i class="fas fa-link"></i> Copy Link</button>\n';
  html += '</div></div>\n';

  // Navigation
  html += '<div class="nav-links">';
  if (prevRecipe) html += '<a href="' + slugify(prevRecipe.name) + '.html">&#8592; ' + esc(prevRecipe.name) + '</a>';
  else html += '<span></span>';
  if (nextRecipe) html += '<a href="' + slugify(nextRecipe.name) + '.html">' + esc(nextRecipe.name) + ' &#8594;</a>';
  else html += '<span></span>';
  html += '</div>\n';

  html += '<div class="back"><a href="/">&#8592; Back to All Recipes</a></div>\n';

  html += '<div style="text-align:center;padding:10px 0;font-size:0.72rem;color:#64748b;"><i class="fas fa-seedling" style="color:#d4a017;"></i> An indigenous Vijayawada brand \u2014 homegrown, rooted in Andhra Pradesh\u2019s culinary heritage</div>\n';
  html += '<div class="footer-text">';
  html += '&copy; 2026 Royal Mutton Hub | <a href="http://guidingkey.com" target="_blank" rel="noopener noreferrer">Developed by Guiding Key</a>';
  html += '</div>\n';

  html += '</div>\n';
  html += '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer">\n';
  html += '</body>\n</html>';

  var filePath = path.join('RecipeDB', slug + '.html');
  fs.writeFileSync(filePath, html, 'utf8');
  console.log('Generated: ' + filePath);
}

// Generate RecipeDB index page
function generateIndex() {
  var html = '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width,initial-scale=1.0">\n';
  html += '<title>Mutton Recipes | Royal Mutton Hub Recipe Database</title>\n';
  html += '<meta name="description" content="Browse our collection of authentic mutton recipes from Royal Mutton Hub, Vijayawada. Classic biryani, Andhra curry, kebabs and more.">\n';
  html += '<meta name="keywords" content="mutton recipes, andhra mutton curry, biryani recipe, vijayawada, royal mutton hub">\n';
  html += '<meta property="og:title" content="Mutton Recipes | Royal Mutton Hub Recipe Database">\n';
  html += '<meta property="og:description" content="Browse our collection of authentic mutton recipes.">\n';
  html += '<meta property="og:url" content="https://royal-mutton-hub.netlify.app/RecipeDB/">\n';
  html += '<meta property="og:type" content="website">\n';
  html += '<link rel="canonical" href="https://royal-mutton-hub.netlify.app/RecipeDB/">\n';
  html += '<link rel="icon" href="data:image/svg+xml,<svg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 100 100%27><text y=%27.9em%27 font-size=%2790%27>\U0001F411</text></svg>">\n';
  html += '<script type="application/ld+json">{"@context":"https://schema.org","@type":"ItemList","name":"Royal Mutton Hub Recipe Database","description":"Authentic mutton recipes","url":"https://royal-mutton-hub.netlify.app/RecipeDB/","itemListElement":[' +
    recipes.map(function(r, i) { return '{"@type":"ListItem","position":' + (i+1) + ',"url":"https://royal-mutton-hub.netlify.app/RecipeDB/' + slugify(r.name) + '.html"}'; }).join(',') + ']}</script>\n';
  html += '<style>\n';
  html += '*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}\n';
  html += 'body{font-family:\'Segoe UI\',Tahoma,Geneva,Verdana,sans-serif;background:#0a0a0a;color:#f1f5f9;padding:20px}\n';
  html += '.container{max-width:800px;margin:0 auto}\n';
  html += 'h1{text-align:center;font-size:1.6rem;color:#d4a017;margin-bottom:6px}\n';
  html += '.subtitle{text-align:center;font-size:0.85rem;color:#94a3b8;margin-bottom:24px}\n';
  html += '.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px}\n';
  html += '.card{background:#111;border:1px solid rgba(212,160,23,0.1);border-radius:14px;padding:20px;transition:all 0.2s}\n';
  html += '.card:hover{border-color:rgba(212,160,23,0.3);transform:translateY(-3px)}\n';
  html += '.card .badge{display:inline-block;padding:3px 12px;border-radius:50px;font-size:0.7rem;font-weight:600;background:rgba(212,160,23,0.12);color:#d4a017;margin-bottom:6px}\n';
  html += '.card h2{font-size:1rem;font-weight:700;margin-bottom:4px}\n';
  html += '.card h2 a{color:#f1f5f9;text-decoration:none}\n';
  html += '.card h2 a:hover{color:#d4a017}\n';
  html += '.card .author{font-size:0.78rem;color:#94a3b8;margin-bottom:6px}\n';
  html += '.card .meta{display:flex;gap:8px;font-size:0.75rem;color:#64748b;flex-wrap:wrap}\n';
  html += '.footer-text{text-align:center;padding:20px 0;font-size:0.78rem;color:#475569;margin-top:20px}\n';
  html += '.footer-text a{color:#d4a017;text-decoration:none}\n';
  html += '.back-home{text-align:center;margin-bottom:20px}\n';
  html += '.back-home a{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:rgba(212,160,23,0.1);border:1px solid rgba(212,160,23,0.2);border-radius:10px;color:#d4a017;font-size:0.85rem;text-decoration:none}\n';
  html += '.back-home a:hover{background:rgba(212,160,23,0.2)}\n';
  html += '.indigenous-badge{text-align:center;padding:8px 0 16px;font-size:0.72rem;color:#64748b}\n';
  html += '</style>\n</head>\n<body>\n<div class="container">\n';
  html += '<h1>&#127858; Mutton Recipe Database</h1>\n';
  html += '<p class="subtitle">Authentic mutton recipes from <strong style="color:#d4a017;">Royal Mutton Hub</strong> \u2014 an indigenous Vijayawada brand rooted in Andhra Pradesh\u2019s culinary heritage</p>\n';
  html += '<div class="back-home"><a href="/">&#8592; Back to Royal Mutton Hub</a></div>\n';
  html += '<div class="grid">\n';
  recipes.forEach(function(r) {
    var slug = slugify(r.name);
    var imgIcon = r.image || '&#127858;';
    var eqStr = r.equipment ? r.equipment.slice(0,2).join(', ') + (r.equipment.length > 2 ? '...' : '') : '';
    var chefBadge = '';
    if (r.chefKey && CHEF_CREDITS[r.chefKey]) chefBadge = '<div style="font-size:0.65rem;color:#d4a017;margin:4px 0 2px;">' + CHEF_CREDITS[r.chefKey].badge + '</div>';
    html += '<div class="card">';
    html += '<div style="font-size:2rem;text-align:center;margin-bottom:4px;">' + imgIcon + '</div>';
    html += '<div class="badge">' + esc(r.category) + '</div>';
    html += '<h2><a href="' + slug + '.html">' + esc(r.name) + '</a></h2>';
    html += '<div class="author"><i class="fas fa-user" style="color:#d4a017;margin-right:4px;"></i>' + esc(r.author) + '</div>';
    html += chefBadge;
    html += '<div class="meta"><span>&#9200; ' + esc(r.prep) + '</span><span>&#9200; ' + esc(r.cook) + '</span><span>&#127860; ' + esc(r.servings) + '</span></div>';
    if (eqStr) html += '<div style="font-size:0.72rem;color:#64748b;margin-top:6px;">&#128295; ' + esc(eqStr) + '</div>';
    html += '</div>\n';
  });
  html += '</div>\n';
  html += '<div class="indigenous-badge"><i class="fas fa-seedling" style="color:#d4a017;"></i> An indigenous Vijayawada brand \u2014 homegrown, rooted in Andhra Pradesh\u2019s culinary heritage</div>\n';
  html += '<div class="footer-text">';
  html += '&copy; 2026 Royal Mutton Hub | <a href="http://guidingkey.com" target="_blank" rel="noopener noreferrer">Developed by Guiding Key</a>';
  html += '</div>\n</div>\n';
  html += '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer">\n';
  html += '</body>\n</html>';
  fs.writeFileSync(path.join('RecipeDB', 'index.html'), html, 'utf8');
  console.log('Generated: RecipeDB/index.html');
}

recipes.forEach(function(r, i) { generateRecipePage(r, i, recipes.length); });
generateIndex();
console.log('\nDone! Generated ' + (recipes.length + 1) + ' files.');