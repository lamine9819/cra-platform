"use strict";
// =============================================
// 3. UTILITAIRES BCRYPT
// =============================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparePassword = exports.hashPassword = void 0;
const tslib_1 = require("tslib");
// src/utils/bcrypt.ts
const bcrypt_1 = tslib_1.__importDefault(require("bcrypt"));
const SALT_ROUNDS = 12;
const hashPassword = async (password) => {
    return await bcrypt_1.default.hash(password, SALT_ROUNDS);
};
exports.hashPassword = hashPassword;
const comparePassword = async (password, hash) => {
    return await bcrypt_1.default.compare(password, hash);
};
exports.comparePassword = comparePassword;
//# sourceMappingURL=bcrypt.js.map