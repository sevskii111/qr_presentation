getNumRawDataModules = function (ver) {
    if (ver < 1 || ver > 40)
        throw "Version number out of range";
    var result = (16 * ver + 128) * ver + 64;
    if (ver >= 2) {
        var numAlign = Math.floor(ver / 7) + 2;
        result -= (25 * numAlign - 10) * numAlign - 55;
        if (ver >= 7)
            result -= 36;
    }
    return result;
};

getNumDataCodewords = function (ver, ecl) {
    return Math.floor(getNumRawDataModules(ver) / 8) -
        ECC_CODEWORDS_PER_BLOCK[ecl][ver] *
        NUM_ERROR_CORRECTION_BLOCKS[ecl][ver];
};

function ReedSolomonGenerator(degree) {
    if (degree < 1 || degree > 255)
        throw "Degree out of range";

    // Coefficients of the divisor polynomial, stored from highest to lowest power, excluding the leading term which
    // is always 1. For example the polynomial x^3 + 255x^2 + 8x + 93 is stored as the uint8 array {255, 8, 93}.
    var coefficients = [];

    // Start with the monomial x^0
    for (var i = 0; i < degree - 1; i++)
        coefficients.push(0);
    coefficients.push(1);

    // Compute the product polynomial (x - r^0) * (x - r^1) * (x - r^2) * ... * (x - r^{degree-1}),
    // drop the highest term, and store the rest of the coefficients in order of descending powers.
    // Note that r = 0x02, which is a generator element of this field GF(2^8/0x11D).
    var root = 1;
    for (var i = 0; i < degree; i++) {
        // Multiply the current product by (x - r^i)
        for (var j = 0; j < coefficients.length; j++) {
            coefficients[j] = ReedSolomonGenerator.multiply(coefficients[j], root);
            if (j + 1 < coefficients.length)
                coefficients[j] ^= coefficients[j + 1];
        }
        root = ReedSolomonGenerator.multiply(root, 0x02);
    }

    // Computes and returns the Reed-Solomon error correction codewords for the given
    // sequence of data codewords. The returned object is always a new byte array.
    // This method does not alter this object's state (because it is immutable).
    this.getRemainder = function (data) {
        // Compute the remainder by performing polynomial division
        var result = coefficients.map(function () {
            return 0;
        });
        data.forEach(function (b) {
            var factor = b ^ result.shift();
            result.push(0);
            coefficients.forEach(function (coef, i) {
                result[i] ^= ReedSolomonGenerator.multiply(coef, factor);
            });
        });
        return result;
    };
}

// This static function returns the product of the two given field elements modulo GF(2^8/0x11D). The arguments and
// result are unsigned 8-bit integers. This could be implemented as a lookup table of 256*256 entries of uint8.
ReedSolomonGenerator.multiply = function (x, y) {
    if (x >>> 8 != 0 || y >>> 8 != 0)
        throw "Byte out of range";
    // Russian peasant multiplication
    var z = 0;
    for (var i = 7; i >= 0; i--) {
        z = (z << 1) ^ ((z >>> 7) * 0x11D);
        z ^= ((y >>> i) & 1) * x;
    }
    if (z >>> 8 != 0)
        throw "Assertion error";
    return z;
};