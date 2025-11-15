"use strict";
// src/types/knowledgeTransfer.types.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransferType = void 0;
// ❌ SUPPRIMER cette définition
/*
export enum TransferType {
  FICHE_TECHNIQUE = 'FICHE_TECHNIQUE',
  DEMONSTRATION = 'DEMONSTRATION',
  // ... etc
}
*/
// ✅ IMPORTER depuis Prisma
const client_1 = require("@prisma/client");
Object.defineProperty(exports, "TransferType", { enumerable: true, get: function () { return client_1.TransferType; } });
//# sourceMappingURL=knowledgeTransfer.types.js.map