import express from 'express'
import cookieparser from 'cookie-parser'
import cors from 'cors'




const app = express();

app.use(cors({
    origin: process.env.ORIGIN_URL
}))
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"))
app.use(cookieparser())

export { app };