const Product = require("../models/Product.model");
const Category = require("../models/Category.model");
const PurchaseOrder = require("../models/PurchaseOrder.model");
const Order = require("../models/Order.model");
const InventorySnapshot = require("../models/InventorySnapshot.model");
const { getAllChildCategories } = require("../utils/getAllChildCategories");

const createProduct = async (newProduct) => {
  const {
    product_title,
    product_category,
    product_brand,
    product_img,
    product_description,
    product_display,
    product_famous,
    product_rate,
    product_percent_discount,
    colors,
  } = newProduct;

  let product_price = 0;
  let product_countInStock = 0;

  const allPrices = colors.flatMap((color) =>
    color.variants.map((variant) => Number(variant.variant_price))
  );

  product_price = allPrices.length > 0 ? Math.min(...allPrices) : 0;

  product_countInStock = colors.reduce((acc, color) => {
    return (
      acc +
      color.variants.reduce(
        (sum, variant) => sum + Number(variant.variant_countInStock),
        0
      )
    );
  }, 0);

  const newProductData = {
    product_title,
    product_category,
    product_description,
    product_display,
    product_famous,
    product_rate,
    product_brand,
    product_img,
    product_percent_discount,
    colors,
    product_price,
    product_countInStock,
  };

  const newProductInstance = await Product.create(newProductData);
  if (newProductInstance) {
    return {
      EC: 0,
      EM: "Tạo sản phẩm mới thành công",
      data: newProductInstance,
    };
  }
};

const updateProduct = async (productId, updatedProduct) => {
  const existingProduct = await Product.findById(productId);

  if (!existingProduct) {
    return {
      EC: 1,
      EM: "Không tìm thấy sản phẩm",
      data: [],
    };
  }

  let updateData = { ...updatedProduct };

  if (updateData.colors) {
    const validPrices = updateData.colors
      .map((color) =>
        color.variants.map((variant) => {
          Number(variant.variant_price);
        })
      )
      .filter((price) => !isNaN(price) && price > 0);

    updateData.product_price =
      validPrices.length > 0
        ? Math.min(...validPrices)
        : existingProduct.product_price;

    countInStockOfEachColor = updateData.colors.map((color) =>
      color.variants.reduce((sum, variant) => {
        const countInStock = variant._doc
          ? Number(variant._doc.variant_countInStock)
          : Number(variant.variant_countInStock);
        return sum + (countInStock || 0);
      }, 0)
    );
    updateData.product_countInStock = countInStockOfEachColor.reduce(
      (sum, count) => {
        return sum + count;
      },
      0
    );
  }

  const updatedProductInstance = await Product.findByIdAndUpdate(
    productId,
    updateData,
    { new: true, runValidators: true }
  );

  if (updatedProductInstance) {
    return {
      EC: 0,
      EM: "Cập nhật sản phẩm thành công",
      data: updatedProductInstance,
    };
  } else {
    return {
      EC: 2,
      EM: "Cập nhật sản phẩm thất bại",
      data: [],
    };
  }
};

const getDetailsProduct = async (id) => {
  const product = await Product.findById(id).populate("product_category");

  if (!product) {
    return {
      EC: 1,
      EM: "Không tìm thấy sản phẩm",
      data: [],
    };
  }

  return {
    EC: 0,
    EM: "Lấy chi tiết sản phẩm thành công",
    data: product,
  };
};

const deleteProduct = async (id) => {
  const product = await Product.findById(id);

  if (!product) {
    return {
      EC: 1,
      EM: "Không tìm thấy sản phẩm",
      data: [],
    };
  }

  await product.deleteOne();

  return {
    EC: 0,
    EM: "Xóa sản phẩm thành công",
    data: [],
  };
};

