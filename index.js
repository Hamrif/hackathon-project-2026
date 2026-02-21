const express = require("express");
const multer = require("multer");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();
const app = express();
const port = 3000;
const path = require("path");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY; // Add this to your .env

const upload = multer({storage: multer.memoryStorage()});
const gemini_ai = new GoogleGenerativeAI(GEMINI_API_KEY);

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname,"public")));
app.set("views",path.join(__dirname,"views"));

app.listen(port, () => {
    console.log(`Listening to port ${port}`);
});

app.get("/home", (req, res) => {
    res.render("home.ejs");
});

app.post("/analyze-image", upload.single("image"), async (req, res) => {
    const file = req.file;
    console.log(GEMINI_API_KEY);
    if(!file) return res.status(400).send("No file uploaded");
    
    try {
        // 1. Setup Gemini
        const model = gemini_ai.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {responseMimeType: "application/json"}
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

        // 2. Get ingredients from Gemini
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const response_text = response.text();
        
        const ingredientsArray = JSON.parse(response_text);

        // 3. Format ingredients for Spoonacular (e.g., "eggs,+tomato,+cheese")
        const ingredientsString = ingredientsArray.join(",+");

        // 4. Fetch recipes from Spoonacular
        const spoonacularUrl = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredientsString}&number=5&apiKey=${SPOONACULAR_API_KEY}`;
        const recipeResponse = await fetch(spoonacularUrl);
        
        if (!recipeResponse.ok) {
            throw new Error(`Spoonacular API responded with status: ${recipeResponse.status}`);
        }

        const recipesData = await recipeResponse.json();

        // 5. Send both the detected ingredients and the suggested recipes back to the client
        res.json({
            detectedIngredients: ingredientsArray,
            suggestedRecipes: recipesData
        });

    } catch (error) {
        console.error("Error analyzing image or fetching recipes:", error);
        res.status(500).json({ error: "Failed to process image and generate recipes." });
    }
});