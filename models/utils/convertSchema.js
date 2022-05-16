const axios = require("axios").default;

const convertSchemaToYangoSchema = (product, category) => {
    const updatedSchema = {
        name: product.name,
        description: product.description,
        price: product.price,
        available: product.stock_status === "instock" ? true : false || false,
        isAdult: true,
        weight: product.weight || 0,
        volume: 0,
        pieces: product.stock_quantity || 0,
        measureType: "weight",
        category: {
            id: category.id,
            name: category.name,
        },
    };
    return updatedSchema;
};

const getCategoryId = async (category, shopId) => {
    const { AUTH_TOKEN } = process.env;

    const payload = { name: category.name };

    const response = await axios.post(
        `https://seller.yango.yandex.com/api/shop/${shopId}/catalog/category`,
        payload,
        {
            headers: {
                Authorization: "Bearer " + AUTH_TOKEN,
            },
        }
    );
    return response.data;
};

module.exports = { convertSchemaToYangoSchema, getCategoryId };
