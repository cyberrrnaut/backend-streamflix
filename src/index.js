import dotenv from "dotenv"
import connectDB from "./db/index.js"

dotenv.config({
    path: './env'
})

connectDB()             //async function returns a promise
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running at port  ${process.env.PORT }`);
    })
})
.catch((error)=>{
    console.log("Database connection error:",error);
}) 