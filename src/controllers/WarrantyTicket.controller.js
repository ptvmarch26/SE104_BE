const warrantyService = require("../services/WarrantyTicket.service");

const createWarrantyTicket = async (req, res) => {
  try {
    const result = await warrantyService.createTicket(req.body);
    result.EC === 0
      ? res.success(result.data, result.EM)
      : res.error(result.EC, result.EM);
  } catch (error) {
    return res.InternalError();
  }
};

const getWarrantyTickets = async (req, res) => {
  try {
    const result = await warrantyService.getTickets(req.query);
    result.EC === 0
      ? res.success(result.data, result.EM)
      : res.error(result.EC, result.EM);
  } catch (err) {
    return res.InternalError();
  }
};

const getWarrantyTicketById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await warrantyService.getTicketById(id);
    console.log("re", result)
    return result.EC === 0
      ? res.success(result.data, result.EM)
      : res.error(result.EC, result.EM);

  } catch (err) {
    return res.InternalError();
  }
};

const updateWarrantyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, manager } = req.body;

    const result = await warrantyService.updateStatus(id, status, manager);

    result.EC === 0
      ? res.success(result.data, result.EM)
      : res.error(result.EC, result.EM);
  } catch (err) {
    return res.InternalError();
  }
};

module.exports = {
  createWarrantyTicket,
  getWarrantyTickets,
  getWarrantyTicketById,
  updateWarrantyStatus,
};
