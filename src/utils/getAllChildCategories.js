const Category = require("../models/Category.model");

async function getAllChildCategories(categoryId) {
  let results = [categoryId];
  let queue = [categoryId];

  while (queue.length > 0) {
    const current = queue.shift();
    const children = await Category.find({ category_parent_id: current }).lean();

    children.forEach(child => {
      results.push(child._id.toString());
      queue.push(child._id.toString());
    });
  }

  return results; 
}

module.exports = { getAllChildCategories };
