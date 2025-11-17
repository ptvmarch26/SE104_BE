const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();
const Category = require("../models/Category.model");

const SearchProductService = async (message) => {
  const categoryLevel1Docs = await Category.find(
    { category_level: 1 },
    "category_type"
  );
  const categoryLevel2Docs = await Category.find(
    { category_level: 2 },
    "category_type"
  );

  const category_name = [
    ...new Set(categoryLevel1Docs.map((doc) => doc.category_type)),
  ];
  const category_sub = [
    ...new Set(categoryLevel2Docs.map((doc) => doc.category_type)),
  ];

  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Dựa vào thông tin message, hãy tạo string như sau:
                            {"category": string (phải nằm trong danh sách: [${category_name.join(
                              ", "
                            )}]; và lấy category_type) "category_gender": string (phải nằm trong danh sách: [Nam, Nữ, Unisex], nếu không có thì để trống) "category_sub": string (nếu có)(phải nằm trong danh sách: [${category_sub.join(
            ", "
          )}]; và lấy category_type) "price_min": number (nếu có - không có thì không gửi) "price_max": number (nếu có - không có thì không gửi) "product_color": string (nếu có - viết hoa chữ đầu) "product_brand - viết hoa chữ đầu": string (nếu có)}
                            Chỉ trả về string,`,
        },
        { role: "user", content: message },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );
  console.log("res", response);
  const filters = response.data.choices[0].message.content;
  return { EC: 0, EM: "Trả lời thành công", data: filters };
};
module.exports = {
  SearchProductService,
};
