 require("dotenv").config();

const db_URL = process.env.ATLASDB_URL
const express = require("express"); //express framework helps create server and routes
const app = express(); //this is the main express application object

const mongoose = require("mongoose"); //mongoose connects node.js app with mongodb database
const path = require("path"); //path helps create correct file paths across OS
const methodOverride = require("method-override"); //allows put and delete requests through html forms
const ejsMate = require("ejs-mate"); //helps create layouts and boilerplates templates in ejs
const expressError = require("./utils/expressError.js");//custom error class for handling application specific errors

//Routes of different models
const listingRouter = require("./routes/listing.js");
const reviewRouter= require("./routes/review.js");
const userRouter = require("./routes/user.js");

const session = require("express-session");
const {MongoStore} = require("connect-mongo"); 
;//stores user session data between requests
const flash = require("connect-flash");//stores temporary messages in session to display after redirects
const passport = require("passport"); //passport handles user authentication
const LocalStrategy = require("passport-local"); //passport local authenticates user using username and password
const User = require("./models/user.js"); //User Model defines structure and rules for user  documents in mongoDB






app.set("view engine" , "ejs"); //ejs is set a default veiw engine
app.set("views" , path.join(__dirname,"views"));//sets absolute path for views folder

app.use(express.urlencoded({extended :true})); //parse form data and store it in req.body
app.use(methodOverride("_method"));//converts post request into put or delete uding query parameter
app.engine('ejs' , ejsMate);//use ejs mate with ejs

app.use(express.static(path.join(__dirname , "/public"))); //serves static file like css js and images

//when app starts -> main() runs->mongoose.connect() tries connecting database -> if(success)then() -> if (failure)catch()
main()
.then(()=>{
   console.log("connected to DB");
}).catch((err)=>{
console.log(err);
})

const store = MongoStore.create({
    mongoUrl: db_URL,
    crypto:{
        secret: process.env.SECRET
    },
    touchAfter:24*3600,
})

store.on("error",()=>{
    console.log("error",err);
})
//sessions - these are used in passport 
const sessionOptions={
    store:store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()*7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    }
}




app.use(session(sessionOptions)); //middleware which sets up session for each request
app.use(flash());//middleware which helps store message in session

app.use(passport.initialize());//initializes passport authentication middleware
app.use(passport.session());//restores loggin-in user from session on each request
//use local to authenticate user
passport.use(new LocalStrategy(User.authenticate()));//authenticates user using username and password

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.failure = req.flash("error");
    res.locals.currUser = req.user;
    next();
})


async function main(){
    await mongoose.connect(db_URL);
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
