
import 'dotenv/config';
import connectDB from './db/db.js';
import { app } from './app.js';


// dotenv config removed (handled by import 'dotenv/config')

connectDB().then(() => {
    const port = process.env.PORT || 8000;
    app.listen(port, () => {
        console.log(`server running on port ${port}`)
    })
}).catch((error) => { console.log(error) })



