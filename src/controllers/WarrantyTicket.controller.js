const warrantyService = require("../services/WarrantyTicket.service");

const createWarrantyTicket = async (req, res) => {
  try {
    const result = await warrantyService.createTicket(req.body);
    return res.status(200).json(result);

  } catch (error) {
    return res.InternalError();
  }
};

const getWarrantyTickets = async (req, res) => {
  try {
    const result = await warrantyService.getTickets(req.query);
    return res.status(200).json(result);

  } catch (err) {
    return res.InternalError();
  }
};

const updateWarrantyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, manager } = req.body;

    const result = await warrantyService.updateStatus(id, status, manager);

    return res.status(200).json(result);

  } catch (err) {
    return res.InternalError();
  }
};

module.exports = {
  createWarrantyTicket,
  getWarrantyTickets,
  updateWarrantyStatus
};