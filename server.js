const express = require("express");
const path = require("path");

const app = express();

app.use(express.json());

const foods = [
    {
        id: 1,
        name: "Fresh Fruits",
        price: 30,
        category: "Healthy",
        allowed: true
    },
    {
        id: 2,
        name: "Sandwich",
        price: 60,
        category: "Snacks",
        allowed: true
    },
    {
        id: 3,
        name: "Fruit Juice",
        price: 40,
        category: "Drinks",
        allowed: true
    },
    {
        id: 4,
        name: "Chips",
        price: 20,
        category: "Snacks",
        allowed: true
    },
    {
        id: 5,
        name: "Soft Drinks",
        price: 35,
        category: "Drinks",
        allowed: false
    },
    {
        id: 6,
        name: "Milk",
        price: 25,
        category: "Drinks",
        allowed: true
    }
];

const purchases = [];

let balance = 5000;
let dailyLimit = 150;


// HEALTH
app.get("/api/health", (req, res) => {
    res.json({
        status: "CantiQ backend running"
    });
});


// GET FOODS
app.get("/api/foods", (req, res) => {
    res.json(foods);
});


// ADD FOOD
app.post("/api/foods", (req, res) => {

    const { name, price, category } = req.body;

    const newFood = {
        id: Date.now(),
        name,
        price: Number(price),
        category: category || "Other",
        allowed: false
    };

    foods.push(newFood);

    res.json(newFood);
});


// DELETE FOOD
app.delete("/api/foods/:id", (req, res) => {

    const id = Number(req.params.id);

    const index = foods.findIndex(food => food.id === id);

    if (index === -1) {
        return res.status(404).json({
            error: "Food not found"
        });
    }

    foods.splice(index, 1);

    res.json({
        success: true
    });
});


// CHANGE FOOD PERMISSION
app.post("/api/foods/:id/permission", (req, res) => {

    const id = Number(req.params.id);

    const food = foods.find(food => food.id === id);

    if (!food) {
        return res.status(404).json({
            error: "Food not found"
        });
    }

    food.allowed = Boolean(req.body.allowed);

    res.json(food);
});


// SAVE PARENT SETTINGS
app.post("/api/settings", (req, res) => {

    const { annualBalance, dailySpendingLimit } = req.body;

    if (annualBalance !== undefined) {
        balance = Number(annualBalance);
    }

    if (dailySpendingLimit !== undefined) {
        dailyLimit = Number(dailySpendingLimit);
    }

    res.json({
        balance,
        dailyLimit
    });
});


// GET PARENT SETTINGS
app.get("/api/settings", (req, res) => {

    res.json({
        balance,
        dailyLimit
    });
});


// MAKE PURCHASE
app.post("/api/purchases", (req, res) => {

    const { foodId } = req.body;

    const food = foods.find(item => item.id === Number(foodId));

    if (!food) {
        return res.status(404).json({
            error: "Food not found"
        });
    }

    if (!food.allowed) {
        return res.status(403).json({
            error: "Food is not allowed"
        });
    }

    if (balance < food.price) {
        return res.status(400).json({
            error: "Insufficient balance"
        });
    }

    const today = new Date().toDateString();

    const todaysPurchases = purchases.filter(
        purchase => purchase.date === today
    );

    const todaysSpending = todaysPurchases.reduce(
        (total, purchase) => total + purchase.price,
        0
    );

    if (todaysSpending + food.price > dailyLimit) {
        return res.status(400).json({
            error: "Daily spending limit exceeded"
        });
    }

    balance -= food.price;

    const purchase = {
        id: Date.now(),
        foodId: food.id,
        name: food.name,
        price: food.price,
        date: today,
        time: new Date().toLocaleTimeString()
    };

    purchases.push(purchase);

    res.json({
        success: true,
        purchase,
        balance
    });
});


// GET DASHBOARD DATA
app.get("/api/dashboard", (req, res) => {

    const today = new Date().toDateString();

    const todaysPurchases = purchases.filter(
        purchase => purchase.date === today
    );

    const todaysSpending = todaysPurchases.reduce(
        (total, purchase) => total + purchase.price,
        0
    );

    res.json({
        balance,
        dailyLimit,
        todaysSpending,
        todaysPurchases: todaysPurchases.length,
        purchases: todaysPurchases
    });
});


// SERVE FRONTEND
app.use(express.static(path.join(__dirname, "../frontend")));


// START SERVER
app.listen(3000, () => {
    console.log("CantiQ running on http://localhost:3000");
});