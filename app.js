const express = require("express");
const app = express();

const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const expressError = require("./utils/expressError.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter= require("./routes/review.js");
const userRouter = require("./routes/user.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");






app.set("view engine" , "ejs");
app.set("views" , path.join(__dirname,"views"));

app.use(express.urlencoded({extended :true}));
app.use(methodOverride("_method"));
app.engine('ejs' , ejsMate);

app.use(express.static(path.join(__dirname , "/public")));
main()
.then(()=>{
   console.log("connected to DB");
}).catch((err)=>{
console.log(err);
})


//sessions
const sessionOptions={
    secret:"mySuperSecretCode",
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()*7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    }
}

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
//use local to authenticate user
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.failure = req.flash("error");
    res.locals.currUser = req.user;
    next();
})

async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}



// app.get("/testListing" , (req,res)=>{
//     let newListing = new Listing({
//         title:"My Home",
//         description :"The Great Villa",
//         price:20000,
//         location:"Delhi",
//         country:"India",
//     })
//     console.log(newListing);
//     res.send("testingSuccessful");
// })

// app.get("/demoUser",async(req,res)=>{
//     const fakeUser = new User({
//        email:"abc@gmail.com",
//        username:"delta-student",
//     })

//     let newUser = await User.register(fakeUser , "helloworld");
//     res.send(newUser);

// })



app.use("/listings" , listingRouter);
app.use("/listings/:id/reviews" , reviewRouter);
app.use("/", userRouter);


app.get("/",(req,res)=>{
    res.send("connection successful");
})

app.use( (req , res , next)=>{
    next(new expressError(404 , "Page Not Found"));
})

app.use((err , req , res , next)=>{
    let {statusCode = 500, message="Something went wrong"} = err;
    res.status(statusCode).render("./listings/error.ejs" ,{err})
    // res.status(statusCode).send(message);
})


app.listen(8080 , ()=>{
    console.log("server is listening on port 8080");
})
