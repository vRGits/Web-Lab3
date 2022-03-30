const fs = require('fs')
const path4444 = require('path')
const express = require('express')
const app444 = express()
const crypto = require('crypto')
const urlencodedParser = express.urlencoded({extended: false});
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

app444.use(cookieParser());
app444.use("/image", express.static('image'))
app444.use("/script", express.static('script'))
app444.use("/css", express.static('css'))

app444.get('/v1/authorization', function (req, res) {
    res.sendFile(__dirname + '/views/authorization.html')
});

const authorization = (req, res, next) => {
    const token = req.cookies.access_token;
    if (!token) {
        return res.status(403).sendFile(__dirname + '/views/403.html');
    }
    try {
        const bdata = jwt.verify(token, "YOUR_SECRET_KEY");
        req.userId = bdata.id;
        req.userRole = bdata.role;
        return next();
    } catch {
        return res.sendStatus(403);
    }
};
app444.get('/', function(req, res){
    res.sendFile(__dirname + '/views/index.html')
});

app444.post("/v1/authorization",
    urlencodedParser,
    function (req, res) {
        let sha1 = crypto.createHash('sha1')
        let hash = sha1.update(req.body.password).digest('hex')
        req.body.password = hash
        const token = jwt.sign({ id: 1, role: "admin" }, "YOUR_SECRET_KEY");
        return res
            .cookie("access_token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
            })
            .status(200)
            .redirect("/v1/cars")
});

app444.get("/v1/cars", authorization, (req, res) => {
    res.sendFile(__dirname + '/views/cars.html')
});

app444.get("/SignOut", authorization, (req, res) => {
    return res
        .clearCookie("access_token")
        .redirect('/')
});

app444.get('*', function(req, res){
    res.status(404).sendFile(__dirname + '/views/404.html')
});

app444.listen(8080)