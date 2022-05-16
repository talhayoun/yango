const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000


const { router: productsRouter } = require("./routers/products");

app.use(cors());
app.use(express.json());

app.use(productsRouter)

app.listen(port, () => {
    console.log(`Server connected port: ${port}`);
})