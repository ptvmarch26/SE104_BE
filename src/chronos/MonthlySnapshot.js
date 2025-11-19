const cron = require("node-cron");
const Product = require("../models/Product.model");
const InventorySnapshot = require("../models/InventorySnapshot.model");

const createMonthlySnapshot = async () => {
  try {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const products = await Product.find().lean();

    for (const product of products) {
      for (const color of product.colors) {
        for (const variant of color.variants) {
          await InventorySnapshot.findOneAndUpdate(
            {
              month,
              product_id: product._id,
              color: color.color_name,
              size: variant.variant_size,
            },
            {
              opening_stock: variant.variant_countInStock,
            },
            { upsert: true }
          );
        }
      }
    }

    console.log("Snapshot tồn kho đã tạo thành công!");

  } catch (err) {
    console.error("Lỗi snapshot tồn kho:", err);
  }
};

cron.schedule("5 0 1 * *", createMonthlySnapshot);

module.exports = createMonthlySnapshot;
