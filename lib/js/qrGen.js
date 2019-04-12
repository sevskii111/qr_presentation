//table
var ECC_CODEWORDS_PER_BLOCK = [
    // Version: (note that index 0 is for padding, and is set to an illegal value)
    //  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40    Error correction level
    [null, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30], // Low
    [null, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28], // Medium
    [null, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30], // Quartile
    [null, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30], // High
];

var NUM_ERROR_CORRECTION_BLOCKS = [
    // Version: (note that index 0 is for padding, and is set to an illegal value)
    //  0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40    Error correction level
    [null, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25], // Low
    [null, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49], // Medium
    [null, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68], // Quartile
    [null, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81], // High
];

const mixConversionTable = {
    "0": 0,
    "1": 1,
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    "A": 10,
    "B": 11,
    "C": 12,
    "D": 13,
    "E": 14,
    "F": 15,
    "G": 16,
    "H": 17,
    "I": 18,
    "J": 19,
    "K": 20,
    "L": 21,
    "M": 22,
    "N": 23,
    "O": 24,
    "P": 25,
    "Q": 26,
    "R": 27,
    "S": 28,
    "T": 29,
    "U": 30,
    "V": 31,
    "W": 32,
    "X": 33,
    "Y": 34,
    "Z": 35,
    " ": 36,
    "$": 37,
    "%": 38,
    "*": 39,
    "+": 40,
    "-": 41,
    ".": 42,
    "/": 43,
    ":": 44,
}
const possibleMixSymbols = Object.keys(mixConversionTable);

const masks = [(a, b) => {
    return (a + b) % 2;
}, (a, b) => {
    return b % 2;
}, (a, b) => {
    return a % 3;
}, (a, b) => {
    return (a + b) % 3;
}, (a, b) => {
    return (a / 3 + b / 2) % 2;
}, (a, b) => {
    return (a * b) % 2 || (a * b) % 3;
}, (a, b) => {
    return ((a * b) % 2 + (a * b) % 3) % 2;
}, (a, b) => {
    return ((a * b) % 2 + (a + b) % 3) % 2;
}];

const corrLetters = ["L", "M", "Q", "H"];

const BTB = {
    "0000": "0",
    "0001": "1",
    "0010": "2",
    "0011": "3",
    "0100": "4",
    "0101": "5",
    "0110": "6",
    "0111": "7",
    "1000": "8",
    "1001": '9',
    "1010": "A",
    "1011": "B",
    "1100": "C",
    "1101": "D",
    "1110": "E",
    "1111": "F"
}
//poem
const poem = `ADVENTURE I.
A SCANDAL IN BOHEMIA
I.
To Sherlock Holmes she is always the woman.
I have seldom heard him mention her under any other name.
In his eyes she eclipses and predominates the whole of her sex.
It was not that he felt any emotion akin to love for Irene Adler.
All emotions, and that one particularly, were abhorrent to his cold, precise but admirably balanced mind.
He was, I take it, the most perfect reasoning and observing machine that the world has seen, but as a lover he would have placed himself in a false position.
He never spoke of the softer passions, save with a gibe and a sneer.
They were admirable things for the observer-excellent for drawing the veil from men's motives and actions.
But for the trained reasoner to admit such intrusions into his own delicate and finely adjusted temperament was to introduce a distracting factor which might throw a doubt upon all his mental results.
Grit in a sensitive instrument, or a crack in one of his own high-power lenses, would not be more disturbing than a strong emotion in a nature such as his.
And yet there was but one woman to him, and that woman was the late Irene Adler, of dubious and questionable memory.
I had seen little of Holmes lately. My marriage had drifted us away from each other.
My own complete happiness, and the home-centred interests which rise up around the man who first finds himself master of his own establishment, were sufficient to absorb all my attention, while Holmes, who loathed every form of society with his whole Bohemian soul, remained in our lodgings in Baker Street, buried among his old books, and alternating from week to week between cocaine and ambition, the drowsiness of the drug, and the fierce energy of his own keen nature.
He was still, as ever, deeply attracted by the study of crime, and occupied his immense faculties and extraordinary powers of observation in following out those clues, and clearing up those mysteries which had been abandoned as hopeless by the official police.
From time to time I heard some vague account of his doings: of his summons to Odessa in the case of the Trepoff murder, of his clearing up of the singular tragedy of the Atkinson brothers at Trincomalee, and finally of the mission which he had accomplished so delicately and successfully for the reigning family of Holland.
Beyond these signs of his activity, however, which I merely shared with all the readers of the daily press, I knew little of my former friend and companion.
One night-it was on the twentieth of March, 1888-I was returning from a journey to a patient (for I had now returned to civil practice), when my way led me through Baker Street.
As I passed the well-remembered door, which must always be associated in my mind with my wooing, and with the dark incidents of the Study in Scarlet, I was seized with a keen desire to see Holmes again, and to know how he was employing his extraordinary powers.
`;
//external
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

