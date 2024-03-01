const users = require("../model/UserModel")
const bcrypt = require("bcrypt")
var nodemailer = require("nodemailer")

const userCreatedHTML = `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to JayGarments</title>
  <style>
    /* Styles for the email body */
    body {
      font-family: Arial, sans-serif;
      background-color: #f0f0f0;
      margin: 0;
      padding: 0;
      text-align: center;
    }

    /* Styles for the email container */
    .container {
      max-width: 600px;
      margin: 20px auto;
      padding: 20px;
      background-color: #ffffff;
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }

    /* Styles for the header */
    .header {
      background-color: #007bff;
      color: #ffffff;
      padding: 20px;
      border-radius: 10px 10px 0 0;
    }

    /* Styles for the welcome message */
    .welcome-message {
      font-size: 24px;
      margin-bottom: 20px;
    }

    /* Styles for the button */
    .button {
      margin-left:auto;
      margin-right:auto;
      display: inline-block;
      padding: 10px 20px;
      background-color: #007bff;
      color: #ffffff;
      text-decoration: none;
      border-radius: 5px;
      transition: background-color 0.3s ease;
    }

    .button:hover {
      background-color: #0056b3;
    }
  </style>
</head>

<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to JayGarments</h1>
    </div>
    <div class="content">
      <p class="welcome-message">Welcome to JayGarments! We're excited to have you on board.</p>
      <a href="${process.env.WEBSITE_LINK}" class="button">Visit Our Website</a>
    </div>
  </div>
</body>

</html>
`

const loginDetectedHTML = `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Detected</title>
    <style>
        /* Styles for the email body */
        body {
            font-family: Arial, sans-serif;
            background-color: #f0f0f0;
            margin: 0;
            padding: 0;
            text-align: center;
        }

        /* Styles for the email container */
        .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        /* Styles for the header */
        .header {
            background-color: #007bff;
            color: #ffffff;
            padding: 20px;
            border-radius: 10px 10px 0 0;
        }

        /* Styles for the message */
        .message {
            font-size: 18px;
            margin-bottom: 20px;
        }

        /* Styles for the button */
        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #007bff;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            transition: background-color 0.3s ease;
        }

        .button:hover {
            background-color: #0056b3;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h1>Login Detected</h1>
        </div>
        <div class="content">
            <p class="message">Hello , your account was logged in from a device.</p>
            <p>If this was you, you can safely ignore this email.</p>
            <p>If you did not perform this action, please secure your account immediately.</p>
            <a href="${process.env.WEBSITE_LINK}" class="button">Visit Our Website</a>
        </div>
    </div>
</body>

</html>
`

const passwordRestSuccessful = `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Change Successful</title>
    <style>
        /* Styles for the email body */
        body {
            font-family: Arial, sans-serif;
            background-color: #f0f0f0;
            margin: 0;
            padding: 0;
            text-align: center;
        }

        /* Styles for the email container */
        .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        /* Styles for the header */
        .header {
            background-color: #007bff;
            color: #ffffff;
            padding: 20px;
            border-radius: 10px 10px 0 0;
        }

        /* Styles for the message */
        .message {
            font-size: 18px;
            margin-bottom: 20px;
        }

        /* Styles for the button */
        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #007bff;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            transition: background-color 0.3s ease;
        }

        .button:hover {
            background-color: #0056b3;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h1>Password Change Successful</h1>
        </div>
        <div class="content">
            <p class="message">Hello, your password has been successfully changed.</p>
            <p>If you did not perform this action, please secure your account immediately.</p>
            <a href="${process.env.WEBSITE_LINK}" class="button">Visit Our Website</a>
        </div>
    </div>
</body>

</html>
`

const sendMail = (email, subject, html) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_ID,
            pass: process.env.PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_ID,
        to: email,
        subject: subject,
        html: html
    };

    transporter.sendMail(mailOptions, function (error, info) {
        // if (error) {
        //     console.log(error);
        // } else {
        //     console.log('Email sent: ' + info.response);
        // }
    });
}

module.exports.createUser = async (req, res, next) => {
    const { name, phoneNumber, email, password } = req.body
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await users.findOne({ email: email })
    if (user) {
        res.send({
            msg: "User already exist with same Email"
        })
    }
    else {
        const data = await users.create({ name, phoneNumber, email, password: hashedPassword })
        const { _id, password, otp, expiry, ...info } = { ...data._doc }
        if (data) {
            sendMail(email, "New Account Created.", userCreatedHTML)
            res.send({ id: _id, ...info })
        }
        else {
            res.send({
                msg: "User not added"
            })
        }
    }
}

