declare global {
    interface BigInt {
        toJSON?: () => string;
    }
}
export declare const serializeBigInt: (obj: any) => any;
export declare const convertBigIntToNumber: (obj: any) => any;
export declare const setupBigIntSerialization: () => void;
//# sourceMappingURL=bigint.d.ts.map