function getAlignmentPatternPositions(version, size) {
    if (version == 1)
        return [];
    else {
        var numAlign = Math.floor(version / 7) + 2;
        var step = (version == 32) ? 26 :
            Math.ceil((size - 13) / (numAlign * 2 - 2)) * 2;
        var result = [6];
        for (var pos = size - 7; result.length < numAlign; pos -= step)
            result.splice(1, 0, pos);
        return result;
    }
}

function getBit(x, i) {
    return ((x >>> i) & 1) != 0;
}

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
//in page
const colors = ['#e6194b', '#3cb44b', '#4363d8', '#f58231', '#46f0f0', '#f032e6',
    '#fabebe', '#bcf60c', '#008080', '#911eb4', '#e6beff', '#ffe119', '#fffac8', '#800000', '#aaffc3', '#808000',
    '#ffd8b1', '#000075',
    '#9a6324'
];

function coursorToEnd(div) {

    div.focus();

    if (window.getSelection && document.createRange) {
        // IE 9 and non-IE
        var sel = window.getSelection();
        var range = document.createRange();
        range.setStart(div, div.childNodes.length);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
    }
}

function stringNum2Bin(str) {
    if (!str.match(/^\d*$/)) {
        return ["Невозможно"];
    }
    var result = [];
    while (str.length >= 3) {
        let bin = parseInt(str.substr(0, 3)).toString(2);
        result.push("0".repeat(10 - bin.length) + bin);
        str = str.substr(3);
    }

    if (str.length == 2) {
        let bin = parseInt(str).toString(2);
        result.push("0".repeat(7 - bin.length) + bin);
    } else if (str.length == 1) {
        let bin = parseInt(str).toString(2);
        result.push("0".repeat(4 - bin.length) + bin);
    }

    return result;
}



function stringMix2Bin(str) {
    str = str.toUpperCase();
    for (let i = 0; i < str.length; i++) {
        if (possibleMixSymbols.indexOf(str[i]) == -1) {
            return ["Невозможно"];
        }
    }
    var result = [];
    while (str.length >= 2) {
        let bin = (mixConversionTable[str[0]] * 45 + mixConversionTable[str[1]]).toString(2);
        result.push("0".repeat(11 - bin.length) + bin);
        str = str.substr(2);
    }

    if (str.length == 1) {
        let bin = mixConversionTable[str[0]].toString(2);
        result.push("0".repeat(6 - bin.length) + bin);
    }

    return result;
}

function toUTF8Array(str) {
    var utf8 = [];
    for (var i = 0; i < str.length; i++) {
        var charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) {
            utf8.push(0xc0 | (charcode >> 6),
                0x80 | (charcode & 0x3f));
        } else if (charcode < 0xd800 || charcode >= 0xe000) {
            utf8.push(0xe0 | (charcode >> 12),
                0x80 | ((charcode >> 6) & 0x3f),
                0x80 | (charcode & 0x3f));
        }
        // surrogate pair
        else {
            i++;
            // UTF-16 encodes 0x10000-0x10FFFF by
            // subtracting 0x10000 and splitting the
            // 20 bits of 0x0-0xFFFFF into two halves
            charcode = 0x10000 + (((charcode & 0x3ff) << 10) |
                (str.charCodeAt(i) & 0x3ff));
            utf8.push(0xf0 | (charcode >> 18),
                0x80 | ((charcode >> 12) & 0x3f),
                0x80 | ((charcode >> 6) & 0x3f),
                0x80 | (charcode & 0x3f));
        }
    }
    return utf8;
}

