const axios = require("axios").default;

const createdCategories = new Set();
const { AUTH_TOKEN } = process.env;
const convertSchemaToYangoSchema = (product, category, image) => {
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
        pictures: image ? [image] : []
    };
    return updatedSchema;
};

const getCategoryId = async (category, shopId) => {

    const isCreated = isCategoryCreated(category);

    if (isCreated) return isCreated;

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
    const createdCategory = response.data;
    createdCategories.add({ id: createdCategory.id, name: createdCategory.name });
    return category;
};

const isCategoryCreated = (categoryData) => {
    for (let category of createdCategories) {
        if (category.name == categoryData.name) return category;
    }
    return false;
};

const extractBinaryData = async (imagesArray) => {
    const url = imagesArray[0].src;
    const response = await axios.get(url, { responseType: "arraybuffer" });
    return response.data;
}

const uploadImage = async (binaryData, shopId) => {
    const image = await axios.post(`https://seller.yango.yandex.com/api/shop/${shopId}/catalog/upload-picture`, binaryData, {
        headers: {
            "Content-Type": "application/octet-stream",
            Authorization: "Bearer " + AUTH_TOKEN
        },
    });
    return image.data;
}

module.exports = { convertSchemaToYangoSchema, getCategoryId, uploadImage, extractBinaryData };
