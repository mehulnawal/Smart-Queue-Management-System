import dotenv from 'dotenv';
import app from '../app.js';
dotenv.config();

const PORT = process.env.PORT || 9000

app.listen(PORT, (error) => {
    if (error)
        return console.log(`Error in starting server - ${error}`);

    return console.log(`Server running → http://localhost:${PORT}`);
});