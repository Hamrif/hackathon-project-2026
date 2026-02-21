const express = require("express");
const multer = require("multer");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();
const port = 3000;
const path = require("path");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
const upload = multer({ storage: multer.memoryStorage() });
const gemini_ai = new GoogleGenerativeAI(GEMINI_API_KEY);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));

app.listen(port, () => {
    console.log(`listening to port ${port}`);
});



app.get("/home", (req, res) => {
    res.render("home.ejs");
});


app.get("/ingredients", (req, res) => {
    // Test data so we don't have to rely on api
    USE_TEST_DATA = true;
    
    const testIngredients = ["chicken breast", "garlic", "onion", "tomatoes", "olive oil", "rice", "bell pepper", "cheese"];

    if (USE_TEST_DATA) {
      res.render("ingredients.ejs", { ingredients: testIngredients });
    } else {
      res.render("ingredients.ejs", { ingredients: [] });
    }
});

app.post("/analyze-image", upload.single("image"), async (req, res) => {
    const file = req.file;
    
    if (!file) return res.status(400).send("No file uploaded");
    
    const model = gemini_ai.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = [
        {
            inlineData: {
                mimeType: file.mimetype,
                data: file.buffer.toString("base64")
            }
        },
        {
            text: 'List all the food ingredients you can see in this image. Return as a JSON array of strings, nothing else. Example: ["eggs", "tomato", "cheese"]'
        }
    ];

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const response_text = response.text();

        // 1. Clean and Parse the JSON string from Gemini
        const cleanedText = response_text.replace(/```json|```/g, "").trim();
        let ingredientsArray = [];
        try {
            ingredientsArray = JSON.parse(cleanedText);
        } catch (e) {
            console.log("Gemini returned non-JSON text or empty response, assuming no ingredients found.");
        }
        if (!Array.isArray(ingredientsArray)) ingredientsArray = [];

        // 2. Merge with existing ingredients (if any) and render
        let existingIngredients = req.body.existingIngredients || [];
        if (!Array.isArray(existingIngredients)) existingIngredients = [existingIngredients];
        
        const combinedIngredients = [...new Set([...existingIngredients, ...ingredientsArray])];

        res.render("ingredients.ejs", { ingredients: combinedIngredients });

    } catch (error) {
        console.error("Error analyzing image:", error);
    }
});

