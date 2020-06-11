const express = require("express");
const bodyParser = require("body-parser");
const methodOverride = require('method-override');
const cookieSession = require('cookie-session');

const { getUserByEmail, generateRandomString, authenticateUser, urlsForUser, isLoggedIn  } = require("./helpers.js");

const bcrypt = require('bcrypt');
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('X-HTTP-Method-Override'));

app.use(cookieSession({
  name: 'session',
  //secret keys for cookie encryption
  keys: ['super-secret-key', 'key2']
}));
// databases
let urlDatabase = {};
let users = {};

//routing
app.get("/", (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    res.redirect("/login");
  } else {
    res.redirect("/urls");
  }
});

app.get("/urls", (req, res) => {
  const userId = req.session.userId;
  if (!isLoggedIn(req.session)) {
    res.status(403).send("Please login or register first.");
  } else {
    const userDatabase = urlsForUser(userId, urlDatabase);
    let templateVars = {
      userId,
      urls: userDatabase,
      users,
    };
    res.render("urls_index", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    userId: req.session.userId,
    users,
  };
  if (templateVars.userId) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = urlDatabase[req.params.shortURL];
  if (!isLoggedIn(req.session)) {
    res.status(403).send("Please login or register first.");
  } else if (!shortURL) {
    res.status(403).send("The short URL enetered is not valid");
  } else {
    const longUrl = shortURL.longURL;
    let templateVars = {
      userId: req.session.userId,
      shortURL: req.params.shortURL,
      longURL: longUrl,
      users,
    };
    res.render("urls_show", templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = urlDatabase[req.params.shortURL];
  if (shortURL) {
    const longURL = shortURL.longURL;
    res.redirect(longURL);
  } else {
    res.status(403).send("The short URL is not valid.");
  }
});

app.get("/register", (req, res) => {
  if (!isLoggedIn(req.session)) {
    let templateVars = {
      userId: req.session.userId,
      users,
    };
    res.render("register", templateVars);
  } else {
    res.redirect('/urls');
  }
});

app.get("/login", (req, res) => {
  if (!isLoggedIn(req.session)) {
    let templateVars = {
      userId: req.session.userId,
      users,
    };
    res.render("login", templateVars);
  } else {
    res.redirect('/urls');
  }
});

app.post("/urls/:id", (req, res) => {
  const userId = req.session.userId;
  const shortURL = req.params.id;
  if (userId === urlDatabase[shortURL].userID) {
    const newURL = req.body.newURL;
    urlDatabase[shortURL] = {
      longURL: newURL,
      userID: req.session.userId,
    };
    res.redirect(`/urls/`);
  } else {
    res.status(403).send("The short URL is not valid.");
  }
});

app.post("/urls", (req, res) => {
  const randomString = generateRandomString();
  urlDatabase[randomString] = {
    longURL: req.body.longURL,
    userID: req.session.userId,
  };
  res.redirect(`/urls/${randomString}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.session.userId;
  const shortURL = req.params.shortURL;
  if (userId === urlDatabase[shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls/");
  }
});

app.post("/register", (req, res) => {
  const userId = generateRandomString();
  const email = req.body.email;
  //looking up useder based on email
  const user = getUserByEmail(email, users);
  if (email === "" || req.body.password === "") {
    res.status(403).send("user or password were empty!");
  } else if (!user) {
    users[userId] = {
      id: userId,
      email,
      hashedPassword: bcrypt.hashSync(req.body.password, 10),
    };
    //setting the cookie in the users browser
    req.session['userId'] = userId;
    res.redirect("/urls");
  } else {
    res.status(403).send("user is already registered!");
  }
});

app.post("/login", (req, res) => {
  //extract info from form with req.body from the login page!
  const email = req.body.email;
  const password = req.body.password;

  const userId = authenticateUser(email, password, users);
  if (userId) {
    //set cookie with user id
    req.session['userId'] = userId;
    res.redirect("/urls");
  } else {
    //user is not authenticated => error msg
    res.status(403).send("password or email are incorrect!");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



