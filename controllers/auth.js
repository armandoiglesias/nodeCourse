const User = require('../models/user');

exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isAuthenticated: req.session.user

    });
};

exports.postLogin = (req, res, next) => {
    User.findById("5ff61dc0f8df9732ec3cc7cd")
        .then(user => {
            console.log(user);
            req.session.isLoggedIn = true;
            req.session.user = user;
            req.session.save(err => {
                console.log(err);
                res.redirect("/");
            });
        })
        .catch(err => {
            console.log(err);
            res.redirect("/login");
        });

}

exports.postLogout = (req, res, next) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
}