// Test data so that we don't have to rely on api
const TEST_RECIPES = [
  {
    "id": 642303,
    "title": "Eggplant Pizzette",
    "image": "https://img.spoonacular.com/recipes/642303-312x231.jpg",
    "usedIngredientCount": 2,
    "missedIngredientCount": 2,
    "missedIngredients": [
      { "id": 11209, "name": "eggplant", "aisle": "Produce", "image": "https://img.spoonacular.com/ingredients_100x100/eggplant.png" },
      { "id": 2044, "name": "basil", "aisle": "Produce", "image": "https://img.spoonacular.com/ingredients_100x100/fresh-basil.jpg" }
    ],
    "usedIngredients": [
      { "id": 11529, "name": "tomatoes", "aisle": "Produce", "image": "https://img.spoonacular.com/ingredients_100x100/tomato.png" },
      { "id": 1041009, "name": "cheese", "aisle": "Cheese", "image": "https://img.spoonacular.com/ingredients_100x100/cheddar-cheese.png" }
    ]
  },
  {
    "id": 657610,
    "title": "Quick N' Easy Basil Pesto",
    "image": "https://img.spoonacular.com/recipes/657610-312x231.jpg",
    "usedIngredientCount": 2,
    "missedIngredientCount": 2,
    "missedIngredients": [
      { "id": 2044, "name": "basil leaves", "aisle": "Produce", "image": "https://img.spoonacular.com/ingredients_100x100/fresh-basil.jpg" },
      { "id": 12147, "name": "pine nuts", "aisle": "Baking", "image": "https://img.spoonacular.com/ingredients_100x100/pine-nuts.png" }
    ],
    "usedIngredients": [
      { "id": 11215, "name": "garlic", "aisle": "Produce", "image": "https://img.spoonacular.com/ingredients_100x100/garlic.png" },
      { "id": 1032, "name": "parmesan cheese", "aisle": "Cheese", "image": "https://img.spoonacular.com/ingredients_100x100/parmesan.jpg" }
    ]
  },
  {
    "id": 1165783,
    "title": "Slow Cooker Ranch Chicken",
    "image": "https://img.spoonacular.com/recipes/1165783-312x231.jpg",
    "usedIngredientCount": 2,
    "missedIngredientCount": 2,
    "missedIngredients": [
      { "id": 6194, "name": "chicken broth", "aisle": "Canned and Jarred", "image": "https://img.spoonacular.com/ingredients_100x100/chicken-broth.png" },
      { "id": 93733, "name": "ranch seasoning", "aisle": "Oil, Vinegar, Salad Dressing", "image": "https://img.spoonacular.com/ingredients_100x100/oregano-dried.png" }
    ],
    "usedIngredients": [
      { "id": 5062, "name": "chicken breasts", "aisle": "Meat", "image": "https://img.spoonacular.com/ingredients_100x100/chicken-breasts.png" },
      { "id": 1041009, "name": "cheese", "aisle": "Cheese", "image": "https://img.spoonacular.com/ingredients_100x100/cheddar-cheese.png" }
    ]
  },
  {
    "id": 651225,
    "title": "Mashed Potatoes with Garlic, Sage & Goat Cheese",
    "image": "https://img.spoonacular.com/recipes/651225-312x231.jpg",
    "usedIngredientCount": 2,
    "missedIngredientCount": 2,
    "missedIngredients": [
      { "id": 11353, "name": "baking potatoes", "aisle": "Produce", "image": "https://img.spoonacular.com/ingredients_100x100/russet-or-idaho-potatoes.png" },
      { "id": 99226, "name": "sage", "aisle": "Spices and Seasonings", "image": "https://img.spoonacular.com/ingredients_100x100/fresh-sage.png" }
    ],
    "usedIngredients": [
      { "id": 11215, "name": "garlic", "aisle": "Produce", "image": "https://img.spoonacular.com/ingredients_100x100/garlic.png" },
      { "id": 1041009, "name": "cheese", "aisle": "Cheese", "image": "https://img.spoonacular.com/ingredients_100x100/cheddar-cheese.png" }
    ]
  },
  {
    "id": 648368,
    "title": "Jalapeno Queso With Goat Cheese",
    "image": "https://img.spoonacular.com/recipes/648368-312x231.jpg",
    "usedIngredientCount": 2,
    "missedIngredientCount": 2,
    "missedIngredients": [
      { "id": 11979, "name": "jalapeno pepper", "aisle": "Canned and Jarred", "image": "https://img.spoonacular.com/ingredients_100x100/jalapeno-pepper.png" },
      { "id": 6168, "name": "hot sauce", "aisle": "Condiments", "image": "https://img.spoonacular.com/ingredients_100x100/hot-sauce-or-tabasco.png" }
    ],
    "usedIngredients": [
      { "id": 1159, "name": "goat cheese", "aisle": "Cheese", "image": "https://img.spoonacular.com/ingredients_100x100/goat-cheese.jpg" },
      { "id": 11529, "name": "tomatoes", "aisle": "Produce", "image": "https://img.spoonacular.com/ingredients_100x100/tomato.png" }
    ]
  },
  {
    "id": 1674265,
    "title": "Easy Tomato Soup",
    "image": "https://img.spoonacular.com/recipes/1674265-312x231.jpg",
    "usedIngredientCount": 2,
    "missedIngredientCount": 2,
    "missedIngredients": [
      { "id": 1001, "name": "butter", "aisle": "Milk, Eggs, Other Dairy", "image": "https://img.spoonacular.com/ingredients_100x100/butter-sliced.jpg" },
      { "id": 6615, "name": "vegetable broth", "aisle": "Canned and Jarred", "image": "https://img.spoonacular.com/ingredients_100x100/chicken-broth.png" }
    ],
    "usedIngredients": [
      { "id": 11529, "name": "tomatoes", "aisle": "Produce", "image": "https://img.spoonacular.com/ingredients_100x100/tomato.png" },
      { "id": 11282, "name": "onion", "aisle": "Produce", "image": "https://img.spoonacular.com/ingredients_100x100/brown-onion.png" }
    ]
  },
  {
    "id": 999001,
    "title": "Simple Garlic Rice",
    "image": "https://img.spoonacular.com/recipes/716426-312x231.jpg",
    "usedIngredientCount": 3,
    "missedIngredientCount": 0,
    "missedIngredients": [],
    "usedIngredients": [
      { "id": 11215, "name": "garlic", "aisle": "Produce", "image": "https://img.spoonacular.com/ingredients_100x100/garlic.png" },
      { "id": 20444, "name": "rice", "aisle": "Pasta and Rice", "image": "https://img.spoonacular.com/ingredients_100x100/uncooked-white-rice.png" },
      { "id": 4053, "name": "olive oil", "aisle": "Oil, Vinegar, Salad Dressing", "image": "https://img.spoonacular.com/ingredients_100x100/olive-oil.jpg" }
    ]
  },
  {
    "id": 999002,
    "title": "Chicken Stir Fry with Bell Peppers",
    "image": "https://img.spoonacular.com/recipes/716408-312x231.jpg",
    "usedIngredientCount": 4,
    "missedIngredientCount": 1,
    "missedIngredients": [
      { "id": 16124, "name": "soy sauce", "aisle": "Condiments", "image": "https://img.spoonacular.com/ingredients_100x100/soy-sauce.jpg" }
    ],
    "usedIngredients": [
      { "id": 5062, "name": "chicken breast", "aisle": "Meat", "image": "https://img.spoonacular.com/ingredients_100x100/chicken-breasts.png" },
      { "id": 10211821, "name": "bell pepper", "aisle": "Produce", "image": "https://img.spoonacular.com/ingredients_100x100/bell-pepper-orange.png" },
      { "id": 11215, "name": "garlic", "aisle": "Produce", "image": "https://img.spoonacular.com/ingredients_100x100/garlic.png" },
      { "id": 11282, "name": "onion", "aisle": "Produce", "image": "https://img.spoonacular.com/ingredients_100x100/brown-onion.png" }
    ]
  }
];


