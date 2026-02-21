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

// --- YOUR ROUTES SHOULD ALL BE AT THIS TOP LEVEL ---

app.get("/home", (req, res) => {
    res.render("home.ejs");
});

// Updated to plural /ingredients to match your request
app.get("/ingredients", (req, res) => {
    // Pass an empty array initially so the page loads cleanly
    res.render("ingredients.ejs", { ingredients: [] });
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
        res.status(500).send("Error analyzing image");
    }
});

app.post("/get-recipes", async (req, res) => {
    const ingredients = req.body.ingredients;

    if (!ingredients) return res.status(400).send("No ingredients provided");

    const ingredientsString = Array.isArray(ingredients) ? ingredients.join(",") : ingredients;

    try {
        const response = await fetch(`https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(ingredientsString)}&number=10&apiKey=${SPOONACULAR_API_KEY}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Spoonacular API Error:", response.status, errorText);
            throw new Error(`Failed to fetch recipes: ${response.status}`);
        }
        
        const recipes = await response.json();
        res.render("recipes.ejs", { recipes: recipes });
    } catch (error) {
        console.error("Error fetching recipes:", error);
        res.status(500).send("Error fetching recipes");
    }
});