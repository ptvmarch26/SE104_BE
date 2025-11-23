const Category = require("../models/Category.model");

const createCategory = async (categoryData) => {
  const {
    category_gender = null,
    category_type,
    category_parent_id = null,
    category_level = 1,
    category_unit,
  } = categoryData;

  if (!category_type || category_type.trim() === "") {
    return {
      EC: 1,
      EM: "Tên danh mục không được để trống",
    };
  }

  const existingCategory = await Category.findOne({
    category_type: category_type.trim(),
    category_gender: category_gender,
  });

  if (existingCategory) {
    return {
      EC: 1,
      EM: "Danh mục đã tồn tại",
    };
  }

  let finalUnit = category_unit || "cái";

  if (category_parent_id) {
    const parent = await Category.findById(category_parent_id);
    if (!parent) {
      return { EC: 1, EM: "Danh mục cha không tồn tại" };
    }
    finalUnit = parent.category_unit;
  }

  const newCategory = new Category({
    category_gender,
    category_type: category_type.trim(),
    category_parent_id,
    category_level,
    category_unit: finalUnit,
  });

  await newCategory.save();

  return {
    EC: 0,
    EM: "Tạo danh mục mới thành công",
    data: newCategory,
  };
};

const getDetailCategory = async (categoryId) => {
  const existingCategory = await Category.findById(categoryId);
  if (!existingCategory) {
    return {
      EC: 2,
      EM: "Danh mục không tồn tại",
    };
  }

  return {
    EC: 0,
    EM: "Lấy chi tiết danh mục thành công",
    data: existingCategory,
  };
};

const getAllCategory = async () => {
  const listCategory = await Category.find();
  return {
    EC: 0,
    EM: "Lấy tất cả danh mục thành công",
    data: listCategory,
  };
};

const getSubCategory = async (categoryId) => {
  const existingCategory = await Category.findById(categoryId);
  if (!existingCategory) {
    return {
      EC: 2,
      EM: "Danh mục không tồn tại",
    };
  }
  const listSubCategory = await Category.find({
    category_parent_id: categoryId,
  });
  return {
    EC: 0,
    EM: "Lấy danh mục con thành công",
    data: listSubCategory,
  };
};

const updateCategory = async (categoryId, updateData) => {
  const existing = await Category.findById(categoryId);
  if (!existing) {
    return { EC: 2, EM: "Danh mục không tồn tại" };
  }

  const {
    category_gender = existing.category_gender,
    category_type = existing.category_type,
    category_parent_id = existing.category_parent_id,
    category_level = existing.category_level,
    category_unit,
  } = updateData;

  if (!category_type || category_type.trim() === "") {
    return { EC: 1, EM: "Tên danh mục không được để trống" };
  }

  const duplicate = await Category.findOne({
    _id: { $ne: categoryId },
    category_type: category_type.trim(),
    category_gender,
  });

  if (duplicate) {
    return { EC: 1, EM: "Danh mục đã tồn tại" };
  }

  let finalUnit = existing.category_unit;

  if (category_parent_id) {
    const parent = await Category.findById(category_parent_id);
    if (!parent) return { EC: 1, EM: "Danh mục cha không tồn tại" };
    finalUnit = parent.category_unit;
  } else {
    finalUnit = category_unit || existing.category_unit || "cái"; // danh mục cha
  }

  const updatedCategory = await Category.findByIdAndUpdate(
    categoryId,
    {
      category_gender,
      category_type: category_type.trim(),
      category_parent_id,
      category_level,
      category_unit: finalUnit,
    },
    { new: true, runValidators: true }
  );

  return {
    EC: 0,
    EM: "Cập nhật danh mục thành công",
    data: updatedCategory,
  };
};

const deleteCategory = async (categoryId) => {
  const existingCategory = await Category.findById(categoryId);
  if (!existingCategory) {
    return {
      EC: 2,
      EM: "Danh mục không tồn tại",
    };
  }
  await existingCategory.delete();
  return {
    EC: 0,
    EM: "Xóa danh mục thành công",
  };
};

module.exports = {
  createCategory,
  getDetailCategory,
  getSubCategory,
  updateCategory,
  getAllCategory,
  deleteCategory,
};