function string2Bin(str) {
    var result = [];
    for (var i = 0; i < str.length; i++) {
        let arr = toUTF8Array(str[i]);
        if (arr.length == 1) {
            let bin = toUTF8Array(str[i])[0].toString(2);
            result.push("0".repeat(8 - bin.length) + bin);
        } else {
            let bin1 = toUTF8Array(str[i])[0].toString(2);
            let bin2 = toUTF8Array(str[i])[1].toString(2);
            let bin = "0".repeat(8 - bin1.length) + bin1 + "0".repeat(8 - bin2.length) + bin2;
            result.push(bin);
        }

    }
    return result;
}

function getFieldsLen(type, ver) {
    if (type == 0) {
        if (ver <= 9) {
            return 10;
        } else if (ver <= 26) {
            return 12;
        } else {
            return 14;
        }
    } else if (type == 1) {
        if (ver <= 9) {
            return 9;
        } else if (ver <= 26) {
            return 11;
        } else {
            return 13;
        }
    } else if (type == 2) {
        if (ver <= 9) {
            return 8;
        } else if (ver <= 26) {
            return 16;
        } else {
            return 16;
        }
    }
}

function getFields(type, ver, bites) {
    var result = [];
    let len = getFieldsLen(type, ver)
    if (type == 0) {
        result.push("0001");
        let count = 0;
        for (let i = 0; i < bites.length; i++) {
            if (bites[i].length == 10) {
                count += 3;
            } else if (bites[i].length == 7) {
                count += 2;
            } else {
                count += 1;
            }
        }
        let bin = (count).toString(2);
        result.push("0".repeat(len - bin.length) + bin);
    } else if (type == 1) {
        result.push("0010");
        let count = 0;
        for (let i = 0; i < bites.length; i++) {
            if (bites[i].length == 11) {
                count += 2;
            } else {
                count += 1;
            }
        }
        let bin = count.toString(2);
        result.push("0".repeat(len - bin.length) + bin);
    } else if (type == 2) {
        result.push("0100");
        let bin = (bites.join('').length / 8).toString(2);
        result.push("0".repeat(len - bin.length) + bin);
    }
    //console.log(result);
    return result;
}

function calcVersion(bits, type, cor) {
    let targetLen = bits.join('').length;
    for (let i = 1; i <= 40; i++) {
        if (getNumDataCodewords(i, cor) * 8 >= targetLen + getFieldsLen(type, i) + 4) {
            return i;
        }
    }
}

function fillData(bits, ver, cor) {
    let targetLen = getNumDataCodewords(ver, cor) * 8;
    let result = bits.join('');
    result += "0".repeat(Math.min(4, targetLen - result.length));

    result += "0".repeat((8 - result.length % 8) % 8);
    //console.log(targetLen);

    let i = 0;
    while (result.length < targetLen) {
        result += (i % 2 == 0) ? "11101100" : "00010001";
        i++;
    }

    return result;
}

function blockify(bits, ver, cor) {
    let bytes = [];
    for (let i = 0; i < bits.length; i += 8) {
        bytes.push(bits.substr(i, 8));
    }
    let blocksCount = NUM_ERROR_CORRECTION_BLOCKS[cor][ver];
    let bytesPerBlock = parseInt(bytes.length / blocksCount);
    let extendedBlockCount = bytes.length % blocksCount;

    let result = [];
    for (let i = 0; i < blocksCount; i++) {
        result.push([]);
        for (let j = 0; j < bytesPerBlock + (blocksCount - i <= extendedBlockCount ? 1 : 0); j++) {
            result[i].push(bytes.shift());
        }
    }
    return result;
}

