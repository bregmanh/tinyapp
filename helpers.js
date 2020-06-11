const bcrypt = require('bcrypt');

function getUserByEmail(email, users) {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user].id;
    }
  } 
};
function generateRandomString() {
  let r = Math.random().toString(36).substring(2, 7);
  return r;
}

const authenticateUser = (email, passwordEntered, users) => {
  const user = getUserByEmail(email, users);
  if (user) {
    const hashedPassword = users[user].hashedPassword;
    if (user && bcrypt.compareSync(passwordEntered, hashedPassword)) {
      return users[user].id;
    }
  }
  return false;
}

function urlsForUser(userId, urlDatabase) {
  let result = {};
  for (let item in urlDatabase) {
    if (urlDatabase[item].userID === userId) {
      result[item] = urlDatabase[item];
    }
  }
  return result;
}

function isLoggedIn(cookieInfo) {
  const userId = cookieInfo.userId;
  if (userId) {
    return true;
  } else {
    return false;
  }
}

module.exports = { getUserByEmail, generateRandomString, authenticateUser, urlsForUser, isLoggedIn };