function isOptionalAisle(aisle) {
    if (!aisle) return false;
    const a = aisle.toLowerCase();
    return a.includes('spice') || a.includes('season') ||
           a.includes('oil') || a.includes('vinegar') ||
           a.includes('baking') || a.includes('condiment');
}

function processRecipes(recipes) {
    const readyToCook = [];
    const shoppingRequired = [];

    for (const r of recipes) {
        const used = r.usedIngredients || [];
        const missed = r.missedIngredients || [];
        const requiredMissing = [];
        const optionalMissing = [];

        for (const m of missed) {
            if (isOptionalAisle(m.aisle)) {
                optionalMissing.push(m);
            } else {
                requiredMissing.push(m);
            }
        }

        if (requiredMissing.length <= 3) {
            const processed = {
                title: r.title,
                image: r.image,
                used: used,
                missing: requiredMissing,
                optional: optionalMissing
            };
            if (requiredMissing.length === 0) {
                readyToCook.push(processed);
            } else {
                shoppingRequired.push(processed);
            }
        }
    }

    return { readyToCook, shoppingRequired };
}

app.post("/get-recipes", async (req, res) => {
    const ingredients = req.body.ingredients;


    // Use test data instead of calling API
    const USE_TEST_DATA = true;

    if (USE_TEST_DATA) {
        const { readyToCook, shoppingRequired } = processRecipes(TEST_RECIPES);
        res.render("recipes.ejs", { readyToCook, shoppingRequired });
        return;
    }

    if (!ingredients) return res.status(400).send("No ingredients provided");

    const ingredientsString = Array.isArray(ingredients) ? ingredients.join(",") : ingredients;

    try {
        const response = await fetch(`https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(ingredientsString)}&number=20&ranking=2&apiKey=${SPOONACULAR_API_KEY}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Spoonacular API Error:", response.status, errorText);
            throw new Error(`Failed to fetch recipes: ${response.status}`);
        }
        
        const recipes = await response.json();
        console.log("=== SPOONACULAR RESPONSE ===");
        console.log(JSON.stringify(recipes, null, 2));
        console.log("=== END SPOONACULAR RESPONSE ===");
        const { readyToCook, shoppingRequired } = processRecipes(recipes);
        res.render("recipes.ejs", { readyToCook, shoppingRequired });
    } catch (error) {
        console.error("Error fetching recipes:", error);
    }
});