function getCorrData(blocks, ver, cor) {
    let result = [];
    //console.log(cor, ver);
    let rs = new ReedSolomonGenerator(ECC_CODEWORDS_PER_BLOCK[cor][ver]);

    for (var i = 0, k = 0; i < blocks.length; i++) {
        var dat = blocks[i].map(x => parseInt(x, 2));
        //console.log(dat);
        k += dat.length;
        var ecc = rs.getRemainder(dat);
        result[i] = [];
        for (let j = 0; j < ecc.length; j++) {
            let bin = ecc[j].toString(2);
            result[i].push("0".repeat(8 - bin.length) + bin);
        }
    }
    //console.log(result);
    return result;
}

let field = {};

function drawCode(blocks, corrBlocks, ver, cor, mask, scale, canvas, needPayload = true, needTiming = true,
    needPos = true, needAlignment = true, needVersion = true, needFormat = true, needMask = true, border = 4, colors =
    false, maxSize = -1) {
    let $c = $(canvas);
    let size = (ver * 4 + 17);
    if (maxSize != -1)
    {
        for (scale = 1;(size + border * 2) * scale < maxSize;scale++);
        scale--;
    }
    $c.attr("width", (size + border * 2) * scale);
    $c.attr("height", (size + border * 2) * scale);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, (size + border * 2) * scale, (size + border * 2) * scale);
    let field = [];
    let uField = [];
    for (let i = 0; i < size; i++) {
        field.push([]);
        for (let j = 0; j < size; j++) {
            field[i].push(false);
        }
    }

    uField = field.map(x => x.slice(0));


    if (needTiming) {
        drawTimingPatterns(field, uField, ver);
    }
    if (needPos) {
        drawPosPatterns(field, uField, ver);
    }
    if (needAlignment) {
        drawAlignmentPatterns(field, uField, ver);
    }
    if (needVersion) {
        drawVersion(field, uField, ver);
    }
    if (needFormat) {
        drawFormatBits(field, uField, mask, cor);
    }

    if (needPayload) {
        let dataBits = joinBlocks(blocks, corrBlocks);
        drawDataBits(field, uField, dataBits);
    }

    if (needMask) {
        applyMask(field, uField, masks[mask])
    }

    drawField(field, scale, ctx, border, uField, colors);
}

function drawFinderPattern(field, uField, x, y) {
    const size = field.length;
    for (var dy = -4; dy <= 4; dy++) {
        for (var dx = -4; dx <= 4; dx++) {
            var dist = Math.max(Math.abs(dx), Math.abs(dy)); // Chebyshev/infinity norm
            var xx = x + dx,
                yy = y + dy;
            if (0 <= xx && xx < size && 0 <= yy && yy < size) {
                uField[xx][yy] = 1;
                if (dist != 2 && dist != 4) {
                    field[xx][yy] = true;
                } else {
                    field[xx][yy] = false;
                }
            }
        }
    }
}

function drawAlignmentPattern(field, uField, x, y) {
    for (var dy = -2; dy <= 2; dy++) {
        for (var dx = -2; dx <= 2; dx++) {
            var dist = Math.max(Math.abs(dx), Math.abs(dy)); // Chebyshev/infinity norm
            uField[x + dx][y + dy] = 2;
            if (dist != 1) {
                field[x + dx][y + dy] = true;
            } else {
                field[x + dx][y + dy] = false;
            }
        }
    }
}

function drawPosPatterns(field, uField, ver) {
    const size = field.length;
    drawFinderPattern(field, uField, 3, 3);
    drawFinderPattern(field, uField, size - 4, 3);
    drawFinderPattern(field, uField, 3, size - 4);
}

