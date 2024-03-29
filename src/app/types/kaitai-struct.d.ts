/** Declaration file generated by dts-gen */

declare module "kaitai-struct" {
  export class KaitaiStream {
    constructor(arrayBuffer: any);

    alignToByte(): void;

    ensureBytesLeft(length: any): void;

    ensureFixedContents(expected: any): any;

    isEof(): any;

    mapUint8Array(length: any): any;

    readBitsInt(n: any): any;

    readBitsIntBe(n: any): any;

    readBitsIntLe(n: any): any;

    readBytes(len: any): any;

    readBytesFull(): any;

    readBytesTerm(terminator: any, include: any, consume: any, eosError: any): any;

    readF4be(): any;

    readF4le(): any;

    readF8be(): any;

    readF8le(): any;

    readS1(): any;

    readS2be(): any;

    readS2le(): any;

    readS4be(): any;

    readS4le(): any;

    readS8be(): any;

    readS8le(): any;

    readU1(): any;

    readU2be(): any;

    readU2le(): any;

    readU4be(): any;

    readU4le(): any;

    readU8be(): any;

    readU8le(): any;

    seek(pos: any): void;

    static EOFError(bytesReq: any, bytesAvail: any): void;

    static UndecidedEndiannessError(): void;

    static UnexpectedDataError(expected: any, actual: any): void;

    static ValidationExprError(actual: any, io: any, srcPath: any): void;

    static ValidationGreaterThanError(max: any, actual: any): void;

    static ValidationLessThanError(min: any, actual: any): void;

    static ValidationNotAnyOfError(actual: any, io: any, srcPath: any): void;

    static ValidationNotEqualError(expected: any, actual: any): void;

    static arrayMax(arr: any): any;

    static arrayMin(arr: any): any;

    static byteArrayCompare(a: any, b: any): any;

    static bytesStripRight(data: any, padByte: any): any;

    static bytesTerminate(data: any, term: any, include: any): any;

    static bytesToStr(arr: any, encoding: any): any;

    static createStringFromArray(array: any): any;

    static depUrls: {
      zlib: any;
    };

    static endianness: boolean;

    static mod(a: any, b: any): any;

    static processRotateLeft(data: any, amount: any, groupSize: any): any;

    static processXorMany(data: any, key: any): any;

    static processXorOne(data: any, key: any): any;

    static processZlib(buf: any): any;

  }
}