const getAllProduct = async (filters) => {
  let query = {};
  const genderFilter =
    filters.category_gender?.length > 0 ? filters.category_gender : [];

  let categoryIds = [];

  if (
    genderFilter.length !== 3 &&
    !filters.category?.length &&
    !filters.category_sub?.length
  ) {
    const categories = await Category.find({
      category_gender: { $in: genderFilter },
    });
    categoryIds.push(...categories.map((cat) => cat._id));
  }

  const categoryArray = Array.isArray(filters.category)
    ? filters.category
    : [filters.category];
  const subArray = Array.isArray(filters.category_sub)
    ? filters.category_sub
    : [filters.category_sub];

  let subCategoryParentIds = [];

  if (filters.category_sub) {
    const subCategories = await Category.find({
      category_type: { $in: subArray },
      category_gender: { $in: genderFilter },
    });

    subCategoryParentIds = subCategories.map((subCat) => ({
      parentId: subCat.category_parent_id,
      subId: subCat._id,
    }));
  }

  if (!filters.category && filters.category_sub) {
    for (const subCategory of subArray) {
      const subCategories = await Category.find({
        category_type: subCategory,
        category_gender: { $in: genderFilter },
      });

      for (const sub of subCategories) {
        categoryIds.push(sub._id);
      }
    }
  }

  for (const categoryType of categoryArray) {
    const matchedCategories = await Category.find({
      category_type: categoryType,
      category_gender: { $in: genderFilter },
    });

    for (const parent of matchedCategories) {
      const relatedSubs = subCategoryParentIds.filter(
        (item) => item.parentId.toString() === parent._id.toString()
      );

      if (relatedSubs.length > 0) {
        categoryIds.push(...relatedSubs.map((item) => item.subId));
      } else {
        categoryIds.push(parent._id);

        const subCats = await Category.find({
          category_parent_id: parent._id,
          category_gender: { $in: genderFilter },
        });
        categoryIds.push(...subCats.map((cat) => cat._id));
      }
    }
  }

  if (categoryIds.length > 0) {
    query.product_category = {
      $in: [...new Set(categoryIds.map((id) => id.toString()))],
    };
  }

  if (filters.price_min || filters.price_max) {
    query.product_price = {};
    if (filters.price_min) query.product_price.$gte = Number(filters.price_min);
    if (filters.price_max) query.product_price.$lte = Number(filters.price_max);
  }

  if (filters.product_color) {
    const colorArray = Array.isArray(filters.product_color)
      ? filters.product_color
      : [filters.product_color];
    if (colorArray.length > 0) {
      query["colors.color_name"] = { $in: colorArray };
    }
  }

  if (filters.product_brand?.length > 0) {
    query.product_brand = { $in: filters.product_brand };
  }

  const products = await Product.find(query).populate("product_category");
  const totalProducts = await Product.countDocuments(query);

  return {
    EC: 0,
    EM: "Lấy danh sách sản phẩm thành công",
    data: {
      total: totalProducts,
      products,
    },
  };
};

const MIN_STOCK = 20;

const getInventoryReport = async (month, categoryId) => {
  try {
    const regex = /^\d{4}[-/]\d{2}$/;
    let cleanMonth = month.substring(0, 7);

    if (!regex.test(cleanMonth)) {
      return { EC: 1, EM: "Tham số month không hợp lệ. (YYYY-MM)", data: null };
    }

    const [year, mm] = cleanMonth.split(/[-/]/);
    const start = new Date(Number(year), Number(mm) - 1, 1);
    const end = new Date(Number(year), Number(mm), 1);

    // Nếu có category → lấy cả con
    let categoryFilterIds = null;

    if (categoryId) {
      categoryFilterIds = await getAllChildCategories(categoryId);
    }

    // Lấy sản phẩm theo category filter
    const productQuery = categoryFilterIds
      ? { product_category: { $in: categoryFilterIds } }
      : {};

    const products = await Product.find(productQuery)
                  .populate("product_category", "category_unit")
                  .lean();


    const snapshots = await InventorySnapshot.find({ month: cleanMonth }).lean();

    const snapshotMap = new Map();
    snapshots.forEach(s => {
      const key = `${s.product_id}-${s.color}-${s.size}`;
      snapshotMap.set(key, s.opening_stock);
    });

    const imports = await PurchaseOrder.aggregate([
      { $match: { createdAt: { $gte: start, $lt: end } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: {
            product: "$items.product",
            color: "$items.color_name",
            size: "$items.variant_size",
          },
          total_imported: { $sum: "$items.quantity" },
          unit: { $first: "$items.unit" }
        }
      }
    ]);

    const importMap = new Map();
    imports.forEach(i => {
      const key = `${i._id.product}-${i._id.color}-${i._id.size}`;
      importMap.set(key, { imported: i.total_imported, unit: i.unit });
    });

    const sales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lt: end },
          order_status: { $in: ["Đang giao", "Hoàn thành"] },
        }
      },
      { $unwind: "$products" },
      {
        $group: {
          _id: {
            product: "$products.product_id",
            color: "$products.color",
            size: "$products.variant",
          },
          total_sold: { $sum: "$products.quantity" }
        }
      }
    ]);

    const saleMap = new Map();
    sales.forEach(s => {
      const key = `${s._id.product}-${s._id.color}-${s._id.size}`;
      saleMap.set(key, s.total_sold);
    });

    const report = [];

    for (const product of products) {
      for (const color of product.colors) {
        for (const variant of color.variants) {

          const key = `${product._id}-${color.color_name}-${variant.variant_size}`;

          const opening = snapshotMap.get(key) ?? variant.variant_countInStock;
          const imported = importMap.get(key)?.imported || 0;
          const productUnit = product.product_category?.category_unit || "cái";
          const sold = saleMap.get(key) || 0;
          const ending = opening + imported - sold;

          report.push({
            product_id: product._id,
            product_title: product.product_title,
            color: color.color_name,
            size: variant.variant_size,
            opening_stock: opening,
            imported,
            sold,
            ending_stock: ending,
            unit: productUnit,
            note: ending < MIN_STOCK ? "Cần nhập thêm" : "",
          });
        }
      }
    }

    return {
      EC: 0,
      EM: "Lấy báo cáo tồn kho thành công",
      data: { month: cleanMonth, total_items: report.length, report }
    };

  } catch (err) {
    return { EC: 1, EM: "Lỗi server", data: err.message };
  }
};

module.exports = {
  createProduct,
  updateProduct,
  getDetailsProduct,
  deleteProduct,
  getAllProduct,
  getInventoryReport,
};
