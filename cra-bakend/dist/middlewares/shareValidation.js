"use strict";
// =============================================
// src/middlewares/shareValidation.ts - Middleware de validation des tokens
// =============================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateShareToken = void 0;
const shareUtils_1 = require("../utils/shareUtils");
const validateShareToken = (req, res, next) => {
    const { shareToken } = req.params;
    if (!shareToken || !(0, shareUtils_1.isValidShareToken)(shareToken)) {
        return res.status(400).json({
            success: false,
            message: 'Token de partage invalide'
        });
    }
    next();
};
exports.validateShareToken = validateShareToken;
//# sourceMappingURL=shareValidation.js.map