const  express=require("express");
const app=express();
const port=3000;
const path =require("path");




app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname,"public")));
app.set("views",path.join(__dirname,"views"));




app.listen(port,()=>{
    console.log(   `listening to port ${port}`);
});

app.get("/home",(req,res)=>{
 res.render("home.ejs");
});
