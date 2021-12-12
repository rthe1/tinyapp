const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))
const bcrypt = require('bcryptjs');

const PORT = 8080;
// --HELPER FUNCTIONS
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

const urlsForUsers = (database, id) => {
  let output = {};
  for (const shortURL in database) {
    if (database[shortURL].userID === id) {
      output[shortURL] = database[shortURL]

    }

  }
  return output
};

app.set("view engine", "ejs");


// --DATABASES
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "admin"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

const userDatabase = {
  "admin": {
    id: "admin",
    email: "1@1.com",
    password: "$2a$10$c6yLtCtF828CiwmG0LX1Kua.EHY2b61eJAkHhxy6yao2Nc1gZcone"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

// --POST SECTION

// Adds new url to database
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  let id = generateRandomString();
  if (!req.session.user_id) {
    return res.status(403).send('You need to be logged in to add new links!')
  }
  urlDatabase[id] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
  };
  res.redirect(`/urls/${id}`);         // Respond with 'Ok' (we will replace this)
});
// dDletes url
app.post("/urls/:shortURL/delete", (req, res) => {
  const isAuthourized = urlDatabase[req.params.shortURL].userID === req.session.user_id;

  if (!isAuthourized) {
    return res.status(403).send("You are not authorized to delete this link!")
  }

  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls")
})
// Edits urls
app.post("/urls/:shortURL", (req, res) => {

  const isAuthourized = urlDatabase[req.params.shortURL].userID === req.session.user_id;

  if (!isAuthourized) {

    return res.status(403).send('YOu are not authorized to edit this link!')

  }


  urlDatabase[req.params.shortURL].longURL = req.body.longURL
  res.redirect("/urls")
})
// Add new user
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
    password: bcrypt.hashSync(password, 10)
  };




  req.session.user_id = id;

  res.redirect("/urls")

})
// Allows existing user to login
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = checkEmail(email);


  if (!user) {
    return res.status(403).send("User Does Not Exist")
  }

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send('Password Is Incorrect!')
  }

  req.session.user_id = user.id;

  res.redirect("/urls");
})
// Deletes cookie
app.post('/logout', (req, res) => {

  delete req.session.user_id
  res.redirect("/urls")

})




// GET SECTION

// Home page
app.get("/", (req, res) => {
  res.redirect("/urls");
});

// Register page
app.get("/register", (req, res) => {
  const templateVars = {
    user: userDatabase[req.session.user_id],
  };

  res.render("register", templateVars)
});

// Login page
app.get("/login", (req, res) => {
  const templateVars = {
    user: userDatabase[req.session.user_id],
  };


  res.render("login", templateVars)
});

// Displays URLS user owns
app.get("/urls", (req, res) => {




  if (!req.session.user_id) {
    res.redirect("/login");
  }

  console.log(req.session.user_id)
  const templateVars = {
    urls: urlsForUsers(urlDatabase, req.session.user_id),
    user: userDatabase[req.session.user_id],
  };

  res.render("urls_index", templateVars);
});

// Add URLS to datatbase
app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  }

  const templateVars = {
    user: userDatabase[req.session.user_id],
  };
  res.render("urls_new", templateVars);
});

// Shortened link route
app.get("/u/:shortURL", (req, res) => {
  // const longURL = ...

  const longURL = urlDatabase[req.params.shortURL].longURL
  console.log(req.params.shortURL)
  res.redirect(longURL);
});

// URL edit page
app.get("/urls/:shortURL", (req, res) => {

  const isAuthourized = urlDatabase[req.params.shortURL].userID === req.session.user_id;

  if (!req.session.user_id || !isAuthourized) {
    res.redirect("/urls");
  }

  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: userDatabase[req.session.user_id],
  };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});