const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

let users = {

};

app.get("/", (req, res) => {
  res.send("Hello!");
});
//works
app.get("/urls", (req, res) => {
  let templateVars = {
    username: req.cookies["userId"],
    urls: urlDatabase,
    users,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["userId"],
    users,
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const longUrl = urlDatabase[req.params.shortURL];
  let templateVars = {
    username: req.cookies["userId"],
    shortURL: req.params.shortURL,
    longURL: longUrl,
    users,
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
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
    username: req.cookies["userId"],
    users,
  }
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = {
    username: req.cookies["userId"],
    users,
  }
  res.render("login", templateVars);
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const newURL = req.body.newURL
  urlDatabase[shortURL] = newURL;
  res.redirect(`/urls/`);
});

app.post("/urls", (req, res) => {
  const randomString = generateRandomString()
  urlDatabase[randomString] = req.body.longURL;
  console.log("We are here now")
  res.redirect(`/urls/${randomString}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls/");
});

app.post("/register", (req, res) => {
  const userId = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const user = findUserByEmail(email);
  if (!user) {
    users[userId] = {
      userId,
      email,
      password,
    }
  } else {
    res.status(403).send("user is already registered!");
  }

  //setting the cookie in the users browser
  res.cookie("userId", userId);
  res.redirect("/urls");
});


app.post("/login", (req, res) => {
  //extract info from form with req.body from the login page!
  const email = req.body.email;
  const password = req.body.password;

  const userId = authenticateUser(email, password);
  if (userId) {
    //set cookie with user id
    //redirect to /urls
  } else {
    //user is not authenticated => error msg
  }
  //old:
  // res.cookie('user_id', req.body.user_id);
  // res.redirect("/urls/");
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
    if (user.email === email) {
      return true;
    }
  } return false;
};

const authenticateUser = (email, password) => {
  const user = findUserByEmail(email);
  if (user && user.password === password) {
    return user.id;
  }
  return false;
}