module.exports.getUser = async (req, res, next) => {
    try {
        const { email } = req.params
        const user = await users.findOne({ email: email })
        const { _id, password, otp, expiry, ...info } = { ...user._doc }
        res.send({ id: _id, ...info })
    } catch (err) {
        res.status(500).send({ msg: "Ereor in fetching user details!!" })
    }
}

module.exports.checkUser = async (req, res, next) => {
    const { email, password } = req.body
    const data = await users.findOne({ email: email })
    if (data) {
        if (await bcrypt.compare(password, data.password) == true) {
            const { _id, password, otp, expiry, ...info } = { ...data._doc }
            // sendMail(email, "Login Detected", loginDetectedHTML)
            res.send({ id: _id, ...info })
            return;
        }
        else {
            res.send({
                msg: "User not found"
            })
            return;
        }
    }
    else {
        res.send({
            msg: "User not found"
        })
        return;
    }
}

module.exports.resetPassword = async (req, res, next) => {
    try {
        const { email, oldPassword, newPassword } = req.body
        const data = await users.findOne({ email: email })
        if (data) {
            if (await bcrypt.compare(oldPassword, data.password) == true) {
                const newHashedPassword = await bcrypt.hash(newPassword, 10)
                const upadatedUser = await users.findOneAndUpdate(({ email: email }, { $set: { password: newHashedPassword } }))
                const { _id, password, otp, expiry, ...info } = { ...upadatedUser._doc }
                sendMail(email, "Password Changed Successfully!!", passwordRestSuccessful)
                res.send({ id: _id, ...info })
                return;
            }
            else {
                throw ("Wrong Old Password")
                return;
            }
        }
        else {
            throw ("User not found")
            return;
        }
    } catch (err) {
        res.status(500).send({
            msg: err
        })
    }
}

const generateRandomOTP = (length) => {
    const digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < length; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
};

module.exports.generateOTP = async (req, res, next) => {
    try {
        const { email } = req.body
        const data = await users.findOne({ email: email })
        if (data) {
            const otp = generateRandomOTP(10)
            const setOPT = await users.findOneAndUpdate({ email: email }, { $set: { otp: otp, expiry: new Date(Date.now() + 5*60*1000) } })
            const otpHTML = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>OTP Verification</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f5f5f5;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 20px auto;
                        padding: 20px;
                        background-color: #ffffff;
                        border-radius: 10px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    }
                    .header {
                        background-color: #007bff;
                        color: #ffffff;
                        padding: 20px;
                        border-radius: 10px 10px 0 0;
                    }
                    .content {
                        padding: 20px;
                    }
                    .otp-container {
                        margin-top: 20px;
                        padding: 20px;
                        background-color: #f9f9f9;
                        border-radius: 5px;
                    }
                    .otp-text {
                        font-size: 18px;
                        margin-bottom: 10px;
                    }
                    .otp-code {
                        font-size: 24px;
                        font-weight: bold;
                        color: #007bff;
                    }
                </style>
            </head>
            <body>
                    <div class="container">
                        <div class="header">
                            <h1>OTP Verification</h1>
                        </div>
                        <div class="content">
                            <p class="otp-text">Your OTP for verification:</p>
                            <div class="otp-container">
                                <p class="otp-code">${otp}</p>
                            </div>
                            <p class="otp-text">This OTP is valid for 5 minutes. Please do not share it with anyone.</p>
                        </div>
                    </div>
            </body>
            </html>
            `
            sendMail(email, "Verification OTP",otpHTML)
            if (setOPT) {
                res.json(true);
                return;
            }
            else {
                throw ("Error Generating OTP");
                return;
            }
        }
        else {
            throw ("User not found")
            return;
        }
    } catch (err) {
        res.status(500).send({
            msg: err
        })
    }
}

module.exports.forgotPassword = async (req, res, next) => {
    try {
        const { email , otp , password , confirmPassword } = req.body
        if(password!=confirmPassword){
            throw "Passwords dosen't match!!"
            return;
        }
        const user = await users.findOne({ email: email })
        if (user) {
            if(user.otp!=otp){
                throw new Error("Invalid OTP");
                return;
            }else if(user.expiry < new Date()){
                throw new Error("Expired OTP!! Generate OPT Again.");
                return;
            }else{
                const hashedPassword = await bcrypt.hash(password,5)
                const userUpadted  = await users.findOneAndUpdate({email:email},{$set:{password:hashedPassword,otp:null,expiry:null}})
                if(userUpadted){
                    res.json(true)
                    return;
                }
                else{
                    throw ("Error updating Pssword.")
                    return;
                }
            }
        }
        else {
            console.log(5)
            throw ("User not found")
            return;
        }
    } catch (err) {
        console.log(err.message)
        res.status(500).json({
            msg:err.message
        })
    }
}