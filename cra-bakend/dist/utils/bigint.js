"use strict";
// =============================================
// SOLUTION 5: UTILITAIRE GLOBAL POUR BIGINT
// =============================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupBigIntSerialization = exports.convertBigIntToNumber = exports.serializeBigInt = void 0;
// Crée src/utils/bigint.ts 
const serializeBigInt = (obj) => {
    return JSON.parse(JSON.stringify(obj, (key, value) => typeof value === 'bigint' ? value.toString() : value));
};
exports.serializeBigInt = serializeBigInt;
const convertBigIntToNumber = (obj) => {
    return JSON.parse(JSON.stringify(obj, (key, value) => typeof value === 'bigint' ? Number(value) : value));
};
exports.convertBigIntToNumber = convertBigIntToNumber;
// Configuration globale BigInt
const setupBigIntSerialization = () => {
    if (!BigInt.prototype.toJSON) {
        BigInt.prototype.toJSON = function () {
            return this.toString();
        };
    }
};
exports.setupBigIntSerialization = setupBigIntSerialization;
//# sourceMappingURL=bigint.js.map