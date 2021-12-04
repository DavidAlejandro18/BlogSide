// @ts-check
const { Router } = require('express');
const router = Router();

router.get('/', (req, res) => {
    //res.send('Menú principal');
    res.render("index", {
        title: "BlogSide",
    });
});

router.get('/dashboard', (req, res) => {
    //res.send('Dashboard');
    res.render("dashboard", {
        title: "Dashboard",
        headerFrontendStatus: true
    });
});

router.get("/settings", (req, res) => {
    res.send("Settings");
});

router.get("/@:username?", (req, res) => {
    res.send('Usuario: '+ req.params.username);
});

router.get("/signout", (req, res) => {
    res.send('Cerramos sesión');
});


module.exports = router;