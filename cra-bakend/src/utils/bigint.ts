// =============================================
// SOLUTION 5: UTILITAIRE GLOBAL POUR BIGINT
// =============================================

// Ajoute la déclaration de type pour BigInt.prototype.toJSON
declare global {
  interface BigInt {
    toJSON?: () => string;
  }
}

// Crée src/utils/bigint.ts 
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