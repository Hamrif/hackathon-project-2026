# WHAT THE FRIDGE? website

A web application that helps you decide what to cook based on the ingredients you have. It identifies ingredients from images and the  suggests recipes.

## Features

Image Analysis: Upload a photo of your fridge or pantry and it fetches ingridients.

Manual Entry: Manually add or remove ingredients from your list.

Recipe Suggestions: Find recipes based on your current inventory.

Smart Sorting: Recipes are categorized into "Ready to Cook" (you have everything) and "Shopping Required" (you need a few more items).

## Prerequisites

Node.js installed

API Key for Google Gemini

API Key for Spoonacular

Installation

Clone the repository.

Install dependencies:
```bash
npm install
```
Create a .env file in the root directory with your API keys:

GEMINI_API_KEY=your_gemini_key
SPOONACULAR_API_KEY=your_spoonacular_key

## Usage

Start the server:
```bash
node index.js
```

Open your browser and navigate to:

http://localhost:3000/home

## Tech Stack

Backend: Node.js, Express.js

AI/ML: Google Generative AI (Gemini 2.5 Flash)

Data: Spoonacular API

Frontend: EJS, HTML, CSS, JavaScript

Frontend Architecture

The application uses EJS (Embedded JavaScript Templates) to render dynamic UI pages on the server. This keeps the frontend lightweight while allowing backend data to be injected directly into views.

## View Templates

The UI is composed of three primary EJS pages:

home.ejs
The landing page where users can upload images for ingredient detection or navigate through the app.

ingredients.ejs
Displays detected ingredients and allows manual modification of the ingredient list.

recipes.ejs
Shows recipe suggestions categorized by availability ("Ready to Cook" vs "Shopping Required").

Each view is rendered via Express routes and receives dynamic data through template variables.

## Styling Structure

Frontend styling is separated into multiple CSS files for modularity and maintainability:

style.css – Global layout & base styles

style2.css – Ingredient page styling

style3.css – Home page styling

This separation avoids large monolithic stylesheets and reduces unintended styling conflicts.

## UI Behavior

The frontend relies on vanilla JavaScript for client-side interactions such as:

Updating ingredient lists dynamically

Handling form submissions

DOM manipulation

Display logic for recipe categories

No heavy frontend frameworks are used, keeping performance fast and the architecture simple.

## Rendering Flow

User performs an action (upload image / modify ingredients).

Request is sent to the Express backend.

Backend processes AI/API calls.

Processed data is passed into an EJS template.

HTML is generated server-side and returned to the browser.

This model avoids complex client-side state management.

## Modifying the Frontend

When updating the UI:

Edit the relevant .ejs file for layout/content changes.

Update only the associated CSS file when possible.

Keep business logic inside Express routes rather than EJS.

Scope CSS rules to page-specific classes to prevent conflicts.