// Import packages, initialize an express app, and define the port you will use


const express = require("express");
const { body, validationResult } = require("express-validator");

const app = express();
const PORT = 3000;

// Enable JSON parsing
app.use(express.json());

const requestLogger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);

    if (req.method === "POST" || req.method === "PUT") {
        console.log("Request Body:", req.body);
    }

    next();
};
app.use(requestLogger);

// Data for the server
const menuItems = [
  {
    id: 1,
    name: "Classic Burger",
    description: "Beef patty with lettuce, tomato, and cheese on a sesame seed bun",
    price: 12.99,
    category: "entree",
    ingredients: ["beef", "lettuce", "tomato", "cheese", "bun"],
    available: true
  },
  {
    id: 2,
    name: "Chicken Caesar Salad",
    description: "Grilled chicken breast over romaine lettuce with parmesan and croutons",
    price: 11.50,
    category: "entree",
    ingredients: ["chicken", "romaine lettuce", "parmesan cheese", "croutons", "caesar dressing"],
    available: true
  },
  {
    id: 3,
    name: "Mozzarella Sticks",
    description: "Crispy breaded mozzarella served with marinara sauce",
    price: 8.99,
    category: "appetizer",
    ingredients: ["mozzarella cheese", "breadcrumbs", "marinara sauce"],
    available: true
  },
  {
    id: 4,
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with molten center, served with vanilla ice cream",
    price: 7.99,
    category: "dessert",
    ingredients: ["chocolate", "flour", "eggs", "butter", "vanilla ice cream"],
    available: true
  },
  {
    id: 5,
    name: "Fresh Lemonade",
    description: "House-made lemonade with fresh lemons and mint",
    price: 3.99,
    category: "beverage",
    ingredients: ["lemons", "sugar", "water", "mint"],
    available: true
  },
  {
    id: 6,
    name: "Fish and Chips",
    description: "Beer-battered cod with seasoned fries and coleslaw",
    price: 14.99,
    category: "entree",
    ingredients: ["cod", "beer batter", "potatoes", "coleslaw", "tartar sauce"],
    available: false
  }
];
let currentId = menuItems.length + 1; // start IDs after existing items
// Define routes and implement middleware here
// Middlware Validation
const validateMenuItem = [
    body("name")
        .isString().withMessage("Name must be a string")
        .isLength({ min: 3 }).withMessage("Name must be at least 3 characters"),

    body("description")
        .isString().withMessage("Description must be a string")
        .isLength({ min: 10 }).withMessage("Description must be at least 10 characters"),

    body("price")
        .isFloat({ gt: 0 }).withMessage("Price must be greater than 0"),

    body("category")
        .isIn(["appetizer", "entree", "dessert", "beverage"])
        .withMessage("Category must be appetizer, entree, dessert, or beverage"),

    body("ingredients")
        .isArray({ min: 1 }).withMessage("Ingredients must be an array with at least one item"),

    body("available")
        .optional()
        .isBoolean().withMessage("Available must be true or false"),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 400,
                errors: errors.array()
            });
        }
        next();
    }
];

// GET all menu items 
app.get("/api/menu", (req, res) => {
    res.status(200).json(menuItems);
});

// GET single menu item
app.get("/api/menu/:id", (req, res) => {
    const item = menuItems.find(m => m.id === parseInt(req.params.id));
    if (!item) return res.status(404).json({ status: 404, message: "Menu item not found" });
    res.status(200).json(item);
});

// POST new menu items
app.post("/api/menu", validateMenuItem, (req, res) => {
    const newItem = {
        id: currentId++,
        ...req.body,
        available: req.body.available ?? true
    };
    menuItems.push(newItem);
    res.status(201).json(newItem);
});

// PUT update menu items
app.put("/api/menu/:id", validateMenuItem, (req, res) => {
    const index = menuItems.findIndex(m => m.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ status: 404, message: "Menu item not found" });
  
    menuItems[index] = { id: menuItems[index].id, ...req.body };
    res.status(200).json(menuItems[index]);
});

// DELETE menu item 
app.delete("/api/menu/:id", (req, res) => {
    const index = menuItems.findIndex(m => m.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ status: 404, message: "Menu item not found" });

    menuItems.splice(index, 1);
    res.status(200).json({ message: "Menu item deleted successfully" });
});

// 404 fallback
app.use((req, res) => {
    res.status(404).json({ status: 404, message: "Endpoint not found" });
});

// 500 ISE log
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal server error" });
});

// Start server 
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


/* For POST request
  { 
  "name": "Grilled Salmon",
  "description": "Fresh salmon grilled to perfection with lemon butter",
  "price": 15.99,
  "category": "entree",
  "ingredients": ["salmon", "lemon", "butter"], // For POST request
  "available": true
}
  
For PUT request
  {
  "name": "Updated Burger",
  "description": "Beef burger with cheese and bacon",
  "price": 13.99,
  "category": "entree",
  "ingredients": ["beef", "cheese", "bacon", "bun"],
  "available": true
} */