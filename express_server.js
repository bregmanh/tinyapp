const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

let urlDatabase = {};
let users = {};

app.get("/", (req, res) => {
  res.send("Hello!");
});
//works
app.get("/urls", (req, res) => {
  const userId = req.cookies["userId"];
  if (!userId) {
    res.redirect("/login");
  } else {
    const userDatabase = urlsForUser(userId);
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
    userId: req.cookies["userId"],
    users,
  }
  if (templateVars.userId) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login")
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const longUrl = urlDatabase[req.params.shortURL].longURL;
  let templateVars = {
    userId: req.cookies["userId"],
    shortURL: req.params.shortURL,
    longURL: longUrl,
    users,
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.get("/register", (req, res) => {
  let templateVars = {
    userId: req.cookies["userId"],
    users,
  }
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = {
    userId: req.cookies["userId"],
    users,
  }
  res.render("login", templateVars);
});

app.post("/urls/:id", (req, res) => {
  const userId = req.cookies["userId"]
  const shortURL = req.params.id;
  if (userId === urlDatabase[shortURL].userID) {
    const newURL = req.body.newURL
    urlDatabase[shortURL] = {
      longURL: newURL,
      userID: req.cookies["userId"],
    }
    res.redirect(`/urls/`);
  }
});

app.post("/urls", (req, res) => {
  const randomString = generateRandomString()
  urlDatabase[randomString] = {
    longURL: req.body.longURL,
    userID: req.cookies["userId"],
  }
  console.log(urlDatabase);
  res.redirect(`/urls/${randomString}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.cookies["userId"];
  const shortURL = req.params.shortURL;
  if (userId === urlDatabase[shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls/");
  }
});

app.post("/register", (req, res) => {
  const userId = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const user = findUserByEmail(email);
  if (email === "" || password === "") {
    res.status(403).send("user or password were empty!");
  } else if (!user) {
    users[userId] = {
      id: userId,
      email,
      password,
    }
    //setting the cookie in the users browser
    res.cookie("userId", userId);
    res.redirect("/urls");
  } else {
    res.status(403).send("user is already registered!");
  }
});

app.post("/login", (req, res) => {
  //extract info from form with req.body from the login page!
  const email = req.body.email;
  const password = req.body.password;

  const userId = authenticateUser(email, password);
  if (userId) {
    //set cookie with user id
    res.cookie("userId", userId);
    //redirect to /urls
    res.redirect("/urls");
  } else {
    //user is not authenticated => error msg
    res.status(403).send("password or email are incorrect!");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('userId');
  res.redirect("/urls/");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  let r = Math.random().toString(36).substring(2, 7);
  return r;
}
function findUserByEmail(email) {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user].id;
    }
  } return false;
};

const authenticateUser = (email, password) => {
  const user = findUserByEmail(email);
  if (user && users[user].password === password) {
    return users[user].id;
  }
  return false;
}

function urlsForUser(userId) {
  let result = {};
  for (let item in urlDatabase) {
    if (urlDatabase[item].userID === userId) {
      result[item] = urlDatabase[item];
    }
  }
  return result;
}

