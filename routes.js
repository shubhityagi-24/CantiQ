const { loginUser } = require("./auth");

function handleLogin(username, password) {
    return loginUser(username, password);
}

module.exports = { handleLogin };