/*
  Ported to JavaScript by Lazar Laszlo 2011 
  
  lazarsoft@gmail.com, www.lazarsoft.info
  
*/

/*
*
* Copyright 2007 ZXing authors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

var shift_jis_table;

function QRCodeDataBlockReader(blocks, version, numErrorCorrectionCode) {
    this.blockPointer = 0;
    this.bitOffset = 0;
    this.dataLength = 0;
    this.blocks = blocks;
    this.numErrorCorrectionCode = numErrorCorrectionCode;
    if (version <= 9)
        this.dataLengthMode = 0;
    else if (version >= 10 && version <= 26)
        this.dataLengthMode = 1;
    else if (version >= 27 && version <= 40)
        this.dataLengthMode = 2;
    this.require = function (url) {
        var xhr = null;
        if (window.ActiveXObject) { //IE
            try {
                // lte IE6
                xhr = new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e) {
                // lte IE5.5
                xhr = new ActiveXObject("Microsoft.XMLHTTP");
            }
        } else if (window.XMLHttpRequest) {
            //Firefox，Opera 8.0+，Safari，Chrome
            xhr = new XMLHttpRequest();
        }
        xhr.open("GET", url, false);
        xhr.send();
        if (xhr.readyState == 4) {
            if ((xhr.status / 100 == 2) || xhr.status == 0 || xhr.status == 304) {
                var doc = document;
                var myBody = doc.getElementsByTagName("BODY")[0];
                var myScript = doc.createElement("script");
                myScript.language = "javascript";
                myScript.type = "text/javascript";
                try {
                    myScript.appendChild(doc.createTextNode(xhr.responseText));
                } catch (ex) {
                    // lte IE8
                    myScript.text = xhr.responseText;
                }
                myBody.appendChild(myScript);
            }
        }
    }

    this.getNextBits = function (numBits) {
        var result = 0;

        // First, read remainder from current byte
        if (this.bitOffset > 0) {
            var bitsLeft = 8 - this.bitOffset;
            var toRead = numBits < bitsLeft ? numBits : bitsLeft;
            var bitsToNotRead = bitsLeft - toRead;
            var mask = (0xFF >> (8 - toRead)) << bitsToNotRead;
            result = (this.blocks[this.blockPointer] & mask) >> bitsToNotRead;
            numBits -= toRead;
            this.bitOffset += toRead;
            if (this.bitOffset == 8) {
                this.bitOffset = 0;
                ++this.blockPointer;
            }
        }

        // Next read whole bytes
        if (numBits > 0) {
            while (numBits >= 8) {
                result = (result << 8) | (this.blocks[this.blockPointer] & 0xFF);
                ++this.blockPointer;
                numBits -= 8;
            }

            // Finally read a partial byte
            if (numBits > 0) {
                var bitsToNotRead = 8 - numBits;
                var mask = (0xFF >> bitsToNotRead) << bitsToNotRead;
                result = (result << numBits) | ((this.blocks[this.blockPointer] & mask) >> bitsToNotRead);
                this.bitOffset += numBits;
            }
        }
        return result;
    }
    this.NextMode = function () {
        if ((this.blockPointer > this.blocks.length - this.numErrorCorrectionCode - 2))
            return 0;
        else
            return this.getNextBits(4);
    }
    this.sizeOfDataLengthInfo = [
        [0, 0, 0],
        [10, 12, 14], // NUMERIC
        [9, 11, 13], // ALPHANUMERIC
        [0, 0, 0], // STRUCTURED_APPEND
        [8, 16, 16], // BYTE
        [0, 0, 0], // FNC1_FIRST_POSITION
        [0, 0, 0],
        [0, 0, 0], // ECI
        [8, 10, 12], // KANJI
        [0, 0, 0], // FNC1_SECOND_POSITION
        [8, 10, 12]// HANZI
    ];
    this.tableAplhaNumeric = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:".split('');
    this.getDataLength = function (modeIndicator) {
        return this.getNextBits(this.sizeOfDataLengthInfo[modeIndicator][this.dataLengthMode]);
    }
    this.getAlphaNumericString = function (dataLength) {
        var strData = "";
        do {
            if (dataLength > 1) {
                var intData = this.getNextBits(11);
                var firstLetter = Math.floor(intData / 45);
                var secondLetter = intData % 45;
                strData += this.tableAplhaNumeric[firstLetter];
                strData += this.tableAplhaNumeric[secondLetter];
                dataLength -= 2;
            } else if (dataLength == 1) {
                strData += this.tableAplhaNumeric[this.getNextBits(6)];
                dataLength -= 1;
            }
        } while (dataLength > 0);

        return strData;
    }
    this.getNumericString = function (dataLength) {
        var intData = 0;
        var strData = "";
        do {
            if (dataLength >= 3) {
                intData = this.getNextBits(10);
                if (intData < 100)
                    strData += "0";
                if (intData < 10)
                    strData += "0";
                dataLength -= 3;
            } else if (dataLength == 2) {
                intData = this.getNextBits(7);
                if (intData < 10)
                    strData += "0";
                dataLength -= 2;
            } else if (dataLength == 1) {
                intData = this.getNextBits(4);
                dataLength -= 1;
            }
            strData += intData;
        } while (dataLength > 0);

        return strData;
    }
    this.defaultEncoding = this.ISO88591Encoding;
    this.ISO88591Encoding = function (data) {
        var output = "";
        for (var i = 0; i < data.length; ++i) {
            output += String.fromCharCode(data[i]);
        }
        return output;
    }
    this.ShiftJISEncoding = function (data) {
        var output = "";
        var tail = 0;
        var character = 0;

        for (var i = 0; i < data.length; ++i) {
            if (data[i] < 0x80) {
                if (data[i] == 0x5C)
                    character = 0x00A5;
                else if (data[i] == 0x7E)
                    character = 0x203E;
                else
                    character = data[i];
            } else if ((data[i] >= 0xA1 && data[i] <= 0xDF)) {
                character = data[i] + 0xFEC0;
            } else if ((data[i] >= 0x81 && data[i] <= 0x9F) || (data[i] >= 0xE0 && data[i] <= 0xEA)) {
                if (i == data.length - 1)
                    throw "Too few bytes."
                    var s1 = data[i];
                var s2 = data[++i];
                if ((s2 >= 0x40 && s2 <= 0x7E) || (s2 >= 0x80 && s2 <= 0xFC)) {
                    var t1 = (s1 < 0xE0 ? s1 - 0x81 : s1 - 0xC1);
                    var t2 = (s2 < 0x80 ? s2 - 0x40 : s2 - 0x41);
                    var c1 = 2 * t1 + (t2 < 0x5E ? 0 : 1);
                    var c2 = (t2 < 0x5E ? t2 : t2 - 0x5E);
                    if ((c1 <= 0x07) || (c1 >= 0x0F && c1 <= 0x53)) {
                        if (c2 < 0x7F) {
                            var tmp = 94 * c1 + c2;
                            character = 0xFFFD;
                            if (tmp < 1410) {
                                if (tmp < 690) {
                                    if (!shift_jis_table)
                                        this.require('shift_jis_table.js');
                                    character = shift_jis_table.jisx0208_2uni_page21[tmp];
                                }
                            } else {
                                if (tmp < 7808) {
                                    if (!shift_jis_table)
                                        this.require('shift_jis_table.js');
                                    character = shift_jis_table.jisx0208_2uni_page30[tmp - 1410];
                                }
                            }
                        }
                    }
                }
            } else if (data[i] >= 0xF0 && data[i] <= 0xF9) {
                /* User-defined range. See
                 * Ken Lunde's "CJKV Information Processing", table 4-66, p. 206. */
                if (i == data.length - 1)
                    throw "Too few bytes."
                    var s1 = data[i];
                var s2 = data[++i];
                if ((s2 >= 0x40 && s2 <= 0x7E) || (s2 >= 0x80 && s2 <= 0xFC)) {
                    character = 0xE000 + 188 * (s1 - 0xF0) + (s2 < 0x80 ? s2 - 0x40 : s2 - 0x41);
                }
            }
            output += String.fromCharCode(character);
        }
        return output;
    }
    this.UTF8Encoding = function (data) {
        var output = "";
        var tail = 0;
        var character = 0;

        for (var i = 0; i < data.length; ++i) {
            if (tail-- > 0) {
                if (data[i] >= 128 && data[i] <= 191) { //10XX XXXX
                    character = (character << 6) + (data[i] & 0x3F);
                } else {
                    // TODO: malformed warning
                }
            } else {
                if (data[i] <= 127) { //0XXX XXXX
                    tail = -1;
                } else if (data[i] >= 192 && data[i] <= 223) { //110X XXXX
                    tail = 1;
                } else if (data[i] >= 224 && data[i] <= 239) { //1110 XXXX
                    tail = 2;
                } else if (data[i] >= 240 && data[i] <= 247) { //1111 0XXX
                    tail = 3;
                } else if (data[i] >= 248 && data[i] <= 251) { //1111 10XX
                    tail = 4;
                } else if (data[i] >= 252 && data[i] <= 253) { //1111 110X
                    tail = 5;
                } else {
                    // TODO: malformed warning
                }
                character = data[i] & (0xFF >> (tail + 2));
            }
            if (tail <= 0) {
                output += String.fromCharCode(character);
            }
        }
        return output;
    }
    this.guessEncoding = function (data) {
        // For now, merely tries to distinguish ISO-8859-1, UTF-8 and Shift_JIS,
        // which should be by far the most common encodings.
        var length = data.length;
        var canBeISO88591 = true;
        var canBeShiftJIS = true;
        var canBeUTF8 = true;
        var utf8BytesLeft = 0;
        //var utf8LowChars = 0;
        var utf2BytesChars = 0;
        var utf3BytesChars = 0;
        var utf4BytesChars = 0;
        var sjisBytesLeft = 0;
        //var sjisLowChars = 0;
        var sjisKatakanaChars = 0;
        //var sjisDoubleBytesChars = 0;
        var sjisCurKatakanaWordLength = 0;
        var sjisCurDoubleBytesWordLength = 0;
        var sjisMaxKatakanaWordLength = 0;
        var sjisMaxDoubleBytesWordLength = 0;
        //var isoLowChars = 0;
        //var isoHighChars = 0;
        var isoHighOther = 0;

        var utf8bom = data.length > 3 &&
            data[0] == 0xEF &&
            data[1] == 0xBB &&
            data[2] == 0xBF;

        for (var i = 0;
            i < length && (canBeISO88591 || canBeShiftJIS || canBeUTF8);
            ++i) {

            var value = data[i] & 0xFF;

            // UTF-8 stuff
            if (canBeUTF8) {
                if (utf8BytesLeft > 0) {
                    if ((value & 0x80) == 0) {
                        canBeUTF8 = false;
                    } else {
                        --utf8BytesLeft;
                    }
                } else if ((value & 0x80) != 0) {
                    if ((value & 0x40) == 0) {
                        canBeUTF8 = false;
                    } else {
                        ++utf8BytesLeft;
                        if ((value & 0x20) == 0) {
                            ++utf2BytesChars;
                        } else {
                            ++utf8BytesLeft;
                            if ((value & 0x10) == 0) {
                                ++utf3BytesChars;
                            } else {
                                ++utf8BytesLeft;
                                if ((value & 0x08) == 0) {
                                    ++utf4BytesChars;
                                } else {
                                    canBeUTF8 = false;
                                }
                            }
                        }
                    }
                } //else {
                //++utf8LowChars;
                //}
            }

            // ISO-8859-1 stuff
            if (canBeISO88591) {
                if (value > 0x7F && value < 0xA0) {
                    canBeISO88591 = false;
                } else if (value > 0x9F) {
                    if (value < 0xC0 || value == 0xD7 || value == 0xF7) {
                        ++isoHighOther;
                    } //else {
                    //++isoHighChars;
                    //}
                } //else {
                //++isoLowChars;
                //}
            }

            // Shift_JIS stuff
            if (canBeShiftJIS) {
                if (sjisBytesLeft > 0) {
                    if (value < 0x40 || value == 0x7F || value > 0xFC) {
                        canBeShiftJIS = false;
                    } else {
                        --sjisBytesLeft;
                    }
                } else if (value == 0x80 || value == 0xA0 || value > 0xEF) {
                    canBeShiftJIS = false;
                } else if (value > 0xA0 && value < 0xE0) {
                    ++sjisKatakanaChars;
                    sjisCurDoubleBytesWordLength = 0;
                    ++sjisCurKatakanaWordLength;
                    if (sjisCurKatakanaWordLength > sjisMaxKatakanaWordLength) {
                        sjisMaxKatakanaWordLength = sjisCurKatakanaWordLength;
                    }
                } else if (value > 0x7F) {
                    ++sjisBytesLeft;
                    //+sjisDoubleBytesChars+;
                    sjisCurKatakanaWordLength = 0;
                    ++sjisCurDoubleBytesWordLength;
                    if (sjisCurDoubleBytesWordLength > sjisMaxDoubleBytesWordLength) {
                        sjisMaxDoubleBytesWordLength = sjisCurDoubleBytesWordLength;
                    }
                } else {
                    //++sjisLowChars;
                    sjisCurKatakanaWordLength = 0;
                    sjisCurDoubleBytesWordLength = 0;
                }
            }
        }

        if (canBeUTF8 && utf8BytesLeft > 0) {
            canBeUTF8 = false;
        }
        if (canBeShiftJIS && sjisBytesLeft > 0) {
            canBeShiftJIS = false;
        }

        // Easy -- if there is BOM or at least 1 valid not-single byte character (and no evidence it can't be UTF-8), done
        if (canBeUTF8 && (utf8bom || utf2BytesChars + utf3BytesChars + utf4BytesChars > 0)) {
            return this.UTF8Encoding(data);
        }
        // Easy -- if assuming Shift_JIS or at least 3 valid consecutive not-ascii characters (and no evidence it can't be), done
        if (canBeShiftJIS && (/*ASSUME_SHIFT_JIS || */
                sjisMaxKatakanaWordLength >= 3 || sjisMaxDoubleBytesWordLength >= 3)) {
            return this.ShiftJISEncoding(data);
        }
        // Distinguishing Shift_JIS and ISO-8859-1 can be a little tough for short words. The crude heuristic is:
        // - If we saw
        //   - only two consecutive katakana chars in the whole text, or
        //   - at least 10% of bytes that could be "upper" not-alphanumeric Latin1,
        // - then we conclude Shift_JIS, else ISO-8859-1
        if (canBeISO88591 && canBeShiftJIS) {
            return (sjisMaxKatakanaWordLength == 2 && sjisKatakanaChars == 2) || isoHighOther * 10 >= length
             ? this.ShiftJISEncoding(data) : this.ISO88591Encoding(data);
        }

        // Otherwise, try in order ISO-8859-1, Shift JIS, UTF-8 and fall back to default platform encoding
        if (canBeISO88591) {
            return this.ISO88591Encoding(data);
        }
        if (canBeShiftJIS) {
            return this.ShiftJISEncoding(data);
        }
        if (canBeUTF8) {
            return this.UTF8Encoding(data);
        }
        // Otherwise, we take a wild guess with platform encoding
        return this.defaultEncoding(data);
    }
    this.get8bitByteArray = function (dataLength) {
        var output = [];
        do {
            output.push(this.getNextBits(8));
        } while (--dataLength > 0);
        return this.guessEncoding(output);
    }
    this.getKanjiString = function (dataLength) {
        var unicodeString = "";
        do {
            var intData = this.getNextBits(13);
            var tempWord = ((intData / 0xC0) << 8) + intData % 0xC0;
            // between 8140 - 9FFC on Shift_JIS character set
            // between E040 - EBBF on Shift_JIS character set
            tempWord += tempWord < 0x01F00 ? 0x08140 : 0x0C140;
            unicodeString += this.ShiftJISEncoding([tempWord >> 8, tempWord & 0xFF]);
        } while (--dataLength > 0);

        return unicodeString;
    }
    this.getHanziString = function (dataLength) {
        var unicodeString = "";
        do {
            var intData = this.getNextBits(13);
            var tempWord = ((intData / 0x060) << 8) + (intData % 0x060);
            unicodeString += String.fromCharCode(tempWord + (tempWord < 0x003BF ? 0x0A1A1 : 0x0A6A1));
        } while (--dataLength > 0);

        return unicodeString;
    }
    this.__defineGetter__("DataByte", function () {
        var output = "";
        const MODE_NUMBERIC = 1;
        const MODE_ALPHA_NUMBERIC = 2;
        const MODE_STRUCTURED_APPEND = 3;
        const MODE_8BIT_BYTE = 4;
        const MODE_FNC1_FIRST_POSITION = 5;
        const MODE_ECI = 7;
        const MODE_KANJI = 8;
        const MODE_FNC1_SECOND_POSITION = 9;
        const MODE_HANZI = 10; // defined in GBT 18284-2000, may not be supported in foreign country

        const GB2312_SUBSET = 1;
        var fc1InEffect = false;
        var encoding;
        do {
            var mode = this.NextMode();
            if (mode == 0) {
                if (output.length > 0)
                    break;
                else
                    throw "Empty data block";
            }
            if (mode == MODE_FNC1_FIRST_POSITION || mode == MODE_FNC1_SECOND_POSITION) {
                // We do little with FNC1 except alter the parsed result a bit according to the spec
                fc1InEffect = true;
            } else if (mode == MODE_STRUCTURED_APPEND) {
                // sequence number and parity is added later to the result metadata
                // Read next 8 bits (symbol sequence #) and 8 bits (parity data), then continue
                // TODO: store the metadata
                var symbolSequence = this.getNextBits(8);
                var parityData = this.getNextBits(8);
            } else if (mode == MODE_ECI) {
                // Count doesn't apply to ECI
                var firstByte = this.getNextBits(8);
                if ((firstByte & 0x80) == 0) {
                    // just one byte
                    encoding = firstByte & 0x7F;
                } else if ((firstByte & 0xC0) == 0x80) {
                    // two bytes
                    var secondByte = this.getNextBits(8);
                    encoding = ((firstByte & 0x3F) << 8) | secondByte;
                } else if ((firstByte & 0xE0) == 0xC0) {
                    // three bytes
                    var secondThirdBytes = this.getNextBits(16);
                    encoding = ((firstByte & 0x1F) << 16) | secondThirdBytes;
                } else
                    throw "Invalid ECI Byte: " + firstByte;
                // TODO: ECI encoding for MODE_8BIT_BYTE
            } else {
                // First handle Hanzi mode which does not start with character count
                if (mode == MODE_HANZI) {
                    //chinese mode contains a sub set indicator right after mode indicator
                    var subset = this.getNextBits(4);
                    var countHanzi = this.getNextBits(this.getDataLength(mode));
                    if (subset == GB2312_SUBSET) {
                        output += getHanziString(countHanzi);
                    }
                } else {
                    dataLength = this.getDataLength(mode);
                    if (dataLength < 1)
                        throw "Invalid data length: " + dataLength;
                    switch (mode) {
                    case MODE_NUMBERIC:
                        output += this.getNumericString(dataLength);
                        break;

                    case MODE_ALPHA_NUMBERIC:
                        var temp_str = this.getAlphaNumericString(dataLength);
                        if (fc1InEffect) {
                            for (var i = 0; i < temp_str.length; ++i) {
                                if (temp_str.charCodeAt(i) == '%') {
                                    if (i < temp_str.length - 1 && temp_str.charCodeAt(i + 1) == '%') {
                                        // %% is rendered as %
                                        temp_str = temp_str.substring(0, i + 1) + temp_str.substring(i + 2);
                                    } else {
                                        // In alpha mode, % should be converted to FNC1 separator 0x1D
                                        temp_str = temp_str.substring(0, i) + String.fromCharCode(0x1D) + temp_str.substring(i + 1);
                                    }
                                }
                            }
                        }
                        output += temp_str;
                        break;

                    case MODE_8BIT_BYTE:
                        output += this.get8bitByteArray(dataLength);
                        break;

                    case MODE_KANJI:
                        output += this.getKanjiString(dataLength);
                        break;
                    default:
                        throw "Invalid mode: " + mode + " in (block:" + this.blockPointer + " bit:" + this.bitOffset + ")";
                    }
                }
            }
        } while (true);
        return output;
    });
}
