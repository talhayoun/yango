const express = require("express");
const axios = require("axios").default;
const productEndpoints = require("../models/apis/product-endpoint");
const {
    convertSchemaToYangoSchema,
    getCategoryId,
    extractBinaryData,
    uploadImage,
} = require("../models/utils/convertSchema");
const router = express.Router();
const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;

const { API_BASE_URL, API_USER, API_PASS, AUTH_TOKEN } = process.env;

const axiosInstance = axios.create({
    baseURL: "https://seller.yango.yandex.com/api/shop",
    headers: { Authorization: "Bearer " + AUTH_TOKEN },
});

const WooCommerce = new WooCommerceRestApi({
    url: API_BASE_URL,
    consumerKey: API_USER,
    consumerSecret: API_PASS,
    version: "wc/v3",
});

router.get("/products", async (req, res) => {
    try {
        const response = await WooCommerce.get(productEndpoints.products);
        res.send(response.data);
    } catch (err) {
        res.status(404).send("Failed to get products list");
    }
});

router.post("/products", (req, res) => {
    const products = req.body;
    const shopId = req.query.shopId;

    try {
        products.map(async (currentProduct) => {
            let imageData;
            if (currentProduct.images.length > 0) {
                const binaryData = await extractBinaryData(currentProduct.images);
                imageData = await uploadImage(binaryData, shopId);
            }
            const category = await getCategoryId(
                currentProduct.categories[0],
                shopId
            );
            const updatedProductSchema = convertSchemaToYangoSchema(
                currentProduct,
                category,
                imageData
            );

            await axiosInstance.post(
                `/${shopId}/catalog/catalogItem`,
                updatedProductSchema
            );
        });
        res.status(201).send();
    } catch (error) {
        res.status(404).send("Failed to create product");
    }
});


module.exports = { router, axiosInstance };
