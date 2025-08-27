// =============================================
// SOLUTION 5: UTILITAIRE GLOBAL POUR BIGINT
// =============================================

// Crée src/utils/bigint.ts :

export const serializeBigInt = (obj: any): any => {
  return JSON.parse(JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
};

export const convertBigIntToNumber = (obj: any): any => {
  return JSON.parse(JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? Number(value) : value
  ));
};

// Configuration globale BigInt
export const setupBigIntSerialization = () => {
  if (!BigInt.prototype.toJSON) {
    BigInt.prototype.toJSON = function() {
      return this.toString();
    };
  }
};