function drawAlignmentPatterns(field, uField, ver) {
    const size = field.length;
    var alignPatPos = getAlignmentPatternPositions(ver, size);
    var numAlign = alignPatPos.length;
    for (var i = 0; i < numAlign; i++) {
        for (var j = 0; j < numAlign; j++) {
            // Don't draw on the three finder corners
            if (!(i == 0 && j == 0 || i == 0 && j == numAlign - 1 || i == numAlign - 1 && j == 0))
                drawAlignmentPattern(field, uField, alignPatPos[i], alignPatPos[j]);
        }
    }
}

function drawVersion(field, uField, version) {
    if (version < 7)
        return;
    const size = field.length;
    // Calculate error correction code and pack bits
    var rem = version; // version is uint6, in the range [7, 40]
    for (var i = 0; i < 12; i++)
        rem = (rem << 1) ^ ((rem >>> 11) * 0x1F25);
    var bits = version << 12 | rem; // uint18
    if (bits >>> 18 != 0)
        throw "Assertion error";

    // Draw two copies
    for (var i = 0; i < 18; i++) {
        var bit = getBit(bits, i);
        var a = size - 11 + i % 3;
        var b = Math.floor(i / 3);
        uField[a][b] = uField[b][a] = 4;
        field[a][b] = field[b][a] = bit;
    }
}


function drawTimingPatterns(field, uField, ver) {
    const size = field.length;
    for (var i = 0; i < size; i++) {
        uField[6][i] = 3;
        uField[i][6] = 3;
        if (i % 2 == 0) {
            field[6][i] = true;
            field[i][6] = true;
        } else {
            field[6][i] = false;
            field[i][6] = false;
        }
    }
}

function drawFormatBits(field, uField, mask, cor) {
    const size = field.length;
    // Calculate error correction code and pack bits
    var data = [1, 0, 3, 2][cor] << 3 | mask; // errCorrLvl is uint2, mask is uint3
    var rem = data;
    for (var i = 0; i < 10; i++)
        rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    var bits = (data << 10 | rem) ^ 0x5412; // uint15
    if (bits >>> 15 != 0)
        throw "Assertion error";

    // Draw first copy
    for (var i = 0; i <= 5; i++) {
        field[8][i] = getBit(bits, i);
        uField[8][i] = 5;
    }

    uField[8][7] = uField[8][8] = uField[7][8] = 5;
    field[8][7] = getBit(bits, 6);
    field[8][8] = getBit(bits, 7);
    field[7][8] = getBit(bits, 8);

    for (var i = 9; i < 15; i++) {
        uField[14 - i][8] = 5;
        field[14 - i][8] = getBit(bits, i);
    }

    // Draw second copy
    for (var i = 0; i < 8; i++) {
        uField[size - 1 - i][8] = 5;
        field[size - 1 - i][8] = getBit(bits, i);
    }
    for (var i = 8; i < 15; i++) {
        uField[8][size - 15 + i] = 5;
        field[8][size - 15 + i] = getBit(bits, i);
    }
    uField[8][size - 8] = 5;
    field[8][size - 8] = true;
}

function joinBlocks(blocks, corBlocks) {
    let result = [];
    for (let j = 0; j < blocks[blocks.length - 1].length; j++) {
        for (let i = 0; i < blocks.length; i++) {
            if (blocks[i][j]) {
                for (let k = 0; k < 8; k++) {
                    result.push(blocks[i][j][k] == '1' ? true : false);
                }
            }
        }
    }

    for (let j = 0; j < corBlocks[corBlocks.length - 1].length; j++) {
        for (let i = 0; i < corBlocks.length; i++) {
            if (corBlocks[i][j]) {
                for (let k = 0; k < 8; k++) {
                    result.push(corBlocks[i][j][k] == '1' ? true : false);
                }
            }
        }
    }

    return result;
}

