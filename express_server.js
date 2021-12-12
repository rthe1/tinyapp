const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))
const PORT = 8080;

const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 8);
};

const checkEmail = (email) => {

  for (const user in userDatabase) {

    if (email === userDatabase[user].email) {
      return userDatabase[user]
    }

  }
  return false;
}

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const userDatabase = {
  "admin": {
    id: "admin",
    email: "1@1.com",
    password: "123"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

// POST SECTION

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  let id = generateRandomString();
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`);         // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:shortURL/delete", (req, res) => {

  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls")
})

app.post("/urls/:shortURL", (req, res) => {

  urlDatabase[req.params.shortURL] = req.body.longURL
  res.redirect("/urls")
})

app.post("/register", (req, res) => {

  const id = generateRandomString()
  const email = req.body.email;
  const password = req.body.password;

  if (req.body.email === "" || req.body.password === "") {
    return res.status(403).send("Please Enter A UserName Or Password")
  }

  for (const user in userDatabase) {

    if (email === userDatabase[user].email) {
      return res.status(403).send("Email Provided Already Exists In Database Please Login")
    }
  }

  userDatabase[id] = {
    id: id,
    email: email,
    password: password
  };


  req.session.user_id = id;

  res.redirect("/urls")

})

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = checkEmail(email);

  if (!user) {
    return res.status(403).send("User Does Not Exist")
  }

  res.redirect("/urls");
})

app.post('/logout', (req, res) => {

  delete req.session.user_id
  res.redirect("/urls")

})




// GET SECTION

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: userDatabase[req.session.user_id],
  };

  res.render("register", templateVars)
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: userDatabase[req.session.user_id],
  };
  res.render("login", templateVars)
});


app.get("/urls", (req, res) => {
  console.log(req.session.user_id)
  const templateVars = {
    urls: urlDatabase,
    user: userDatabase[req.session.user_id],
  };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: userDatabase[req.session.user_id],
  };
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  // const longURL = ...
  const longURL = urlDatabase[req.params.shortURL]
  console.log(req.params.shortURL)
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: userDatabase[req.session.user_id],
  };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});