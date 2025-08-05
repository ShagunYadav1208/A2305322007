const express = require("express")
const fileSystem = require("fs")
const rimraf = require("rimraf")
const crypto = require("crypto")
const path = require("path")
const fs = require("fs").promises
const app = express()
const cors = require("cors")
const http = require("http").createServer(app)
const formidable = require("express-formidable")
const bcrypt = require("bcrypt")
const nodemailer = require("nodemailer")
const { nanoid } = require('nanoid');

const { MongoClient, ObjectId} = require("mongodb")
const session = require("express-session")

const mainURL = "http://localhost:1700"

const mongoURL = "mongodb://localhost:27017"
const databaseName = "URLShortner"

let database

const nodemailerForm = "shagunyadav1208@gmail.com"
const nodemailerObject = {
    service: "gmail",
    host: "smtp.gmail.com",
    prot: 456,
    secure: true,
    auth: {
        user: "shagunyadav1208test@gmail.com",
        pass: "egkpbcgomxeglkso"
    }
}

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}))

app.use("/public", express.static(__dirname + "/public"))

app.use(session({
    secret: "secret key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}))

app.use(formidable())

async function startServer(){
    try{
        const client = await MongoClient.connect(mongoURL)
        database = client.db(databaseName)
        console.log("Database Connected")

        app.get("/api/session-info", (req, res) => {
            res.json({
                mainURL: mainURL,
                isLogin: typeof req.session.user !== "undefined",
                user: req.session.user || null,
                session: req.session || {}
            })
        })

        app.post("/Register", async(req, res) => {
            const { name, email, password, frontendURL } = req.fields

            //Generate verification token
            const verification_token = Date.now()
            const user = await database.collection("users").findOne({ email })

            if(!user){
                const hash = await bcrypt.hash(password, 10)

                await database.collection("users").insertOne({
                    name,
                    email,
                    password: hash,
                    reset_token: "",
                    uploaded: [],
                    sharedWithMe: [],
                    isVerified: false,
                    verification_token
                })

                const transporter = nodemailer.createTransport(nodemailerObject)

                const verificationURL = `${frontendURL}/verifyEmail/${email}/${verification_token}`
                const html = `Please verify your account by clicking the following link: <br><br> <a href = "${verificationURL}">Confirm Email </a> <br><br> Thank You.`

                await transporter.sendMail({
                    from: nodemailerForm,
                    to: email,
                    subject: "Email Verification",
                    text: `Please verify your account by clicking the following link: ${verificationURL}`,
                    html: html
                })

                return res.json({
                    success: true,
                    message: "Signed up successfully. An email has been sent to verify your account."
                })
            }
            else{
                return res.json({
                    success: false,
                    message: "Email already exists."
                })
            }
        })

        app.get("/verifyEmail/:email/:verification_token", async(req, res) => {
            const email = req.params.email
            const verification_token = parseInt(req.params.verification_token)

            const user = await database.collection("users").findOne({ email, verification_token })

            if(!user){
                return res.json({
                    success: false,
                    message: "Email does not exist or verification link is expired."
                })
            }
            
            await database.collection("users").updateOne({ email, verification_token }, { $set: { verification_token: "", isVerified: true } })

            return res.json({
                success: true,
                message: "Account has been verified. Please Login."
            })
        })

        app.post("/Login", async(req, res) => {
            const { email, password } = req.fields

            const user = await database.collection("users").findOne({ email })

            if(!user){
                return res.json({
                    success: false,
                    message: "Email does not exist."
                })
            }

            const isPasswordCorrect = await bcrypt.compare(password, user.password)

            if(!isPasswordCorrect){
                return res.json({
                    success: false,
                    message: "Password is incorrect."
                })
            }

            if(!user.isVerified){
                return res.json({
                    success: false,
                    message: "Please verify your email before Logging in."
                })
            }

            req.session.user = user
            return res.json({
                user: user,
                success: true
            })
        })

        app.get("/Logout", (req, res) => {
            req.session.destroy()
            res.json({
                success: true
            })
        })

        app.post("/SendRecoveryLink", async(req, res) => {
            const { email, frontendURL } = req.fields
            
            const user = await database.collection("users").findOne({ email })

            if(!user){
                return res.json({
                    success: false,
                    message: "Email does not exist."
                })
            }

            const reset_token = new Date().getTime()

            await database.collection("users").updateOne({ email }, { $set: { reset_token } })

            const transporter = nodemailer.createTransport(nodemailerObject)

            const text = `Please click the following link to reset your password: ${frontendURL}/ResetPassword/${email}/${reset_token}`
            const html = `Please click the following link to reset your password: <br><br> <a href = "${frontendURL}/ResetPassword/${email}/${reset_token}">Reset Password</a> <br><br> Thank you.`

            transporter.sendMail({
                from: nodemailerForm,
                to: email,
                subject: "Reset Password",
                text,
                html
            }, (error, info) => {
                if(error){
                    console.error(error)
                    return res.json({
                        success: false,
                        message: "Could not send email. Please try again."
                    })
                }
                else{
                    console.log("Email sent: " + info.response)
                    return res.json({
                        success: true,
                        message: "Email has been sent with the link to recover the password."
                    })
                }
            })
        })

        app.post("/ResetPassword", async(req, res) => {
            const { email, reset_token, password } = req.fields

            const user = await database.collection("users").findOne({ email, reset_token: parseInt(reset_token) })

            if(!user){
                return res.json({
                    success: false,
                    message: "Recovery Link is invalid or expired.",
                    redirectTo: "forgotPassword"
                })
            }

            const hash = await bcrypt.hash(password, 10)

            await database.collection("users").updateOne(
                { email, reset_token: parseInt(reset_token) },
                { $set: { password: hash, reset_token: "" } }
            )

            return res.json({
                success: true,
                message: "Password has been changed. Please login again.",
                redirectTo: "loginRegister"
            })
        })

        // app.post("/api/shorten-url", async (req, res) => {
        //     const { longUrl } = req.fields;

        //     if (!longUrl || typeof longUrl !== "string") {
        //         return res.status(400).json({ success: false, message: "Invalid URL" });
        //     }

        //     // Check if URL already exists
        //     let existing = await database.collection("shortUrls").findOne({ longUrl });
        //     if (existing) {
        //         return res.json({
        //             success: true,
        //             shortUrl: `${mainURL}/${existing.shortId}`
        //         });
        //     }

        //     const shortId = nanoid(7);
        //     await database.collection("shortUrls").insertOne({
        //         longUrl,
        //         shortId,
        //         createdAt: new Date()
        //     });

        //     return res.json({
        //         success: true,
        //         shortUrl: `${mainURL}/${shortId}`
        //     });
        // });

        app.post("/api/shorten-url", async (req, res) => {
            const { longUrl } = req.fields;

            if (!longUrl || typeof longUrl !== "string") {
                return res.status(400).json({ success: false, message: "Invalid URL" });
            }

            try {
                // Check if long URL already exists
                const existing = await database.collection("shortUrls").findOne({ longUrl });
                if (existing) {
                    return res.json({
                        success: true,
                        shortUrl: `${mainURL}/${existing.shortId}`,
                        longUrl: existing.longUrl
                    });
                }

                // Generate new short ID
                const shortId = nanoid(7);

                // Save to DB
                await database.collection("shortUrls").insertOne({
                    longUrl,
                    shortId,
                    createdAt: new Date()
                });

                return res.json({
                    success: true,
                    shortUrl: `${mainURL}/${shortId}`,
                    longUrl
                });
            } catch (err) {
                console.error(err);
                return res.status(500).json({ success: false, message: "Server error" });
            }
        });

        app.get("/:shortId", async (req, res) => {
            const { shortId } = req.params;

            try {
                const entry = await database.collection("shortUrls").findOne({ shortId });

                if (!entry) {
                    return res.status(404).send("Short URL not found");
                }

                return res.redirect(entry.longUrl);
            } catch (err) {
                console.error("Redirection error:", err);
                return res.status(500).send("Server error");
            }
        });

        http.listen(1700, () => {
            console.log("Server Started at " + mainURL)
        })
    }
    catch(err){
        console.error("Error connecting to database: ", err)
    }
}

startServer()