function joinBlocksPresent(blocks, corBlocks) {
    let result = [];
    for (let j = 0; j < blocks[blocks.length - 1].length; j++) {
        for (let i = 0; i < blocks.length; i++) {
            if (blocks[i][j]) {
                result.push({
                    ind: i,
                    data: blocks[i][j]
                });
            }
        }
    }

    for (let j = 0; j < corBlocks[corBlocks.length - 1].length; j++) {
        for (let i = 0; i < corBlocks.length; i++) {
            if (corBlocks[i][j]) {
                result.push({
                    ind: i + blocks.length,
                    data: corBlocks[i][j]
                });
            }
        }
    }

    return result;
}

function drawDataBits(field, uField, bits) {
    const size = field.length;

    let str = "";
    for (let i = 0; i < bits.length; i += 8) {
        str += bits.slice(i, i + 8).map(x => x ? '1' : '0').join('') + "\n";
    }
    //console.log(str);

    let c = 0;
    for (let i = 0; i < size / 2; i++) {
        let x = size - i * 2 - 1;
        if (x <= 6) {
            x--;
        }
        for (let j = 0; j < size; j++) {
            let y = ((i % 2 != 0) ? j : size - j - 1);
            for (let k = 0; k < 2 && x - k >= 0; k++) {
                if (!uField[x - k][y]) {
                    if (c < bits.length) {
                        field[x - k][y] = bits[c];
                    }
                    uField[x - k][y] = 6;
                    c++;
                }
            }
        }
    }
}

function applyMask(field, uField, mask) {
    const size = field.length;
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (uField[i][j] == 6 && !mask(i, j)) {
                field[i][j] = !field[i][j];
            }
        }
    }
}


function drawField(field, scale, ctx, border, uField, colors = false) {
    ctx.fillStyle = '#000';
    for (let i = border; i < field.length + border; i++) {
        for (let j = border; j < field.length + border; j++) {
            if (field[i - border][j - border]) {
                ctx.fillRect(i * scale, j * scale, scale, scale);
            }
        }
    }

    if (colors) {
        for (let i = border; i < uField.length + border; i++) {
            for (let j = border; j < uField.length + border; j++) {
                const c = ['#e6194b', '#3cb44b', '#4363d8', '#f58231', '#46f0f0', '#f032e6',
                    '#fabebe', '#bcf60c', '#008080', '#911eb4', '#e6beff', '#ffe119', '#fffac8', '#800000',
                    '#aaffc3', '#808000',
                    '#ffd8b1', '#000075',
                    '#9a6324'
                ];
                ctx.fillStyle = c[uField[i - border][j - border]] + "55";
                if (uField[i - border][j - border]) {
                    ctx.fillRect(i * scale, j * scale, scale, scale);
                }
            }
        }
    }
}

function getBestType(text) {
    let num = stringNum2Bin(text);
    let mix = stringMix2Bin(text);
    let bin = string2Bin(text);
    if (text == "" || num[0][0] != "Н") {
        return 0;
    } else if (mix[0][0] != "Н") {
        return 1;
    } else {
        return 2;
    }
}

//qr gen

function qrGen() {
    let codes = $(".qr")
    for (let i = 0; i < codes.length; i++) {
        let code = $(codes[i]);
        let text = code.attr('qr-data');
        let size = code.attr('qr-size');
        
        console.log(text);

        let num = stringNum2Bin(text);
        let mix = stringMix2Bin(text);
        let bin = string2Bin(text);

        let type = getBestType(text),
            len,
            cor = 3;

        if (type <= 1) {
            len = text.length;
        } else {
            let bin = string2Bin(text);
            len = bin.join('').length / 8;
        }

        bin = [num, mix, bin][type];
        let ver = calcVersion(bin, type, cor);

        let fields = getFields(type, ver, bin);
        let filler = fillData(fields.concat(bin), ver, cor).substr(bin.join('').length + fields.join('').length);
        let data = [fields.join(''), bin.join(''), filler];

        const blocks = blockify(data.join(''), ver, cor);

        const corrBlocks = getCorrData(blocks, ver, cor);

        drawCode(blocks, corrBlocks, ver, cor, 3, 6, codes[i], true, true, true, true, true, true, true, 4, false, size);
    }
}

qrGen();