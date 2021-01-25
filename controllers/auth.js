const User = require('../models/user');
const bcrypt = require('bcryptjs');
const nodeMailer = require('nodemailer');
const sendGrid = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');
const { use } = require('../routes/shop');

const transporter = nodeMailer.createTransport(sendGrid({
    auth: {
        api_key: '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',
    }
}));

exports.getLogin = (req, res, next) => {
    let message = req.flash('error');
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: message
    });
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const pass = req.body.password;
    User.findOne({ email: email }).then(user => {
        if (!user) {
            req.flash('error', 'Invalid email or password');
            return res.redirect('/login');
        }

        bcrypt.compare(pass, user.password)
            .then(doMatch => {
                if (doMatch) {
                    req.session.isLoggedIn = true;
                    req.session.user = user;
                    return req.session.save(err => {
                        console.log(err);
                        res.redirect("/");
                    });
                }
                req.flash('error', 'Invalid email or password');
                res.redirect("/login");
            })
            .catch(err => {
                console.log(err);
                res.redirect("/login");
            })
    })
        .catch(err => console.log(err));

}

exports.postLogout = (req, res, next) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
}

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    User.findOne({ email: email })
        .then(userDoc => {
            if (userDoc) {
                req.flash('error', 'Email exists, try a different one');
                return res.redirect('/signup');
            }
            bcrypt.hash(password, 12)
                .then(hashedPwd => {
                    const user = new User({
                        email: email,
                        password: hashedPwd,
                        cart: { items: [] },
                        name: 'Joker'
                    });
                    return user.save();
                })
                .then(result => {
                    transporter.sendMail({
                        to: email,
                        from: 'shop@nodecourse.com',
                        subject: 'Sign up Succeeded',
                        html: '<h1>yoy signed in to our site</h1>'
                    });
                    res.redirect('/login');
                })

        })
        .catch(err => {
            console.log(err);
        });
};

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: req.flash('error')
    });
};

exports.getReset = (req, res, next) => {
    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset Password',
        errorMessage: req.flash('error')
    });
};

exports.postReset = (req, res, next) => {
    let email = req.body.email;
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err);
            return res.redirect('/reset');
        }
        const token = buffer.toString('hex');
        console.log("token:",token);
        User.findOne({ email: email }).then(
            user => {
                if (!user) {
                    req.flash('error', 'No account with that email');
                    return res.redirect('/reset');
                }

                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 36000000;
                return user.save();

            }).then(result => {
                res.redirect('/login');
                console.log(token);
                transporter.sendMail({
                    to: email,
                    from: 'shop@nodecourse.com',
                    subject: 'Password Reset',
                    html: `
                    <p>You requested a password Reset</p>
                    <p>Click on this <a href="http://localhost:3000/reset/${token}">link</a> to set a new Password</p>
                    `
                });
            })
            .catch(err => console.log(err));
    });
};

exports.getNewPassword = (req,res,next)=>{

    const token = req.params.token;
    User.findOne({ resetToken : token, resetTokenExpiration : {
        $gt : Date.now()
    } }).then( user => {

        if(!user){
            console.log("don't exists");
            req.flash("error","Expired Token, try to recover password again");
            return res.redirect('/reset');
        }

        res.render('auth/new-password', {
            path: '/new-password',
            pageTitle: 'New Password',
            errorMessage: req.flash('error'),
            userId : user._id.toString(),
            passwordToken : token
        });
    }).catch( err => console.log(err)  );
};

exports.postNewPassword = (req,res, next)=>{
    let password = req.body.password;
    let userId = req.body.userId;
    let passwordToken = req.body.passwordToken;
    let currentUser;

    User.findOne({ _id : userId, resetToken : passwordToken, resetTokenExpiration : {
        $gt : Date.now()
    } })
    .then( user => {
        currentUser = user;
        return bcrypt.hash(password, 12)
    })
    .then( hashed =>{
        currentUser.password = hashed;
        currentUser.resetToken = undefined;
        currentUser.resetTokenExpiration = undefined;
        return currentUser.save();
    } )
    .then( resuilt =>{
        res.redirect('/login');
    })
    .catch()



}

