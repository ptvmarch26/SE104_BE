// routes/chat.js
const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
const { optionalVerifyToken } = require('../middlewares/AuthMiddleWare');
const { ChatbotController } = require('../controllers/Chatbot.controller');
dotenv.config();

/**
 * @swagger
 * /chat:
 *   get:
 *     summary: Tìm kiếm sản phẩm qua chatbot
 *     tags: [Chatbot]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: message
 *         required: true
 *         description: Tin nhắn tìm kiếm sản phẩm của người dùng
 *         schema:
 *           type: string
 *           example: "Tôi muốn tìm giày thể thao"
 *     responses:
 *       200:
 *         description: Trả về kết quả tìm kiếm sản phẩm
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 EC:
 *                   type: integer
 *                   example: 0
 *                 EM:
 *                   type: string
 *                   example: "Trả lời thành công"
 *                 data:
 *                   type: string
 *                   example: '{"category": "Giày", "category_gender": "Nam", "product_color": "Đen", "price_min": 500000, "price_max": 1500000}'
 *       400:
 *         description: Lỗi yêu cầu không hợp lệ
 *       500:
 *         description: Lỗi máy chủ
 */
router.get('/', optionalVerifyToken, ChatbotController.SearchProduct);

module.exports = router;
