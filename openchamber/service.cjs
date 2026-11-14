/*! Bundled third-party licenses

yazl
The MIT License (MIT)

Copyright (c) 2014 Josh Wolfe

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

yauzl
The MIT License (MIT)

Copyright (c) 2014 Josh Wolfe

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

pend
The MIT License (Expat)

Copyright (c) 2014 Andrew Kelley

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation files
(the "Software"), to deal in the Software without restriction,
including without limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of the Software,
and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

buffer-crc32
The MIT License

Copyright (c) 2013-2024 Brian J. Brennan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

stream-json
Copyright 2005-2026 Eugene Lazutkin

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

stream-chain
Copyright 2005-2026 Eugene Lazutkin

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/buffer-crc32/dist/index.cjs
var require_dist = __commonJS({
  "node_modules/buffer-crc32/dist/index.cjs"(exports2, module2) {
    "use strict";
    function getDefaultExportFromCjs(x) {
      return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
    }
    var CRC_TABLE = new Int32Array([
      0,
      1996959894,
      3993919788,
      2567524794,
      124634137,
      1886057615,
      3915621685,
      2657392035,
      249268274,
      2044508324,
      3772115230,
      2547177864,
      162941995,
      2125561021,
      3887607047,
      2428444049,
      498536548,
      1789927666,
      4089016648,
      2227061214,
      450548861,
      1843258603,
      4107580753,
      2211677639,
      325883990,
      1684777152,
      4251122042,
      2321926636,
      335633487,
      1661365465,
      4195302755,
      2366115317,
      997073096,
      1281953886,
      3579855332,
      2724688242,
      1006888145,
      1258607687,
      3524101629,
      2768942443,
      901097722,
      1119000684,
      3686517206,
      2898065728,
      853044451,
      1172266101,
      3705015759,
      2882616665,
      651767980,
      1373503546,
      3369554304,
      3218104598,
      565507253,
      1454621731,
      3485111705,
      3099436303,
      671266974,
      1594198024,
      3322730930,
      2970347812,
      795835527,
      1483230225,
      3244367275,
      3060149565,
      1994146192,
      31158534,
      2563907772,
      4023717930,
      1907459465,
      112637215,
      2680153253,
      3904427059,
      2013776290,
      251722036,
      2517215374,
      3775830040,
      2137656763,
      141376813,
      2439277719,
      3865271297,
      1802195444,
      476864866,
      2238001368,
      4066508878,
      1812370925,
      453092731,
      2181625025,
      4111451223,
      1706088902,
      314042704,
      2344532202,
      4240017532,
      1658658271,
      366619977,
      2362670323,
      4224994405,
      1303535960,
      984961486,
      2747007092,
      3569037538,
      1256170817,
      1037604311,
      2765210733,
      3554079995,
      1131014506,
      879679996,
      2909243462,
      3663771856,
      1141124467,
      855842277,
      2852801631,
      3708648649,
      1342533948,
      654459306,
      3188396048,
      3373015174,
      1466479909,
      544179635,
      3110523913,
      3462522015,
      1591671054,
      702138776,
      2966460450,
      3352799412,
      1504918807,
      783551873,
      3082640443,
      3233442989,
      3988292384,
      2596254646,
      62317068,
      1957810842,
      3939845945,
      2647816111,
      81470997,
      1943803523,
      3814918930,
      2489596804,
      225274430,
      2053790376,
      3826175755,
      2466906013,
      167816743,
      2097651377,
      4027552580,
      2265490386,
      503444072,
      1762050814,
      4150417245,
      2154129355,
      426522225,
      1852507879,
      4275313526,
      2312317920,
      282753626,
      1742555852,
      4189708143,
      2394877945,
      397917763,
      1622183637,
      3604390888,
      2714866558,
      953729732,
      1340076626,
      3518719985,
      2797360999,
      1068828381,
      1219638859,
      3624741850,
      2936675148,
      906185462,
      1090812512,
      3747672003,
      2825379669,
      829329135,
      1181335161,
      3412177804,
      3160834842,
      628085408,
      1382605366,
      3423369109,
      3138078467,
      570562233,
      1426400815,
      3317316542,
      2998733608,
      733239954,
      1555261956,
      3268935591,
      3050360625,
      752459403,
      1541320221,
      2607071920,
      3965973030,
      1969922972,
      40735498,
      2617837225,
      3943577151,
      1913087877,
      83908371,
      2512341634,
      3803740692,
      2075208622,
      213261112,
      2463272603,
      3855990285,
      2094854071,
      198958881,
      2262029012,
      4057260610,
      1759359992,
      534414190,
      2176718541,
      4139329115,
      1873836001,
      414664567,
      2282248934,
      4279200368,
      1711684554,
      285281116,
      2405801727,
      4167216745,
      1634467795,
      376229701,
      2685067896,
      3608007406,
      1308918612,
      956543938,
      2808555105,
      3495958263,
      1231636301,
      1047427035,
      2932959818,
      3654703836,
      1088359270,
      936918e3,
      2847714899,
      3736837829,
      1202900863,
      817233897,
      3183342108,
      3401237130,
      1404277552,
      615818150,
      3134207493,
      3453421203,
      1423857449,
      601450431,
      3009837614,
      3294710456,
      1567103746,
      711928724,
      3020668471,
      3272380065,
      1510334235,
      755167117
    ]);
    function ensureBuffer(input) {
      if (Buffer.isBuffer(input)) {
        return input;
      }
      if (typeof input === "number") {
        return Buffer.alloc(input);
      } else if (typeof input === "string") {
        return Buffer.from(input);
      } else {
        throw new Error("input must be buffer, number, or string, received " + typeof input);
      }
    }
    function bufferizeInt(num) {
      const tmp = ensureBuffer(4);
      tmp.writeInt32BE(num, 0);
      return tmp;
    }
    function _crc32(buf, previous) {
      buf = ensureBuffer(buf);
      if (Buffer.isBuffer(previous)) {
        previous = previous.readUInt32BE(0);
      }
      let crc = ~~previous ^ -1;
      for (var n = 0; n < buf.length; n++) {
        crc = CRC_TABLE[(crc ^ buf[n]) & 255] ^ crc >>> 8;
      }
      return crc ^ -1;
    }
    function crc32() {
      return bufferizeInt(_crc32.apply(null, arguments));
    }
    crc32.signed = function() {
      return _crc32.apply(null, arguments);
    };
    crc32.unsigned = function() {
      return _crc32.apply(null, arguments) >>> 0;
    };
    var bufferCrc32 = crc32;
    var index = /* @__PURE__ */ getDefaultExportFromCjs(bufferCrc32);
    module2.exports = index;
  }
});

// node_modules/yazl/index.js
var require_yazl = __commonJS({
  "node_modules/yazl/index.js"(exports2) {
    var fs = require("fs");
    var Transform3 = require("stream").Transform;
    var PassThrough = require("stream").PassThrough;
    var zlib = require("zlib");
    var util = require("util");
    var EventEmitter = require("events").EventEmitter;
    var errorMonitor = require("events").errorMonitor;
    var crc32 = require_dist();
    exports2.ZipFile = ZipFile;
    exports2.dateToDosDateTime = dateToDosDateTime;
    util.inherits(ZipFile, EventEmitter);
    function ZipFile() {
      this.outputStream = new PassThrough();
      this.entries = [];
      this.outputStreamCursor = 0;
      this.ended = false;
      this.allDone = false;
      this.forceZip64Eocd = false;
      this.errored = false;
      this.on(errorMonitor, function() {
        this.errored = true;
      });
    }
    ZipFile.prototype.addFile = function(realPath, metadataPath, options2) {
      var self = this;
      metadataPath = validateMetadataPath(metadataPath, false);
      if (options2 == null) options2 = {};
      if (shouldIgnoreAdding(self)) return;
      var entry = new Entry(metadataPath, false, options2);
      self.entries.push(entry);
      fs.stat(realPath, function(err, stats) {
        if (err) return self.emit("error", err);
        if (!stats.isFile()) return self.emit("error", new Error("not a file: " + realPath));
        entry.uncompressedSize = stats.size;
        if (options2.mtime == null) entry.setLastModDate(stats.mtime);
        if (options2.mode == null) entry.setFileAttributesMode(stats.mode);
        entry.setFileDataPumpFunction(function() {
          var readStream = fs.createReadStream(realPath);
          entry.state = Entry.FILE_DATA_IN_PROGRESS;
          readStream.on("error", function(err2) {
            self.emit("error", err2);
          });
          pumpFileDataReadStream(self, entry, readStream);
        });
        pumpEntries(self);
      });
    };
    ZipFile.prototype.addReadStream = function(readStream, metadataPath, options2) {
      this.addReadStreamLazy(metadataPath, options2, function(cb) {
        cb(null, readStream);
      });
    };
    ZipFile.prototype.addReadStreamLazy = function(metadataPath, options2, getReadStreamFunction) {
      var self = this;
      if (typeof options2 === "function") {
        getReadStreamFunction = options2;
        options2 = null;
      }
      if (options2 == null) options2 = {};
      metadataPath = validateMetadataPath(metadataPath, false);
      if (shouldIgnoreAdding(self)) return;
      var entry = new Entry(metadataPath, false, options2);
      self.entries.push(entry);
      entry.setFileDataPumpFunction(function() {
        entry.state = Entry.FILE_DATA_IN_PROGRESS;
        getReadStreamFunction(function(err, readStream) {
          if (err) return self.emit("error", err);
          pumpFileDataReadStream(self, entry, readStream);
        });
      });
      pumpEntries(self);
    };
    ZipFile.prototype.addBuffer = function(buffer, metadataPath, options2) {
      var self = this;
      metadataPath = validateMetadataPath(metadataPath, false);
      if (buffer.length > 1073741823) throw new Error("buffer too large: " + buffer.length + " > 1073741823");
      if (options2 == null) options2 = {};
      if (options2.size != null) throw new Error("options.size not allowed");
      if (shouldIgnoreAdding(self)) return;
      var entry = new Entry(metadataPath, false, options2);
      entry.uncompressedSize = buffer.length;
      entry.crc32 = crc32.unsigned(buffer);
      entry.crcAndFileSizeKnown = true;
      self.entries.push(entry);
      if (entry.compressionLevel === 0) {
        setCompressedBuffer(buffer);
      } else {
        zlib.deflateRaw(buffer, { level: entry.compressionLevel }, function(err, compressedBuffer) {
          setCompressedBuffer(compressedBuffer);
        });
      }
      function setCompressedBuffer(compressedBuffer) {
        entry.compressedSize = compressedBuffer.length;
        entry.setFileDataPumpFunction(function() {
          writeToOutputStream(self, compressedBuffer);
          writeToOutputStream(self, entry.getDataDescriptor());
          entry.state = Entry.FILE_DATA_DONE;
          setImmediate(function() {
            pumpEntries(self);
          });
        });
        pumpEntries(self);
      }
    };
    ZipFile.prototype.addEmptyDirectory = function(metadataPath, options2) {
      var self = this;
      metadataPath = validateMetadataPath(metadataPath, true);
      if (options2 == null) options2 = {};
      if (options2.size != null) throw new Error("options.size not allowed");
      if (options2.compress != null) throw new Error("options.compress not allowed");
      if (options2.compressionLevel != null) throw new Error("options.compressionLevel not allowed");
      if (shouldIgnoreAdding(self)) return;
      var entry = new Entry(metadataPath, true, options2);
      self.entries.push(entry);
      entry.setFileDataPumpFunction(function() {
        writeToOutputStream(self, entry.getDataDescriptor());
        entry.state = Entry.FILE_DATA_DONE;
        pumpEntries(self);
      });
      pumpEntries(self);
    };
    var eocdrSignatureBuffer = bufferFrom([80, 75, 5, 6]);
    ZipFile.prototype.end = function(options2, calculatedTotalSizeCallback) {
      if (typeof options2 === "function") {
        calculatedTotalSizeCallback = options2;
        options2 = null;
      }
      if (options2 == null) options2 = {};
      if (this.ended) return;
      this.ended = true;
      if (this.errored) return;
      this.calculatedTotalSizeCallback = calculatedTotalSizeCallback;
      this.forceZip64Eocd = !!options2.forceZip64Format;
      if (options2.comment) {
        if (typeof options2.comment === "string") {
          this.comment = encodeCp437(options2.comment);
        } else {
          this.comment = options2.comment;
        }
        if (this.comment.length > 65535) throw new Error("comment is too large");
        if (bufferIncludes(this.comment, eocdrSignatureBuffer)) throw new Error("comment contains end of central directory record signature");
      } else {
        this.comment = EMPTY_BUFFER;
      }
      pumpEntries(this);
    };
    function writeToOutputStream(self, buffer) {
      self.outputStream.write(buffer);
      self.outputStreamCursor += buffer.length;
    }
    function pumpFileDataReadStream(self, entry, readStream) {
      var crc32Watcher = new Crc32Watcher();
      var uncompressedSizeCounter = new ByteCounter();
      var compressor = entry.compressionLevel !== 0 ? new zlib.DeflateRaw({ level: entry.compressionLevel }) : new PassThrough();
      var compressedSizeCounter = new ByteCounter();
      readStream.pipe(crc32Watcher).pipe(uncompressedSizeCounter).pipe(compressor).pipe(compressedSizeCounter).pipe(self.outputStream, { end: false });
      compressedSizeCounter.on("end", function() {
        entry.crc32 = crc32Watcher.crc32;
        if (entry.uncompressedSize == null) {
          entry.uncompressedSize = uncompressedSizeCounter.byteCount;
        } else {
          if (entry.uncompressedSize !== uncompressedSizeCounter.byteCount) return self.emit("error", new Error("file data stream has unexpected number of bytes"));
        }
        entry.compressedSize = compressedSizeCounter.byteCount;
        self.outputStreamCursor += entry.compressedSize;
        writeToOutputStream(self, entry.getDataDescriptor());
        entry.state = Entry.FILE_DATA_DONE;
        pumpEntries(self);
      });
    }
    function determineCompressionLevel(options2) {
      if (options2.compress != null && options2.compressionLevel != null) {
        if (!!options2.compress !== !!options2.compressionLevel) throw new Error("conflicting settings for compress and compressionLevel");
      }
      if (options2.compressionLevel != null) return options2.compressionLevel;
      if (options2.compress === false) return 0;
      return 6;
    }
    function pumpEntries(self) {
      if (self.allDone || self.errored) return;
      if (self.ended && self.calculatedTotalSizeCallback != null) {
        var calculatedTotalSize = calculateTotalSize(self);
        if (calculatedTotalSize != null) {
          self.calculatedTotalSizeCallback(calculatedTotalSize);
          self.calculatedTotalSizeCallback = null;
        }
      }
      var entry = getFirstNotDoneEntry();
      function getFirstNotDoneEntry() {
        for (var i = 0; i < self.entries.length; i++) {
          var entry2 = self.entries[i];
          if (entry2.state < Entry.FILE_DATA_DONE) return entry2;
        }
        return null;
      }
      if (entry != null) {
        if (entry.state < Entry.READY_TO_PUMP_FILE_DATA) return;
        if (entry.state === Entry.FILE_DATA_IN_PROGRESS) return;
        entry.relativeOffsetOfLocalHeader = self.outputStreamCursor;
        var localFileHeader = entry.getLocalFileHeader();
        writeToOutputStream(self, localFileHeader);
        entry.doFileDataPump();
      } else {
        if (self.ended) {
          self.offsetOfStartOfCentralDirectory = self.outputStreamCursor;
          self.entries.forEach(function(entry2) {
            var centralDirectoryRecord = entry2.getCentralDirectoryRecord();
            writeToOutputStream(self, centralDirectoryRecord);
          });
          writeToOutputStream(self, getEndOfCentralDirectoryRecord(self));
          self.outputStream.end();
          self.allDone = true;
        }
      }
    }
    function calculateTotalSize(self) {
      var pretendOutputCursor = 0;
      var centralDirectorySize = 0;
      for (var i = 0; i < self.entries.length; i++) {
        var entry = self.entries[i];
        if (entry.compressionLevel !== 0) return -1;
        if (entry.state >= Entry.READY_TO_PUMP_FILE_DATA) {
          if (entry.uncompressedSize == null) return -1;
        } else {
          if (entry.uncompressedSize == null) return null;
        }
        entry.relativeOffsetOfLocalHeader = pretendOutputCursor;
        var useZip64Format = entry.useZip64Format();
        pretendOutputCursor += LOCAL_FILE_HEADER_FIXED_SIZE + entry.utf8FileName.length;
        pretendOutputCursor += entry.uncompressedSize;
        if (!entry.crcAndFileSizeKnown) {
          if (useZip64Format) {
            pretendOutputCursor += ZIP64_DATA_DESCRIPTOR_SIZE;
          } else {
            pretendOutputCursor += DATA_DESCRIPTOR_SIZE;
          }
        }
        centralDirectorySize += CENTRAL_DIRECTORY_RECORD_FIXED_SIZE + entry.utf8FileName.length + entry.fileComment.length;
        if (!entry.forceDosTimestamp) {
          centralDirectorySize += INFO_ZIP_UNIVERSAL_TIMESTAMP_EXTRA_FIELD_SIZE;
        }
        if (useZip64Format) {
          centralDirectorySize += ZIP64_EXTENDED_INFORMATION_EXTRA_FIELD_SIZE;
        }
      }
      var endOfCentralDirectorySize = 0;
      if (self.forceZip64Eocd || self.entries.length >= 65535 || centralDirectorySize >= 65535 || pretendOutputCursor >= 4294967295) {
        endOfCentralDirectorySize += ZIP64_END_OF_CENTRAL_DIRECTORY_RECORD_SIZE + ZIP64_END_OF_CENTRAL_DIRECTORY_LOCATOR_SIZE;
      }
      endOfCentralDirectorySize += END_OF_CENTRAL_DIRECTORY_RECORD_SIZE + self.comment.length;
      return pretendOutputCursor + centralDirectorySize + endOfCentralDirectorySize;
    }
    function shouldIgnoreAdding(self) {
      if (self.ended) throw new Error("cannot add entries after calling end()");
      if (self.errored) return true;
      return false;
    }
    var ZIP64_END_OF_CENTRAL_DIRECTORY_RECORD_SIZE = 56;
    var ZIP64_END_OF_CENTRAL_DIRECTORY_LOCATOR_SIZE = 20;
    var END_OF_CENTRAL_DIRECTORY_RECORD_SIZE = 22;
    function getEndOfCentralDirectoryRecord(self, actuallyJustTellMeHowLongItWouldBe) {
      var needZip64Format = false;
      var normalEntriesLength = self.entries.length;
      if (self.forceZip64Eocd || self.entries.length >= 65535) {
        normalEntriesLength = 65535;
        needZip64Format = true;
      }
      var sizeOfCentralDirectory = self.outputStreamCursor - self.offsetOfStartOfCentralDirectory;
      var normalSizeOfCentralDirectory = sizeOfCentralDirectory;
      if (self.forceZip64Eocd || sizeOfCentralDirectory >= 4294967295) {
        normalSizeOfCentralDirectory = 4294967295;
        needZip64Format = true;
      }
      var normalOffsetOfStartOfCentralDirectory = self.offsetOfStartOfCentralDirectory;
      if (self.forceZip64Eocd || self.offsetOfStartOfCentralDirectory >= 4294967295) {
        normalOffsetOfStartOfCentralDirectory = 4294967295;
        needZip64Format = true;
      }
      if (actuallyJustTellMeHowLongItWouldBe) {
        if (needZip64Format) {
          return ZIP64_END_OF_CENTRAL_DIRECTORY_RECORD_SIZE + ZIP64_END_OF_CENTRAL_DIRECTORY_LOCATOR_SIZE + END_OF_CENTRAL_DIRECTORY_RECORD_SIZE;
        } else {
          return END_OF_CENTRAL_DIRECTORY_RECORD_SIZE;
        }
      }
      var eocdrBuffer = bufferAlloc(END_OF_CENTRAL_DIRECTORY_RECORD_SIZE + self.comment.length);
      eocdrBuffer.writeUInt32LE(101010256, 0);
      eocdrBuffer.writeUInt16LE(0, 4);
      eocdrBuffer.writeUInt16LE(0, 6);
      eocdrBuffer.writeUInt16LE(normalEntriesLength, 8);
      eocdrBuffer.writeUInt16LE(normalEntriesLength, 10);
      eocdrBuffer.writeUInt32LE(normalSizeOfCentralDirectory, 12);
      eocdrBuffer.writeUInt32LE(normalOffsetOfStartOfCentralDirectory, 16);
      eocdrBuffer.writeUInt16LE(self.comment.length, 20);
      self.comment.copy(eocdrBuffer, 22);
      if (!needZip64Format) return eocdrBuffer;
      var zip64EocdrBuffer = bufferAlloc(ZIP64_END_OF_CENTRAL_DIRECTORY_RECORD_SIZE);
      zip64EocdrBuffer.writeUInt32LE(101075792, 0);
      writeUInt64LE(zip64EocdrBuffer, ZIP64_END_OF_CENTRAL_DIRECTORY_RECORD_SIZE - 12, 4);
      zip64EocdrBuffer.writeUInt16LE(VERSION_MADE_BY, 12);
      zip64EocdrBuffer.writeUInt16LE(VERSION_NEEDED_TO_EXTRACT_ZIP64, 14);
      zip64EocdrBuffer.writeUInt32LE(0, 16);
      zip64EocdrBuffer.writeUInt32LE(0, 20);
      writeUInt64LE(zip64EocdrBuffer, self.entries.length, 24);
      writeUInt64LE(zip64EocdrBuffer, self.entries.length, 32);
      writeUInt64LE(zip64EocdrBuffer, sizeOfCentralDirectory, 40);
      writeUInt64LE(zip64EocdrBuffer, self.offsetOfStartOfCentralDirectory, 48);
      var zip64EocdlBuffer = bufferAlloc(ZIP64_END_OF_CENTRAL_DIRECTORY_LOCATOR_SIZE);
      zip64EocdlBuffer.writeUInt32LE(117853008, 0);
      zip64EocdlBuffer.writeUInt32LE(0, 4);
      writeUInt64LE(zip64EocdlBuffer, self.outputStreamCursor, 8);
      zip64EocdlBuffer.writeUInt32LE(1, 16);
      return Buffer.concat([
        zip64EocdrBuffer,
        zip64EocdlBuffer,
        eocdrBuffer
      ]);
    }
    function validateMetadataPath(metadataPath, isDirectory) {
      if (metadataPath === "") throw new Error("empty metadataPath");
      metadataPath = metadataPath.replace(/\\/g, "/");
      if (/^[a-zA-Z]:/.test(metadataPath) || /^\//.test(metadataPath)) throw new Error("absolute path: " + metadataPath);
      if (metadataPath.split("/").indexOf("..") !== -1) throw new Error("invalid relative path: " + metadataPath);
      var looksLikeDirectory = /\/$/.test(metadataPath);
      if (isDirectory) {
        if (!looksLikeDirectory) metadataPath += "/";
      } else {
        if (looksLikeDirectory) throw new Error("file path cannot end with '/': " + metadataPath);
      }
      return metadataPath;
    }
    var EMPTY_BUFFER = bufferAlloc(0);
    function Entry(metadataPath, isDirectory, options2) {
      this.utf8FileName = bufferFrom(metadataPath);
      if (this.utf8FileName.length > 65535) throw new Error("utf8 file name too long. " + utf8FileName.length + " > 65535");
      this.isDirectory = isDirectory;
      this.state = Entry.WAITING_FOR_METADATA;
      this.setLastModDate(options2.mtime != null ? options2.mtime : /* @__PURE__ */ new Date());
      this.forceDosTimestamp = !!options2.forceDosTimestamp;
      if (options2.mode != null) {
        this.setFileAttributesMode(options2.mode);
      } else {
        this.setFileAttributesMode(isDirectory ? 16893 : 33204);
      }
      if (isDirectory) {
        this.crcAndFileSizeKnown = true;
        this.crc32 = 0;
        this.uncompressedSize = 0;
        this.compressedSize = 0;
      } else {
        this.crcAndFileSizeKnown = false;
        this.crc32 = null;
        this.uncompressedSize = null;
        this.compressedSize = null;
        if (options2.size != null) this.uncompressedSize = options2.size;
      }
      if (isDirectory) {
        this.compressionLevel = 0;
      } else {
        this.compressionLevel = determineCompressionLevel(options2);
      }
      this.forceZip64Format = !!options2.forceZip64Format;
      if (options2.fileComment) {
        if (typeof options2.fileComment === "string") {
          this.fileComment = bufferFrom(options2.fileComment, "utf-8");
        } else {
          this.fileComment = options2.fileComment;
        }
        if (this.fileComment.length > 65535) throw new Error("fileComment is too large");
      } else {
        this.fileComment = EMPTY_BUFFER;
      }
    }
    Entry.WAITING_FOR_METADATA = 0;
    Entry.READY_TO_PUMP_FILE_DATA = 1;
    Entry.FILE_DATA_IN_PROGRESS = 2;
    Entry.FILE_DATA_DONE = 3;
    Entry.prototype.setLastModDate = function(date) {
      this.mtime = date;
      var dosDateTime = dateToDosDateTime(date);
      this.lastModFileTime = dosDateTime.time;
      this.lastModFileDate = dosDateTime.date;
    };
    Entry.prototype.setFileAttributesMode = function(mode) {
      if ((mode & 65535) !== mode) throw new Error("invalid mode. expected: 0 <= " + mode + " <= 65535");
      this.externalFileAttributes = mode << 16 >>> 0;
    };
    Entry.prototype.setFileDataPumpFunction = function(doFileDataPump) {
      this.doFileDataPump = doFileDataPump;
      this.state = Entry.READY_TO_PUMP_FILE_DATA;
    };
    Entry.prototype.useZip64Format = function() {
      return this.forceZip64Format || this.uncompressedSize != null && this.uncompressedSize > 4294967294 || this.compressedSize != null && this.compressedSize > 4294967294 || this.relativeOffsetOfLocalHeader != null && this.relativeOffsetOfLocalHeader > 4294967294;
    };
    var LOCAL_FILE_HEADER_FIXED_SIZE = 30;
    var VERSION_NEEDED_TO_EXTRACT_UTF8 = 20;
    var VERSION_NEEDED_TO_EXTRACT_ZIP64 = 45;
    var VERSION_MADE_BY = 3 << 8 | 63;
    var FILE_NAME_IS_UTF8 = 1 << 11;
    var UNKNOWN_CRC32_AND_FILE_SIZES = 1 << 3;
    Entry.prototype.getLocalFileHeader = function() {
      var crc322 = 0;
      var compressedSize = 0;
      var uncompressedSize = 0;
      if (this.crcAndFileSizeKnown) {
        crc322 = this.crc32;
        compressedSize = this.compressedSize;
        uncompressedSize = this.uncompressedSize;
      }
      var fixedSizeStuff = bufferAlloc(LOCAL_FILE_HEADER_FIXED_SIZE);
      var generalPurposeBitFlag = FILE_NAME_IS_UTF8;
      if (!this.crcAndFileSizeKnown) generalPurposeBitFlag |= UNKNOWN_CRC32_AND_FILE_SIZES;
      fixedSizeStuff.writeUInt32LE(67324752, 0);
      fixedSizeStuff.writeUInt16LE(VERSION_NEEDED_TO_EXTRACT_UTF8, 4);
      fixedSizeStuff.writeUInt16LE(generalPurposeBitFlag, 6);
      fixedSizeStuff.writeUInt16LE(this.getCompressionMethod(), 8);
      fixedSizeStuff.writeUInt16LE(this.lastModFileTime, 10);
      fixedSizeStuff.writeUInt16LE(this.lastModFileDate, 12);
      fixedSizeStuff.writeUInt32LE(crc322, 14);
      fixedSizeStuff.writeUInt32LE(compressedSize, 18);
      fixedSizeStuff.writeUInt32LE(uncompressedSize, 22);
      fixedSizeStuff.writeUInt16LE(this.utf8FileName.length, 26);
      fixedSizeStuff.writeUInt16LE(0, 28);
      return Buffer.concat([
        fixedSizeStuff,
        // file name (variable size)
        this.utf8FileName
        // extra field (variable size)
        // no extra fields
      ]);
    };
    var DATA_DESCRIPTOR_SIZE = 16;
    var ZIP64_DATA_DESCRIPTOR_SIZE = 24;
    Entry.prototype.getDataDescriptor = function() {
      if (this.crcAndFileSizeKnown) {
        return EMPTY_BUFFER;
      }
      if (!this.useZip64Format()) {
        var buffer = bufferAlloc(DATA_DESCRIPTOR_SIZE);
        buffer.writeUInt32LE(134695760, 0);
        buffer.writeUInt32LE(this.crc32, 4);
        buffer.writeUInt32LE(this.compressedSize, 8);
        buffer.writeUInt32LE(this.uncompressedSize, 12);
        return buffer;
      } else {
        var buffer = bufferAlloc(ZIP64_DATA_DESCRIPTOR_SIZE);
        buffer.writeUInt32LE(134695760, 0);
        buffer.writeUInt32LE(this.crc32, 4);
        writeUInt64LE(buffer, this.compressedSize, 8);
        writeUInt64LE(buffer, this.uncompressedSize, 16);
        return buffer;
      }
    };
    var CENTRAL_DIRECTORY_RECORD_FIXED_SIZE = 46;
    var INFO_ZIP_UNIVERSAL_TIMESTAMP_EXTRA_FIELD_SIZE = 9;
    var ZIP64_EXTENDED_INFORMATION_EXTRA_FIELD_SIZE = 28;
    Entry.prototype.getCentralDirectoryRecord = function() {
      var fixedSizeStuff = bufferAlloc(CENTRAL_DIRECTORY_RECORD_FIXED_SIZE);
      var generalPurposeBitFlag = FILE_NAME_IS_UTF8;
      if (!this.crcAndFileSizeKnown) generalPurposeBitFlag |= UNKNOWN_CRC32_AND_FILE_SIZES;
      var izutefBuffer = EMPTY_BUFFER;
      if (!this.forceDosTimestamp) {
        izutefBuffer = bufferAlloc(INFO_ZIP_UNIVERSAL_TIMESTAMP_EXTRA_FIELD_SIZE);
        izutefBuffer.writeUInt16LE(21589, 0);
        izutefBuffer.writeUInt16LE(INFO_ZIP_UNIVERSAL_TIMESTAMP_EXTRA_FIELD_SIZE - 4, 2);
        var EB_UT_FL_MTIME = 1 << 0;
        var EB_UT_FL_ATIME = 1 << 1;
        izutefBuffer.writeUInt8(EB_UT_FL_MTIME | EB_UT_FL_ATIME, 4);
        var timestamp = Math.floor(this.mtime.getTime() / 1e3);
        if (timestamp < -2147483648) timestamp = -2147483648;
        if (timestamp > 2147483647) timestamp = 2147483647;
        izutefBuffer.writeUInt32LE(timestamp, 5);
      }
      var normalCompressedSize = this.compressedSize;
      var normalUncompressedSize = this.uncompressedSize;
      var normalRelativeOffsetOfLocalHeader = this.relativeOffsetOfLocalHeader;
      var versionNeededToExtract = VERSION_NEEDED_TO_EXTRACT_UTF8;
      var zeiefBuffer = EMPTY_BUFFER;
      if (this.useZip64Format()) {
        normalCompressedSize = 4294967295;
        normalUncompressedSize = 4294967295;
        normalRelativeOffsetOfLocalHeader = 4294967295;
        versionNeededToExtract = VERSION_NEEDED_TO_EXTRACT_ZIP64;
        zeiefBuffer = bufferAlloc(ZIP64_EXTENDED_INFORMATION_EXTRA_FIELD_SIZE);
        zeiefBuffer.writeUInt16LE(1, 0);
        zeiefBuffer.writeUInt16LE(ZIP64_EXTENDED_INFORMATION_EXTRA_FIELD_SIZE - 4, 2);
        writeUInt64LE(zeiefBuffer, this.uncompressedSize, 4);
        writeUInt64LE(zeiefBuffer, this.compressedSize, 12);
        writeUInt64LE(zeiefBuffer, this.relativeOffsetOfLocalHeader, 20);
      }
      fixedSizeStuff.writeUInt32LE(33639248, 0);
      fixedSizeStuff.writeUInt16LE(VERSION_MADE_BY, 4);
      fixedSizeStuff.writeUInt16LE(versionNeededToExtract, 6);
      fixedSizeStuff.writeUInt16LE(generalPurposeBitFlag, 8);
      fixedSizeStuff.writeUInt16LE(this.getCompressionMethod(), 10);
      fixedSizeStuff.writeUInt16LE(this.lastModFileTime, 12);
      fixedSizeStuff.writeUInt16LE(this.lastModFileDate, 14);
      fixedSizeStuff.writeUInt32LE(this.crc32, 16);
      fixedSizeStuff.writeUInt32LE(normalCompressedSize, 20);
      fixedSizeStuff.writeUInt32LE(normalUncompressedSize, 24);
      fixedSizeStuff.writeUInt16LE(this.utf8FileName.length, 28);
      fixedSizeStuff.writeUInt16LE(izutefBuffer.length + zeiefBuffer.length, 30);
      fixedSizeStuff.writeUInt16LE(this.fileComment.length, 32);
      fixedSizeStuff.writeUInt16LE(0, 34);
      fixedSizeStuff.writeUInt16LE(0, 36);
      fixedSizeStuff.writeUInt32LE(this.externalFileAttributes, 38);
      fixedSizeStuff.writeUInt32LE(normalRelativeOffsetOfLocalHeader, 42);
      return Buffer.concat([
        fixedSizeStuff,
        // file name (variable size)
        this.utf8FileName,
        // extra field (variable size)
        izutefBuffer,
        zeiefBuffer,
        // file comment (variable size)
        this.fileComment
      ]);
    };
    Entry.prototype.getCompressionMethod = function() {
      var NO_COMPRESSION = 0;
      var DEFLATE_COMPRESSION = 8;
      return this.compressionLevel === 0 ? NO_COMPRESSION : DEFLATE_COMPRESSION;
    };
    var minDosDate = new Date(1980, 0, 1);
    var maxDosDate = new Date(2107, 11, 31, 23, 59, 58);
    function dateToDosDateTime(jsDate) {
      if (jsDate < minDosDate) jsDate = minDosDate;
      else if (jsDate > maxDosDate) jsDate = maxDosDate;
      var date = 0;
      date |= jsDate.getDate() & 31;
      date |= (jsDate.getMonth() + 1 & 15) << 5;
      date |= (jsDate.getFullYear() - 1980 & 127) << 9;
      var time = 0;
      time |= Math.floor(jsDate.getSeconds() / 2);
      time |= (jsDate.getMinutes() & 63) << 5;
      time |= (jsDate.getHours() & 31) << 11;
      return { date, time };
    }
    function writeUInt64LE(buffer, n, offset) {
      var high = Math.floor(n / 4294967296);
      var low = n % 4294967296;
      buffer.writeUInt32LE(low, offset);
      buffer.writeUInt32LE(high, offset + 4);
    }
    util.inherits(ByteCounter, Transform3);
    function ByteCounter(options2) {
      Transform3.call(this, options2);
      this.byteCount = 0;
    }
    ByteCounter.prototype._transform = function(chunk, encoding, cb) {
      this.byteCount += chunk.length;
      cb(null, chunk);
    };
    util.inherits(Crc32Watcher, Transform3);
    function Crc32Watcher(options2) {
      Transform3.call(this, options2);
      this.crc32 = 0;
    }
    Crc32Watcher.prototype._transform = function(chunk, encoding, cb) {
      this.crc32 = crc32.unsigned(chunk, this.crc32);
      cb(null, chunk);
    };
    var cp437 = "\0\u263A\u263B\u2665\u2666\u2663\u2660\u2022\u25D8\u25CB\u25D9\u2642\u2640\u266A\u266B\u263C\u25BA\u25C4\u2195\u203C\xB6\xA7\u25AC\u21A8\u2191\u2193\u2192\u2190\u221F\u2194\u25B2\u25BC !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~\u2302\xC7\xFC\xE9\xE2\xE4\xE0\xE5\xE7\xEA\xEB\xE8\xEF\xEE\xEC\xC4\xC5\xC9\xE6\xC6\xF4\xF6\xF2\xFB\xF9\xFF\xD6\xDC\xA2\xA3\xA5\u20A7\u0192\xE1\xED\xF3\xFA\xF1\xD1\xAA\xBA\xBF\u2310\xAC\xBD\xBC\xA1\xAB\xBB\u2591\u2592\u2593\u2502\u2524\u2561\u2562\u2556\u2555\u2563\u2551\u2557\u255D\u255C\u255B\u2510\u2514\u2534\u252C\u251C\u2500\u253C\u255E\u255F\u255A\u2554\u2569\u2566\u2560\u2550\u256C\u2567\u2568\u2564\u2565\u2559\u2558\u2552\u2553\u256B\u256A\u2518\u250C\u2588\u2584\u258C\u2590\u2580\u03B1\xDF\u0393\u03C0\u03A3\u03C3\xB5\u03C4\u03A6\u0398\u03A9\u03B4\u221E\u03C6\u03B5\u2229\u2261\xB1\u2265\u2264\u2320\u2321\xF7\u2248\xB0\u2219\xB7\u221A\u207F\xB2\u25A0\xA0";
    if (cp437.length !== 256) throw new Error("assertion failure");
    var reverseCp437 = null;
    function encodeCp437(string) {
      if (/^[\x20-\x7e]*$/.test(string)) {
        return bufferFrom(string, "utf-8");
      }
      if (reverseCp437 == null) {
        reverseCp437 = {};
        for (var i = 0; i < cp437.length; i++) {
          reverseCp437[cp437[i]] = i;
        }
      }
      var result = bufferAlloc(string.length);
      for (var i = 0; i < string.length; i++) {
        var b = reverseCp437[string[i]];
        if (b == null) throw new Error("character not encodable in CP437: " + JSON.stringify(string[i]));
        result[i] = b;
      }
      return result;
    }
    function bufferAlloc(size) {
      bufferAlloc = modern;
      try {
        return bufferAlloc(size);
      } catch (e) {
        bufferAlloc = legacy;
        return bufferAlloc(size);
      }
      function modern(size2) {
        return Buffer.allocUnsafe(size2);
      }
      function legacy(size2) {
        return new Buffer(size2);
      }
    }
    function bufferFrom(something, encoding) {
      bufferFrom = modern;
      try {
        return bufferFrom(something, encoding);
      } catch (e) {
        bufferFrom = legacy;
        return bufferFrom(something, encoding);
      }
      function modern(something2, encoding2) {
        return Buffer.from(something2, encoding2);
      }
      function legacy(something2, encoding2) {
        return new Buffer(something2, encoding2);
      }
    }
    function bufferIncludes(buffer, content) {
      bufferIncludes = modern;
      try {
        return bufferIncludes(buffer, content);
      } catch (e) {
        bufferIncludes = legacy;
        return bufferIncludes(buffer, content);
      }
      function modern(buffer2, content2) {
        return buffer2.includes(content2);
      }
      function legacy(buffer2, content2) {
        for (var i = 0; i <= buffer2.length - content2.length; i++) {
          for (var j = 0; ; j++) {
            if (j === content2.length) return true;
            if (buffer2[i + j] !== content2[j]) break;
          }
        }
        return false;
      }
    }
  }
});

// src/private-channel.ts
var private_channel_exports = {};
__export(private_channel_exports, {
  UUID: () => UUID,
  channelPath: () => channelPath,
  privateDirectory: () => privateDirectory,
  readJsonFile: () => readJsonFile,
  writePrivateJson: () => writePrivateJson
});
async function channelPath(packageDirectory2, hostPID = process.ppid, home = (0, import_node_os2.homedir)()) {
  if (!Number.isInteger(hostPID) || hostPID <= 0) throw new Error("A managed host process identity is required.");
  const canonical = await (0, import_promises8.realpath)(packageDirectory2);
  const packageKey = (0, import_node_crypto6.createHash)("sha256").update(process.platform === "win32" ? canonical.toLowerCase() : canonical).digest("hex");
  return { root: (0, import_node_path8.join)(home, ".openchamber-session-export", "bridges", packageKey, String(hostPID)), packageKey };
}
async function privateDirectory(directory) {
  await (0, import_promises8.mkdir)(directory, { recursive: true, mode: 448 });
  const metadata = await (0, import_promises8.lstat)(directory);
  const canonical = (0, import_node_path8.resolve)(await (0, import_promises8.realpath)(directory)), supplied = (0, import_node_path8.resolve)(directory);
  if (!metadata.isDirectory() || metadata.isSymbolicLink() || (process.platform === "win32" ? canonical.toLowerCase() !== supplied.toLowerCase() : canonical !== supplied)) throw new Error("The private transfer directory is not a regular canonical directory.");
  if (process.platform !== "win32") {
    if (metadata.uid !== process.getuid?.() || (metadata.mode & 63) !== 0) throw new Error("The private transfer directory must belong to this user and have mode 0700.");
  } else {
    const script = "$ErrorActionPreference='Stop';$p=$env:SESSION_EXPORT_PRIVATE_DIR;$sid=[Security.Principal.WindowsIdentity]::GetCurrent().User;$a=New-Object Security.AccessControl.DirectorySecurity;$a.SetOwner($sid);$a.SetAccessRuleProtection($true,$false);$r=New-Object Security.AccessControl.FileSystemAccessRule($sid,'FullControl','ContainerInherit,ObjectInherit','None','Allow');$a.AddAccessRule($r);[System.IO.Directory]::SetAccessControl($p,$a)";
    await exec("powershell.exe", ["-NoProfile", "-NonInteractive", "-EncodedCommand", Buffer.from(script, "utf16le").toString("base64")], {
      windowsHide: true,
      timeout: 1e4,
      env: { PATH: process.env.PATH, SYSTEMROOT: process.env.SYSTEMROOT, SESSION_EXPORT_PRIVATE_DIR: directory }
    });
  }
}
async function writePrivateJson(path, value) {
  const temporary = `${path}.${(0, import_node_crypto6.randomUUID)()}.partial`;
  await (0, import_promises8.writeFile)(temporary, JSON.stringify(value), { flag: "wx", mode: 384 });
  await (0, import_promises8.rename)(temporary, path);
}
async function readJsonFile(path, limit) {
  const metadata = await (0, import_promises8.lstat)(path);
  if (!metadata.isFile() || metadata.isSymbolicLink() || metadata.size > limit) throw new Error("A transfer control file is unsafe or exceeds its documented size limit.");
  return JSON.parse(await (0, import_promises8.readFile)(path, "utf8"));
}
var import_node_crypto6, import_node_child_process2, import_promises8, import_node_os2, import_node_path8, import_node_util, UUID, exec;
var init_private_channel = __esm({
  "src/private-channel.ts"() {
    "use strict";
    import_node_crypto6 = require("node:crypto");
    import_node_child_process2 = require("node:child_process");
    import_promises8 = require("node:fs/promises");
    import_node_os2 = require("node:os");
    import_node_path8 = require("node:path");
    import_node_util = require("node:util");
    UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
    exec = (0, import_node_util.promisify)(import_node_child_process2.execFile);
  }
});

// node_modules/pend/index.js
var require_pend = __commonJS({
  "node_modules/pend/index.js"(exports2, module2) {
    module2.exports = Pend;
    function Pend() {
      this.pending = 0;
      this.max = Infinity;
      this.listeners = [];
      this.waiting = [];
      this.error = null;
    }
    Pend.prototype.go = function(fn) {
      if (this.pending < this.max) {
        pendGo(this, fn);
      } else {
        this.waiting.push(fn);
      }
    };
    Pend.prototype.wait = function(cb) {
      if (this.pending === 0) {
        cb(this.error);
      } else {
        this.listeners.push(cb);
      }
    };
    Pend.prototype.hold = function() {
      return pendHold(this);
    };
    function pendHold(self) {
      self.pending += 1;
      var called = false;
      return onCb;
      function onCb(err) {
        if (called) throw new Error("callback called twice");
        called = true;
        self.error = self.error || err;
        self.pending -= 1;
        if (self.waiting.length > 0 && self.pending < self.max) {
          pendGo(self, self.waiting.shift());
        } else if (self.pending === 0) {
          var listeners = self.listeners;
          self.listeners = [];
          listeners.forEach(cbListener);
        }
      }
      function cbListener(listener) {
        listener(self.error);
      }
    }
    function pendGo(self, fn) {
      fn(pendHold(self));
    }
  }
});

// node_modules/yauzl/fd-slicer.js
var require_fd_slicer = __commonJS({
  "node_modules/yauzl/fd-slicer.js"(exports2) {
    var fs = require("fs");
    var util = require("util");
    var stream = require("stream");
    var Readable6 = stream.Readable;
    var PassThrough = stream.PassThrough;
    var Pend = require_pend();
    var EventEmitter = require("events").EventEmitter;
    exports2.BufferSlicer = BufferSlicer;
    exports2.FdSlicer = FdSlicer;
    util.inherits(FdSlicer, EventEmitter);
    function FdSlicer(fd) {
      EventEmitter.call(this);
      this.fd = fd;
      this.pend = new Pend();
      this.pend.max = 1;
      this.refCount = 0;
    }
    FdSlicer.prototype.read = function(buffer, offset, length, position, callback) {
      var self = this;
      self.pend.go(function(cb) {
        fs.read(self.fd, buffer, offset, length, position, function(err, bytesRead, buffer2) {
          cb();
          callback(err, bytesRead, buffer2);
        });
      });
    };
    FdSlicer.prototype.createReadStream = function(options2) {
      return new ReadStream(this, options2);
    };
    FdSlicer.prototype.ref = function() {
      this.refCount += 1;
    };
    FdSlicer.prototype.unref = function() {
      var self = this;
      self.refCount -= 1;
      if (self.refCount < 0) throw new Error("invalid unref");
      if (self.refCount > 0) return;
      fs.close(self.fd, onCloseDone);
      function onCloseDone(err) {
        if (err) {
          self.emit("error", err);
        } else {
          self.emit("close");
        }
      }
    };
    util.inherits(ReadStream, Readable6);
    function ReadStream(context, options2) {
      options2 = options2 || {};
      Readable6.call(this, options2);
      this.context = context;
      this.context.ref();
      this.start = options2.start || 0;
      this.endOffset = options2.end;
      this.pos = this.start;
    }
    ReadStream.prototype._read = function(n) {
      var self = this;
      var toRead = Math.min(self._readableState.highWaterMark, n);
      if (self.endOffset != null) {
        toRead = Math.min(toRead, self.endOffset - self.pos);
      }
      if (toRead <= 0) {
        self.push(null);
        this._cleanup();
        return;
      }
      self.context.pend.go(function(cb) {
        var buffer = Buffer.allocUnsafe(toRead);
        fs.read(self.context.fd, buffer, 0, toRead, self.pos, function(err, bytesRead) {
          if (err) {
            self.destroy(err);
          } else if (bytesRead === 0) {
            self.push(null);
            self._cleanup();
          } else {
            self.pos += bytesRead;
            self.push(buffer.slice(0, bytesRead));
          }
          cb();
        });
      });
    };
    ReadStream.prototype._destroy = function(err, cb) {
      this._cleanup();
      cb(err);
    };
    ReadStream.prototype._cleanup = function() {
      if (this.context != null) {
        this.context.unref();
        this.context = null;
      }
    };
    util.inherits(BufferSlicer, EventEmitter);
    function BufferSlicer(buffer) {
      EventEmitter.call(this);
      this.refCount = 0;
      this.buffer = buffer;
    }
    BufferSlicer.prototype.read = function(buffer, offset, length, position, callback) {
      if (!(0 <= offset && offset <= buffer.length)) throw new RangeError("offset outside buffer: 0 <= " + offset + " <= " + buffer.length);
      if (position < 0) throw new RangeError("position is negative: " + position);
      if (offset + length > buffer.length) {
        length = buffer.length - offset;
      }
      if (position + length > this.buffer.length) {
        length = this.buffer.length - position;
      }
      if (length <= 0) {
        setImmediate(function() {
          callback(null, 0);
        });
        return;
      }
      this.buffer.copy(buffer, offset, position, position + length);
      setImmediate(function() {
        callback(null, length);
      });
    };
    BufferSlicer.prototype.createReadStream = function(options2) {
      options2 = options2 || {};
      var readStream = new PassThrough(options2);
      readStream.start = options2.start || 0;
      readStream.endOffset = options2.end;
      readStream.pos = readStream.endOffset || this.buffer.length;
      var entireSlice = this.buffer.slice(readStream.start, readStream.pos);
      var maxChunkSize = 65536;
      var offset = 0;
      while (true) {
        var nextOffset = offset + maxChunkSize;
        if (nextOffset >= entireSlice.length) {
          if (offset < entireSlice.length) {
            readStream.write(entireSlice.slice(offset, entireSlice.length));
          }
          break;
        }
        readStream.write(entireSlice.slice(offset, nextOffset));
        offset = nextOffset;
      }
      readStream.end();
      return readStream;
    };
    BufferSlicer.prototype.ref = function() {
      this.refCount += 1;
    };
    BufferSlicer.prototype.unref = function() {
      this.refCount -= 1;
      if (this.refCount < 0) {
        throw new Error("invalid unref");
      }
    };
  }
});

// node_modules/yauzl/crc32.js
var require_crc32 = __commonJS({
  "node_modules/yauzl/crc32.js"(exports2, module2) {
    var CRC_TABLE = new Int32Array([
      0,
      1996959894,
      3993919788,
      2567524794,
      124634137,
      1886057615,
      3915621685,
      2657392035,
      249268274,
      2044508324,
      3772115230,
      2547177864,
      162941995,
      2125561021,
      3887607047,
      2428444049,
      498536548,
      1789927666,
      4089016648,
      2227061214,
      450548861,
      1843258603,
      4107580753,
      2211677639,
      325883990,
      1684777152,
      4251122042,
      2321926636,
      335633487,
      1661365465,
      4195302755,
      2366115317,
      997073096,
      1281953886,
      3579855332,
      2724688242,
      1006888145,
      1258607687,
      3524101629,
      2768942443,
      901097722,
      1119000684,
      3686517206,
      2898065728,
      853044451,
      1172266101,
      3705015759,
      2882616665,
      651767980,
      1373503546,
      3369554304,
      3218104598,
      565507253,
      1454621731,
      3485111705,
      3099436303,
      671266974,
      1594198024,
      3322730930,
      2970347812,
      795835527,
      1483230225,
      3244367275,
      3060149565,
      1994146192,
      31158534,
      2563907772,
      4023717930,
      1907459465,
      112637215,
      2680153253,
      3904427059,
      2013776290,
      251722036,
      2517215374,
      3775830040,
      2137656763,
      141376813,
      2439277719,
      3865271297,
      1802195444,
      476864866,
      2238001368,
      4066508878,
      1812370925,
      453092731,
      2181625025,
      4111451223,
      1706088902,
      314042704,
      2344532202,
      4240017532,
      1658658271,
      366619977,
      2362670323,
      4224994405,
      1303535960,
      984961486,
      2747007092,
      3569037538,
      1256170817,
      1037604311,
      2765210733,
      3554079995,
      1131014506,
      879679996,
      2909243462,
      3663771856,
      1141124467,
      855842277,
      2852801631,
      3708648649,
      1342533948,
      654459306,
      3188396048,
      3373015174,
      1466479909,
      544179635,
      3110523913,
      3462522015,
      1591671054,
      702138776,
      2966460450,
      3352799412,
      1504918807,
      783551873,
      3082640443,
      3233442989,
      3988292384,
      2596254646,
      62317068,
      1957810842,
      3939845945,
      2647816111,
      81470997,
      1943803523,
      3814918930,
      2489596804,
      225274430,
      2053790376,
      3826175755,
      2466906013,
      167816743,
      2097651377,
      4027552580,
      2265490386,
      503444072,
      1762050814,
      4150417245,
      2154129355,
      426522225,
      1852507879,
      4275313526,
      2312317920,
      282753626,
      1742555852,
      4189708143,
      2394877945,
      397917763,
      1622183637,
      3604390888,
      2714866558,
      953729732,
      1340076626,
      3518719985,
      2797360999,
      1068828381,
      1219638859,
      3624741850,
      2936675148,
      906185462,
      1090812512,
      3747672003,
      2825379669,
      829329135,
      1181335161,
      3412177804,
      3160834842,
      628085408,
      1382605366,
      3423369109,
      3138078467,
      570562233,
      1426400815,
      3317316542,
      2998733608,
      733239954,
      1555261956,
      3268935591,
      3050360625,
      752459403,
      1541320221,
      2607071920,
      3965973030,
      1969922972,
      40735498,
      2617837225,
      3943577151,
      1913087877,
      83908371,
      2512341634,
      3803740692,
      2075208622,
      213261112,
      2463272603,
      3855990285,
      2094854071,
      198958881,
      2262029012,
      4057260610,
      1759359992,
      534414190,
      2176718541,
      4139329115,
      1873836001,
      414664567,
      2282248934,
      4279200368,
      1711684554,
      285281116,
      2405801727,
      4167216745,
      1634467795,
      376229701,
      2685067896,
      3608007406,
      1308918612,
      956543938,
      2808555105,
      3495958263,
      1231636301,
      1047427035,
      2932959818,
      3654703836,
      1088359270,
      936918e3,
      2847714899,
      3736837829,
      1202900863,
      817233897,
      3183342108,
      3401237130,
      1404277552,
      615818150,
      3134207493,
      3453421203,
      1423857449,
      601450431,
      3009837614,
      3294710456,
      1567103746,
      711928724,
      3020668471,
      3272380065,
      1510334235,
      755167117
    ]);
    function crc32(buf) {
      let crc = -1;
      for (let x of buf) {
        crc = CRC_TABLE[(crc ^ x) & 255] ^ crc >>> 8;
      }
      return (crc ^ -1) >>> 0;
    }
    module2.exports = crc32;
  }
});

// node_modules/yauzl/index.js
var require_yauzl = __commonJS({
  "node_modules/yauzl/index.js"(exports2) {
    var fs = require("fs");
    var zlib = require("zlib");
    var fd_slicer = require_fd_slicer();
    var util = require("util");
    var EventEmitter = require("events").EventEmitter;
    var Transform3 = require("stream").Transform;
    var PassThrough = require("stream").PassThrough;
    var Writable2 = require("stream").Writable;
    var crc32 = typeof zlib.crc32 === "function" ? zlib.crc32 : require_crc32();
    exports2.open = open6;
    exports2.fromFd = fromFd;
    exports2.fromBuffer = fromBuffer;
    exports2.fromRandomAccessReader = fromRandomAccessReader;
    exports2.openPromise = openPromise;
    exports2.fromFdPromise = fromFdPromise;
    exports2.fromBufferPromise = fromBufferPromise;
    exports2.fromRandomAccessReaderPromise = fromRandomAccessReaderPromise;
    exports2.dosDateTimeToDate = dosDateTimeToDate;
    exports2.getFileNameLowLevel = getFileNameLowLevel;
    exports2.validateFileName = validateFileName;
    exports2.parseExtraFields = parseExtraFields;
    exports2.ZipFile = ZipFile;
    exports2.Entry = Entry;
    exports2.LocalFileHeader = LocalFileHeader;
    exports2.RandomAccessReader = RandomAccessReader;
    function openPromise(path, options2) {
      return new Promise((resolve4, reject) => {
        open6(path, { ...options2, lazyEntries: true }, function(err, zipfile) {
          if (err) return reject(err);
          resolve4(zipfile);
        });
      });
    }
    function fromFdPromise(fd, options2) {
      return new Promise((resolve4, reject) => {
        fromFd(fd, { ...options2, lazyEntries: true }, function(err, zipfile) {
          if (err) return reject(err);
          resolve4(zipfile);
        });
      });
    }
    function fromBufferPromise(buffer, options2) {
      return new Promise((resolve4, reject) => {
        fromBuffer(buffer, { ...options2, lazyEntries: true }, function(err, zipfile) {
          if (err) return reject(err);
          resolve4(zipfile);
        });
      });
    }
    function fromRandomAccessReaderPromise(reader, totalSize, options2) {
      return new Promise((resolve4, reject) => {
        fromRandomAccessReader(reader, totalSize, { ...options2, lazyEntries: true }, function(err, zipfile) {
          if (err) return reject(err);
          resolve4(zipfile);
        });
      });
    }
    function open6(path, options2, callback) {
      if (typeof options2 === "function") {
        callback = options2;
        options2 = null;
      }
      if (options2 == null) options2 = {};
      if (options2.autoClose == null) options2.autoClose = true;
      if (options2.lazyEntries == null) options2.lazyEntries = false;
      if (options2.decodeStrings == null) options2.decodeStrings = true;
      if (options2.validateEntrySizes == null) options2.validateEntrySizes = true;
      if (options2.strictFileNames == null) options2.strictFileNames = false;
      if (callback == null) callback = defaultCallback;
      fs.open(path, "r", function(err, fd) {
        if (err) return callback(err);
        fromFd(fd, options2, function(err2, zipfile) {
          if (err2) fs.close(fd, defaultCallback);
          callback(err2, zipfile);
        });
      });
    }
    function fromFd(fd, options2, callback) {
      if (typeof options2 === "function") {
        callback = options2;
        options2 = null;
      }
      if (options2 == null) options2 = {};
      if (options2.autoClose == null) options2.autoClose = false;
      if (options2.lazyEntries == null) options2.lazyEntries = false;
      if (options2.decodeStrings == null) options2.decodeStrings = true;
      if (options2.validateEntrySizes == null) options2.validateEntrySizes = true;
      if (options2.strictFileNames == null) options2.strictFileNames = false;
      if (callback == null) callback = defaultCallback;
      fs.fstat(fd, function(err, stats) {
        if (err) return callback(err);
        var reader = new fd_slicer.FdSlicer(fd);
        fromRandomAccessReader(reader, stats.size, options2, callback);
      });
    }
    function fromBuffer(buffer, options2, callback) {
      if (typeof options2 === "function") {
        callback = options2;
        options2 = null;
      }
      if (options2 == null) options2 = {};
      options2.autoClose = false;
      if (options2.lazyEntries == null) options2.lazyEntries = false;
      if (options2.decodeStrings == null) options2.decodeStrings = true;
      if (options2.validateEntrySizes == null) options2.validateEntrySizes = true;
      if (options2.strictFileNames == null) options2.strictFileNames = false;
      var reader = new fd_slicer.BufferSlicer(buffer);
      fromRandomAccessReader(reader, buffer.length, options2, callback);
    }
    function fromRandomAccessReader(reader, totalSize, options2, callback) {
      if (typeof options2 === "function") {
        callback = options2;
        options2 = null;
      }
      if (options2 == null) options2 = {};
      if (options2.autoClose == null) options2.autoClose = true;
      if (options2.lazyEntries == null) options2.lazyEntries = false;
      if (options2.decodeStrings == null) options2.decodeStrings = true;
      var decodeStrings = !!options2.decodeStrings;
      if (options2.validateEntrySizes == null) options2.validateEntrySizes = true;
      if (options2.strictFileNames == null) options2.strictFileNames = false;
      if (callback == null) callback = defaultCallback;
      if (typeof totalSize !== "number") throw new Error("expected totalSize parameter to be a number");
      if (totalSize > Number.MAX_SAFE_INTEGER) {
        throw new Error("zip file too large. only file sizes up to 2^52 are supported due to JavaScript's Number type being an IEEE 754 double.");
      }
      reader.ref();
      var eocdrWithoutCommentSize = 22;
      var zip64EocdlSize = 20;
      var maxCommentSize = 65535;
      var bufferSize = Math.min(zip64EocdlSize + eocdrWithoutCommentSize + maxCommentSize, totalSize);
      var buffer = newBuffer(bufferSize);
      var bufferReadStart = totalSize - buffer.length;
      readAndAssertNoEof(reader, buffer, 0, bufferSize, bufferReadStart, function(err) {
        if (err) return callback(err);
        for (var i = bufferSize - eocdrWithoutCommentSize; i >= 0; i -= 1) {
          if (buffer.readUInt32LE(i) !== 101010256) continue;
          var eocdrBuffer = buffer.subarray(i);
          var diskNumber = eocdrBuffer.readUInt16LE(4);
          var entryCount = eocdrBuffer.readUInt16LE(10);
          var centralDirectoryOffset = eocdrBuffer.readUInt32LE(16);
          var commentLength = eocdrBuffer.readUInt16LE(20);
          var expectedCommentLength = eocdrBuffer.length - eocdrWithoutCommentSize;
          if (commentLength !== expectedCommentLength) {
            return callback(new Error("Invalid comment length. Expected: " + expectedCommentLength + ". Found: " + commentLength + ". Are there extra bytes at the end of the file? Or is the end of central dir signature `PK\u263A\u263B` in the comment?"));
          }
          var comment = decodeStrings ? decodeBuffer(eocdrBuffer.subarray(22), false) : eocdrBuffer.subarray(22);
          if (i - zip64EocdlSize >= 0 && buffer.readUInt32LE(i - zip64EocdlSize) === 117853008) {
            var zip64EocdlBuffer = buffer.subarray(i - zip64EocdlSize, i - zip64EocdlSize + zip64EocdlSize);
            var zip64EocdrOffset = readUInt64LE(zip64EocdlBuffer, 8);
            var zip64EocdrBuffer = newBuffer(56);
            return readAndAssertNoEof(reader, zip64EocdrBuffer, 0, zip64EocdrBuffer.length, zip64EocdrOffset, function(err2) {
              if (err2) return callback(err2);
              if (zip64EocdrBuffer.readUInt32LE(0) !== 101075792) {
                return callback(new Error("invalid zip64 end of central directory record signature"));
              }
              diskNumber = zip64EocdrBuffer.readUInt32LE(16);
              if (diskNumber !== 0) {
                return callback(new Error("multi-disk zip files are not supported: found disk number: " + diskNumber));
              }
              entryCount = readUInt64LE(zip64EocdrBuffer, 32);
              centralDirectoryOffset = readUInt64LE(zip64EocdrBuffer, 48);
              return callback(null, new ZipFile(reader, centralDirectoryOffset, totalSize, entryCount, comment, options2.autoClose, options2.lazyEntries, decodeStrings, options2.validateEntrySizes, options2.strictFileNames));
            });
          }
          if (diskNumber !== 0) {
            return callback(new Error("multi-disk zip files are not supported: found disk number: " + diskNumber));
          }
          return callback(null, new ZipFile(reader, centralDirectoryOffset, totalSize, entryCount, comment, options2.autoClose, options2.lazyEntries, decodeStrings, options2.validateEntrySizes, options2.strictFileNames));
        }
        callback(new Error("End of central directory record signature not found. Either not a zip file, or file is truncated."));
      });
    }
    util.inherits(ZipFile, EventEmitter);
    function ZipFile(reader, centralDirectoryOffset, fileSize, entryCount, comment, autoClose, lazyEntries, decodeStrings, validateEntrySizes, strictFileNames) {
      var self = this;
      EventEmitter.call(self);
      self.reader = reader;
      self.reader.on("error", function(err) {
        emitError(self, err);
      });
      self.reader.once("close", function() {
        self.emit("close");
      });
      self.readEntryCursor = centralDirectoryOffset;
      self.fileSize = fileSize;
      self.entryCount = entryCount;
      self.comment = comment;
      self.entriesRead = 0;
      self.autoClose = !!autoClose;
      self.lazyEntries = !!lazyEntries;
      self.decodeStrings = !!decodeStrings;
      self.validateEntrySizes = !!validateEntrySizes;
      self.strictFileNames = !!strictFileNames;
      self.isOpen = true;
      self.emittedError = false;
      self.hasEachEntryBeenCalled = false;
      if (!self.lazyEntries) self._readEntry();
    }
    ZipFile.prototype.close = function() {
      if (!this.isOpen) return;
      this.isOpen = false;
      this.reader.unref();
    };
    function emitErrorAndAutoClose(self, err) {
      if (self.autoClose) self.close();
      emitError(self, err);
    }
    function emitError(self, err) {
      if (self.emittedError) return;
      self.emittedError = true;
      self.emit("error", err);
    }
    ZipFile.prototype.readEntry = function() {
      if (!this.lazyEntries) throw new Error("readEntry() called without lazyEntries:true");
      this._readEntry();
    };
    ZipFile.prototype._readEntry = function() {
      var self = this;
      if (self.entryCount === self.entriesRead) {
        setImmediate(function() {
          if (self.autoClose) self.close();
          if (self.emittedError) return;
          self.emit("end");
        });
        return;
      }
      if (self.emittedError) return;
      var buffer = newBuffer(46);
      readAndAssertNoEof(self.reader, buffer, 0, buffer.length, self.readEntryCursor, function(err) {
        if (err) return emitErrorAndAutoClose(self, err);
        if (self.emittedError) return;
        var entry = new Entry();
        var signature = buffer.readUInt32LE(0);
        if (signature !== 33639248) return emitErrorAndAutoClose(self, new Error("invalid central directory file header signature: 0x" + signature.toString(16)));
        entry.versionMadeBy = buffer.readUInt16LE(4);
        entry.versionNeededToExtract = buffer.readUInt16LE(6);
        entry.generalPurposeBitFlag = buffer.readUInt16LE(8);
        entry.compressionMethod = buffer.readUInt16LE(10);
        entry.lastModFileTime = buffer.readUInt16LE(12);
        entry.lastModFileDate = buffer.readUInt16LE(14);
        entry.crc32 = buffer.readUInt32LE(16);
        entry.compressedSize = buffer.readUInt32LE(20);
        entry.uncompressedSize = buffer.readUInt32LE(24);
        entry.fileNameLength = buffer.readUInt16LE(28);
        entry.extraFieldLength = buffer.readUInt16LE(30);
        entry.fileCommentLength = buffer.readUInt16LE(32);
        entry.internalFileAttributes = buffer.readUInt16LE(36);
        entry.externalFileAttributes = buffer.readUInt32LE(38);
        entry.relativeOffsetOfLocalHeader = buffer.readUInt32LE(42);
        if (entry.generalPurposeBitFlag & 64) return emitErrorAndAutoClose(self, new Error("strong encryption is not supported"));
        self.readEntryCursor += 46;
        buffer = newBuffer(entry.fileNameLength + entry.extraFieldLength + entry.fileCommentLength);
        readAndAssertNoEof(self.reader, buffer, 0, buffer.length, self.readEntryCursor, function(err2) {
          if (err2) return emitErrorAndAutoClose(self, err2);
          if (self.emittedError) return;
          entry.fileNameRaw = buffer.subarray(0, entry.fileNameLength);
          var fileCommentStart = entry.fileNameLength + entry.extraFieldLength;
          entry.extraFieldRaw = buffer.subarray(entry.fileNameLength, fileCommentStart);
          entry.fileCommentRaw = buffer.subarray(fileCommentStart, fileCommentStart + entry.fileCommentLength);
          try {
            entry.extraFields = parseExtraFields(entry.extraFieldRaw);
          } catch (err3) {
            return emitErrorAndAutoClose(self, err3);
          }
          if (self.decodeStrings) {
            var isUtf8 = (entry.generalPurposeBitFlag & 2048) !== 0;
            entry.fileComment = decodeBuffer(entry.fileCommentRaw, isUtf8);
            entry.fileName = getFileNameLowLevel(entry.generalPurposeBitFlag, entry.fileNameRaw, entry.extraFields, self.strictFileNames);
            var errorMessage = validateFileName(entry.fileName);
            if (errorMessage != null) return emitErrorAndAutoClose(self, new Error(errorMessage));
          } else {
            entry.fileComment = entry.fileCommentRaw;
            entry.fileName = entry.fileNameRaw;
          }
          entry.comment = entry.fileComment;
          self.readEntryCursor += buffer.length;
          self.entriesRead += 1;
          for (var i = 0; i < entry.extraFields.length; i++) {
            var extraField = entry.extraFields[i];
            if (extraField.id !== 1) continue;
            var zip64EiefBuffer = extraField.data;
            var index = 0;
            if (entry.uncompressedSize === 4294967295) {
              if (index + 8 > zip64EiefBuffer.length) {
                return emitErrorAndAutoClose(self, new Error("zip64 extended information extra field does not include uncompressed size"));
              }
              entry.uncompressedSize = readUInt64LE(zip64EiefBuffer, index);
              index += 8;
            }
            if (entry.compressedSize === 4294967295) {
              if (index + 8 > zip64EiefBuffer.length) {
                return emitErrorAndAutoClose(self, new Error("zip64 extended information extra field does not include compressed size"));
              }
              entry.compressedSize = readUInt64LE(zip64EiefBuffer, index);
              index += 8;
            }
            if (entry.relativeOffsetOfLocalHeader === 4294967295) {
              if (index + 8 > zip64EiefBuffer.length) {
                return emitErrorAndAutoClose(self, new Error("zip64 extended information extra field does not include relative header offset"));
              }
              entry.relativeOffsetOfLocalHeader = readUInt64LE(zip64EiefBuffer, index);
              index += 8;
            }
            break;
          }
          if (self.validateEntrySizes && entry.compressionMethod === 0) {
            var expectedCompressedSize = entry.uncompressedSize;
            if (entry.isEncrypted()) {
              expectedCompressedSize += 12;
            }
            if (entry.compressedSize !== expectedCompressedSize) {
              var msg = "compressed/uncompressed size mismatch for stored file: " + entry.compressedSize + " != " + entry.uncompressedSize;
              return emitErrorAndAutoClose(self, new Error(msg));
            }
          }
          self.emit("entry", entry);
          if (!self.lazyEntries) self._readEntry();
        });
      });
    };
    ZipFile.prototype.eachEntry = function() {
      const self = this;
      if (!self.lazyEntries) throw new Error("eachEntry() requires lazyEntries: true");
      if (self.hasEachEntryBeenCalled) throw new Error("eachEntry() must only be called once per ZipFile");
      self.hasEachEntryBeenCalled = true;
      let pendingResolveReject = null;
      self.on("entry", onEntry);
      self.on("end", onEnd);
      self.on("error", onError);
      function cleanup() {
        self.removeListener("entry", onEntry);
        self.removeListener("end", onEnd);
        self.removeListener("error", onError);
        if (self.autoClose) self.close();
      }
      function onEntry(entry) {
        let { resolve: resolve4 } = pendingResolveReject;
        pendingResolveReject = null;
        resolve4({ value: entry });
      }
      function onEnd() {
        let { resolve: resolve4 } = pendingResolveReject;
        pendingResolveReject = null;
        cleanup();
        resolve4({ done: true });
      }
      function onError(err) {
        let { reject } = pendingResolveReject;
        pendingResolveReject = null;
        cleanup();
        reject(err);
      }
      return {
        [Symbol.asyncIterator]() {
          return this;
        },
        next() {
          const promise = new Promise((resolve4, reject) => {
            if (pendingResolveReject != null) throw new Error("next() called before previous Promise was resolved.");
            pendingResolveReject = { resolve: resolve4, reject };
          });
          self.readEntry();
          return promise;
        },
        return(value) {
          cleanup();
          return Promise.resolve({ done: true, value });
        },
        throw(value) {
          cleanup();
          return Promise.reject(value);
        }
      };
    };
    ZipFile.prototype.openReadStream = function(entry, options2, callback) {
      var self = this;
      var relativeStart = 0;
      var relativeEnd = entry.compressedSize;
      if (callback == null) {
        callback = options2;
        options2 = null;
      }
      if (options2 == null) {
        options2 = {};
      } else {
        if (options2.decodeFileData === false) {
          if (options2.decrypt != null) {
            throw new Error("cannot use options.decrypt when options.decodeFileData === false");
          }
          if (options2.decompress != null) {
            throw new Error("cannot use options.decompress when options.decodeFileData === false");
          }
        } else {
          if (options2.decrypt != null) {
            if (!entry.isEncrypted()) {
              throw new Error("options.decrypt can only be specified for encrypted entries. See also option decodeFileData.");
            }
            if (options2.decrypt !== false) throw new Error("invalid options.decrypt value: " + options2.decrypt);
            if (entry.isCompressed()) {
              if (options2.decompress !== false) throw new Error("entry is encrypted and compressed, and options.decompress !== false. See also option decodeFileData.");
            }
          }
          if (options2.decompress != null) {
            if (!entry.isCompressed()) {
              throw new Error("options.decompress can only be specified for compressed entries. See also option decodeFileData.");
            }
            if (!(options2.decompress === false || options2.decompress === true)) {
              throw new Error("invalid options.decompress value: " + options2.decompress);
            }
            decompress = options2.decompress;
          }
        }
        if (options2.start != null) {
          relativeStart = options2.start;
          if (relativeStart < 0) throw new Error("options.start < 0");
          if (relativeStart > entry.compressedSize) throw new Error("options.start > entry.compressedSize");
        }
        if (options2.end != null) {
          relativeEnd = options2.end;
          if (relativeEnd < 0) throw new Error("options.end < 0");
          if (relativeEnd > entry.compressedSize) throw new Error("options.end > entry.compressedSize");
          if (relativeEnd < relativeStart) throw new Error("options.end < options.start");
        }
      }
      var rawMode = options2.decodeFileData === false || // Explicitly requested raw.
      (entry.compressionMethod === 0 || // Naturally without compression.
      entry.compressionMethod === 8 && options2.decompress === false) && (!entry.isEncrypted() || // Naturally without encryption.
      options2.decrypt === false);
      if (options2.start != null || options2.end != null) {
        if (!rawMode) throw new Error("start/end range require options.decodeFileData === false for non-trivial encoded entries.");
      }
      if (!self.isOpen) return callback(new Error("closed"));
      if (entry.isEncrypted() && !rawMode) {
        if (options2.decrypt !== false) return callback(new Error("entry is encrypted, and options.decodeFileData !== false"));
      }
      var decompress;
      if (rawMode) {
        decompress = false;
      } else if (entry.compressionMethod === 8) {
        decompress = options2.decodeFileData !== true;
      } else {
        return callback(new Error("unsupported compression method: " + entry.compressionMethod));
      }
      self.readLocalFileHeader(entry, { minimal: true }, function(err, localFileHeader) {
        if (err) return callback(err);
        self.openReadStreamLowLevel(
          localFileHeader.fileDataStart,
          entry.compressedSize,
          relativeStart,
          relativeEnd,
          decompress,
          entry.uncompressedSize,
          callback
        );
      });
    };
    ZipFile.prototype.openReadStreamLowLevel = function(fileDataStart, compressedSize, relativeStart, relativeEnd, decompress, uncompressedSize, callback) {
      var self = this;
      var fileDataEnd = fileDataStart + compressedSize;
      var readStream = self.reader.createReadStream({
        start: fileDataStart + relativeStart,
        end: fileDataStart + relativeEnd
      });
      var endpointStream = readStream;
      if (decompress) {
        var destroyed = false;
        var inflateFilter = zlib.createInflateRaw();
        readStream.on("error", function(err) {
          setImmediate(function() {
            if (!destroyed) inflateFilter.emit("error", err);
          });
        });
        readStream.pipe(inflateFilter);
        if (self.validateEntrySizes) {
          endpointStream = new AssertByteCountStream(uncompressedSize);
          inflateFilter.on("error", function(err) {
            setImmediate(function() {
              if (!destroyed) endpointStream.emit("error", err);
            });
          });
          inflateFilter.pipe(endpointStream);
        } else {
          endpointStream = inflateFilter;
        }
        installDestroyFn(endpointStream, function() {
          destroyed = true;
          if (inflateFilter !== endpointStream) inflateFilter.unpipe(endpointStream);
          readStream.unpipe(inflateFilter);
          readStream.destroy();
        });
      }
      callback(null, endpointStream);
    };
    ZipFile.prototype.readLocalFileHeader = function(entry, options2, callback) {
      var self = this;
      if (callback == null) {
        callback = options2;
        options2 = null;
      }
      if (options2 == null) options2 = {};
      self.reader.ref();
      var buffer = newBuffer(30);
      readAndAssertNoEof(self.reader, buffer, 0, buffer.length, entry.relativeOffsetOfLocalHeader, function(err) {
        try {
          if (err) return callback(err);
          var signature = buffer.readUInt32LE(0);
          if (signature !== 67324752) {
            return callback(new Error("invalid local file header signature: 0x" + signature.toString(16)));
          }
          var fileNameLength = buffer.readUInt16LE(26);
          var extraFieldLength = buffer.readUInt16LE(28);
          var fileDataStart = entry.relativeOffsetOfLocalHeader + 30 + fileNameLength + extraFieldLength;
          if (fileDataStart + entry.compressedSize > self.fileSize) {
            return callback(new Error("file data overflows file bounds: " + fileDataStart + " + " + entry.compressedSize + " > " + self.fileSize));
          }
          if (options2.minimal) {
            return callback(null, { fileDataStart });
          }
          var localFileHeader = new LocalFileHeader();
          localFileHeader.fileDataStart = fileDataStart;
          localFileHeader.versionNeededToExtract = buffer.readUInt16LE(4);
          localFileHeader.generalPurposeBitFlag = buffer.readUInt16LE(6);
          localFileHeader.compressionMethod = buffer.readUInt16LE(8);
          localFileHeader.lastModFileTime = buffer.readUInt16LE(10);
          localFileHeader.lastModFileDate = buffer.readUInt16LE(12);
          localFileHeader.crc32 = buffer.readUInt32LE(14);
          localFileHeader.compressedSize = buffer.readUInt32LE(18);
          localFileHeader.uncompressedSize = buffer.readUInt32LE(22);
          localFileHeader.fileNameLength = fileNameLength;
          localFileHeader.extraFieldLength = extraFieldLength;
          buffer = newBuffer(fileNameLength + extraFieldLength);
          self.reader.ref();
          readAndAssertNoEof(self.reader, buffer, 0, buffer.length, entry.relativeOffsetOfLocalHeader + 30, function(err2) {
            try {
              if (err2) return callback(err2);
              localFileHeader.fileName = buffer.subarray(0, fileNameLength);
              localFileHeader.extraField = buffer.subarray(fileNameLength);
              return callback(null, localFileHeader);
            } finally {
              self.reader.unref();
            }
          });
        } finally {
          self.reader.unref();
        }
      });
    };
    ZipFile.prototype.openReadStreamPromise = function(entry, options2) {
      return new Promise((resolve4, reject) => {
        this.openReadStream(entry, options2, function(err, readStream) {
          if (err) return reject(err);
          resolve4(readStream);
        });
      });
    };
    ZipFile.prototype.openReadStreamLowLevelPromise = function(fileDataStart, compressedSize, relativeStart, relativeEnd, decompress, uncompressedSize) {
      return new Promise((resolve4, reject) => {
        this.openReadStream(fileDataStart, compressedSize, relativeStart, relativeEnd, decompress, uncompressedSize, function(err, readStream) {
          if (err) return reject(err);
          resolve4(readStream);
        });
      });
    };
    ZipFile.prototype.readLocalFileHeaderPromise = function(entry, options2) {
      return new Promise((resolve4, reject) => {
        this.readLocalFileHeader(entry, options2, function(err, localFileHeader) {
          if (err) return reject(err);
          resolve4(localFileHeader);
        });
      });
    };
    function Entry() {
    }
    Entry.prototype.getLastModDate = function(options2) {
      if (options2 == null) options2 = {};
      if (!options2.forceDosFormat) {
        for (var i = 0; i < this.extraFields.length; i++) {
          var extraField = this.extraFields[i];
          if (extraField.id === 21589) {
            var data = extraField.data;
            if (data.length < 5) continue;
            var flags = data[0];
            var HAS_MTIME = 1;
            if (!(flags & HAS_MTIME)) continue;
            var posixTimestamp = data.readInt32LE(1);
            return new Date(posixTimestamp * 1e3);
          } else if (extraField.id === 10) {
            var data = extraField.data;
            if (data.length !== 32) continue;
            if (data.readUInt16LE(4) !== 1) continue;
            if (data.readUInt16LE(6) !== 24) continue;
            var hundredNanoSecondsSince1601 = data.readUInt32LE(8) + 4294967296 * data.readInt32LE(12);
            var millisecondsSince1970 = hundredNanoSecondsSince1601 / 1e4 - 116444736e5;
            return new Date(millisecondsSince1970);
          }
        }
      }
      return dosDateTimeToDate(this.lastModFileDate, this.lastModFileTime, options2.timezone);
    };
    Entry.prototype.canDecodeFileData = function() {
      return !this.isEncrypted() && (this.compressionMethod === 0 || this.compressionMethod === 8);
    };
    Entry.prototype.isEncrypted = function() {
      return (this.generalPurposeBitFlag & 1) !== 0;
    };
    Entry.prototype.isCompressed = function() {
      return this.compressionMethod === 8;
    };
    function LocalFileHeader() {
    }
    function dosDateTimeToDate(date, time, timezone) {
      var day = date & 31;
      var month = (date >> 5 & 15) - 1;
      var year = (date >> 9 & 127) + 1980;
      var millisecond = 0;
      var second = (time & 31) * 2;
      var minute = time >> 5 & 63;
      var hour = time >> 11 & 31;
      if (timezone == null || timezone === "local") {
        return new Date(year, month, day, hour, minute, second, millisecond);
      } else if (timezone === "UTC") {
        return new Date(Date.UTC(year, month, day, hour, minute, second, millisecond));
      } else {
        throw new Error("unrecognized options.timezone: " + options.timezone);
      }
    }
    function getFileNameLowLevel(generalPurposeBitFlag, fileNameBuffer, extraFields, strictFileNames) {
      var fileName = null;
      for (var i = 0; i < extraFields.length; i++) {
        var extraField = extraFields[i];
        if (extraField.id === 28789) {
          if (extraField.data.length < 6) {
            continue;
          }
          if (extraField.data.readUInt8(0) !== 1) {
            continue;
          }
          var oldNameCrc32 = extraField.data.readUInt32LE(1);
          if (crc32(fileNameBuffer) !== oldNameCrc32) {
            continue;
          }
          fileName = decodeBuffer(extraField.data.subarray(5), true);
          break;
        }
      }
      if (fileName == null) {
        var isUtf8 = (generalPurposeBitFlag & 2048) !== 0;
        fileName = decodeBuffer(fileNameBuffer, isUtf8);
      }
      if (!strictFileNames) {
        fileName = fileName.replace(/\\/g, "/");
      }
      return fileName;
    }
    function validateFileName(fileName) {
      if (fileName.indexOf("\\") !== -1) {
        return "invalid characters in fileName: " + fileName;
      }
      if (/^[a-zA-Z]:/.test(fileName) || /^\//.test(fileName)) {
        return "absolute path: " + fileName;
      }
      if (fileName.split("/").indexOf("..") !== -1) {
        return "invalid relative path: " + fileName;
      }
      return null;
    }
    function parseExtraFields(extraFieldBuffer) {
      var extraFields = [];
      var i = 0;
      while (i < extraFieldBuffer.length - 3) {
        var headerId = extraFieldBuffer.readUInt16LE(i + 0);
        var dataSize = extraFieldBuffer.readUInt16LE(i + 2);
        var dataStart = i + 4;
        var dataEnd = dataStart + dataSize;
        if (dataEnd > extraFieldBuffer.length) throw new Error("extra field length exceeds extra field buffer size");
        var dataBuffer = extraFieldBuffer.subarray(dataStart, dataEnd);
        extraFields.push({
          id: headerId,
          data: dataBuffer
        });
        i = dataEnd;
      }
      return extraFields;
    }
    function readAndAssertNoEof(reader, buffer, offset, length, position, callback) {
      if (length === 0) {
        return setImmediate(function() {
          callback(null, newBuffer(0));
        });
      }
      reader.read(buffer, offset, length, position, function(err, bytesRead) {
        if (err) return callback(err);
        if (bytesRead < length) {
          return callback(new Error("unexpected EOF"));
        }
        callback();
      });
    }
    util.inherits(AssertByteCountStream, Transform3);
    function AssertByteCountStream(byteCount) {
      Transform3.call(this);
      this.actualByteCount = 0;
      this.expectedByteCount = byteCount;
    }
    AssertByteCountStream.prototype._transform = function(chunk, encoding, cb) {
      this.actualByteCount += chunk.length;
      if (this.actualByteCount > this.expectedByteCount) {
        var msg = "too many bytes in the stream. expected " + this.expectedByteCount + ". got at least " + this.actualByteCount;
        return cb(new Error(msg));
      }
      cb(null, chunk);
    };
    AssertByteCountStream.prototype._flush = function(cb) {
      if (this.actualByteCount < this.expectedByteCount) {
        var msg = "not enough bytes in the stream. expected " + this.expectedByteCount + ". got only " + this.actualByteCount;
        return cb(new Error(msg));
      }
      cb();
    };
    util.inherits(RandomAccessReader, EventEmitter);
    function RandomAccessReader() {
      EventEmitter.call(this);
      this.refCount = 0;
    }
    RandomAccessReader.prototype.ref = function() {
      this.refCount += 1;
    };
    RandomAccessReader.prototype.unref = function() {
      var self = this;
      self.refCount -= 1;
      if (self.refCount > 0) return;
      if (self.refCount < 0) throw new Error("invalid unref");
      self.close(onCloseDone);
      function onCloseDone(err) {
        if (err) return self.emit("error", err);
        self.emit("close");
      }
    };
    RandomAccessReader.prototype.createReadStream = function(options2) {
      if (options2 == null) options2 = {};
      var start2 = options2.start;
      var end = options2.end;
      if (start2 === end) {
        var emptyStream = new PassThrough();
        setImmediate(function() {
          emptyStream.end();
        });
        return emptyStream;
      }
      var stream = this._readStreamForRange(start2, end);
      var destroyed = false;
      var refUnrefFilter = new RefUnrefFilter(this);
      stream.on("error", function(err) {
        setImmediate(function() {
          if (!destroyed) refUnrefFilter.emit("error", err);
        });
      });
      installDestroyFn(refUnrefFilter, function() {
        stream.unpipe(refUnrefFilter);
        refUnrefFilter.unref();
        stream.destroy();
      });
      var byteCounter = new AssertByteCountStream(end - start2);
      refUnrefFilter.on("error", function(err) {
        setImmediate(function() {
          if (!destroyed) byteCounter.emit("error", err);
        });
      });
      installDestroyFn(byteCounter, function() {
        destroyed = true;
        refUnrefFilter.unpipe(byteCounter);
        refUnrefFilter.destroy();
      });
      return stream.pipe(refUnrefFilter).pipe(byteCounter);
    };
    RandomAccessReader.prototype._readStreamForRange = function(start2, end) {
      throw new Error("not implemented");
    };
    RandomAccessReader.prototype.read = function(buffer, offset, length, position, callback) {
      var readStream = this.createReadStream({ start: position, end: position + length });
      var writeStream = new Writable2();
      var written = 0;
      writeStream._write = function(chunk, encoding, cb) {
        chunk.copy(buffer, offset + written, 0, chunk.length);
        written += chunk.length;
        cb();
      };
      writeStream.on("finish", callback);
      readStream.on("error", function(error) {
        callback(error);
      });
      readStream.pipe(writeStream);
    };
    RandomAccessReader.prototype.close = function(callback) {
      setImmediate(callback);
    };
    util.inherits(RefUnrefFilter, PassThrough);
    function RefUnrefFilter(context) {
      PassThrough.call(this);
      this.context = context;
      this.context.ref();
      this.unreffedYet = false;
    }
    RefUnrefFilter.prototype._flush = function(cb) {
      this.unref();
      cb();
    };
    RefUnrefFilter.prototype.unref = function(cb) {
      if (this.unreffedYet) return;
      this.unreffedYet = true;
      this.context.unref();
    };
    var cp437 = "\0\u263A\u263B\u2665\u2666\u2663\u2660\u2022\u25D8\u25CB\u25D9\u2642\u2640\u266A\u266B\u263C\u25BA\u25C4\u2195\u203C\xB6\xA7\u25AC\u21A8\u2191\u2193\u2192\u2190\u221F\u2194\u25B2\u25BC !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~\u2302\xC7\xFC\xE9\xE2\xE4\xE0\xE5\xE7\xEA\xEB\xE8\xEF\xEE\xEC\xC4\xC5\xC9\xE6\xC6\xF4\xF6\xF2\xFB\xF9\xFF\xD6\xDC\xA2\xA3\xA5\u20A7\u0192\xE1\xED\xF3\xFA\xF1\xD1\xAA\xBA\xBF\u2310\xAC\xBD\xBC\xA1\xAB\xBB\u2591\u2592\u2593\u2502\u2524\u2561\u2562\u2556\u2555\u2563\u2551\u2557\u255D\u255C\u255B\u2510\u2514\u2534\u252C\u251C\u2500\u253C\u255E\u255F\u255A\u2554\u2569\u2566\u2560\u2550\u256C\u2567\u2568\u2564\u2565\u2559\u2558\u2552\u2553\u256B\u256A\u2518\u250C\u2588\u2584\u258C\u2590\u2580\u03B1\xDF\u0393\u03C0\u03A3\u03C3\xB5\u03C4\u03A6\u0398\u03A9\u03B4\u221E\u03C6\u03B5\u2229\u2261\xB1\u2265\u2264\u2320\u2321\xF7\u2248\xB0\u2219\xB7\u221A\u207F\xB2\u25A0\xA0";
    function decodeBuffer(buffer, isUtf8) {
      if (isUtf8) {
        return buffer.toString("utf8");
      } else {
        var result = "";
        for (var i = 0; i < buffer.length; i++) {
          result += cp437[buffer[i]];
        }
        return result;
      }
    }
    function readUInt64LE(buffer, offset) {
      var lower32 = buffer.readUInt32LE(offset);
      var upper32 = buffer.readUInt32LE(offset + 4);
      return upper32 * 4294967296 + lower32;
    }
    var newBuffer;
    if (typeof Buffer.allocUnsafe === "function") {
      newBuffer = function(len) {
        return Buffer.allocUnsafe(len);
      };
    } else {
      newBuffer = function(len) {
        return new Buffer(len);
      };
    }
    function installDestroyFn(stream, fn) {
      if (typeof stream.destroy === "function") {
        stream._destroy = function(err, cb) {
          fn();
          if (cb != null) cb(err);
        };
      } else {
        stream.destroy = fn;
      }
    }
    function defaultCallback(err) {
      if (err) throw err;
    }
  }
});

// src/connection.ts
var ConnectionResolver = class {
  constructor(environment = process.env) {
    this.environment = environment;
  }
  environment;
  async resolve() {
    const address = this.environment.OPENCHAMBER_OPENCODE_URL;
    const token2 = this.environment.OPENCHAMBER_SERVICE_TOKEN;
    if (!address || !token2) throw new Error("OpenChamber OpenCode access is unavailable. Use OpenChamber >=2.7.1 and approve this extension\u2019s service and OpenCode access.");
    const match = /^http:\/\/(?:127\.0\.0\.1|\[::1\]):([0-9]{1,5})\/?$/.exec(address);
    if (!match || match[0] !== address || Number(match[1]) < 1 || Number(match[1]) > 65535 || token2.length > 8192 || /[^\x21-\x7e]/.test(token2)) throw new Error("The host-provided OpenChamber connection is invalid. No fallback discovery was attempted.");
    return { url: new URL(address).href, version: null, token: token2 };
  }
};

// src/opencode.ts
var import_node_fs2 = require("node:fs");
var import_node_crypto4 = require("node:crypto");
var import_node_events2 = require("node:events");
var import_node_path4 = require("node:path");
var import_node_stream4 = require("node:stream");
var import_promises5 = require("node:stream/promises");

// src/attachments.ts
var import_node_crypto3 = require("node:crypto");
var import_promises4 = require("node:fs/promises");
var import_node_path3 = require("node:path");
var import_node_url = require("node:url");

// src/capture-store.ts
var import_node_crypto = require("node:crypto");
var import_promises = require("node:fs/promises");
var import_node_path = require("node:path");
var import_node_os = require("node:os");
var CONTROL_BYTES = 64 * 1024;
var CaptureStore = class _CaptureStore {
  constructor(root) {
    this.root = root;
  }
  root;
  static async create() {
    const base = process.env.SESSION_EXPORT_TEST_TMP ?? (0, import_node_path.join)((0, import_node_os.tmpdir)(), "opencode");
    await (0, import_promises.mkdir)(base, { recursive: true });
    return new _CaptureStore(await (0, import_promises.mkdtemp)((0, import_node_path.join)(base, "session-export-capture-")));
  }
  file(name) {
    if (!/^[a-z0-9_-]+$/i.test(name)) throw new Error("Invalid capture-store index name.");
    return (0, import_node_path.join)(this.root, `${name}.jsonl`);
  }
  async claim(namespace, identity) {
    if (!/^[a-z0-9_-]+$/i.test(namespace)) throw new Error("Invalid identity namespace.");
    const hash = (0, import_node_crypto.createHash)("sha256").update(identity).digest("hex");
    const path = (0, import_node_path.join)(this.root, "identities", namespace, hash.slice(0, 2), hash);
    await (0, import_promises.mkdir)((0, import_node_path.dirname)(path), { recursive: true });
    try {
      await (0, import_promises.writeFile)(path, identity, { flag: "wx", mode: 384 });
      return true;
    } catch (error) {
      if (error.code === "EEXIST") return false;
      throw error;
    }
  }
  /** Records contain only small backend descriptors; full projected evidence belongs in streamed JSON files. */
  async append(name, value) {
    const text = JSON.stringify(value) + "\n";
    if (Buffer.byteLength(text) > CONTROL_BYTES) throw new Error("A capture control record exceeds its metadata size limit.");
    await (0, import_promises.mkdir)(this.root, { recursive: true });
    await (0, import_promises.appendFile)(this.file(name), text, { encoding: "utf8", mode: 384 });
  }
  /** Required indexes exist even for legitimate empty sessions; absence is never a substitute for captured emptiness. */
  async initialize(name) {
    await (0, import_promises.mkdir)(this.root, { recursive: true });
    await (0, import_promises.writeFile)(this.file(name), "", { flag: "wx", mode: 384 });
  }
  async *records(name, options2 = {}) {
    let file;
    try {
      file = await (0, import_promises.open)(this.file(name), "r");
    } catch (error) {
      if (error.code === "ENOENT") {
        if (options2.required) throw new Error(`Required capture index ${name} is missing. Prepare the export again.`);
        return;
      }
      throw error;
    }
    const bytes = Buffer.alloc(CONTROL_BYTES), decoder = new TextDecoder();
    let position = 0, remaining = "";
    try {
      for (; ; ) {
        const { bytesRead } = await file.read(bytes, 0, bytes.length, position);
        if (!bytesRead) break;
        position += bytesRead;
        remaining += decoder.decode(bytes.subarray(0, bytesRead), { stream: true });
        let boundary;
        while ((boundary = remaining.indexOf("\n")) !== -1) {
          const line = remaining.slice(0, boundary);
          remaining = remaining.slice(boundary + 1);
          if (line) yield JSON.parse(line);
        }
        if (Buffer.byteLength(remaining) > CONTROL_BYTES) throw new Error("A stored control record exceeds its metadata limit.");
      }
      if (remaining.trim()) throw new Error("A stored control record ended incompletely.");
    } finally {
      await file.close();
    }
  }
  /** Validate descriptors on every consumer pass, so cleanup or truncation cannot turn captured evidence into a successful empty archive. */
  async *sessions(capture) {
    let sessions = 0, messages = 0, roots = 0;
    for await (const session of this.records("sessions", { required: true })) {
      if (!Number.isSafeInteger(session.messageCount) || session.messageCount < 0) throw new Error("Invalid capture message count. Prepare the export again.");
      sessions++;
      messages += session.messageCount;
      if (session.id === capture.target.sessionID) roots++;
      yield session;
    }
    if (sessions !== capture.sessionCount || messages !== capture.messageCount || roots !== 1) throw new Error("Capture session index/count mismatch. Prepare the export again.");
  }
  async *messages(session) {
    let count = 0;
    for await (const message of this.records(session.messageIndex, { required: true })) {
      count++;
      yield message;
    }
    if (count !== session.messageCount) throw new Error("Capture message index/count mismatch. Prepare the export again.");
  }
  /** A byte cursor avoids rescanning the entire inventory for every UI page. Only bounded control records are decoded. */
  async page(name, offset = 0, limit = 100) {
    if (!Number.isSafeInteger(offset) || offset < 0 || !Number.isInteger(limit) || limit < 1 || limit > 100) throw new Error("Invalid inventory cursor or page size.");
    let file;
    try {
      file = await (0, import_promises.open)(this.file(name), "r");
    } catch (error) {
      if (error.code === "ENOENT" && offset === 0) return { records: [], next: null };
      throw error;
    }
    const records = [];
    try {
      const size = (await file.stat()).size;
      if (offset > size) throw new Error("Invalid inventory cursor.");
      if (offset > 0) {
        const prior = Buffer.alloc(1);
        await file.read(prior, 0, 1, offset - 1);
        if (prior[0] !== 10) throw new Error("Invalid inventory cursor.");
      }
      const bytes = Buffer.alloc(CONTROL_BYTES);
      let position = offset, cursor = offset, pending = Buffer.alloc(0);
      for (; ; ) {
        const { bytesRead } = await file.read(bytes, 0, bytes.length, position);
        if (!bytesRead) break;
        position += bytesRead;
        pending = Buffer.concat([pending, bytes.subarray(0, bytesRead)]);
        let boundary;
        while ((boundary = pending.indexOf(10)) !== -1) {
          const line = pending.subarray(0, boundary);
          pending = pending.subarray(boundary + 1);
          cursor += boundary + 1;
          if (line.length > CONTROL_BYTES) throw new Error("An inventory control record exceeds its metadata limit.");
          if (line.length) records.push(JSON.parse(line.toString("utf8")));
          if (records.length === limit) return { records, next: cursor < size ? cursor : null };
        }
        if (pending.length > CONTROL_BYTES) throw new Error("An inventory control record exceeds its metadata limit.");
      }
      if (pending.length) throw new Error("An inventory control record ended incompletely.");
      return { records, next: null };
    } finally {
      await file.close();
    }
  }
};

// src/json-stream.ts
var import_node_fs = require("node:fs");
var import_promises2 = require("node:fs/promises");
var import_node_path2 = require("node:path");
var import_node_crypto2 = require("node:crypto");
var import_node_events = require("node:events");
var import_node_stream3 = require("node:stream");
var import_promises3 = require("node:stream/promises");

// node_modules/stream-chain/src/index.js
var import_node_stream2 = require("node:stream");

// node_modules/stream-chain/src/defs.js
var defs_exports = {};
__export(defs_exports, {
  Stop: () => Stop,
  abortSymbol: () => abortSymbol,
  clearFunctionList: () => clearFunctionList,
  combineMany: () => combineMany,
  combineManyMut: () => combineManyMut,
  fListSymbol: () => fListSymbol,
  final: () => final,
  finalSymbol: () => finalSymbol,
  finalValue: () => finalValue,
  flushSymbol: () => flushSymbol,
  flushable: () => flushable,
  getFinalValue: () => getFinalValue,
  getFunctionList: () => getFunctionList,
  getManyValues: () => getManyValues,
  isDuplexNodeStream: () => isDuplexNodeStream,
  isDuplexWebStream: () => isDuplexWebStream,
  isFinalValue: () => isFinalValue,
  isFlushable: () => isFlushable,
  isFunctionList: () => isFunctionList,
  isMany: () => isMany,
  isReadableNodeStream: () => isReadableNodeStream,
  isReadableWebStream: () => isReadableWebStream,
  isStop: () => isStop,
  isWritableNodeStream: () => isWritableNodeStream,
  isWritableWebStream: () => isWritableWebStream,
  many: () => many,
  manySymbol: () => manySymbol,
  none: () => none,
  normalizeMany: () => normalizeMany,
  setFunctionList: () => setFunctionList,
  stop: () => stop,
  stopErrorSymbol: () => stopErrorSymbol,
  toMany: () => toMany
});
var none = /* @__PURE__ */ Symbol.for("object-stream.none");
var stop = /* @__PURE__ */ Symbol.for("object-stream.stop");
var finalSymbol = /* @__PURE__ */ Symbol.for("object-stream.final");
var manySymbol = /* @__PURE__ */ Symbol.for("object-stream.many");
var flushSymbol = /* @__PURE__ */ Symbol.for("object-stream.flush");
var abortSymbol = /* @__PURE__ */ Symbol.for("object-stream.abort");
var fListSymbol = /* @__PURE__ */ Symbol.for("object-stream.fList");
var stopErrorSymbol = /* @__PURE__ */ Symbol.for("object-stream.stopError");
var finalValue = (value) => ({ [finalSymbol]: 1, value });
var many = (values2) => ({ [manySymbol]: 1, values: values2 });
var isFinalValue = (o) => o && o[finalSymbol] === 1;
var isMany = (o) => o && o[manySymbol] === 1;
var isFlushable = (o) => o && o[flushSymbol] === 1;
var isFunctionList = (o) => o && o[fListSymbol] === 1;
var isStop = (o) => o && o[stopErrorSymbol] === 1;
var getFinalValue = (o) => o.value;
var getManyValues = (o) => o.values;
var getFunctionList = (o) => o.fList;
var flushable = (write3, final3 = null, abort = null) => {
  const fn = final3 ? (value) => value === none ? final3() : write3(value) : write3;
  fn[flushSymbol] = 1;
  if (abort) fn[abortSymbol] = abort;
  return fn;
};
var setFunctionList = (o, fns) => {
  o.fList = fns;
  o[fListSymbol] = 1;
  return o;
};
var clearFunctionList = (o) => {
  delete o.fList;
  delete o[fListSymbol];
  return o;
};
var Stop = class extends Error {
};
Stop.prototype[stopErrorSymbol] = 1;
var toMany = (value) => value === none ? many([]) : value && value[manySymbol] === 1 ? value : many([value]);
var normalizeMany = (o) => {
  if (o?.[manySymbol] === 1) {
    switch (o.values.length) {
      case 0:
        return none;
      case 1:
        return o.values[0];
    }
  }
  return o;
};
var combineMany = (...args) => {
  const values2 = [];
  for (let i = 0; i < args.length; ++i) {
    const a = args[i];
    if (a === none) continue;
    if (a?.[manySymbol] === 1) {
      values2.push(...a.values);
    } else {
      values2.push(a);
    }
  }
  return many(values2);
};
var combineManyMut = (a, ...args) => {
  const values2 = a === none ? [] : a?.[manySymbol] === 1 ? a.values : [a];
  for (let i = 0; i < args.length; ++i) {
    const b = args[i];
    if (b === none) continue;
    if (b?.[manySymbol] === 1) {
      values2.push(...b.values);
    } else {
      values2.push(b);
    }
  }
  return many(values2);
};
var isReadableWebStream = (x) => !!(x && typeof x === "object" && typeof x.getReader === "function" && typeof x.pipeTo === "function");
var isWritableWebStream = (x) => !!(x && typeof x === "object" && typeof x.getWriter === "function" && typeof x.abort === "function");
var isDuplexWebStream = (x) => !!(x && typeof x === "object" && isReadableWebStream(x.readable) && isWritableWebStream(x.writable));
var isReadableNodeStream = (obj) => obj && typeof obj.pipe === "function" && typeof obj.on === "function" && (!obj._writableState || (typeof obj._readableState === "object" ? obj._readableState.readable : null) !== false) && (!obj._writableState || obj._readableState);
var isWritableNodeStream = (obj) => obj && typeof obj.write === "function" && typeof obj.on === "function" && (!obj._readableState || (typeof obj._writableState === "object" ? obj._writableState.writable : null) !== false);
var isDuplexNodeStream = (obj) => obj && typeof obj.pipe === "function" && obj._readableState && typeof obj.on === "function" && typeof obj.write === "function";
var final = finalValue;

// node_modules/stream-chain/src/exec.js
var cancelSymbol = /* @__PURE__ */ Symbol.for("object-stream.cancel");
var dropNullSymbol = /* @__PURE__ */ Symbol.for("object-stream.dropNull");
var stopAtSymbol = /* @__PURE__ */ Symbol.for("object-stream.stopAt");
var GEN_CANCEL = /* @__PURE__ */ Symbol.for("object-stream.genCancel");
var markStop = (error, index) => {
  if (isStop(error)) error[stopAtSymbol] = index;
  throw error;
};
var stopIndex = (stop2, fns) => stop2[stopAtSymbol] ?? fns.length;
var withCleanupError = (err, cleanupErr) => {
  if (err == null || isStop(err)) return cleanupErr;
  return err instanceof Error ? new AggregateError([err, cleanupErr], "pipeline error; generator cleanup also failed") : err;
};
var hasAborters = (fns) => fns.some((fn) => fn[abortSymbol]);
var noteFinal = (value, fn, finished2) => {
  if (value && typeof value.then == "function") return value.then((v) => (finished2.add(fn), v));
  finished2.add(fn);
  return value;
};
var abortStages = async (fns, finished2, to = fns.length) => {
  let failure;
  for (let i = 0; i < to; ++i) {
    const fn = fns[i], abort = fn[abortSymbol];
    if (!abort || finished2.has(fn)) continue;
    finished2.add(fn);
    try {
      await abort();
    } catch (error) {
      failure = failure === void 0 ? error : new AggregateError([failure, error], "stage cleanup failed more than once");
    }
  }
  return failure;
};
var next = (value, fns, index, push) => {
  for (let i = index; ; ) {
    if (value && typeof value.then == "function") {
      const ii = i;
      return value.then(
        (v) => next(v, fns, ii, push),
        (e) => markStop(e, ii)
      );
    }
    if (value === none || value == null && push[dropNullSymbol]) return void 0;
    if (value === stop) markStop(new Stop(), i);
    if (isFinalValue(value)) {
      const final3 = getFinalValue(value);
      if (final3 == null && push[dropNullSymbol]) return void 0;
      return push(final3);
    }
    if (isMany(value)) {
      return nextMany(getManyValues(value), fns, i, push);
    }
    if (value && typeof value.next == "function") {
      return nextGen(value, fns, i, push);
    }
    if (i >= fns.length) {
      return push(value);
    }
    try {
      value = fns[i++](value);
    } catch (error) {
      markStop(error, i);
    }
  }
};
var nextMany = (values2, fns, i, push) => {
  const step = (j) => {
    for (; j < values2.length; ++j) {
      const r = next(values2[j], fns, i, push);
      if (r && typeof r.then == "function") {
        const jj = j;
        return r.then(() => step(jj + 1));
      }
    }
  };
  return step(0);
};
var nextGen = (it, fns, i, push) => {
  const step = () => {
    for (; ; ) {
      if (push[cancelSymbol]) throw push[cancelSymbol];
      let data;
      try {
        data = it.next();
      } catch (error) {
        markStop(error, i);
      }
      if (data && typeof data.then == "function") {
        return data.then(
          (d) => {
            if (d.done) return;
            const r3 = next(d.value, fns, i, push);
            return r3 && typeof r3.then == "function" ? r3.then(step) : step();
          },
          (e) => markStop(e, i)
        );
      }
      if (data.done) return;
      const r2 = next(data.value, fns, i, push);
      if (r2 && typeof r2.then == "function") return r2.then(step);
    }
  };
  const abort = (err) => {
    const onCleanupError = (cleanupErr) => withCleanupError(err, cleanupErr);
    let ret;
    try {
      ret = it.return ? it.return() : void 0;
    } catch (cleanupErr) {
      throw onCleanupError(cleanupErr);
    }
    if (ret && typeof ret.then == "function") {
      return ret.then(
        () => {
          throw err;
        },
        (cleanupErr) => {
          throw onCleanupError(cleanupErr);
        }
      );
    }
    throw err;
  };
  let r;
  try {
    r = step();
  } catch (err) {
    return abort(err);
  }
  return r && typeof r.then == "function" ? r.then(void 0, abort) : r;
};
var flush = (fns, index, push, finished2) => {
  let stop2 = null;
  const resume = (error) => {
    if (!isStop(error)) throw error;
    stop2 = error;
    return step(stopIndex(error, fns));
  };
  const step = (i) => {
    for (; i < fns.length; ++i) {
      const f = fns[i];
      if (!isFlushable(f) || finished2?.has(f)) continue;
      let r;
      try {
        let value;
        try {
          value = f(none);
        } catch (error) {
          markStop(error, i + 1);
        }
        if (finished2) value = noteFinal(value, f, finished2);
        r = next(value, fns, i + 1, push);
      } catch (error) {
        return resume(error);
      }
      if (r && typeof r.then == "function") {
        const ii = i;
        return r.then(() => step(ii + 1), resume);
      }
    }
    if (stop2) throw stop2;
  };
  return step(index);
};
var releaseStopped = async (fns, finished2, stop2) => {
  const failure = await abortStages(fns, finished2, stopIndex(stop2, fns));
  if (failure === void 0) return void 0;
  const more = await abortStages(fns, finished2);
  return more === void 0 ? failure : new AggregateError([failure, more], "stage cleanup failed more than once");
};
var finishStop = async (fns, stop2, push, finished2) => {
  let error;
  try {
    await flush(fns, stopIndex(stop2, fns), push, finished2);
  } catch (e) {
    if (isStop(e)) stop2 = e;
    else error = e;
  }
  const failure = error === void 0 ? await releaseStopped(fns, finished2, stop2) : await abortStages(fns, finished2);
  if (failure !== void 0) error = withCleanupError(error, failure);
  if (error !== void 0) throw error;
};
var genBridge = (fns, once3) => {
  fns = fns.filter((fn) => fn).flat(Infinity).map((fn) => isFunctionList(fn) ? getFunctionList(fn) : fn).flat(Infinity);
  if (!fns.length) {
    fns = [(x) => x];
  }
  const canAbort = hasAborters(fns), finished2 = /* @__PURE__ */ new Set();
  let flushed = false, stopAt = 0;
  const drive = async (value, push) => {
    try {
      await next(value, fns, 0, push);
    } catch (error) {
      if (!isStop(error)) throw error;
      await finishStop(fns, error, push, finished2);
      throw error;
    }
    await flush(fns, 0, push, finished2);
  };
  let g = async function* (value) {
    if (flushed) throw Error("Call to a flushed pipe.");
    const isFlush = !once3 && value === none;
    if (isFlush || once3) flushed = true;
    const pending = [];
    let wakeConsumer = null;
    let resolveProducer = null;
    let rejectProducer = null;
    let done = false, error = null, cancelled = false, completed = false;
    const push = (v) => {
      if (cancelled) throw GEN_CANCEL;
      pending.push(v);
      if (wakeConsumer) {
        const w = wakeConsumer;
        wakeConsumer = null;
        w();
      }
      return new Promise((res, rej) => {
        resolveProducer = res;
        rejectProducer = rej;
      });
    };
    Promise.resolve().then(
      () => once3 ? drive(value, push) : isFlush ? flush(fns, stopAt, push, finished2) : next(value, fns, 0, push)
    ).then(
      () => {
      },
      (e) => {
        if (e === GEN_CANCEL) return;
        error = e;
        if (!isFlush && isStop(e)) stopAt = stopIndex(e, fns);
      }
    ).finally(() => {
      done = true;
      if (wakeConsumer) {
        const w = wakeConsumer;
        wakeConsumer = null;
        w();
      }
    });
    try {
      for (; ; ) {
        while (pending.length) {
          const v = pending.shift();
          if (resolveProducer) {
            const r = resolveProducer;
            resolveProducer = rejectProducer = null;
            r();
          }
          yield v;
        }
        if (error) throw error;
        if (done) {
          completed = true;
          return;
        }
        await new Promise((res) => wakeConsumer = res);
      }
    } finally {
      cancelled = true;
      push[cancelSymbol] = GEN_CANCEL;
      if (rejectProducer) {
        const rj = rejectProducer;
        resolveProducer = rejectProducer = null;
        rj(GEN_CANCEL);
      }
      if (!completed && canAbort) {
        const failure = isStop(error) ? await releaseStopped(fns, finished2, error) : await abortStages(fns, finished2);
        if (failure !== void 0) throw withCleanupError(error, failure);
      }
    }
  };
  if (once3) return g;
  const needToFlush = fns.some((fn) => isFlushable(fn));
  if (needToFlush) g = flushable(g);
  return setFunctionList(g, fns);
};

// node_modules/stream-chain/src/gen.js
var gen = (...fns) => genBridge(fns, false);
var gen_default = gen;

// node_modules/stream-chain/src/asStream.js
var import_node_stream = require("node:stream");
var CANCEL = /* @__PURE__ */ Symbol.for("object-stream.asStreamCancel");
var asStream = (fn, options2) => {
  if (typeof fn != "function") {
    throw TypeError("Only a function is accepted as the first argument");
  }
  const innerFns = isFunctionList(fn) ? fn.fList : null;
  const stages = innerFns ?? [fn];
  const canAbort = hasAborters(stages), finished2 = /* @__PURE__ */ new Set();
  let stopped = false;
  let destroyed = false;
  let flushed = false;
  let nullPushed = false;
  let resolvePaused = null;
  let rejectPaused = null;
  let stream = null;
  const resume = () => {
    if (!resolvePaused) return;
    const resolve4 = resolvePaused;
    resolvePaused = rejectPaused = null;
    resolve4();
  };
  const cancelPaused = () => {
    if (!rejectPaused) return;
    const reject = rejectPaused;
    resolvePaused = rejectPaused = null;
    reject(CANCEL);
  };
  const signalEnd = () => {
    if (nullPushed) return;
    nullPushed = true;
    stream.push(null);
  };
  const enqueue = (value) => {
    if (destroyed) throw CANCEL;
    if (nullPushed) return;
    if (!stream.push(value)) {
      return new Promise((resolve4, reject) => {
        resolvePaused = resolve4;
        rejectPaused = reject;
      });
    }
  };
  enqueue[dropNullSymbol] = true;
  const queue = [];
  const pump = async () => {
    while (queue.length) {
      if (destroyed) throw CANCEL;
      const g = queue[queue.length - 1];
      let result = g.next();
      if (result && typeof result.then == "function") result = await result;
      if (result.done) {
        queue.pop();
        continue;
      }
      let value = result.value;
      if (value && typeof value.then == "function") value = await value;
      const r = processValue(value);
      if (r) await r;
    }
  };
  const release = async (error) => {
    while (queue.length) {
      const g = queue.pop();
      try {
        if (g.return) await g.return();
      } catch (cleanupErr) {
        error = withCleanupError(error, cleanupErr);
      }
    }
    throw error;
  };
  const processValue = (value) => {
    if (value && typeof value.then == "function") {
      return value.then(processValue);
    }
    if (value == null || value === none) return;
    if (value === stop) throw new Stop();
    if (isMany(value)) {
      const values2 = getManyValues(value);
      let promise;
      for (let i = 0; i < values2.length; ++i) {
        if (promise) {
          const ii = i;
          promise = promise.then(() => processValue(values2[ii]));
        } else {
          const r = processValue(values2[i]);
          if (r) promise = r;
        }
      }
      return promise;
    }
    if (isFinalValue(value)) {
      return processValue(getFinalValue(value));
    }
    if (value && typeof value.next == "function") {
      queue.push(value);
      return pump().catch(release);
    }
    return enqueue(value);
  };
  const finishWrite = (callback, error) => {
    if (!error || error === CANCEL) {
      callback(null);
    } else if (!isStop(error)) {
      callback(error);
    } else {
      stopped = true;
      finishStop(stages, error, enqueue, finished2).then(
        () => {
          flushed = true;
          signalEnd();
          callback(null);
        },
        (failure) => callback(failure)
      );
    }
  };
  stream = new import_node_stream.Duplex({
    writableObjectMode: true,
    readableObjectMode: true,
    ...options2,
    write(chunk, encoding, callback) {
      if (stopped) return callback(null);
      if (innerFns) {
        let r2;
        try {
          r2 = next(chunk, innerFns, 0, enqueue);
        } catch (error) {
          return finishWrite(callback, error);
        }
        if (r2 && typeof r2.then == "function") {
          r2.then(
            () => callback(null),
            (error) => finishWrite(callback, error)
          );
        } else {
          callback(null);
        }
        return;
      }
      let r;
      try {
        r = processValue(fn(chunk, encoding));
      } catch (error) {
        return finishWrite(callback, error);
      }
      if (r) {
        r.then(
          () => callback(null),
          (error) => finishWrite(callback, error)
        );
      } else {
        callback(null);
      }
    },
    final(callback) {
      const onComplete = () => {
        flushed = true;
        signalEnd();
        callback(null);
      };
      if (stopped) {
        onComplete();
        return;
      }
      if (innerFns) {
        let r2;
        try {
          r2 = flush(innerFns, 0, enqueue, finished2);
        } catch (error) {
          return finishWrite(callback, error);
        }
        if (r2 && typeof r2.then == "function") {
          r2.then(onComplete, (error) => finishWrite(callback, error));
        } else {
          onComplete();
        }
        return;
      }
      if (!isFlushable(fn)) {
        onComplete();
        return;
      }
      let r;
      try {
        const value = fn(none, null);
        r = processValue(noteFinal(value, fn, finished2));
      } catch (error) {
        return finishWrite(callback, error);
      }
      if (r) {
        r.then(onComplete, (error) => finishWrite(callback, error));
      } else {
        onComplete();
      }
    },
    read() {
      resume();
    },
    // Unblock any pending paused-promise so an in-flight write can settle —
    // mirrors asWebStream's controller.signal listener for writer.abort().
    destroy(error, callback) {
      stopped = destroyed = true;
      enqueue[cancelSymbol] = CANCEL;
      cancelPaused();
      if (flushed || !canAbort) {
        callback(error);
        return;
      }
      abortStages(stages, finished2).then(
        (failure) => callback(
          failure === void 0 ? error : (
            /** @type {Error} */
            withCleanupError(error, failure)
          )
        )
      );
    }
  });
  return stream;
};
var asStream_default = asStream;

// node_modules/stream-chain/src/asWebStream.js
var CANCEL2 = /* @__PURE__ */ Symbol.for("object-stream.asWebStreamCancel");
var asWebStream = (fn, options2) => {
  if (isDuplexWebStream(fn) || isReadableWebStream(fn) || isWritableWebStream(fn)) {
    return fn;
  }
  if (typeof fn !== "function") {
    throw new TypeError("Only a function or Web Streams object is accepted as the first argument");
  }
  const strategy = options2?.strategy;
  const readableStrategy = options2?.readableStrategy ?? strategy;
  const writableStrategy = options2?.writableStrategy ?? strategy;
  const innerFns = isFunctionList(fn) ? fn.fList : null;
  const stages = innerFns ?? [fn];
  const canAbort = hasAborters(stages), finished2 = /* @__PURE__ */ new Set();
  let stopped = false;
  let cancelled = false;
  let flushed = false;
  let releasing = null;
  let readableClosed = false;
  let writableErrored = false;
  let readableController;
  let writableController;
  let pendingDrain = null;
  let rejectDrain = null;
  const unblockDrain = () => {
    if (!pendingDrain) return;
    const resolve4 = pendingDrain;
    pendingDrain = rejectDrain = null;
    resolve4();
  };
  const cancelDrain = () => {
    if (!rejectDrain) return;
    const reject = rejectDrain;
    pendingDrain = rejectDrain = null;
    reject(CANCEL2);
  };
  const closeReadable = () => {
    if (readableClosed) return;
    readableClosed = true;
    readableController.close();
  };
  const errorReadable = (reason) => {
    if (readableClosed) return;
    readableClosed = true;
    readableController.error(reason);
  };
  const errorWritable = (reason) => {
    if (writableErrored || !writableController) return;
    writableErrored = true;
    writableController.error(reason);
  };
  const readable = new ReadableStream(
    {
      start(c) {
        readableController = c;
      },
      pull() {
        unblockDrain();
      },
      cancel(reason) {
        readableClosed = true;
        cancelProducer();
        errorWritable(reason);
        return releaseStages().then(rethrow);
      }
    },
    readableStrategy
  );
  const enqueue = (value) => {
    if (cancelled) throw CANCEL2;
    if (readableClosed) return;
    readableController.enqueue(value);
    if (readableController.desiredSize <= 0) {
      return new Promise((resolve4, reject) => {
        pendingDrain = resolve4;
        rejectDrain = reject;
      });
    }
  };
  enqueue[dropNullSymbol] = true;
  const cancelProducer = () => {
    stopped = cancelled = true;
    enqueue[cancelSymbol] = CANCEL2;
    cancelDrain();
  };
  const releaseStages = () => {
    if (flushed || !canAbort) return Promise.resolve(void 0);
    releasing ??= abortStages(stages, finished2);
    return releasing;
  };
  const rethrow = (failure) => {
    if (failure !== void 0) throw failure;
  };
  const queue = [];
  const pump = async () => {
    while (queue.length) {
      if (cancelled) throw CANCEL2;
      const g = queue[queue.length - 1];
      let result = g.next();
      if (result && typeof result.then == "function") result = await result;
      if (result.done) {
        queue.pop();
        continue;
      }
      let value = result.value;
      if (value && typeof value.then == "function") value = await value;
      const r = processValue(value);
      if (r) await r;
    }
  };
  const release = async (error) => {
    while (queue.length) {
      const g = queue.pop();
      try {
        if (g.return) await g.return();
      } catch (cleanupErr) {
        error = withCleanupError(error, cleanupErr);
      }
    }
    throw error;
  };
  const processValue = (value) => {
    if (value && typeof value.then == "function") {
      return value.then(processValue);
    }
    if (value == null || value === none) return;
    if (value === stop) throw new Stop();
    if (isMany(value)) {
      const values2 = getManyValues(value);
      let promise;
      for (let i = 0; i < values2.length; ++i) {
        if (promise) {
          const ii = i;
          promise = promise.then(() => processValue(values2[ii]));
        } else {
          const r = processValue(values2[i]);
          if (r) promise = r;
        }
      }
      return promise;
    }
    if (isFinalValue(value)) {
      return processValue(getFinalValue(value));
    }
    if (value && typeof value.next == "function") {
      queue.push(value);
      return pump().catch(release);
    }
    return enqueue(value);
  };
  const endAfterStop = async (stop2) => {
    stopped = true;
    try {
      await finishStop(stages, stop2, enqueue, finished2);
    } catch (error) {
      errorReadable(error);
      throw error;
    }
    flushed = true;
    closeReadable();
  };
  const writable = new WritableStream(
    {
      // `controller.signal` aborts during writer.abort() BEFORE the sink's
      // abort() callback runs. The spec waits for in-flight write() to
      // settle first — so if write() is awaiting pendingDrain, we'd
      // deadlock unless the signal listener wakes it.
      // Optional-chained because Bun ≤1.3.14 returns `undefined` for the
      // controller's signal (spec-required per WHATWG Streams §4.5.2 but
      // missing in Bun's builtin — see oven-sh/bun#31156 / PR #31157).
      // Fixed upstream (present in Bun 1.4.0); the chaining stays for older
      // Bun, which only loses the abort wakeup.
      start(controller) {
        writableController = controller;
        controller.signal?.addEventListener("abort", cancelProducer);
      },
      async write(chunk) {
        if (stopped) return;
        try {
          if (innerFns) {
            const r2 = next(chunk, innerFns, 0, enqueue);
            if (r2) await r2;
            return;
          }
          const r = processValue(fn(chunk));
          if (r) await r;
        } catch (error) {
          if (error === CANCEL2) return;
          if (isStop(error)) return endAfterStop(error);
          errorReadable(error);
          const failure = await releaseStages();
          throw failure === void 0 ? error : withCleanupError(error, failure);
        }
      },
      async close() {
        try {
          if (!stopped) {
            if (innerFns) {
              const r = flush(innerFns, 0, enqueue, finished2);
              if (r) await r;
            } else if (isFlushable(fn)) {
              const r = processValue(noteFinal(fn(none), fn, finished2));
              if (r) await r;
            }
            flushed = true;
          }
        } catch (error) {
          if (isStop(error)) return endAfterStop(error);
          if (error !== CANCEL2) {
            errorReadable(error);
            const failure = await releaseStages();
            throw failure === void 0 ? error : withCleanupError(error, failure);
          }
        }
        closeReadable();
      },
      abort(reason) {
        cancelProducer();
        errorReadable(reason);
        return releaseStages().then(rethrow);
      }
    },
    writableStrategy
  );
  return { readable, writable };
};
var asWebStream_default = asWebStream;

// node_modules/stream-chain/src/dataSource.js
var dataSource = (fn) => {
  if (typeof fn == "function") return fn;
  if (fn) {
    if (typeof fn[Symbol.asyncIterator] == "function") return fn[Symbol.asyncIterator].bind(fn);
    if (typeof fn[Symbol.iterator] == "function") return fn[Symbol.iterator].bind(fn);
  }
  throw new TypeError("The argument should be a function or an iterable object.");
};
var dataSource_default = dataSource;

// node_modules/stream-chain/src/index.js
var {
  isReadableWebStream: isReadableWebStream2,
  isWritableWebStream: isWritableWebStream2,
  isDuplexWebStream: isDuplexWebStream2,
  isReadableNodeStream: isReadableNodeStream2,
  isWritableNodeStream: isWritableNodeStream2,
  isDuplexNodeStream: isDuplexNodeStream2
} = defs_exports;
var groupFunctions = (output, fn, index, fns) => {
  if (isDuplexNodeStream2(fn) || !index && isReadableNodeStream2(fn) || index === fns.length - 1 && isWritableNodeStream2(fn)) {
    output.push(fn);
    return output;
  }
  if (isDuplexWebStream2(fn)) {
    output.push(import_node_stream2.Duplex.fromWeb(fn, { objectMode: true }));
    return output;
  }
  if (!index && isReadableWebStream2(fn)) {
    output.push(import_node_stream2.Readable.fromWeb(fn, { objectMode: true }));
    return output;
  }
  if (index === fns.length - 1 && isWritableWebStream2(fn)) {
    output.push(import_node_stream2.Writable.fromWeb(fn, { objectMode: true }));
    return output;
  }
  if (typeof fn != "function")
    throw TypeError("Item #" + index + " is not a proper stream, nor a function.");
  if (!output.length) output.push([]);
  const last = output[output.length - 1];
  if (Array.isArray(last)) {
    last.push(fn);
  } else {
    output.push([fn]);
  }
  return output;
};
var produceStreams = (item) => {
  if (Array.isArray(item)) {
    if (!item.length) return null;
    if (item.length == 1) return item[0] && /** @type {any} */
    chain.asStream(item[0]);
    return (
      /** @type {any} */
      chain.asStream(
        /** @type {any} */
        chain.gen(...item)
      )
    );
  }
  return item;
};
var wrapFunctions = (fn, index, fns) => {
  if (isDuplexNodeStream2(fn) || !index && isReadableNodeStream2(fn) || index === fns.length - 1 && isWritableNodeStream2(fn)) {
    return fn;
  }
  if (isDuplexWebStream2(fn)) {
    return import_node_stream2.Duplex.fromWeb(fn, { objectMode: true });
  }
  if (!index && isReadableWebStream2(fn)) {
    return import_node_stream2.Readable.fromWeb(fn, { objectMode: true });
  }
  if (index === fns.length - 1 && isWritableWebStream2(fn)) {
    return import_node_stream2.Writable.fromWeb(fn, { objectMode: true });
  }
  if (typeof fn == "function") return (
    /** @type {any} */
    chain.asStream(fn)
  );
  throw TypeError("Item #" + index + " is not a proper stream, nor a function.");
};
var write = (input, chunk, encoding, callback) => {
  let error = null;
  try {
    input.write(chunk, encoding, (e) => callback(e || error));
  } catch (e) {
    error = e;
  }
};
var final2 = (input, callback) => {
  let error = null;
  try {
    input.end(null, null, (e) => callback(e || error));
  } catch (e) {
    error = e;
  }
};
var read = (output) => {
  output.resume();
};
var chain = (fns, options2) => {
  if (!Array.isArray(fns) || !fns.length) {
    throw TypeError("Chain's first argument should be a non-empty array.");
  }
  fns = fns.flat(Infinity).filter((fn) => fn);
  const streams = (options2?.noGrouping ? fns.map(wrapFunctions) : fns.map((fn) => isFunctionList(fn) ? getFunctionList(fn) : fn).flat(Infinity).reduce(groupFunctions, []).map(produceStreams)).filter((s) => s), input = streams[0], output = streams.reduce((output2, item) => output2 && output2.pipe(item) || item);
  let stream = null;
  let writeMethod = (chunk, encoding, callback) => write(input, chunk, encoding, callback), finalMethod = (callback) => final2(input, callback), readMethod = () => read(output);
  if (!isWritableNodeStream2(input)) {
    writeMethod = (_1, _2, callback) => callback(null);
    finalMethod = (callback) => callback(null);
    input.on("end", () => stream.end());
  }
  if (isReadableNodeStream2(output)) {
    output.on("data", (chunk) => !stream.push(chunk) && output.pause());
    output.on("end", () => stream.push(null));
  } else {
    readMethod = () => {
    };
    output.on("finish", () => stream.push(null));
  }
  stream = /** @type {Duplex & {streams: any[], input: any, output: any}} */
  new import_node_stream2.Duplex({
    writableObjectMode: true,
    readableObjectMode: true,
    ...options2,
    readable: isReadableNodeStream2(output),
    writable: isWritableNodeStream2(input),
    write: writeMethod,
    final: finalMethod,
    read: readMethod,
    destroy(error, callback) {
      if (!stream.writableFinished || !stream.readableEnded) {
        for (const item of streams) item.destroy();
      }
      callback(error);
    }
  });
  stream.streams = streams;
  stream.input = input;
  stream.output = output;
  if (!isReadableNodeStream2(output)) {
    stream.resume();
  }
  if (!options2?.skipEvents) {
    streams.forEach((item) => item.on("error", (error) => stream.emit("error", error)));
  }
  return stream;
};
chain.none = none;
chain.stop = stop;
chain.Stop = Stop;
chain.stopErrorSymbol = stopErrorSymbol;
chain.isStop = isStop;
chain.finalSymbol = finalSymbol;
chain.finalValue = finalValue;
chain.final = final;
chain.isFinalValue = isFinalValue;
chain.getFinalValue = getFinalValue;
chain.manySymbol = manySymbol;
chain.many = many;
chain.isMany = isMany;
chain.getManyValues = getManyValues;
chain.flushSymbol = flushSymbol;
chain.flushable = flushable;
chain.isFlushable = isFlushable;
chain.abortSymbol = abortSymbol;
chain.fListSymbol = fListSymbol;
chain.isFunctionList = isFunctionList;
chain.getFunctionList = getFunctionList;
chain.setFunctionList = setFunctionList;
chain.clearFunctionList = clearFunctionList;
chain.toMany = toMany;
chain.normalizeMany = normalizeMany;
chain.combineMany = combineMany;
chain.combineManyMut = combineManyMut;
chain.chain = chain;
chain.chainUnchecked = chain;
chain.gen = gen_default;
chain.asStream = asStream_default;
chain.asWebStream = asWebStream_default;
chain.dataSource = dataSource_default;

// node_modules/stream-chain/src/fun.js
var asArray = (...fns) => {
  fns = fns.filter((fn) => fn).flat(Infinity).map((fn) => isFunctionList(fn) ? getFunctionList(fn) : fn).flat(Infinity);
  if (!fns.length) {
    fns = [(x) => x];
  }
  let flushed = false, stopAt = 0;
  const noteStop = (error) => {
    if (isStop(error)) stopAt = stopIndex(error, fns);
    throw error;
  };
  let g = (value) => {
    if (flushed) throw Error("Call to a flushed pipe.");
    const results = [], push = (v) => {
      results.push(v);
    };
    let pending;
    if (value !== none) {
      try {
        pending = next(value, fns, 0, push);
      } catch (error) {
        noteStop(error);
      }
    } else {
      flushed = true;
      pending = flush(fns, stopAt, push);
    }
    return pending && typeof pending.then == "function" ? pending.then(() => results, noteStop) : results;
  };
  const needToFlush = fns.some((fn) => isFlushable(fn));
  if (needToFlush) g = flushable(g);
  return setFunctionList(g, fns);
};
var fun = (...fns) => {
  const f = asArray(...fns);
  let g = (value) => {
    const result = (
      /** @type {any} */
      f(value)
    );
    if (result && typeof result.then == "function") {
      return result.then((results) => many(results));
    }
    return many(result);
  };
  if (isFlushable(f)) g = flushable(g);
  return setFunctionList(g, getFunctionList(f));
};
var fun_default = fun;

// node_modules/stream-chain/src/web/index.js
var groupFunctions2 = (output, item, index, items) => {
  if (isDuplexWebStream(item)) {
    output.push(item);
    return output;
  }
  if (!index && isReadableWebStream(item)) {
    output.push({ readable: item, writable: null });
    return output;
  }
  if (index === items.length - 1 && isWritableWebStream(item)) {
    output.push({ readable: null, writable: item });
    return output;
  }
  if (typeof item !== "function") {
    throw new TypeError(`Item #${index} is not a Web Streams object or function.`);
  }
  if (!output.length) output.push([]);
  const last = output[output.length - 1];
  if (Array.isArray(last)) {
    last.push(item);
  } else {
    output.push([item]);
  }
  return output;
};
var makeProduceStages = (options2) => (item) => {
  if (Array.isArray(item)) {
    if (!item.length) return null;
    if (item.length === 1) return (
      /** @type {any} */
      chain2.asWebStream(item[0], options2)
    );
    return (
      /** @type {any} */
      chain2.asWebStream(
        /** @type {any} */
        chain2.gen(...item),
        options2
      )
    );
  }
  return item;
};
var chain2 = (fns, options2) => {
  if (!Array.isArray(fns) || !fns.length) {
    throw new TypeError("Chain's first argument should be a non-empty array.");
  }
  fns = fns.flat(Infinity).filter(Boolean).map((fn) => isFunctionList(fn) ? getFunctionList(fn) : fn).flat(Infinity);
  if (!fns.length) {
    throw new TypeError("Chain's first argument is empty after flattening.");
  }
  const stages = fns.reduce(groupFunctions2, []).map(makeProduceStages(options2)).filter((s) => s);
  for (let i = 0; i < stages.length - 1; ++i) {
    const from = stages[i].readable;
    const to = stages[i + 1].writable;
    if (!from) {
      throw new TypeError(`Stage #${i} has no readable side; cannot pipe to next stage.`);
    }
    if (!to) {
      throw new TypeError(`Stage #${i + 1} has no writable side; cannot accept input.`);
    }
    from.pipeTo(to).catch(() => {
    });
  }
  const c = {
    readable: stages[stages.length - 1].readable,
    writable: stages[0].writable,
    streams: stages,
    input: stages[0],
    output: stages[stages.length - 1]
  };
  return c;
};
chain2.none = none;
chain2.stop = stop;
chain2.Stop = Stop;
chain2.stopErrorSymbol = stopErrorSymbol;
chain2.isStop = isStop;
chain2.finalSymbol = finalSymbol;
chain2.finalValue = finalValue;
chain2.final = final;
chain2.isFinalValue = isFinalValue;
chain2.getFinalValue = getFinalValue;
chain2.manySymbol = manySymbol;
chain2.many = many;
chain2.isMany = isMany;
chain2.getManyValues = getManyValues;
chain2.flushSymbol = flushSymbol;
chain2.flushable = flushable;
chain2.isFlushable = isFlushable;
chain2.abortSymbol = abortSymbol;
chain2.fListSymbol = fListSymbol;
chain2.isFunctionList = isFunctionList;
chain2.getFunctionList = getFunctionList;
chain2.setFunctionList = setFunctionList;
chain2.clearFunctionList = clearFunctionList;
chain2.toMany = toMany;
chain2.normalizeMany = normalizeMany;
chain2.combineMany = combineMany;
chain2.combineManyMut = combineManyMut;
chain2.chain = chain2;
chain2.chainUnchecked = chain2;
chain2.gen = gen_default;
chain2.fun = fun_default;
chain2.asWebStream = asWebStream_default;
chain2.dataSource = dataSource_default;

// node_modules/stream-chain/src/core/index.js
var chain3 = (fns, _options) => {
  const flat = (Array.isArray(fns) ? fns : []).flat(Infinity).filter(Boolean).map((fn) => isFunctionList(fn) ? getFunctionList(fn) : fn).flat(Infinity);
  const g = gen_default(...flat);
  const c = async function* (input) {
    if (input == null) return;
    if (typeof input === "string" || input[Symbol.asyncIterator] === void 0 && input[Symbol.iterator] === void 0) {
      yield* g(input);
      return;
    }
    for await (const value of input) yield* g(value);
  };
  c.streams = null;
  c.input = null;
  c.output = null;
  return c;
};
chain3.none = none;
chain3.stop = stop;
chain3.Stop = Stop;
chain3.stopErrorSymbol = stopErrorSymbol;
chain3.isStop = isStop;
chain3.finalSymbol = finalSymbol;
chain3.finalValue = finalValue;
chain3.final = final;
chain3.isFinalValue = isFinalValue;
chain3.getFinalValue = getFinalValue;
chain3.manySymbol = manySymbol;
chain3.many = many;
chain3.isMany = isMany;
chain3.getManyValues = getManyValues;
chain3.flushSymbol = flushSymbol;
chain3.flushable = flushable;
chain3.isFlushable = isFlushable;
chain3.abortSymbol = abortSymbol;
chain3.fListSymbol = fListSymbol;
chain3.isFunctionList = isFunctionList;
chain3.getFunctionList = getFunctionList;
chain3.setFunctionList = setFunctionList;
chain3.clearFunctionList = clearFunctionList;
chain3.toMany = toMany;
chain3.normalizeMany = normalizeMany;
chain3.combineMany = combineMany;
chain3.combineManyMut = combineManyMut;
chain3.chain = chain3;
chain3.chainUnchecked = chain3;
chain3.gen = gen_default;
chain3.fun = fun_default;
chain3.dataSource = dataSource_default;

// node_modules/stream-chain/src/utils/fixUtf8Stream.js
var dropBOM = (s) => s.charCodeAt(0) === 65279 ? s.slice(1) : s;
var makeTextDecoderImpl = (options2) => {
  const textDecoder = new TextDecoder("utf-8", { ignoreBOM: true });
  let atStart = !options2?.ignoreBOM;
  return flushable((chunk) => {
    let s;
    if (chunk === none) s = textDecoder.decode();
    else if (typeof chunk == "string") s = chunk;
    else if (chunk instanceof Uint8Array) s = textDecoder.decode(chunk, { stream: true });
    else throw new TypeError("Expected a string or a Uint8Array");
    if (!atStart || !s) return s;
    atStart = false;
    return dropBOM(s);
  });
};
var makeStringDecoderImpl = (StringDecoder) => (options2) => {
  const stringDecoder = new StringDecoder();
  let atStart = !options2?.ignoreBOM;
  return flushable((chunk) => {
    let s;
    if (chunk === none) s = stringDecoder.end();
    else if (typeof chunk == "string") s = chunk;
    else if (chunk instanceof Uint8Array) s = stringDecoder.write(chunk);
    else throw new TypeError("Expected a string or a Uint8Array");
    if (!atStart || !s) return s;
    atStart = false;
    return dropBOM(s);
  });
};
var impl = makeTextDecoderImpl;
var isDeno = typeof globalThis["Deno"] == "object" && globalThis["Deno"]?.version;
var isBun = typeof globalThis["Bun"] == "object" && globalThis["Bun"]?.version;
var isNode = !isDeno && !isBun && typeof process == "object" && process?.versions?.node;
var readyPromise = isNode ? import("node:string_decoder").then(
  ({ StringDecoder }) => {
    impl = makeStringDecoderImpl(StringDecoder);
  },
  () => {
  }
  // squelch — stick with TextDecoder
) : Promise.resolve();
var fixUtf8Stream = (options2) => impl(options2);
var fixUtf8Stream_default = fixUtf8Stream;

// node_modules/stream-json/src/core/parser.js
var patterns = {
  value1: /[\"\{\[\]\-\d]|true\b|false\b|null\b|\s{1,256}/y,
  string: /[^\x00-\x1f\"\\]{1,256}|\\[bfnrt\"\\\/]|\\u[\da-fA-F]{4}|\"/y,
  numberStart: /\d/y,
  numberDigit: /\d{0,256}/y,
  numberFraction: /[\.eE]/y,
  numberExponent: /[eE]/y,
  numberExpSign: /[-+]/y
};
var MAX_PATTERN_SIZE = 16;
patterns.numberFracStart = patterns.numberExpStart = patterns.numberStart;
patterns.numberFracDigit = patterns.numberExpDigit = patterns.numberDigit;
var expected = { object: "objectStop", array: "arrayStop", "": "done" };
var tokenStartObject = { name: "startObject" };
var tokenEndObject = { name: "endObject" };
var tokenStartArray = { name: "startArray" };
var tokenEndArray = { name: "endArray" };
var tokenStartString = { name: "startString" };
var tokenEndString = { name: "endString" };
var tokenStartNumber = { name: "startNumber" };
var tokenEndNumber = { name: "endNumber" };
var tokenStartKey = { name: "startKey" };
var tokenEndKey = { name: "endKey" };
var literalTokens = {
  true: { name: "trueValue", value: true },
  false: { name: "falseValue", value: false },
  null: { name: "nullValue", value: null }
};
var fromHex = (s) => String.fromCharCode(parseInt(s.slice(2), 16));
var codes = { b: "\b", f: "\f", n: "\n", r: "\r", t: "	", '"': '"', "\\": "\\", "/": "/" };
var ASCII_TAB = "	".charCodeAt(0);
var ASCII_LF = "\n".charCodeAt(0);
var ASCII_CR = "\r".charCodeAt(0);
var ASCII_SPACE = " ".charCodeAt(0);
var ASCII_QUOTE = '"'.charCodeAt(0);
var ASCII_BACKSLASH = "\\".charCodeAt(0);
var ASCII_OPEN_BRACE = "{".charCodeAt(0);
var ASCII_CLOSE_BRACE = "}".charCodeAt(0);
var ASCII_OPEN_BRACKET = "[".charCodeAt(0);
var ASCII_CLOSE_BRACKET = "]".charCodeAt(0);
var ASCII_MINUS = "-".charCodeAt(0);
var ASCII_COLON = ":".charCodeAt(0);
var ASCII_COMMA = ",".charCodeAt(0);
var ASCII_ZERO = "0".charCodeAt(0);
var ASCII_NINE = "9".charCodeAt(0);
var ASCII_UPPER_A = "A".charCodeAt(0);
var ASCII_UPPER_F = "F".charCodeAt(0);
var ASCII_LOWER_A = "a".charCodeAt(0);
var ASCII_LOWER_F = "f".charCodeAt(0);
var ASCII_LOWER_N = "n".charCodeAt(0);
var ASCII_LOWER_T = "t".charCodeAt(0);
var ASCII_LOWER_U = "u".charCodeAt(0);
var HIGH_SURROGATE_FIRST = 55296;
var HIGH_SURROGATE_LAST = 56319;
var TERM = [];
for (const ch of ",}] 	\n\r") TERM[ch.charCodeAt(0)] = 1;
var numberFull = /-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][-+]?\d+)?/y;
var HEX = (c) => c >= ASCII_ZERO && c <= ASCII_NINE || c >= ASCII_UPPER_A && c <= ASCII_UPPER_F || c >= ASCII_LOWER_A && c <= ASCII_LOWER_F;
var jsonParser = (options2) => {
  let packKeys = true, packStrings = true, packNumbers = true, streamKeys = true, streamStrings = true, streamNumbers = true, jsonStreaming = false;
  if (options2) {
    "packValues" in options2 && (packKeys = packStrings = packNumbers = options2.packValues);
    "packKeys" in options2 && (packKeys = options2.packKeys);
    "packStrings" in options2 && (packStrings = options2.packStrings);
    "packNumbers" in options2 && (packNumbers = options2.packNumbers);
    "streamValues" in options2 && (streamKeys = streamStrings = streamNumbers = options2.streamValues);
    "streamKeys" in options2 && (streamKeys = options2.streamKeys);
    "streamStrings" in options2 && (streamStrings = options2.streamStrings);
    "streamNumbers" in options2 && (streamNumbers = options2.streamNumbers);
    jsonStreaming = options2.jsonStreaming;
  }
  !packKeys && (streamKeys = true);
  !packStrings && (streamStrings = true);
  !packNumbers && (streamNumbers = true);
  let done = false, expect = jsonStreaming ? "done" : "value", parent = "", openNumber = false, accumulator = "", heldSurrogate = "", buffer = "";
  const stack = [];
  const pushStringChunk = (tokens, value) => {
    if (heldSurrogate) {
      value = heldSurrogate + value;
      heldSurrogate = "";
    }
    const last = value.charCodeAt(value.length - 1);
    if (last >= HIGH_SURROGATE_FIRST && last <= HIGH_SURROGATE_LAST) {
      heldSurrogate = value.charAt(value.length - 1);
      if (value.length === 1) return;
      value = value.slice(0, -1);
    }
    tokens.push({ name: "stringChunk", value });
  };
  return flushable((buf) => {
    const tokens = [];
    if (buf === none) {
      done = true;
    } else {
      buffer += buf;
    }
    let match, fm, s, e, q, rs, cc, value, index = 0;
    main: for (; ; ) {
      switch (expect) {
        case "value1":
        case "value": {
          while (index < buffer.length) {
            cc = buffer.charCodeAt(index);
            if (cc === ASCII_SPACE || cc === ASCII_TAB || cc === ASCII_LF || cc === ASCII_CR) {
              ++index;
              continue;
            }
            break;
          }
          if (index >= buffer.length) {
            if (done) throw new Error("Parser has expected a value");
            break main;
          }
          cc = buffer.charCodeAt(index);
          if (cc === ASCII_QUOTE) {
            q = index + 1;
            rs = q;
            s = "";
            for (; ; ) {
              if (q >= buffer.length) {
                q = -1;
                break;
              }
              e = buffer.charCodeAt(q);
              if (e === ASCII_QUOTE) {
                s += buffer.slice(rs, q);
                break;
              }
              if (e < ASCII_SPACE) {
                q = -1;
                break;
              }
              if (e === ASCII_BACKSLASH) {
                if (q + 1 >= buffer.length) {
                  q = -1;
                  break;
                }
                cc = buffer.charCodeAt(q + 1);
                if (cc === ASCII_LOWER_U) {
                  if (q + 6 > buffer.length || !(HEX(buffer.charCodeAt(q + 2)) && HEX(buffer.charCodeAt(q + 3)) && HEX(buffer.charCodeAt(q + 4)) && HEX(buffer.charCodeAt(q + 5)))) {
                    q = -1;
                    break;
                  }
                  s += buffer.slice(rs, q) + String.fromCharCode(parseInt(buffer.slice(q + 2, q + 6), 16));
                  q += 6;
                } else {
                  value = codes[buffer.charAt(q + 1)];
                  if (value === void 0) {
                    q = -1;
                    break;
                  }
                  s += buffer.slice(rs, q) + value;
                  q += 2;
                }
                rs = q;
                continue;
              }
              ++q;
            }
            if (q >= 0) {
              if (streamStrings) {
                tokens.push(tokenStartString);
                if (s) tokens.push({ name: "stringChunk", value: s });
                tokens.push(tokenEndString);
              }
              if (packStrings) tokens.push({ name: "stringValue", value: s });
              index = q + 1;
              expect = expected[parent];
              continue main;
            }
            if (streamStrings) tokens.push(tokenStartString);
            expect = "string";
            ++index;
            continue main;
          }
          if (cc === ASCII_OPEN_BRACE) {
            tokens.push(tokenStartObject);
            stack.push(parent);
            parent = "object";
            expect = "key1";
            ++index;
            continue main;
          }
          if (cc === ASCII_OPEN_BRACKET) {
            tokens.push(tokenStartArray);
            stack.push(parent);
            parent = "array";
            expect = "value1";
            ++index;
            continue main;
          }
          if (cc === ASCII_CLOSE_BRACKET) {
            if (expect !== "value1") throw new Error("Parser cannot parse input: unexpected token ']'");
            tokens.push(tokenEndArray);
            parent = stack.pop();
            expect = expected[parent];
            ++index;
            continue main;
          }
          if (cc === ASCII_MINUS || cc >= ASCII_ZERO && cc <= ASCII_NINE) {
            numberFull.lastIndex = index;
            fm = numberFull.exec(buffer);
            if (fm) {
              e = index + fm[0].length;
              if (e < buffer.length && TERM[buffer.charCodeAt(e)]) {
                s = fm[0];
                if (streamNumbers) tokens.push(tokenStartNumber, { name: "numberChunk", value: s }, tokenEndNumber);
                if (packNumbers) tokens.push({ name: "numberValue", value: s });
                index = e;
                expect = expected[parent];
                continue main;
              }
            }
            openNumber = true;
            if (cc === ASCII_MINUS) {
              if (streamNumbers) tokens.push(tokenStartNumber, { name: "numberChunk", value: "-" });
              packNumbers && (accumulator = "-");
              expect = "numberStart";
            } else if (cc === ASCII_ZERO) {
              if (streamNumbers) tokens.push(tokenStartNumber, { name: "numberChunk", value: "0" });
              packNumbers && (accumulator = "0");
              expect = "numberFraction";
            } else {
              s = buffer.charAt(index);
              if (streamNumbers) tokens.push(tokenStartNumber, { name: "numberChunk", value: s });
              packNumbers && (accumulator = s);
              expect = "numberDigit";
            }
            ++index;
            continue main;
          }
          if (cc === ASCII_LOWER_T || cc === ASCII_LOWER_F || cc === ASCII_LOWER_N) {
            patterns.value1.lastIndex = index;
            match = patterns.value1.exec(buffer);
            if (!match) {
              if (done || index + MAX_PATTERN_SIZE < buffer.length) {
                throw new Error("Parser cannot parse input: expected a value");
              }
              break main;
            }
            value = match[0];
            if (buffer.length - index === value.length && !done) break main;
            tokens.push(literalTokens[value]);
            expect = expected[parent];
            index += value.length;
            continue main;
          }
          throw new Error("Parser cannot parse input: expected a value");
        }
        // incremental string body (escapes / long / cross-chunk)
        case "keyVal":
        case "string":
          patterns.string.lastIndex = index;
          match = patterns.string.exec(buffer);
          if (!match) {
            if (index < buffer.length && (done || buffer.length - index >= 6)) throw new Error("Parser cannot parse input: escaped characters");
            if (done) throw new Error("Parser has expected a string value");
            break main;
          }
          value = match[0];
          if (value === '"') {
            if (heldSurrogate) {
              tokens.push({ name: "stringChunk", value: heldSurrogate });
              heldSurrogate = "";
            }
            if (expect === "keyVal") {
              if (streamKeys) tokens.push(tokenEndKey);
              if (packKeys) {
                tokens.push({ name: "keyValue", value: accumulator });
                accumulator = "";
              }
              expect = "colon";
            } else {
              if (streamStrings) tokens.push(tokenEndString);
              if (packStrings) {
                tokens.push({ name: "stringValue", value: accumulator });
                accumulator = "";
              }
              expect = expected[parent];
            }
          } else if (value.length > 1 && value.charAt(0) === "\\") {
            const t = value.length == 2 ? codes[value.charAt(1)] : fromHex(value);
            if (expect === "keyVal" ? streamKeys : streamStrings) {
              pushStringChunk(tokens, t);
            }
            if (expect === "keyVal" ? packKeys : packStrings) {
              accumulator += t;
            }
          } else {
            if (expect === "keyVal" ? streamKeys : streamStrings) {
              pushStringChunk(tokens, value);
            }
            if (expect === "keyVal" ? packKeys : packStrings) {
              accumulator += value;
            }
          }
          index += value.length;
          break;
        case "key1":
        case "key": {
          while (index < buffer.length) {
            cc = buffer.charCodeAt(index);
            if (cc === ASCII_SPACE || cc === ASCII_TAB || cc === ASCII_LF || cc === ASCII_CR) {
              ++index;
              continue;
            }
            break;
          }
          if (index >= buffer.length) {
            if (done) throw new Error("Parser cannot parse input: expected an object key");
            break main;
          }
          cc = buffer.charCodeAt(index);
          if (cc === ASCII_QUOTE) {
            q = index + 1;
            rs = q;
            s = "";
            for (; ; ) {
              if (q >= buffer.length) {
                q = -1;
                break;
              }
              e = buffer.charCodeAt(q);
              if (e === ASCII_QUOTE) {
                s += buffer.slice(rs, q);
                break;
              }
              if (e < ASCII_SPACE) {
                q = -1;
                break;
              }
              if (e === ASCII_BACKSLASH) {
                if (q + 1 >= buffer.length) {
                  q = -1;
                  break;
                }
                cc = buffer.charCodeAt(q + 1);
                if (cc === ASCII_LOWER_U) {
                  if (q + 6 > buffer.length || !(HEX(buffer.charCodeAt(q + 2)) && HEX(buffer.charCodeAt(q + 3)) && HEX(buffer.charCodeAt(q + 4)) && HEX(buffer.charCodeAt(q + 5)))) {
                    q = -1;
                    break;
                  }
                  s += buffer.slice(rs, q) + String.fromCharCode(parseInt(buffer.slice(q + 2, q + 6), 16));
                  q += 6;
                } else {
                  value = codes[buffer.charAt(q + 1)];
                  if (value === void 0) {
                    q = -1;
                    break;
                  }
                  s += buffer.slice(rs, q) + value;
                  q += 2;
                }
                rs = q;
                continue;
              }
              ++q;
            }
            if (q >= 0) {
              if (streamKeys) {
                tokens.push(tokenStartKey);
                if (s) tokens.push({ name: "stringChunk", value: s });
                tokens.push(tokenEndKey);
              }
              if (packKeys) tokens.push({ name: "keyValue", value: s });
              index = q + 1;
              expect = "colon";
              continue main;
            }
            if (streamKeys) tokens.push(tokenStartKey);
            expect = "keyVal";
            ++index;
            continue main;
          }
          if (cc === ASCII_CLOSE_BRACE) {
            if (expect !== "key1") throw new Error("Parser cannot parse input: unexpected token '}'");
            tokens.push(tokenEndObject);
            parent = stack.pop();
            expect = expected[parent];
            ++index;
            continue main;
          }
          throw new Error("Parser cannot parse input: expected an object key");
        }
        case "colon": {
          while (index < buffer.length) {
            cc = buffer.charCodeAt(index);
            if (cc === ASCII_SPACE || cc === ASCII_TAB || cc === ASCII_LF || cc === ASCII_CR) {
              ++index;
              continue;
            }
            break;
          }
          if (index >= buffer.length) {
            if (done) throw new Error("Parser cannot parse input: expected ':'");
            break main;
          }
          cc = buffer.charCodeAt(index);
          if (cc === ASCII_COLON) {
            expect = "value";
            ++index;
            continue main;
          }
          throw new Error("Parser cannot parse input: expected ':'");
        }
        case "arrayStop":
        case "objectStop": {
          while (index < buffer.length) {
            cc = buffer.charCodeAt(index);
            if (cc === ASCII_SPACE || cc === ASCII_TAB || cc === ASCII_LF || cc === ASCII_CR) {
              ++index;
              continue;
            }
            break;
          }
          if (index >= buffer.length) {
            if (done) throw new Error("Parser cannot parse input: expected ','");
            break main;
          }
          if (openNumber) {
            if (streamNumbers) tokens.push(tokenEndNumber);
            openNumber = false;
            if (packNumbers) {
              tokens.push({ name: "numberValue", value: accumulator });
              accumulator = "";
            }
          }
          cc = buffer.charCodeAt(index);
          if (cc === ASCII_COMMA) {
            expect = expect === "arrayStop" ? "value" : "key";
            ++index;
            continue main;
          }
          if (cc === ASCII_CLOSE_BRACE || cc === ASCII_CLOSE_BRACKET) {
            if (cc === ASCII_CLOSE_BRACE ? expect === "arrayStop" : expect !== "arrayStop") {
              throw new Error("Parser cannot parse input: expected '" + (expect === "arrayStop" ? "]" : "}") + "'");
            }
            tokens.push(cc === ASCII_CLOSE_BRACE ? tokenEndObject : tokenEndArray);
            parent = stack.pop();
            expect = expected[parent];
            ++index;
            continue main;
          }
          throw new Error("Parser cannot parse input: expected ','");
        }
        // number chunks — cross-chunk / fallback
        case "numberStart":
          patterns.numberStart.lastIndex = index;
          match = patterns.numberStart.exec(buffer);
          if (!match) {
            if (index < buffer.length || done) throw new Error("Parser cannot parse input: expected a starting digit");
            break main;
          }
          value = match[0];
          if (streamNumbers) tokens.push({ name: "numberChunk", value });
          packNumbers && (accumulator += value);
          expect = value === "0" ? "numberFraction" : "numberDigit";
          index += value.length;
          break;
        case "numberDigit":
          patterns.numberDigit.lastIndex = index;
          match = patterns.numberDigit.exec(buffer);
          if (!match) {
            if (index < buffer.length || done) throw new Error("Parser cannot parse input: expected a digit");
            break main;
          }
          value = match[0];
          if (value) {
            if (streamNumbers) tokens.push({ name: "numberChunk", value });
            packNumbers && (accumulator += value);
            index += value.length;
          } else {
            if (index < buffer.length) {
              expect = "numberFraction";
              break;
            }
            if (done) {
              expect = expected[parent];
              break;
            }
            break main;
          }
          break;
        case "numberFraction":
          patterns.numberFraction.lastIndex = index;
          match = patterns.numberFraction.exec(buffer);
          if (!match) {
            if (index < buffer.length || done) {
              expect = expected[parent];
              break;
            }
            break main;
          }
          value = match[0];
          if (streamNumbers) tokens.push({ name: "numberChunk", value });
          packNumbers && (accumulator += value);
          expect = value === "." ? "numberFracStart" : "numberExpSign";
          index += value.length;
          break;
        case "numberFracStart":
          patterns.numberFracStart.lastIndex = index;
          match = patterns.numberFracStart.exec(buffer);
          if (!match) {
            if (index < buffer.length || done) throw new Error("Parser cannot parse input: expected a fractional part of a number");
            break main;
          }
          value = match[0];
          if (streamNumbers) tokens.push({ name: "numberChunk", value });
          packNumbers && (accumulator += value);
          expect = "numberFracDigit";
          index += value.length;
          break;
        case "numberFracDigit":
          patterns.numberFracDigit.lastIndex = index;
          match = patterns.numberFracDigit.exec(buffer);
          value = match[0];
          if (value) {
            if (streamNumbers) tokens.push({ name: "numberChunk", value });
            packNumbers && (accumulator += value);
            index += value.length;
          } else {
            if (index < buffer.length) {
              expect = "numberExponent";
              break;
            }
            if (done) {
              expect = expected[parent];
              break;
            }
            break main;
          }
          break;
        case "numberExponent":
          patterns.numberExponent.lastIndex = index;
          match = patterns.numberExponent.exec(buffer);
          if (!match) {
            if (index < buffer.length) {
              expect = expected[parent];
              break;
            }
            if (done) {
              expect = expected[parent];
              break;
            }
            break main;
          }
          value = match[0];
          if (streamNumbers) tokens.push({ name: "numberChunk", value });
          packNumbers && (accumulator += value);
          expect = "numberExpSign";
          index += value.length;
          break;
        case "numberExpSign":
          patterns.numberExpSign.lastIndex = index;
          match = patterns.numberExpSign.exec(buffer);
          if (!match) {
            if (index < buffer.length) {
              expect = "numberExpStart";
              break;
            }
            if (done) throw new Error("Parser has expected an exponent value of a number");
            break main;
          }
          value = match[0];
          if (streamNumbers) tokens.push({ name: "numberChunk", value });
          packNumbers && (accumulator += value);
          expect = "numberExpStart";
          index += value.length;
          break;
        case "numberExpStart":
          patterns.numberExpStart.lastIndex = index;
          match = patterns.numberExpStart.exec(buffer);
          if (!match) {
            if (index < buffer.length || done) throw new Error("Parser cannot parse input: expected an exponent part of a number");
            break main;
          }
          value = match[0];
          if (streamNumbers) tokens.push({ name: "numberChunk", value });
          packNumbers && (accumulator += value);
          expect = "numberExpDigit";
          index += value.length;
          break;
        case "numberExpDigit":
          patterns.numberExpDigit.lastIndex = index;
          match = patterns.numberExpDigit.exec(buffer);
          value = match[0];
          if (value) {
            if (streamNumbers) tokens.push({ name: "numberChunk", value });
            packNumbers && (accumulator += value);
            index += value.length;
          } else {
            if (index < buffer.length || done) {
              expect = expected[parent];
              break;
            }
            break main;
          }
          break;
        case "done": {
          while (index < buffer.length) {
            cc = buffer.charCodeAt(index);
            if (cc === ASCII_SPACE || cc === ASCII_TAB || cc === ASCII_LF || cc === ASCII_CR) {
              if (openNumber) {
                if (streamNumbers) tokens.push(tokenEndNumber);
                openNumber = false;
                if (packNumbers) {
                  tokens.push({ name: "numberValue", value: accumulator });
                  accumulator = "";
                }
              }
              ++index;
              continue;
            }
            break;
          }
          if (index >= buffer.length) break main;
          if (jsonStreaming) {
            if (openNumber) {
              if (streamNumbers) tokens.push(tokenEndNumber);
              openNumber = false;
              if (packNumbers) {
                tokens.push({ name: "numberValue", value: accumulator });
                accumulator = "";
              }
            }
            expect = "value";
            continue main;
          }
          throw new Error("Parser cannot parse input: unexpected characters");
        }
      }
    }
    if (done && openNumber) {
      if (streamNumbers) tokens.push(tokenEndNumber);
      openNumber = false;
      if (packNumbers) {
        tokens.push({ name: "numberValue", value: accumulator });
        accumulator = "";
      }
    }
    buffer = buffer.slice(index);
    return tokens.length ? many(tokens) : none;
  });
};
var parser = (options2) => gen_default(fixUtf8Stream_default(options2), jsonParser(options2));
parser.parser = parser;
var parser_default = parser;

// node_modules/stream-json/src/parser.js
parser_default.asStream = (options2) => asStream_default(parser_default(options2), { writableObjectMode: true, readableObjectMode: true, ...options2 });
parser_default.asWebStream = (options2) => asWebStream_default(parser_default(options2), { writableObjectMode: true, readableObjectMode: true, ...options2 });
var parser_default2 = parser_default;

// node_modules/stream-json/src/core/utils/path-matcher.js
var DIVERGED = -1;
var MATCHED = -2;
var defaultFilter = () => true;
var toPart = (key) => key == null ? "" : "" + key;
var PathMatcher = class {
  constructor(filter, separator = ".") {
    this.filter = filter;
    this.separator = separator;
    this.stateful = true;
    if (typeof filter == "string") {
      this.filterWithSeparator = filter + separator;
      this.states = [0];
      return;
    }
    if (filter instanceof RegExp) {
      this.paths = [""];
      this.extend = this._extendRegExp;
      this.test = this._testRegExp;
      this.testRecorded = this._testRecordedRegExp;
      return;
    }
    this.stateful = false;
    this.extend = this._extendNothing;
    this.test = this.testRecorded = typeof filter == "function" ? filter : defaultFilter;
  }
  extend(stack) {
    const length = stack.length;
    if (length) this.states[length] = this._step(this.states[length - 1], stack[length - 1], length === 1);
  }
  test(stack, _chunk) {
    const length = stack.length;
    return this._isMatch(length ? this._step(this.states[length - 1], stack[length - 1], length === 1) : 0);
  }
  testRecorded(stack) {
    return this._isMatch(this.states[stack.length]);
  }
  _isMatch(state) {
    return state === MATCHED || state === this.filter.length;
  }
  // state: a position when the path is a proper prefix of filter + separator
  _step(state, key, isRoot) {
    if (!isRoot) state = this._append(state, this.separator);
    return this._append(state, toPart(key));
  }
  _append(state, part) {
    if (state < 0) return state;
    const filterWithSeparator = this.filterWithSeparator;
    if (part.length < filterWithSeparator.length - state) return filterWithSeparator.startsWith(part, state) ? state + part.length : DIVERGED;
    return part.startsWith(filterWithSeparator.slice(state)) ? MATCHED : DIVERGED;
  }
  _extendRegExp(stack) {
    const length = stack.length;
    if (length) this.paths[length] = length === 1 ? toPart(stack[0]) : [this.paths[length - 1], this.separator, toPart(stack[length - 1])].join("");
  }
  _testRegExp(stack, _chunk) {
    const length = stack.length, filter = this.filter;
    filter.lastIndex = 0;
    if (!length) return filter.test("");
    return filter.test(length === 1 ? toPart(stack[0]) : this.paths[length - 1] + this.separator + toPart(stack[length - 1]));
  }
  _testRecordedRegExp(stack) {
    const filter = this.filter;
    filter.lastIndex = 0;
    return filter.test(this.paths[stack.length]);
  }
  _extendNothing(_stack) {
  }
};
var path_matcher_default = PathMatcher;

// node_modules/stream-json/src/core/filters/filter-base.js
var checkableTokens = {
  startObject: 1,
  startArray: 1,
  startString: 1,
  startNumber: 1,
  nullValue: 1,
  trueValue: 1,
  falseValue: 1,
  stringValue: 1,
  numberValue: 1
};
var stopTokens = {
  startObject: "endObject",
  startArray: "endArray",
  startString: "endString",
  startNumber: "endNumber"
};
var optionalTokens = { endString: "stringValue", endNumber: "numberValue" };
var defaultFilter2 = () => true;
var DEFAULT_MAX_DEPTH = 1024;
var filterBase = ({
  specialAction = "accept",
  defaultAction = "ignore",
  nonCheckableAction = "process-key",
  transition
} = {}) => (options2) => {
  const once3 = options2?.once, separator = options2?.pathSeparator || ".", maxDepth = options2?.maxDepth ?? DEFAULT_MAX_DEPTH;
  let filter = defaultFilter2;
  let streamKeys = false, mirrorStreamKeys = true;
  if (options2) {
    if (typeof options2.filter == "function" || typeof options2.filter == "string" || options2.filter instanceof RegExp) {
      filter = options2.filter;
    }
    if ("streamValues" in options2) {
      streamKeys = options2.streamValues;
      mirrorStreamKeys = false;
    }
    if ("streamKeys" in options2) {
      streamKeys = options2.streamKeys;
      mirrorStreamKeys = false;
    }
  }
  const sanitizedOptions = { ...options2, filter, streamKeys, separator }, matcher = new path_matcher_default(options2?.filter, separator), passToken = transition ? none : stop;
  let state = "check", stack = [], depth = 0, previousToken = "", endToken = "", optionalToken = "", startTransition = false, matched = false;
  return flushable((chunk) => {
    if (chunk === none) return transition && state !== "all" ? transition([], null, "flush", sanitizedOptions) : none;
    if (optionalToken) {
      if (optionalToken === chunk.name) {
        let returnToken2 = none;
        switch (state) {
          case "process-key":
            stack[stack.length - 1] = chunk.value;
            state = "check";
            break;
          case "accept-value":
            returnToken2 = chunk;
            state = once3 && matched ? "pass" : "check";
            break;
          default:
            state = once3 ? "all" : "check";
            break;
        }
        optionalToken = "";
        return returnToken2;
      }
      optionalToken = "";
      state = once3 && matched ? state === "reject-value" ? "all" : "pass" : "check";
    }
    let returnToken = none;
    recheck: for (; ; ) {
      switch (state) {
        case "process-key":
          if (chunk.name === "endKey") optionalToken = "keyValue";
          return none;
        case "pass":
          return passToken;
        case "all":
          return chunk;
        case "accept":
        case "reject":
          if (startTransition) {
            startTransition = false;
            returnToken = transition(stack, chunk, state, sanitizedOptions) || none;
          }
          switch (chunk.name) {
            case "startObject":
            case "startArray":
              ++depth;
              break;
            case "endObject":
            case "endArray":
              --depth;
              break;
          }
          if (state === "accept") {
            returnToken = combineManyMut(returnToken, chunk);
          }
          if (!depth) {
            if (once3) {
              state = state === "accept" ? "pass" : "all";
            } else {
              state = "check";
            }
          }
          return returnToken;
        case "accept-value":
        case "reject-value":
          if (startTransition) {
            startTransition = false;
            returnToken = transition(stack, chunk, state, sanitizedOptions) || none;
          }
          if (state === "accept-value") {
            returnToken = combineManyMut(returnToken, chunk);
          }
          if (chunk.name === endToken) {
            optionalToken = optionalTokens[endToken];
            endToken = "";
          }
          return returnToken;
      }
      if (typeof stack[stack.length - 1] == "number") {
        switch (chunk.name) {
          case "startObject":
          case "startArray":
          case "startString":
          case "startNumber":
          case "nullValue":
          case "trueValue":
          case "falseValue":
            ++stack[stack.length - 1];
            break;
          case "numberValue":
            if (previousToken !== "endNumber") ++stack[stack.length - 1];
            break;
          case "stringValue":
            if (previousToken !== "endString") ++stack[stack.length - 1];
            break;
        }
      } else {
        if (chunk.name === "keyValue") stack[stack.length - 1] = chunk.value;
      }
      previousToken = chunk.name;
      let action = nonCheckableAction;
      if (checkableTokens[chunk.name] === 1) {
        if (stack.length > maxDepth) throw new RangeError(`filter: JSON nesting depth exceeds maxDepth (${maxDepth})`);
        action = matcher.test(stack, chunk) ? specialAction : defaultAction;
      }
      endToken = stopTokens[chunk.name] || "";
      matched = action === specialAction;
      switch (action) {
        case "process-key":
          if (chunk.name === "startKey") {
            if (mirrorStreamKeys) sanitizedOptions.streamKeys = true;
            state = "process-key";
            continue recheck;
          }
          break;
        case "accept-token":
          if (endToken && optionalTokens[endToken]) {
            state = "accept-value";
            startTransition = !!transition;
            continue recheck;
          }
          if (transition) returnToken = transition(stack, chunk, action, sanitizedOptions);
          returnToken = combineManyMut(returnToken, chunk);
          if (once3 && matched) state = "pass";
          break;
        case "accept":
          if (endToken) {
            state = optionalTokens[endToken] ? "accept-value" : "accept";
            startTransition = !!transition;
            continue recheck;
          }
          if (transition) returnToken = transition(stack, chunk, action, sanitizedOptions);
          returnToken = combineManyMut(returnToken, chunk);
          if (once3) state = "pass";
          break;
        case "reject":
          if (endToken) {
            state = optionalTokens[endToken] ? "reject-value" : "reject";
            startTransition = !!transition;
            continue recheck;
          }
          if (transition) returnToken = transition(stack, chunk, action, sanitizedOptions);
          if (once3) state = "all";
          break;
        case "pass":
          state = "pass";
          continue recheck;
      }
      break;
    }
    switch (chunk.name) {
      case "startObject":
        matcher.extend(stack);
        stack.push(null);
        break;
      case "startArray":
        matcher.extend(stack);
        stack.push(-1);
        break;
      case "endObject":
      case "endArray":
        stack.pop();
        break;
    }
    return returnToken;
  });
};
var makeStackDiffer = (previousStack = []) => (stack, chunk, options2) => {
  const returnTokens = [];
  let commonLength = 0;
  for (const n = Math.min(stack.length, previousStack.length); commonLength < n && stack[commonLength] === previousStack[commonLength]; ++commonLength) ;
  for (let i = previousStack.length - 1; i > commonLength; --i) {
    returnTokens.push({ name: typeof previousStack[i] == "number" ? "endArray" : "endObject" });
  }
  if (commonLength < previousStack.length) {
    if (commonLength < stack.length) {
      const key = stack[commonLength];
      if (typeof key == "string") {
        if (options2?.streamKeys) {
          returnTokens.push({ name: "startKey" }, { name: "stringChunk", value: key }, { name: "endKey" });
        }
        returnTokens.push({ name: "keyValue", value: key });
      } else if (typeof key == "number" && options2?.skippedArrayValue) {
        for (let i = Math.max(0, previousStack[commonLength] + 1); i < key; ++i) {
          returnTokens.push(...options2.skippedArrayValue);
        }
      }
      previousStack[commonLength] = key;
      ++commonLength;
    } else {
      returnTokens.push({ name: typeof previousStack[commonLength] == "number" ? "endArray" : "endObject" });
    }
  }
  previousStack.splice(commonLength);
  for (let i = commonLength; i < stack.length; ++i) {
    const key = stack[i];
    previousStack.push(key);
    if (typeof key == "number") {
      if (key >= 0) {
        returnTokens.push({ name: "startArray" });
        if (options2?.skippedArrayValue) {
          for (let j = 0; j < key; ++j) {
            returnTokens.push(...options2.skippedArrayValue);
          }
        }
      }
    } else if (typeof key == "string") {
      returnTokens.push({ name: "startObject" });
      if (options2?.streamKeys) {
        returnTokens.push({ name: "startKey" }, { name: "stringChunk", value: key }, { name: "endKey" });
      }
      returnTokens.push({ name: "keyValue", value: key });
    }
  }
  switch (chunk?.name) {
    case "startObject":
      previousStack.push(null);
      break;
    case "startArray":
      previousStack.push(-1);
      break;
  }
  return many(returnTokens);
};
filterBase.filterBase = filterBase;
filterBase.makeStackDiffer = makeStackDiffer;
var filter_base_default = filterBase;

// node_modules/stream-json/src/core/filters/pick.js
var pick = (
  /** @type {any} */
  filter_base_default()
);
pick.pick = pick;
var pick_default = pick;

// node_modules/stream-json/src/core/utils/with-parser.js
var withParser = (fn, options2) => gen_default(parser_default(options2), fn(options2));
withParser.withParser = withParser;
var with_parser_default = withParser;

// node_modules/stream-json/src/utils/with-parser.js
with_parser_default.asStream = (fn, options2) => asStream_default(with_parser_default(fn, options2), { ...options2, writableObjectMode: false, readableObjectMode: true });
with_parser_default.asWebStream = (fn, options2) => asWebStream_default(with_parser_default(fn, options2), { ...options2, writableObjectMode: false, readableObjectMode: true });
var with_parser_default2 = with_parser_default;

// node_modules/stream-json/src/filters/pick.js
pick_default.asStream = (options2) => asStream_default(pick_default(options2), { writableObjectMode: true, readableObjectMode: true, ...options2 });
pick_default.asWebStream = (options2) => asWebStream_default(pick_default(options2), { writableObjectMode: true, readableObjectMode: true, ...options2 });
pick_default.withParser = (options2) => with_parser_default2(pick_default, { packKeys: true, ...options2 });
pick_default.withParserAsStream = (options2) => (
  /** @type {any} */
  with_parser_default2.asStream(pick_default, { packKeys: true, ...options2 })
);
pick_default.withParserAsWebStream = (options2) => (
  /** @type {any} */
  with_parser_default2.asWebStream(pick_default, { packKeys: true, ...options2 })
);
var pick_default2 = pick_default;

// node_modules/stream-json/src/core/filters/ignore.js
var ignore = (options2) => {
  const stackDiffer = makeStackDiffer();
  return filterBase({
    specialAction: "reject",
    defaultAction: "accept-token",
    transition(stack, chunk, action, options3) {
      if (action === "reject" || action === "reject-value") return none;
      return stackDiffer(stack, chunk, options3);
    }
  })(options2);
};
ignore.ignore = ignore;
var ignore_default = ignore;

// node_modules/stream-json/src/filters/ignore.js
ignore_default.asStream = (options2) => asStream_default(ignore_default(options2), { writableObjectMode: true, readableObjectMode: true, ...options2 });
ignore_default.asWebStream = (options2) => asWebStream_default(ignore_default(options2), { writableObjectMode: true, readableObjectMode: true, ...options2 });
ignore_default.withParser = (options2) => with_parser_default2(ignore_default, { packKeys: true, ...options2 });
ignore_default.withParserAsStream = (options2) => (
  /** @type {any} */
  with_parser_default2.asStream(ignore_default, { packKeys: true, ...options2 })
);
ignore_default.withParserAsWebStream = (options2) => (
  /** @type {any} */
  with_parser_default2.asWebStream(ignore_default, { packKeys: true, ...options2 })
);
var ignore_default2 = ignore_default;

// node_modules/stream-json/src/core/stringer.js
var noCommaAfter = { startObject: 1, startArray: 1, endKey: 1, keyValue: 1 };
var noSpaceAfter = { endObject: 1, endArray: 1, "": 1 };
var noSpaceBefore = { startObject: 1, startArray: 1 };
var depthIncrement = { startObject: 1, startArray: 1 };
var depthDecrement = { endObject: 1, endArray: 1 };
var values = { startKey: "keyValue", startString: "stringValue", startNumber: "numberValue" };
var stopNames = { startKey: "endKey", startString: "endString", startNumber: "endNumber" };
var symbols = {
  startObject: "{",
  endObject: "}",
  startArray: "[",
  endArray: "]",
  startKey: '"',
  endKey: '":',
  startString: '"',
  endString: '"',
  startNumber: "",
  endNumber: "",
  nullValue: "null",
  trueValue: "true",
  falseValue: "false"
};
var replaceSymbols = { "\b": "\\b", "\f": "\\f", "\n": "\\n", "\r": "\\r", "	": "\\t", '"': '\\"', "\\": "\\\\" };
var sanitizeString = (value) => value.replace(
  /[\b\f\n\r\t"\\\u0000-\u001F\u007F-\u009F\ud800-\udfff]/gu,
  (match) => Object.hasOwn(replaceSymbols, match) ? replaceSymbols[match] : "\\u" + ("0000" + match.charCodeAt(0).toString(16)).slice(-4)
);
var stringer = (options2) => {
  const vals = {};
  let makeArray = false;
  if (options2) {
    "useValues" in options2 && (vals.keyValue = vals.stringValue = vals.numberValue = options2.useValues);
    "useKeyValues" in options2 && (vals.keyValue = options2.useKeyValues);
    "useStringValues" in options2 && (vals.stringValue = options2.useStringValues);
    "useNumberValues" in options2 && (vals.numberValue = options2.useNumberValues);
    makeArray = options2.makeArray;
  }
  let prev = "";
  let depth = 0;
  let skip = null;
  let first = !!makeArray;
  const processToken = (chunk) => {
    if (skip) {
      if (chunk.name === skip) skip = null;
      return none;
    }
    let result = "";
    if (vals[chunk.name]) {
      if (depth && noCommaAfter[prev] !== 1) result += ",";
      switch (chunk.name) {
        case "keyValue":
          result += '"' + sanitizeString(chunk.value) + '":';
          break;
        case "stringValue":
          result += '"' + sanitizeString(chunk.value) + '"';
          break;
        case "numberValue":
          result += chunk.value;
          break;
      }
    } else {
      switch (chunk.name) {
        case "endObject":
        case "endArray":
        case "endKey":
        case "endString":
        case "endNumber":
          result += symbols[chunk.name];
          break;
        case "stringChunk":
          result += sanitizeString(chunk.value);
          break;
        case "numberChunk":
          result += chunk.value;
          break;
        case "keyValue":
        case "stringValue":
        case "numberValue":
          break;
        case "startKey":
        case "startString":
        case "startNumber":
          if (vals[values[chunk.name]]) {
            skip = stopNames[chunk.name];
            return none;
          }
        // intentional fall down
        default:
          if (depth) {
            if (noCommaAfter[prev] !== 1) result += ",";
          } else {
            if (noSpaceAfter[prev] !== 1 && noSpaceBefore[chunk.name] !== 1) result += " ";
          }
          result += symbols[chunk.name];
          break;
      }
      if (depthIncrement[chunk.name]) {
        ++depth;
      } else if (depthDecrement[chunk.name]) {
        --depth;
      }
    }
    prev = chunk.name;
    return result || none;
  };
  return flushable((chunk) => {
    if (chunk === none) {
      if (!makeArray) return none;
      if (first) return "[]";
      return processToken({ name: "endArray" });
    }
    if (first) {
      first = false;
      const prefix = (
        /** @type {any} */
        processToken({ name: "startArray" })
      );
      const main = processToken(chunk);
      return main === none ? prefix : prefix + main;
    }
    return processToken(chunk);
  });
};
stringer.stringer = stringer;
var stringer_default = stringer;

// node_modules/stream-json/src/stringer.js
stringer_default.asStream = (options2) => asStream_default(stringer_default(options2), { writableObjectMode: true, readableObjectMode: true, ...options2 });
stringer_default.asWebStream = (options2) => asWebStream_default(stringer_default(options2), { writableObjectMode: true, readableObjectMode: true, ...options2 });
var stringer_default2 = stringer_default;

// src/json-stream.ts
var BUFFER_BYTES = 64 * 1024;
var stringifier = () => stringer_default2.asStream({ useKeyValues: true });
var JsonDocument = class _JsonDocument {
  constructor(path) {
    this.path = path;
  }
  path;
  static async capture(source, path) {
    await (0, import_promises2.mkdir)((0, import_node_path2.dirname)(path), { recursive: true });
    await (0, import_promises3.pipeline)(import_node_stream3.Readable.from(source, { objectMode: false, highWaterMark: BUFFER_BYTES }), (0, import_node_fs.createWriteStream)(path, { flags: "wx", mode: 384 }));
    const document = new _JsonDocument(path);
    for await (const _ of document.tokens()) {
    }
    return document;
  }
  async *tokens(path = []) {
    const input = (0, import_node_fs.createReadStream)(this.path, { highWaterMark: BUFFER_BYTES });
    const parsed = parser_default2.asStream({ packKeys: true, streamKeys: false, packStrings: false, packNumbers: false });
    const selected = typeof path === "function" ? pick_default2.asStream({ filter: (stack, token2) => path(stack, token2) }) : path.length ? pick_default2.asStream({ filter: (stack) => stack.length === path.length && path.every((key, index) => stack[index] === key) }) : void 0;
    const output = selected ?? parsed;
    let failure;
    const completed = (selected ? (0, import_promises3.pipeline)(input, parsed, selected) : (0, import_promises3.pipeline)(input, parsed)).catch((error) => {
      failure = error;
    });
    try {
      for await (const token2 of output) yield token2;
      await completed;
      if (failure) throw failure;
    } finally {
      input.destroy();
      parsed.destroy();
      selected?.destroy();
      await completed;
    }
  }
  async kind(path = []) {
    for await (const token2 of this.tokens(path)) {
      if (token2.name === "startObject") return "object";
      if (token2.name === "startArray") return "array";
      if (token2.name === "startString") return "string";
      if (token2.name === "startNumber") return "number";
      if (token2.name === "trueValue" || token2.name === "falseValue") return "boolean";
      if (token2.name === "nullValue") return "null";
    }
    return void 0;
  }
  /** Only schema-sized control fields use this helper; evidence strings use text()/json() instead. */
  async scalar(path, maxBytes = 8192) {
    let text = "", bytes = 0, kind = "";
    for await (const token2 of this.tokens(path)) {
      if (token2.name === "startObject" || token2.name === "startArray") return void 0;
      if (token2.name === "startString" || token2.name === "startNumber") kind = token2.name;
      if (token2.name === "stringChunk" || token2.name === "numberChunk") {
        bytes += Buffer.byteLength(token2.value);
        if (bytes > maxBytes) throw new Error("A JSON control field exceeds its metadata size limit.");
        text += token2.value;
      }
      if (token2.name === "endString") return text;
      if (token2.name === "endNumber") return Number(text);
      if (token2.name === "trueValue" || token2.name === "falseValue" || token2.name === "nullValue") return token2.value;
    }
    if (kind) throw new Error("A JSON control value ended unexpectedly.");
    return void 0;
  }
  async *text(path) {
    let string = false;
    for await (const token2 of this.tokens(path)) {
      if (token2.name === "startString") {
        string = true;
        continue;
      }
      if (token2.name === "stringChunk" && string) yield token2.value;
      else if (token2.name === "endString" && string) return;
      else throw new Error("The selected JSON value is not text.");
    }
  }
  /** Select small reference strings at any depth; oversized/non-string values remain in the evidence, not in inventory metadata. */
  async *stringsWhere(select, maxBytes = 4096) {
    let text = "", bytes = 0, string = false;
    for await (const token2 of this.tokens((stack, token3) => token3.name === "startString" && select(stack, token3))) {
      if (token2.name === "startString") {
        text = "";
        bytes = 0;
        string = true;
      } else if (token2.name === "stringChunk" && string) {
        bytes += Buffer.byteLength(token2.value);
        if (bytes <= maxBytes) text += token2.value;
        else text = "";
      } else if (token2.name === "endString" && string) {
        if (bytes <= maxBytes) yield text;
        string = false;
      }
    }
  }
  async *json(path = []) {
    const input = import_node_stream3.Readable.from(this.tokens(path)), output = stringifier();
    output.setEncoding("utf8");
    let failure;
    const completed = (0, import_promises3.pipeline)(input, output).catch((error) => {
      failure = error;
    });
    try {
      for await (const chunk of output) yield String(chunk);
      await completed;
      if (failure) throw failure;
    } finally {
      input.destroy();
      output.destroy();
      await completed;
    }
  }
  /** Remove only named control fields without assembling a potentially enormous message. */
  async *jsonExcluding(paths) {
    const input = import_node_stream3.Readable.from(this.tokens()), filtered = ignore_default2.asStream({
      filter: (stack) => paths.some((path) => path.length === stack.length && path.every((key, index) => stack[index] === key))
    }), output = stringifier();
    output.setEncoding("utf8");
    let failure;
    const completed = (0, import_promises3.pipeline)(input, filtered, output).catch((error) => {
      failure = error;
    });
    try {
      for await (const chunk of output) yield String(chunk);
      await completed;
      if (failure) throw failure;
    } finally {
      input.destroy();
      filtered.destroy();
      output.destroy();
      await completed;
    }
  }
  /** Split one array in a single pass. Each item is staged before yielding, so even one enormous message stays disk-backed. */
  async *array(path, directory) {
    await (0, import_promises2.mkdir)(directory, { recursive: true });
    let array = false, ended = false, depth = 0, index = 0;
    let writer, itemPath = "", completed, failure;
    const prefix = (0, import_node_crypto2.randomUUID)();
    try {
      for await (const token2 of this.tokens(path)) {
        if (!array) {
          if (token2.name !== "startArray") throw new Error("The selected JSON page is not an array.");
          array = true;
          continue;
        }
        if (!writer && token2.name === "endArray") {
          ended = true;
          break;
        }
        if (!writer) {
          itemPath = (0, import_node_path2.join)(directory, `${prefix}-${index++}.json`);
          writer = stringifier();
          failure = void 0;
          completed = (0, import_promises3.pipeline)(writer, (0, import_node_fs.createWriteStream)(itemPath, { flags: "wx", mode: 384 })).catch((error) => {
            failure = error;
          });
        }
        if (["startObject", "startArray", "startString", "startNumber"].includes(token2.name)) depth++;
        if (["endObject", "endArray", "endString", "endNumber"].includes(token2.name)) depth--;
        if (failure) throw failure;
        if (!writer.write(token2)) await (0, import_node_events.once)(writer, "drain");
        if (depth === 0) {
          writer.end();
          await completed;
          if (failure) throw failure;
          writer = void 0;
          completed = void 0;
          yield new _JsonDocument(itemPath);
        }
      }
      if (!array || !ended || writer) throw new Error("The selected JSON array is missing or incomplete.");
    } finally {
      writer?.destroy();
      await completed;
    }
  }
};

// src/attachments.ts
var MAX_FILE_BYTES = 100 * 1024 * 1024;
var MAX_TOTAL_FILE_BYTES = 500 * 1024 * 1024;
var AttachmentInventory = class {
  async *discover(capture) {
    const store = new CaptureStore(capture.root);
    for await (const session of store.sessions(capture)) {
      const info = new JsonDocument(session.infoPath);
      const directory = String(await info.scalar(["location", "directory"]) ?? capture.target.directory);
      const pins = /* @__PURE__ */ new Set(), recent = /* @__PURE__ */ new Set();
      if (await info.kind(["metadata", "openchamber", "context_obligatory_messages"]) === "array") {
        for await (const pin of info.array(["metadata", "openchamber", "context_obligatory_messages"], (0, import_node_path3.join)(store.root, "asset-pin-records"))) {
          const id = await pin.scalar(["id"]) ?? await pin.scalar([]);
          if (typeof id === "string") pins.add(id);
        }
      }
      if (session.contextPath) for await (const item of new JsonDocument(session.contextPath).array([], (0, import_node_path3.join)(store.root, "asset-context-records"))) {
        const id = await item.scalar(["id"]);
        if (typeof id === "string") recent.add(id);
      }
      for await (const message of store.messages(session)) {
        for await (const reference of this.references(new JsonDocument(message.path), store)) {
          const path = localPath(reference, directory);
          if (!path) continue;
          const id = (0, import_node_crypto3.createHash)("sha256").update(path).digest("hex").slice(0, 24), sessionIndex = `asset-origins-${id}`;
          if (await store.claim("assets", path)) await store.append("discovered-assets", { ...await this.inspect(path, id), sessionIndex });
          if (await store.claim(`asset-origin-${id}`, session.id)) await store.append(sessionIndex, { sessionID: session.id });
          for (const reason of [pins.has(message.id) ? "pinned" : "", recent.has(message.id) || capture.profile === "resume" && !pins.has(message.id) ? "recent" : ""]) {
            if (reason && await store.claim(`asset-reasons-${id}`, reason)) await store.append(`asset-reasons-${id}`, reason);
          }
        }
      }
    }
    for await (const asset of store.records("discovered-assets")) {
      let count = 0;
      for await (const _ of store.records(asset.sessionIndex)) count++;
      const recommendations = [];
      for await (const reason of store.records(`asset-reasons-${asset.id}`)) recommendations.push(reason);
      yield { ...asset, sourceSessionCount: count, recommendations };
    }
  }
  async inspect(path, id) {
    const candidate = { id, path, name: (0, import_node_path3.basename)(path), sessions: [], size: 0, status: "available" };
    try {
      const stat3 = await (0, import_promises4.lstat)(path);
      candidate.size = stat3.size;
      if (!stat3.isFile() || stat3.isSymbolicLink() || !samePath(await (0, import_promises4.realpath)(path), path)) {
        candidate.status = "refused";
        candidate.reason = "Only regular files without symbolic-link ancestors may be collected.";
      } else if (stat3.size > MAX_FILE_BYTES) {
        candidate.status = "refused";
        candidate.reason = "File exceeds the 100 MiB per-file limit.";
      } else candidate.fingerprint = { dev: stat3.dev, ino: stat3.ino, size: stat3.size, mtimeMs: stat3.mtimeMs };
    } catch (error) {
      candidate.status = error.code === "ENOENT" ? "missing" : "refused";
      candidate.reason = candidate.status === "missing" ? "The referenced file is unavailable." : "The referenced file cannot be inspected.";
    }
    return candidate;
  }
  async *references(message, store) {
    if (await message.kind(["text"]) === "string") yield* this.inText(message.text(["text"]));
    if (await message.kind(["files"]) === "array") for await (const file of message.array(["files"], (0, import_node_path3.join)(store.root, "attachment-records"))) {
      for (const path of [["source", "path"], ["source", "uri"], ["uri"]]) yield* this.smallString(file, path);
    }
    if (await message.kind(["content"]) !== "array") return;
    for await (const content of message.array(["content"], (0, import_node_path3.join)(store.root, "attachment-parts"))) {
      if (await content.kind(["text"]) === "string") yield* this.inText(content.text(["text"]));
      const type = await content.scalar(["type"]);
      if (type === "file") yield* this.smallString(content, ["uri"]);
      if (type !== "tool" || await content.kind(["state", "content"]) !== "array") continue;
      const generated = /image|render|screenshot/i.test(String(await content.scalar(["name"]) ?? ""));
      for await (const output of content.array(["state", "content"], (0, import_node_path3.join)(store.root, "attachment-output"))) {
        const kind = await output.scalar(["type"]);
        if (kind === "file") yield* this.smallString(output, ["uri"]);
        if (kind !== "text" || await output.kind(["text"]) !== "string") continue;
        yield* this.inText(output.text(["text"]));
        if (!generated) continue;
        try {
          const document = await JsonDocument.capture(output.text(["text"]), (0, import_node_path3.join)(store.root, `generated-${(0, import_node_crypto3.randomUUID)()}.json`));
          yield* document.stringsWhere((path) => {
            const key = path.at(-1), parent = path.at(-2);
            return typeof key === "string" && ["path", "file_path", "filepath", "saved_path"].includes(key) || typeof key === "number" && typeof parent === "string" && ["paths", "images", "files"].includes(parent);
          });
        } catch (error) {
          if (typeof error.code === "string") throw error;
        }
      }
    }
  }
  async *smallString(document, path) {
    if (await document.kind(path) !== "string") return;
    let text = "", bytes = 0;
    for await (const chunk of document.text(path)) {
      bytes += Buffer.byteLength(chunk);
      if (bytes > 4096) return;
      text += chunk;
      if (/^(data|https?):/i.test(text)) return;
    }
    if (text) yield text;
  }
  /** Bounded reference recognition across text chunks; large prose/embedded data is never assembled. */
  async *inText(source) {
    let pending = "";
    const scan = function* (text, final3) {
      for (const match of text.matchAll(/!\[[^\]]*\]\((?:<([^>]+)>|([^\r\n)]+))\)/g)) yield (match[1] ?? match[2]).replace(/\s+["'][^"']*["']$/, "");
      const artifact = final3 ? /full output saved to\s+([^\r\n\]]+)(?:\r?\n|\]|$)/gi : /full output saved to\s+([^\r\n\]]+)(?:\r?\n|\])/gi;
      for (const match of text.matchAll(artifact)) yield match[1].trim();
    };
    for await (const chunk of source) {
      pending += chunk;
      yield* scan(pending, false);
      if (pending.length > 16384) pending = pending.slice(-8192);
    }
    yield* scan(pending, true);
  }
};
function samePath(a, b) {
  const normalized = (value) => process.platform === "win32" ? (0, import_node_path3.normalize)(value).toLowerCase() : (0, import_node_path3.normalize)(value);
  return normalized(a) === normalized(b);
}
function localPath(value, directory) {
  if (typeof value !== "string" || !value.trim() || value.includes("\0") || value.length > 4096) return;
  let path = value.trim();
  if (/^file:/i.test(path)) {
    try {
      const url = new URL(path);
      if (url.host && url.host !== "localhost") return;
      path = (0, import_node_url.fileURLToPath)(url);
    } catch {
      return;
    }
  } else if (/^[a-z][a-z0-9+.-]*:/i.test(path) && !/^[a-z]:[\\/]/i.test(path)) return;
  if (/^[\\/]{2}/.test(path)) return;
  return (0, import_node_path3.isAbsolute)(path) ? (0, import_node_path3.resolve)(path) : (0, import_node_path3.resolve)(directory, path);
}

// src/opencode.ts
var SessionSource = class _SessionSource {
  constructor(connection, signal) {
    this.connection = connection;
    this.signal = signal;
  }
  connection;
  signal;
  async capture(target, options2 = {}) {
    if (options2.signal !== this.signal) return new _SessionSource(this.connection, options2.signal).capture(target, options2);
    if (!/^ses_[a-zA-Z0-9_-]{1,200}$/.test(target.sessionID) || !target.directory) throw new Error("A valid session and directory are required.");
    const store = await CaptureStore.create();
    const snapshot = { root: store.root, target: { ...target }, startedAt: (/* @__PURE__ */ new Date()).toISOString(), endedAt: "", serverVersion: this.connection.version, sessionCount: 0, messageCount: 0, warnings: [], warningCount: 0 };
    const warn = async (text) => {
      await store.append("warnings", { text });
      snapshot.warningCount++;
      if (snapshot.warnings.length < 25) snapshot.warnings.push(text);
    };
    let active, activeRoot = [];
    try {
      active = await this.document("/api/session/active", {}, store);
      activeRoot = await this.bodyPath(active);
    } catch {
      await warn("Session activity could not be checked; the capture may be non-atomic.");
    }
    await store.append("queue", { id: target.sessionID });
    for await (const queued of store.records("queue")) {
      this.signal?.throwIfAborted();
      const id = queued.id;
      if (!await store.claim("sessions", id)) throw new Error("A cycle or duplicate descendant was found. Retry after the session tree settles.");
      const key = (0, import_node_crypto4.createHash)("sha256").update(id).digest("hex").slice(0, 24), path = `/api/session/${encodeURIComponent(id)}`;
      const before = await this.document(path, {}, store), root = await this.bodyPath(before);
      if (await before.scalar([...root, "id"]) !== id) throw new Error("The server returned a different session identity.");
      if (id === target.sessionID && !samePath(String(await before.scalar([...root, "location", "directory"]) ?? ""), target.directory)) throw new Error("The focused session directory does not match this OpenChamber server.");
      const infoPath = (0, import_node_path4.join)(store.root, `info-${key}.json`), messagesPath = (0, import_node_path4.join)(store.root, `messages-${key}.json`), messageIndex = `messages-${key}`;
      await this.write(before.json(root), infoPath);
      await store.initialize(messageIndex);
      let messageCount = 0;
      const pages = this.pages(`${path}/message`, { order: "asc", limit: "100" }, store, `message-${key}`);
      async function* messages() {
        yield "[";
        for await (const item of pages) {
          const messageID = await item.scalar(["id"]);
          await store.append(messageIndex, { path: item.path, id: messageID });
          if (messageCount++) yield ",";
          yield* (0, import_node_fs2.createReadStream)(item.path);
        }
        yield "]";
      }
      await this.write(messages(), messagesPath);
      for (const archived of options2.profile === "resume" ? [] : ["false", "true"]) {
        for await (const child of this.pages("/api/session", { parentID: id, archived, order: "asc", limit: "100" }, store, `child-${key}-${archived}`)) {
          const childID = await child.scalar(["id"]);
          if (typeof childID !== "string" || !/^ses_[a-zA-Z0-9_-]{1,200}$/.test(childID)) throw new Error("Invalid descendant session identity.");
          await store.append("queue", { id: childID });
        }
      }
      const after = await this.document(path, {}, store), afterRoot = await this.bodyPath(after);
      const changed = await before.scalar([...root, "time", "updated"]) !== await after.scalar([...afterRoot, "time", "updated"]);
      const activityKind = active ? await active.kind([...activeRoot, id]) : void 0;
      const activity = active ? activityKind === "object" || activityKind === "array" || Boolean(await active.scalar([...activeRoot, id])) : null;
      if (activity || changed) await warn(`${id} was active or changed during capture; this is a non-atomic snapshot.`);
      const record = { id, title: String(await before.scalar([...root, "title"]) ?? id), infoPath, messagesPath, messageIndex, messageCount, active: activity, changed, log: { available: false } };
      const parentID = await before.scalar([...root, "parentID"]);
      if (typeof parentID === "string") record.parentID = parentID;
      await store.append("core-sessions", record);
      snapshot.sessionCount++;
      snapshot.messageCount += messageCount;
    }
    for await (const record of store.records("core-sessions")) {
      this.signal?.throwIfAborted();
      for (const [suffix, field] of [["context", "contextPath"], ["instructions", "instructionsPath"]]) {
        try {
          const endpoint = suffix === "context" ? `/api/session/${record.id}/context` : `/api/experimental/session/${record.id}/instructions/entries`;
          const document = await this.document(endpoint, {}, store), path = (0, import_node_path4.join)(store.root, `${suffix}-${record.id}.json`);
          await this.write(document.json(await this.bodyPath(document)), path);
          record[field] = path;
        } catch {
          this.signal?.throwIfAborted();
          if (options2.profile === "resume") throw new Error("Resume snapshots require the approved bundled OpenCode plugin to read effective context and instructions.");
          await warn(`${suffix === "context" ? "Effective context" : "Session instructions"} unavailable for ${record.id}; portable context coverage is incomplete.`);
        }
      }
      if (options2.profile === "resume") {
        record.log = { available: false, error: "Historical logs are intentionally excluded from resume snapshots." };
      } else try {
        const log = await this.log(record.id, store);
        record.eventsPath = log.path;
        record.log = { available: true, watermark: log.watermark };
      } catch (error) {
        record.log = { available: false, error: error instanceof Error ? error.message : "Log unavailable." };
        await warn(`Durable log unavailable for ${record.id}: ${record.log.error}`);
      }
      await store.append("sessions", record);
    }
    snapshot.endedAt = (/* @__PURE__ */ new Date()).toISOString();
    return snapshot;
  }
  async bodyPath(document) {
    return ["object", "array"].includes(await document.kind(["data"]) ?? "") ? ["data"] : [];
  }
  async *pages(path, query, store, namespace) {
    let cursor;
    do {
      const pageQuery = { ...query, ...cursor ? { cursor } : {} };
      if (cursor) delete pageQuery.order;
      const page = await this.document(path, pageQuery, store);
      for await (const item of page.array(["data"], (0, import_node_path4.join)(store.root, "items"))) {
        const identity = await item.scalar(["id"]);
        if (typeof identity !== "string" || !identity || !await store.claim(namespace, identity)) throw new Error(`Missing or duplicate identity in ${path}.`);
        yield item;
      }
      const cursorKind = await page.kind(["cursor"]), nextKind = await page.kind(["cursor", "next"]);
      if (cursorKind && cursorKind !== "object" && cursorKind !== "null" || nextKind && nextKind !== "string" && nextKind !== "null") throw new Error(`Invalid cursor in ${path}.`);
      const next2 = await page.scalar(["cursor", "next"]);
      cursor = next2 === void 0 || next2 === null ? void 0 : typeof next2 === "string" ? next2 : (() => {
        throw new Error(`Invalid cursor in ${path}.`);
      })();
      if (cursor && !await store.claim(`cursor-${namespace}`, cursor)) throw new Error(`Repeated cursor in ${path}.`);
    } while (cursor);
  }
  async response(path, query = {}) {
    const base = new URL(this.connection.url);
    if (!["127.0.0.1", "[::1]", "localhost"].includes(base.hostname) || base.protocol !== "http:" || base.username || base.password) throw new Error("Only a verified local OpenChamber proxy is supported.");
    const url = new URL(path, base);
    for (const [key, value] of Object.entries(query)) url.searchParams.set(key, value);
    const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 15e3);
    try {
      const response = await fetch(url, { redirect: "error", signal: this.signal ? AbortSignal.any([controller.signal, this.signal]) : controller.signal, cache: "no-store", ...this.connection.token ? { headers: { Authorization: `Bearer ${this.connection.token}` } } : {} });
      if (!response.ok) {
        await response.body?.cancel();
        throw new Error(`OpenCode GET ${path} returned ${response.status}.`);
      }
      return response;
    } finally {
      clearTimeout(timer);
    }
  }
  /** Protect an idle connection, not total capture size or elapsed export time. Disk backpressure does not consume this idle budget. */
  async *body(response) {
    if (!response.body) throw new Error("The server returned an empty response body.");
    const reader = response.body.getReader();
    try {
      for (; ; ) {
        let timer;
        const idle = new Promise((_resolve, reject) => {
          timer = setTimeout(() => reject(new Error("The OpenCode response stopped making progress.")), 3e4);
        });
        try {
          const { done, value } = await Promise.race([reader.read(), idle]);
          if (done) return;
          yield value;
        } finally {
          clearTimeout(timer);
        }
      }
    } finally {
      await reader.cancel().catch(() => {
      });
      reader.releaseLock();
    }
  }
  async document(path, query, store) {
    const response = await this.response(path, query);
    return JsonDocument.capture(this.body(response), (0, import_node_path4.join)(store.root, `response-${(0, import_node_crypto4.randomUUID)()}.json`));
  }
  async write(source, path) {
    await (0, import_promises5.pipeline)(import_node_stream4.Readable.from(source, { objectMode: false }), (0, import_node_fs2.createWriteStream)(path, { flags: "wx", mode: 384 }));
  }
  async log(id, store) {
    const response = await this.response(`/api/experimental/session/${encodeURIComponent(id)}/log`, { follow: "false" });
    const path = (0, import_node_path4.join)(store.root, `events-${(0, import_node_crypto4.randomUUID)()}.jsonl`);
    let synced = false, watermark;
    const frames = this.frames(this.body(response), store);
    async function* events() {
      for await (const document of frames) {
        const type = await document.scalar(["type"]);
        if (typeof type !== "string") throw new Error("Unsupported durable log event envelope.");
        yield* (0, import_node_fs2.createReadStream)(document.path);
        yield "\n";
        if (type === "log.synced") {
          const seq = await document.scalar(["seq"]);
          if (typeof seq !== "number" || !Number.isSafeInteger(seq) || seq < 0) throw new Error("The durable log returned an invalid watermark.");
          synced = true;
          watermark = seq;
          break;
        }
      }
    }
    await this.write(events(), path);
    if (!synced) throw new Error("The durable log ended without a captured watermark.");
    return { path, watermark };
  }
  /** SSE data lines may themselves be enormous. Only the field prefix is buffered; event JSON is normalized on disk. */
  async *frames(source, store) {
    let prefix = "", state = "prefix", skipSpace = false, hasData = false;
    let writer, rawPath = "", done, failure;
    const decoder = new TextDecoder();
    const append = async (text) => {
      if (text && writer && !writer.write(text)) await (0, import_node_events2.once)(writer, "drain");
    };
    const finish = async () => {
      if (!writer) return void 0;
      writer.end();
      await done;
      if (failure) throw failure;
      writer = void 0;
      done = void 0;
      hasData = false;
      const raw = new JsonDocument(rawPath), normalizedPath = (0, import_node_path4.join)(store.root, `event-${(0, import_node_crypto4.randomUUID)()}.json`);
      return JsonDocument.capture(raw.json(), normalizedPath);
    };
    try {
      for await (const bytes of source) {
        const text = decoder.decode(bytes, { stream: true });
        let offset = 0;
        while (offset < text.length) {
          const newline = text.indexOf("\n", offset), endLine = newline !== -1;
          let fragment = text.slice(offset, endLine ? newline : text.length);
          offset = endLine ? newline + 1 : text.length;
          if (state === "prefix") {
            const colon = fragment.indexOf(":");
            if (colon !== -1) {
              prefix += fragment.slice(0, colon);
              fragment = fragment.slice(colon + 1);
              state = prefix === "data" ? "data" : "ignore";
              prefix = "";
              if (state === "data") {
                if (!writer) {
                  rawPath = (0, import_node_path4.join)(store.root, `event-raw-${(0, import_node_crypto4.randomUUID)()}.json`);
                  writer = (0, import_node_fs2.createWriteStream)(rawPath, { flags: "wx", mode: 384 });
                  failure = void 0;
                  done = (0, import_promises5.finished)(writer, { cleanup: true }).catch((error) => {
                    failure = error;
                  });
                }
                if (hasData) await append("\n");
                hasData = true;
                skipSpace = true;
              }
            } else {
              prefix += fragment;
              if (prefix.length > 8) {
                state = "ignore";
                prefix = "";
              }
              fragment = "";
            }
          }
          if (state === "data") {
            if (skipSpace && fragment) {
              if (fragment.startsWith(" ")) fragment = fragment.slice(1);
              skipSpace = false;
            }
            await append(fragment);
          }
          if (endLine) {
            if (state === "prefix" && !prefix.trim() && hasData) {
              const event = await finish();
              if (event) yield event;
            }
            state = "prefix";
            prefix = "";
            skipSpace = false;
          }
          if (failure) throw failure;
        }
      }
      if (hasData) {
        const event = await finish();
        if (event) yield event;
      }
    } finally {
      writer?.destroy();
      await done;
    }
  }
};

// src/service.ts
var import_node_crypto13 = require("node:crypto");
var import_node_http = require("node:http");

// src/exporter.ts
var import_node_crypto8 = require("node:crypto");
var import_node_fs6 = require("node:fs");
var import_promises10 = require("node:fs/promises");
var import_node_fs7 = require("node:fs");
var import_promises11 = require("node:stream/promises");
var import_node_os3 = require("node:os");
var import_node_path10 = require("node:path");

// src/archive.ts
var import_node_crypto5 = require("node:crypto");
var import_node_fs3 = require("node:fs");
var import_promises6 = require("node:fs/promises");
var import_node_path6 = require("node:path");
var import_node_stream5 = require("node:stream");
var import_promises7 = require("node:stream/promises");
var import_yazl = __toESM(require_yazl(), 1);

// src/markdown.ts
var import_node_path5 = require("node:path");
var label = (value) => String(value ?? "").replace(/[\r\n`<>]/g, " ");
var MarkdownRenderer = class {
  async *render(capture) {
    const store = new CaptureStore(capture.root);
    yield `# ${label(capture.target.title ?? capture.target.sessionID)}

`;
    yield `Captured ${capture.startedAt}\u2013${capture.endedAt}. OpenCode ${label(capture.serverVersion)}.

`;
    yield "> Private archive: messages and tool output may contain secrets. Reasoning means only content exposed and retained by the host.\n\n";
    for await (const warning of store.records("warnings")) yield `> Warning: ${label(warning.text)}

`;
    for await (const session of store.sessions(capture)) {
      yield `## ${session.id === capture.target.sessionID ? "Session" : "Sub-session"}: ${label(session.title)}

ID: ${label(session.id)}

`;
      if (session.active || session.changed) yield "> Non-atomic snapshot: this session was active or changed during capture.\n\n";
      for await (const message of store.messages(session)) yield* this.message(new JsonDocument(message.path), message.id, capture.root);
    }
  }
  async *message(document, id, root) {
    const type = String(await document.scalar(["type"]) ?? "unknown");
    yield `### ${label(type)} \xB7 ${label(id)}

`;
    if (type === "assistant") {
      if (!await document.scalar(["time", "completed"])) yield "**Unfinished \u2014 retained as exposed by the message API.**\n\n";
      if (await document.kind(["content"]) === "array") for await (const content of document.array(["content"], (0, import_node_path5.join)(root, "markdown-parts"))) {
        const kind = await content.scalar(["type"]);
        if (kind === "text") {
          yield* content.text(["text"]);
          yield "\n\n";
        } else if (kind === "reasoning") {
          yield "#### Reasoning\n\n";
          yield* this.fence(() => content.text(["text"]), "text");
        } else if (kind === "tool") {
          yield `#### Tool: ${label(await content.scalar(["name"]))} \xB7 ${label(await content.scalar(["id"]))}

`;
          yield `Status: ${label(await content.scalar(["state", "status"]) ?? "unknown")}

**Arguments**

`;
          if (await content.kind(["state", "input"])) yield* this.fence(() => content.json(["state", "input"]));
          else yield "```json\nnull\n```\n\n";
          if (await content.kind(["state", "content"]) === "array") for await (const output of content.array(["state", "content"], (0, import_node_path5.join)(root, "markdown-outputs"))) {
            if (await output.scalar(["type"]) === "text") yield* this.fence(() => output.text(["text"]), "text");
            else yield* this.fence(() => output.json());
          }
          yield* this.optional(content, ["state", "error"], "**Error**");
          yield* this.optional(content, ["state", "metadata"], "**Tool metadata**");
        } else {
          yield "#### Unrecognized content\n\n";
          yield* this.fence(() => content.json());
        }
      }
      yield* this.optional(document, ["error"], "**Message error**");
    } else if (["user", "system", "synthetic", "skill"].includes(type)) {
      const name = await document.scalar(["name"]);
      if (name) yield `Name: ${label(name)}

`;
      if (await document.kind(["text"]) === "string") yield* document.text(["text"]);
      yield "\n\n";
      if (await document.kind(["files"]) === "array") {
        yield "**Attachment records**\n\n";
        yield* this.fence(() => document.json(["files"]));
      }
    } else yield* this.fence(() => document.json());
  }
  async *optional(document, path, heading) {
    const kind = await document.kind(path);
    if (!kind || kind === "null") return;
    yield `${heading}

`;
    yield* this.fence(() => document.json(path));
  }
  async *fence(source, language = "json") {
    let width = 3, carried = 0;
    for await (const text of source()) {
      if (!text) continue;
      for (const match of text.matchAll(/`+/g)) {
        const run = match.index === 0 ? carried + match[0].length : match[0].length;
        width = Math.max(width, run + 1);
        carried = match.index + match[0].length === text.length ? run : 0;
      }
      if (!text.endsWith("`")) carried = 0;
    }
    yield* this.marker(width);
    yield `${language}
`;
    yield* source();
    yield "\n";
    yield* this.marker(width);
    yield "\n\n";
  }
  async *marker(width) {
    const block = "`".repeat(Math.min(width, 64 * 1024));
    for (let remaining = width; remaining > 0; remaining -= block.length) yield remaining >= block.length ? block : block.slice(0, remaining);
  }
};

// src/constants.ts
var RELEASE_VERSION = "0.4.0";

// src/archive.ts
var ArchiveWriter = class {
  async write(capture, assets, options2, directory) {
    options2.signal?.throwIfAborted();
    await (0, import_promises6.mkdir)(directory, { recursive: true });
    const staging = await (0, import_promises6.mkdtemp)((0, import_node_path6.join)(directory, ".session-export-")), archive = new CaptureStore(staging), evidence = new CaptureStore(capture.root);
    const warnings = [...capture.warnings];
    let warningCount = capture.warningCount;
    const warn = async (text) => {
      await archive.append("warnings", { text });
      warningCount++;
      if (warnings.length < 25) warnings.push(text);
    };
    const selected = new Set(options2.includeFiles ? options2.selectedAssetIDs ?? [] : []);
    let selectedBytes = 0;
    for await (const asset of assets) {
      options2.signal?.throwIfAborted();
      const decision = { id: asset.id, path: asset.path, size: asset.size, selected: selected.has(asset.id), availability: asset.status, reason: asset.reason, sessionIndex: asset.sessionIndex, sessions: asset.sessions, status: selected.has(asset.id) ? "pending" : asset.status === "available" ? "not-selected" : "unavailable" };
      if (asset.status !== "available" && !selected.has(asset.id)) await warn(`Unavailable ${asset.name}: ${asset.reason ?? asset.status}`);
      if (selected.has(asset.id)) {
        try {
          if (asset.status !== "available" || !asset.fingerprint) throw new Error(asset.reason ?? "The referenced file is unavailable.");
          if (selectedBytes + asset.size > MAX_TOTAL_FILE_BYTES) throw new Error("Selected files exceed the 500 MiB aggregate limit.");
          const entry = await this.asset(asset, staging, options2.signal);
          await archive.append("entries", entry);
          selectedBytes += entry.size;
          decision.status = "included";
          decision.archivePath = entry.path;
        } catch (error) {
          options2.signal?.throwIfAborted();
          if (["ENOSPC", "EDQUOT"].includes(error.code ?? "")) throw error;
          decision.status = "omitted";
          decision.reason = error instanceof Error ? error.message : "File collection failed.";
          await warn(`Omitted ${asset.name}: ${decision.reason}`);
        }
      }
      await archive.append("decisions", decision);
    }
    await this.entry("conversation.md", this.markdown(capture, archive), archive, options2.signal);
    for await (const session of evidence.sessions(capture)) {
      options2.signal?.throwIfAborted();
      const name = session.id === capture.target.sessionID ? "session.json" : `subsessions/${session.id}.json`;
      async function* projected() {
        yield '{"info":';
        yield* (0, import_node_fs3.createReadStream)(session.infoPath);
        yield ',"messages":';
        yield* (0, import_node_fs3.createReadStream)(session.messagesPath);
        yield "}\n";
      }
      await this.entry(name, projected(), archive, options2.signal);
      if (session.log.available && session.eventsPath) await this.entry(`events/${session.id}.jsonl`, (0, import_node_fs3.createReadStream)(session.eventsPath), archive, options2.signal);
      if (session.instructionsPath) await this.entry(`context/${session.id}/instructions.json`, (0, import_node_fs3.createReadStream)(session.instructionsPath), archive, options2.signal);
      if (session.contextPath && capture.profile !== "resume") await this.entry(`context/${session.id}/effective.json`, (0, import_node_fs3.createReadStream)(session.contextPath), archive, options2.signal);
    }
    for (const extra of capture.extras ?? []) await this.entry(extra.name, (0, import_node_fs3.createReadStream)(extra.path), archive, options2.signal);
    await this.entry("manifest.json", this.manifest(capture, archive, Boolean(options2.includeFiles)), archive, options2.signal);
    const zip = new import_yazl.default.ZipFile(), partial = (0, import_node_path6.join)(staging, "archive.zip.partial");
    const output = zip.outputStream;
    zip.on("error", (error) => output.destroy(error));
    let failure;
    const completed = (0, import_promises7.pipeline)(output, (0, import_node_fs3.createWriteStream)(partial, { flags: "wx", mode: 384 }), { signal: options2.signal }).catch((error) => {
      failure = error;
    });
    try {
      for await (const entry of archive.records("entries", { required: true })) {
        options2.signal?.throwIfAborted();
        zip.addFile(entry.source, entry.path, { mode: 33152 });
      }
      zip.end();
      await completed;
      if (failure) throw failure;
    } catch (error) {
      output.destroy();
      await completed;
      throw error;
    }
    const slug = String(capture.target.title ?? "session").normalize("NFKC").replace(/[^\p{L}\p{N}_-]/gu, "-").slice(0, 60) || "session";
    const destination = options2.outputFile ?? (0, import_node_path6.join)(directory, `${slug}-${capture.target.sessionID}-${(0, import_node_crypto5.randomUUID)()}.zip`);
    options2.signal?.throwIfAborted();
    await (0, import_promises6.link)(partial, destination);
    return { path: destination, size: (await (0, import_promises6.stat)(destination)).size, warnings, warningCount };
  }
  async entry(name, content, archive, signal) {
    const source = (0, import_node_path6.join)(archive.root, `entry-${(0, import_node_crypto5.randomUUID)()}`), digest = (0, import_node_crypto5.createHash)("sha256");
    let size = 0;
    const hash = new import_node_stream5.Transform({ transform(chunk, _encoding, callback) {
      size += chunk.length;
      digest.update(chunk);
      callback(null, chunk);
    } });
    await (0, import_promises7.pipeline)(import_node_stream5.Readable.from(content, { objectMode: false }), hash, (0, import_node_fs3.createWriteStream)(source, { flags: "wx", mode: 384 }), { signal });
    await archive.append("entries", { path: name, size, sha256: digest.digest("hex"), source });
  }
  async asset(asset, staging, signal) {
    const metadata = await (0, import_promises6.lstat)(asset.path);
    if (metadata.isSymbolicLink() || !metadata.isFile() || !samePath(await (0, import_promises6.realpath)(asset.path), asset.path)) throw new Error("The referenced file changed or is a symbolic link.");
    const file = await (0, import_promises6.open)(asset.path, "r");
    try {
      const before = await file.stat();
      const matches = (value) => Object.entries(asset.fingerprint).every(([key, expected2]) => value[key] === expected2);
      if (!matches(before)) throw new Error("The file changed after its preview.");
      const source = (0, import_node_path6.join)(staging, `asset-${asset.id}`), digest = (0, import_node_crypto5.createHash)("sha256");
      let copied = 0;
      const hash = new import_node_stream5.Transform({ transform(chunk, _encoding, callback) {
        copied += chunk.length;
        if (copied > asset.size) return callback(new Error("The file grew during collection."));
        digest.update(chunk);
        callback(null, chunk);
      } });
      await (0, import_promises7.pipeline)(file.createReadStream({ autoClose: false }), hash, (0, import_node_fs3.createWriteStream)(source, { flags: "wx", mode: 384 }), { signal });
      if (!matches(await file.stat()) || copied !== asset.size) throw new Error("The file changed during collection.");
      const name = asset.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100) || "attachment";
      return { path: `assets/${asset.id}-${name}`, size: copied, sha256: digest.digest("hex"), source };
    } finally {
      await file.close();
    }
  }
  async *markdown(capture, archive) {
    yield* new MarkdownRenderer().render(capture);
    let first = true;
    for await (const item of archive.records("decisions")) {
      if (first) {
        yield "\n## Referenced local files\n\n";
        first = false;
      }
      yield item.archivePath ? `- [${item.id}](${item.archivePath}) \u2014 ${item.size} bytes
` : `- ${item.id}: ${item.status}${item.reason ? ` \u2014 ${item.reason}` : ""}
`;
    }
    for await (const warning of archive.records("warnings")) yield `
> Asset warning: ${warning.text.replace(/[\r\n<>]/g, " ")}
`;
  }
  async *manifest(capture, archive, includeFiles) {
    const evidence = new CaptureStore(capture.root);
    let stable = true;
    for await (const session of evidence.sessions(capture)) if (session.active !== false || session.changed) stable = false;
    yield JSON.stringify({ schema: "openchamber-session-export/2", version: RELEASE_VERSION, profile: capture.profile ?? "complete", retainHistory: Boolean(capture.retainHistory), target: capture.target, startedAt: capture.startedAt, endedAt: capture.endedAt, serverVersion: capture.serverVersion, source: "OpenCode v2 projected message pages and optional durable log; not the native settled-only transfer export" }).slice(0, -1);
    yield `,"dependencies":${JSON.stringify(["The destination must supply its own repository/worktree, tools, model/provider, skills, MCP services and credentials.", "Only captured session instructions and pins are portable; external notes/plans and global configuration are not automatically copied.", "Restored files live in a new directory. Historical paths in prose and tool arguments are not execution-time path mappings."])}`;
    yield `,"coverage":{"hiddenReasoning":"not available","providerWireTraffic":"not captured","atomic":false,"observedStable":${stable},"logs":[`;
    let comma = false;
    for await (const session of evidence.sessions(capture)) {
      if (comma) yield ",";
      comma = true;
      yield JSON.stringify({ sessionID: session.id, ...session.log });
    }
    yield ']},"sessions":[';
    comma = false;
    for await (const session of evidence.sessions(capture)) {
      if (comma) yield ",";
      comma = true;
      yield JSON.stringify({ id: session.id, parentID: session.parentID, messages: session.messageCount, active: session.active, changed: session.changed });
    }
    yield `],"assets":{"collectionEnabled":${includeFiles},"inspected":${includeFiles},"decisions":[`;
    comma = false;
    for await (const decision of archive.records("decisions")) {
      if (comma) yield ",";
      comma = true;
      const { sessionIndex, sessions, ...visible } = decision;
      yield JSON.stringify(visible).slice(0, -1);
      yield ',"sessions":[';
      let originComma = false;
      if (sessionIndex) for await (const origin of evidence.records(sessionIndex)) {
        if (originComma) yield ",";
        originComma = true;
        yield JSON.stringify(origin.sessionID);
      }
      else for (const id of sessions ?? []) {
        if (originComma) yield ",";
        originComma = true;
        yield JSON.stringify(id);
      }
      yield "]}";
    }
    yield ']},"warnings":[';
    comma = false;
    for (const store of [evidence, archive]) for await (const warning of store.records("warnings")) {
      if (comma) yield ",";
      comma = true;
      yield JSON.stringify(warning.text);
    }
    yield '],"checksumScope":"All entries except manifest.json itself; SHA-256 of uncompressed bytes.","entries":[';
    comma = false;
    for await (const item of archive.records("entries")) {
      if (comma) yield ",";
      comma = true;
      const { source: _source, ...entry } = item;
      yield JSON.stringify(entry);
    }
    yield "]}\n";
  }
};

// src/save-dialog.ts
var import_node_child_process = require("node:child_process");
var import_node_fs4 = require("node:fs");
var import_node_path7 = require("node:path");
var SCRIPT = `
$ErrorActionPreference = 'Stop'
[Console]::InputEncoding = New-Object System.Text.UTF8Encoding($false)
[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
$inputData = [Console]::In.ReadToEnd() | ConvertFrom-Json
Add-Type -AssemblyName System.Windows.Forms
$dialog = New-Object System.Windows.Forms.SaveFileDialog
try {
  $dialog.Title = 'Save complete session archive'
  $dialog.Filter = 'ZIP archives (*.zip)|*.zip'
  $dialog.DefaultExt = 'zip'
  $dialog.AddExtension = $true
  $dialog.CheckPathExists = $true
  $dialog.OverwritePrompt = $true
  $dialog.RestoreDirectory = $true
  $dialog.FileName = [string]$inputData.defaultName
  if ($dialog.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {
    @{ state = 'selected'; path = $dialog.FileName } | ConvertTo-Json -Compress
  } else { @{ state = 'cancelled' } | ConvertTo-Json -Compress }
} finally { $dialog.Dispose() }
`;
function validateOutputFile(path) {
  if (typeof path !== "string" || path.length > 4096 || path.includes("\0") || !(0, import_node_path7.isAbsolute)(path) || /^[\\/]{2}/.test(path) || !/\.zip$/i.test(path)) throw new Error("Choose an absolute local ZIP path; network and device paths are not supported.");
  if ((0, import_node_fs4.existsSync)(path)) throw new Error("The chosen archive already exists. Choose a new filename; existing files are never overwritten.");
}
var WindowsSaveDialog = class {
  async choose(defaultName, signal) {
    if (signal.aborted) return { state: "cancelled" };
    if (process.platform !== "win32" || !/^[^\\/\0]{1,240}\.zip$/i.test(defaultName)) return { state: "unavailable", error: "A local Windows desktop is required for Save As." };
    const executable = (0, import_node_path7.join)(process.env.SystemRoot ?? "C:\\Windows", "System32", "WindowsPowerShell", "v1.0", "powershell.exe");
    return new Promise((resolve4) => {
      const child = (0, import_node_child_process.spawn)(executable, ["-NoProfile", "-NonInteractive", "-STA", "-EncodedCommand", Buffer.from(SCRIPT, "utf16le").toString("base64")], { shell: false, windowsHide: true, stdio: ["pipe", "pipe", "pipe"] });
      let output = "", bytes = 0, overflow = false, settled = false;
      const cancel = () => {
        child.kill();
        finish({ state: "cancelled" });
      };
      const finish = (result) => {
        if (settled) return;
        settled = true;
        signal.removeEventListener("abort", cancel);
        resolve4(result);
      };
      signal.addEventListener("abort", cancel, { once: true });
      if (signal.aborted) cancel();
      child.stdout.setEncoding("utf8");
      child.stdout.on("data", (chunk) => {
        bytes += Buffer.byteLength(chunk);
        if (bytes > 32768) {
          overflow = true;
          child.kill();
        } else output += chunk;
      });
      child.stderr.resume();
      child.stdin.on("error", () => {
      });
      child.once("error", () => finish({ state: "unavailable", error: "The Windows Save As dialog could not be started. Use the manual output directory." }));
      child.once("close", (code) => {
        if (signal.aborted) return finish({ state: "cancelled" });
        try {
          if (code !== 0 || overflow) throw new Error();
          const result = JSON.parse(output.replace(/^\uFEFF/, "").trim());
          if (result.state === "cancelled") return finish({ state: "cancelled" });
          if (result.state !== "selected") throw new Error();
          validateOutputFile(result.path);
          finish({ state: "selected", path: result.path });
        } catch (error) {
          finish({ state: "unavailable", error: error instanceof Error && /already exists/.test(error.message) ? error.message : "The Windows Save As dialog did not return a usable destination. Use the manual output directory." });
        }
      });
      child.stdin.end(JSON.stringify({ defaultName }));
    });
  }
};

// src/profiles.ts
var import_node_fs5 = require("node:fs");
var import_node_crypto7 = require("node:crypto");
var import_node_path9 = require("node:path");
var import_node_stream6 = require("node:stream");
var import_promises9 = require("node:stream/promises");
init_private_channel();
async function write2(path, content) {
  await (0, import_promises9.pipeline)(import_node_stream6.Readable.from(content), (0, import_node_fs5.createWriteStream)(path, { flags: "wx", mode: 384 }));
}
function pinnedMessageIDs(info) {
  const pins = info.metadata?.openchamber?.context_obligatory_messages;
  const result = /* @__PURE__ */ new Set();
  const visit = (value, depth = 0) => {
    if (depth > 8) throw new Error("Pinned-message metadata exceeds its supported depth.");
    if (typeof value === "string" && value.startsWith("msg_")) result.add(value);
    else if (Array.isArray(value)) value.forEach((item) => visit(item, depth + 1));
    else if (value && typeof value === "object") for (const [key, item] of Object.entries(value)) {
      if (key.startsWith("msg_")) result.add(key);
      visit(item, depth + 1);
    }
  };
  visit(pins);
  return result;
}
async function applyProfile(snapshot, options2 = {}) {
  if (options2.profile !== "resume") return { ...snapshot, profile: "complete" };
  const source = new CaptureStore(snapshot.root), store = await CaptureStore.create();
  const original = (await source.page("sessions")).records.find((record2) => record2.id === snapshot.target.sessionID);
  if (!original?.contextPath || !original.instructionsPath) throw new Error("The effective context and session instructions are required for a resume snapshot.");
  const originalRecord = original, originalInstructions = original.instructionsPath;
  const record = { ...original, messagesPath: (0, import_node_path9.join)(store.root, "messages.json"), messageIndex: "resume-messages", messageCount: 0, eventsPath: void 0, log: { available: false, error: "Historical events are intentionally excluded from resume snapshots." } };
  await store.initialize("context-messages");
  const context = new JsonDocument(original.contextPath), pins = pinnedMessageIDs(await readJsonFile(original.infoPath, 2 * 1024 * 1024));
  const contextIDs = /* @__PURE__ */ new Set(), warnings = [...snapshot.warnings], pinFiles = [];
  let compaction = false;
  for await (const message of context.array([], (0, import_node_path9.join)(store.root, "context"))) {
    options2.signal?.throwIfAborted();
    const id = String(await message.scalar(["id"])), type = await message.scalar(["type"]);
    if (!/^msg_[a-zA-Z0-9_-]+$/.test(id) || contextIDs.has(id)) throw new Error("The effective context contains a missing or duplicate message identity.");
    contextIDs.add(id);
    let path = message.path;
    if (type === "compaction" && await message.scalar(["status"]) === "completed") {
      compaction = true;
      path = (0, import_node_path9.join)(store.root, `compaction-${(0, import_node_crypto7.randomUUID)()}.json`);
      await write2(path, message.jsonExcluding([["metadata", "keepID"]]));
      if (await message.kind(["native", "messages"])) warnings.push("This snapshot includes a provider-native checkpoint. Resume with the original provider/model; a different model may require earlier history.");
    }
    await store.append("context-messages", { id, path });
    record.messageCount++;
  }
  let lastContextID;
  for await (const message of source.messages(original)) {
    options2.signal?.throwIfAborted();
    if (pins.has(message.id)) pinFiles.push(message);
    if (contextIDs.has(message.id)) lastContextID = message.id;
  }
  if (contextIDs.size && !lastContextID) throw new Error("Effective context does not match the captured transcript. Capture again after the session settles.");
  if (pinFiles.length !== pins.size) throw new Error("Some pinned messages could not be captured; a faithful resume snapshot cannot be prepared.");
  const olderPins = pinFiles.filter((pin) => !contextIDs.has(pin.id));
  await store.initialize(record.messageIndex);
  for (const pin of pinFiles) if (!contextIDs.has(pin.id)) {
    await store.append(record.messageIndex, pin);
    record.messageCount++;
  }
  for await (const item of store.records("context-messages")) await store.append(record.messageIndex, item);
  let trailing = lastContextID === void 0;
  for await (const message of source.messages(original)) {
    options2.signal?.throwIfAborted();
    if (trailing && !contextIDs.has(message.id) && !pins.has(message.id)) {
      await store.append(record.messageIndex, message);
      contextIDs.add(message.id);
      record.messageCount++;
    }
    if (message.id === lastContextID) trailing = true;
  }
  async function* messages() {
    yield "[";
    let comma = false;
    for await (const message of store.messages(record)) {
      if (comma) yield ",";
      comma = true;
      yield* (0, import_node_fs5.createReadStream)(message.path);
    }
    yield "]";
  }
  await write2(record.messagesPath, messages());
  const instructions = (0, import_node_path9.join)(store.root, "instructions.json");
  async function* entries() {
    yield "[";
    let comma = false;
    for await (const item of new JsonDocument(originalInstructions).array([], (0, import_node_path9.join)(store.root, "instruction-items"))) {
      if (comma) yield ",";
      comma = true;
      yield* item.json();
    }
    for (const pin of olderPins) {
      if (comma) yield ",";
      comma = true;
      const key = `session-export-pinned-${(0, import_node_crypto7.createHash)("sha256").update(pin.id).digest("hex").slice(0, 32)}`;
      yield `{"key":${JSON.stringify(key)},"value":"Pinned source message:\\n`;
      for await (const text of messageText(new JsonDocument(pin.path))) yield JSON.stringify(text).slice(1, -1);
      yield '"}';
    }
    yield "]";
  }
  await write2(instructions, entries());
  record.instructionsPath = instructions;
  await store.append("sessions", record);
  if (!compaction) warnings.push("No reusable compaction is present; the snapshot retains the available effective context and may not be much smaller.");
  const extras = [];
  if (options2.retainHistory) {
    const history = (0, import_node_path9.join)(store.root, "history.md");
    async function* olderText() {
      yield "# Earlier conversation \u2014 reference only\n\nThis document is not restored into active context.\n\n";
      for await (const item of source.messages(originalRecord)) {
        if (contextIDs.has(item.id) || pins.has(item.id)) continue;
        const document = new JsonDocument(item.path), type = await document.scalar(["type"]);
        if (!["user", "assistant"].includes(String(type))) continue;
        yield `## ${type}

`;
        yield* messageText(document);
        yield "\n\n";
      }
    }
    await write2(history, olderText());
    extras.push({ name: "history/conversation.md", path: history });
  }
  for await (const warning of source.records("warnings")) await store.append("warnings", warning);
  for (const text of warnings.slice(snapshot.warnings.length)) await store.append("warnings", { text });
  return { ...snapshot, root: store.root, profile: "resume", retainHistory: Boolean(options2.retainHistory), extras, sessionCount: 1, messageCount: record.messageCount, warnings: warnings.slice(0, 25), warningCount: snapshot.warningCount + warnings.length - snapshot.warnings.length };
}
async function* messageText(document) {
  if (await document.kind(["text"]) === "string") yield* document.text(["text"]);
  else if (await document.kind(["content"]) === "array") {
    for await (const item of document.array(["content"], (0, import_node_path9.join)((0, import_node_path9.dirname)(document.path), "text-items"))) if (await item.scalar(["type"]) === "text") {
      yield* item.text(["text"]);
      yield "\n";
    }
  }
}

// src/exporter.ts
var Exporter = class {
  constructor(source, inventorySource = new AttachmentInventory()) {
    this.source = source;
    this.inventorySource = inventorySource;
  }
  source;
  inventorySource;
  prepared = /* @__PURE__ */ new Map();
  jobs = /* @__PURE__ */ new Map();
  controllers = /* @__PURE__ */ new Map();
  async prepare(target, inspectFiles = false, options2 = {}) {
    const capture = await applyProfile(await this.source.capture({ ...target }, options2), options2), store = new CaptureStore(capture.root);
    let assetCount = 0;
    if (inspectFiles) {
      await (0, import_promises10.mkdir)((0, import_node_path10.join)(capture.root, "asset-index"), { recursive: true });
      for await (const asset of this.inventorySource.discover(capture)) {
        if (!/^[a-zA-Z0-9_-]{1,100}$/.test(asset.id)) throw new Error("The inventory returned an invalid asset identity.");
        await store.append("assets", asset);
        await (0, import_promises10.writeFile)((0, import_node_path10.join)(capture.root, "asset-index", `${asset.id}.json`), JSON.stringify(asset), { flag: "wx", mode: 384 });
        assetCount++;
      }
    }
    const preview = { id: (0, import_node_crypto8.randomUUID)(), target: { ...target }, assets: [], assetCount, warnings: [...capture.warnings], warningCount: capture.warningCount, profile: capture.profile };
    if (this.prepared.size >= 3) this.prepared.delete(this.prepared.keys().next().value);
    this.prepared.set(preview.id, { capture, preview, inspected: inspectFiles });
    return preview;
  }
  async inventory(id, offset = 0) {
    const item = this.preparation(id), store = new CaptureStore(item.capture.root), page = await store.page("assets", offset);
    const assets = [];
    for (const asset of page.records) {
      const { sessionIndex, ...visible } = asset;
      if (sessionIndex) {
        const origins = await store.page(sessionIndex, 0, 25);
        visible.sessions = origins.records.map((record) => record.sessionID);
        visible.additionalSessionCount = Math.max(0, (asset.sourceSessionCount ?? visible.sessions.length) - visible.sessions.length);
      }
      assets.push(visible);
    }
    return { assets, total: item.preview.assetCount ?? 0, next: page.next };
  }
  start(preparedID, options2) {
    const item = this.preparation(preparedID);
    if (options2.includeFiles && !item.inspected) throw new Error("Preview the file inventory before enabling file collection.");
    const selected = options2.includeFiles ? options2.selectedAssetIDs ?? [] : [];
    if (!Array.isArray(selected) || selected.length > 1e3 || selected.some((id) => typeof id !== "string" || !/^[a-zA-Z0-9_-]{1,100}$/.test(id) || !(0, import_node_fs6.existsSync)((0, import_node_path10.join)(item.capture.root, "asset-index", `${id}.json`)))) throw new Error("The selection contains a file outside the prepared inventory.");
    if (options2.outputFile !== void 0) validateOutputFile(options2.outputFile);
    const directory = options2.outputFile ? (0, import_node_path10.dirname)(options2.outputFile) : options2.outputDirectory || (0, import_node_path10.join)((0, import_node_os3.homedir)(), "Downloads", "OpenChamber-Exports");
    if (!(0, import_node_path10.isAbsolute)(directory) || /^[\\/]{2}/.test(directory) || directory.includes("\0")) throw new Error("Choose an absolute local output directory; network and device paths are not supported.");
    if ([...this.jobs.values()].some((job2) => job2.state === "running")) throw new Error("An export is already running. Wait for it to finish.");
    const job = { id: (0, import_node_crypto8.randomUUID)(), target: { ...item.preview.target }, state: "running", progress: "Writing archive" };
    if (this.jobs.size >= 32) this.jobs.delete(this.jobs.keys().next().value);
    this.jobs.set(job.id, job);
    const controller = new AbortController();
    this.controllers.set(job.id, controller);
    const store = new CaptureStore(item.capture.root);
    const assets = options2.includeFiles ? store.records("assets") : (async function* () {
    })();
    const frozen = { ...options2, selectedAssetIDs: [...selected], signal: controller.signal };
    const create = async () => {
      if (item.exact?.key === this.selectionKey(frozen)) {
        await this.validateSelected(item, selected);
        await (0, import_promises10.mkdir)(directory, { recursive: true });
        const staging = await (0, import_promises10.mkdtemp)((0, import_node_path10.join)(directory, ".session-export-")), partial = (0, import_node_path10.join)(staging, "prepared.zip");
        await (0, import_promises11.pipeline)((0, import_node_fs7.createReadStream)(item.exact.path), (0, import_node_fs7.createWriteStream)(partial, { flags: "wx", mode: 384 }), { signal: controller.signal });
        const path = options2.outputFile ?? (0, import_node_path10.join)(directory, `${item.capture.target.sessionID}-${(0, import_node_crypto8.randomUUID)()}.zip`);
        await this.validateSelected(item, selected);
        controller.signal.throwIfAborted();
        await (0, import_promises10.link)(partial, path);
        return { ...item.exact, path };
      }
      return new ArchiveWriter().write(item.capture, assets, frozen, directory);
    };
    void create().then((result) => {
      Object.assign(job, result, { state: "ready", progress: "Archive saved" });
    }).catch((error) => {
      const code = typeof error?.code === "string" && /^[A-Z0-9_]+$/.test(error.code) ? ` (${error.code})` : "";
      const changedSelection = error instanceof Error && error.message === "A selected file changed after preparation. Review the files again.";
      Object.assign(job, { state: "failed", progress: controller.signal.aborted ? "Export cancelled" : "Export failed", error: controller.signal.aborted ? "Export cancelled; source sessions and files were not changed." : changedSelection ? error.message : `Archive creation failed${code}. Check local permissions and disk space; incomplete staging files were retained.` });
    }).finally(() => this.controllers.delete(job.id));
    return { ...job };
  }
  status(id) {
    const job = this.jobs.get(id);
    if (!job) throw new Error("Unknown export job.");
    return { ...job };
  }
  target(id) {
    return { ...this.preparation(id).preview.target };
  }
  cancel(id) {
    const controller = this.controllers.get(id);
    if (!controller) throw new Error("This export job is not running.");
    controller.abort();
  }
  close() {
    for (const controller of this.controllers.values()) controller.abort();
  }
  async size(id, options2, exact = false) {
    const item = this.preparation(id), store = new CaptureStore(item.capture.root);
    if (options2.includeFiles && !item.inspected) throw new Error("Review the file inventory before including files.");
    const selected = options2.includeFiles ? options2.selectedAssetIDs ?? [] : [];
    await this.validateSelected(item, selected);
    let transcript = 0, files = 0, context = 0, history = 0, subsessions = 0;
    for await (const session of store.sessions(item.capture)) {
      let size = (await (0, import_promises10.stat)(session.infoPath)).size + (await (0, import_promises10.stat)(session.messagesPath)).size;
      if (session.eventsPath && session.log.available) size += (await (0, import_promises10.stat)(session.eventsPath)).size;
      if (session.id === item.capture.target.sessionID) transcript += size;
      else subsessions += size;
      for (const path of [session.instructionsPath, item.capture.profile === "resume" ? void 0 : session.contextPath]) if (path) context += (await (0, import_promises10.stat)(path)).size;
    }
    for (const extra of item.capture.extras ?? []) history += (await (0, import_promises10.stat)(extra.path)).size;
    for (const id2 of selected) files += (await readAsset(item, id2)).size;
    const conversation = transcript + subsessions, knownSourceBytes = conversation + context + history + files;
    const result = {
      knownSourceBytes,
      uncompressedEstimate: knownSourceBytes + conversation * 0.75 + 8192,
      estimatedZipBytes: Math.ceil((conversation * 1.75 + context + history) * 0.35 + files * 0.95 + 8192),
      sessionCount: item.capture.sessionCount,
      messageCount: item.capture.messageCount,
      breakdown: { transcript, subsessions, context, history, files },
      estimateNotice: "Estimated sizes are not guarantees. Exact ZIP size requires compression."
    };
    if (exact) {
      const key = this.selectionKey(options2);
      if (item.exact?.key !== key) {
        const measured = await new ArchiveWriter().write(item.capture, options2.includeFiles ? store.records("assets") : (async function* () {
        })(), { includeFiles: options2.includeFiles, selectedAssetIDs: options2.selectedAssetIDs, signal: options2.signal }, (0, import_node_path10.join)(item.capture.root, `measurement-${(0, import_node_crypto8.randomUUID)()}`));
        item.exact = { ...measured, key };
      }
      result.exactZipBytes = item.exact.size;
    }
    return result;
  }
  selectionKey(options2) {
    return JSON.stringify([Boolean(options2.includeFiles), [...options2.selectedAssetIDs ?? []].sort()]);
  }
  async validateSelected(item, selected) {
    if (!Array.isArray(selected) || selected.length > 1e3 || selected.some((id) => typeof id !== "string" || !/^[a-zA-Z0-9_-]{1,100}$/.test(id))) throw new Error("Invalid file selection.");
    if (selected.length && !item.inspected) throw new Error("Review the file inventory first.");
    for (const id of selected) {
      const asset = await readAsset(item, id), current = await (0, import_promises10.lstat)(asset.path);
      if (asset.status !== "available" || current.isSymbolicLink() || !current.isFile() || !samePath(await (0, import_promises10.realpath)(asset.path), asset.path) || !asset.fingerprint || Object.entries(asset.fingerprint).some(([key, value]) => current[key] !== value)) throw new Error("A selected file changed after preparation. Review the files again.");
    }
  }
  preparation(id) {
    const item = this.prepared.get(id);
    if (!item) throw new Error("The prepared export is missing. Prepare it again.");
    return item;
  }
};
async function readAsset(item, id) {
  const { readJsonFile: readJsonFile2 } = await Promise.resolve().then(() => (init_private_channel(), private_channel_exports));
  return readJsonFile2((0, import_node_path10.join)(item.capture.root, "asset-index", `${id}.json`), 64 * 1024);
}

// src/transfer-service.ts
var import_node_path14 = require("node:path");
var import_node_crypto12 = require("node:crypto");

// src/importer.ts
var import_node_crypto10 = require("node:crypto");
var import_node_fs9 = require("node:fs");
var import_promises13 = require("node:fs/promises");
var import_node_path12 = require("node:path");
var import_node_stream7 = require("node:stream");
var import_promises14 = require("node:stream/promises");
var import_yauzl = __toESM(require_yauzl(), 1);

// src/portable-session.ts
var MAX_IMPORT_JSON_BYTES = 64 * 1024 * 1024;
function portableFileKey(path) {
  const value = path.replaceAll("\\", "/").replace(/^\/([a-zA-Z]:\/)/, "$1");
  return /^[a-zA-Z]:\//.test(value) ? value.toLowerCase() : value;
}

// src/importer.ts
init_private_channel();

// src/upload.ts
var import_node_crypto9 = require("node:crypto");
var import_node_fs8 = require("node:fs");
var import_promises12 = require("node:fs/promises");
var import_node_path11 = require("node:path");
init_private_channel();
var UPLOAD_CHUNK_BYTES = 32768;
var MAX_UPLOAD_BYTES = 8 * 1024 * 1024 * 1024;
var UploadStore = class {
  constructor(root) {
    this.root = root;
  }
  root;
  active = /* @__PURE__ */ new Set();
  directory(id) {
    if (!UUID.test(id)) throw new Error("Invalid upload identity.");
    return (0, import_node_path11.join)(this.root, id);
  }
  async load(id) {
    const upload = await readJsonFile((0, import_node_path11.join)(this.directory(id), "state.json"), 8192);
    if (upload.id !== id || Date.now() - upload.updated > 24 * 60 * 60 * 1e3) throw new Error("This upload expired. Choose the ZIP again.");
    return upload;
  }
  async start(name, size) {
    if (typeof name !== "string" || !name.toLowerCase().endsWith(".zip") || !Number.isSafeInteger(size) || size < 22 || size > MAX_UPLOAD_BYTES) throw new Error("Choose a ZIP between 22 bytes and 8 GiB.");
    await privateDirectory(this.root);
    const space = await (0, import_promises12.statfs)(this.root);
    if (space.bavail * space.bsize < size + 16 * 1024 * 1024) throw new Error("Not enough disk space to stage this upload.");
    const upload = { id: (0, import_node_crypto9.randomUUID)(), name: name.slice(-255), size, received: 0, state: "uploading", updated: Date.now() };
    const directory = this.directory(upload.id);
    await privateDirectory(directory);
    const file = await (0, import_promises12.open)((0, import_node_path11.join)(directory, "archive.partial"), "wx", 384);
    await file.close();
    await writePrivateJson((0, import_node_path11.join)(directory, "state.json"), upload);
    return upload;
  }
  async chunk(id, offset, base64, sha256) {
    if (this.active.has(id)) throw new Error("Another chunk for this upload is still being written.");
    this.active.add(id);
    try {
      const upload = await this.load(id);
      if (upload.state !== "uploading" || !Number.isSafeInteger(offset) || typeof base64 !== "string" || base64.length > 43692 || !/^[A-Za-z0-9+/]*={0,2}$/.test(base64)) throw new Error("Invalid upload chunk.");
      const bytes = Buffer.from(base64, "base64"), hash = (0, import_node_crypto9.createHash)("sha256").update(bytes).digest("hex");
      if (bytes.toString("base64") !== base64 || !bytes.length || bytes.length > UPLOAD_CHUNK_BYTES || sha256 !== void 0 && sha256 !== hash) throw new Error("Upload chunk integrity check failed.");
      if (upload.last?.offset === offset && upload.last.hash === hash && upload.last.length === bytes.length) return upload;
      if (offset !== upload.received || offset + bytes.length > upload.size) throw new Error("Upload offset mismatch. Read the acknowledged offset before resuming.");
      const file = await (0, import_promises12.open)((0, import_node_path11.join)(this.directory(id), "archive.partial"), "r+");
      try {
        if ((await file.stat()).size < offset) throw new Error("The staged upload was truncated.");
        let written = 0;
        while (written < bytes.length) {
          const result = await file.write(bytes, written, bytes.length - written, offset + written);
          if (!result.bytesWritten) throw new Error("The upload write stopped making progress.");
          written += result.bytesWritten;
        }
        await file.sync();
      } finally {
        await file.close();
      }
      upload.received += bytes.length;
      upload.updated = Date.now();
      upload.last = { offset, hash, length: bytes.length };
      await writePrivateJson((0, import_node_path11.join)(this.directory(id), "state.json"), upload);
      return upload;
    } finally {
      this.active.delete(id);
    }
  }
  async finish(id, expectedHash) {
    if (this.active.has(id)) throw new Error("Wait for the current chunk to finish.");
    this.active.add(id);
    try {
      const upload = await this.load(id);
      if (upload.state === "ready") return upload;
      if (upload.state !== "uploading" || upload.received !== upload.size) throw new Error("The ZIP upload is incomplete.");
      const partial = (0, import_node_path11.join)(this.directory(id), "archive.partial"), finalized = (0, import_node_path11.join)(this.directory(id), "archive.zip");
      const finalMetadata = await (0, import_promises12.lstat)(finalized).catch((error) => {
        if (error.code === "ENOENT") return void 0;
        throw error;
      });
      const hash = (0, import_node_crypto9.createHash)("sha256"), path = finalMetadata ? finalized : partial;
      const metadata = await (0, import_promises12.lstat)(path);
      if (!metadata.isFile() || metadata.isSymbolicLink() || metadata.size !== upload.size) throw new Error("The staged ZIP size does not match its upload declaration.");
      for await (const bytes of (0, import_node_fs8.createReadStream)(path)) hash.update(bytes);
      upload.sha256 = hash.digest("hex");
      if (expectedHash !== void 0 && expectedHash !== upload.sha256) throw new Error("ZIP checksum mismatch.");
      if (!finalMetadata) await (0, import_promises12.rename)(path, finalized);
      upload.state = "ready";
      upload.updated = Date.now();
      await writePrivateJson((0, import_node_path11.join)(this.directory(id), "state.json"), upload);
      return upload;
    } finally {
      this.active.delete(id);
    }
  }
  status(id) {
    return this.load(id);
  }
  async path(id) {
    if ((await this.load(id)).state !== "ready") throw new Error("Finish uploading this ZIP first.");
    return (0, import_node_path11.join)(this.directory(id), "archive.zip");
  }
  async cancel(id) {
    if (this.active.has(id)) throw new Error("Wait for the current upload operation to finish before cancelling.");
    this.active.add(id);
    try {
      const upload = await this.load(id);
      if (upload.state === "uploading") await (0, import_promises12.rm)((0, import_node_path11.join)(this.directory(id), "archive.partial"), { force: true });
      upload.state = "cancelled";
      upload.updated = Date.now();
      await writePrivateJson((0, import_node_path11.join)(this.directory(id), "state.json"), upload);
    } finally {
      this.active.delete(id);
    }
  }
};

// src/control-metadata.ts
function boundedStrings(values2, maximum = 25, byteBudget = 16 * 1024) {
  const result = [];
  let bytes = 0, omitted = false;
  for (const value of values2) {
    if (typeof value !== "string") continue;
    const text = Buffer.byteLength(value) > 2048 ? Buffer.from(value).subarray(0, 2048).toString("utf8") + "\u2026 [truncated; inspect the archive]" : value;
    if (result.length >= maximum || bytes + Buffer.byteLength(text) > byteBudget - 128) {
      omitted = true;
      continue;
    }
    result.push(text);
    bytes += Buffer.byteLength(text);
  }
  if (omitted && result.length < maximum) result.push("Additional details remain in the archive or private job journal.");
  return result;
}

// src/importer.ts
var MAX_EXPANDED_BYTES = 2 * 1024 * 1024 * 1024;
var MAX_ENTRIES = 1e4;
var Importer = class {
  constructor(plugin2, journalDirectory) {
    this.plugin = plugin2;
    this.journalDirectory = journalDirectory;
  }
  plugin;
  journalDirectory;
  running = /* @__PURE__ */ new Map();
  starting = /* @__PURE__ */ new Set();
  async prepare(sourcePath, destination, signal) {
    const client = await this.plugin();
    if (typeof sourcePath !== "string" || sourcePath.length > 4096 || !(0, import_node_path12.isAbsolute)(sourcePath) || /^[\\/]{2}/.test(sourcePath) || sourcePath.includes("\0")) throw new Error("Provide an absolute ZIP path on this OpenChamber server.");
    const source = await (0, import_promises13.lstat)(sourcePath), canonical = await (0, import_promises13.realpath)(sourcePath);
    if (!source.isFile() || source.isSymbolicLink() || !samePath(canonical, (0, import_node_path12.resolve)(sourcePath))) throw new Error("The ZIP must be a regular local file without symbolic-link ancestors.");
    if (source.size > MAX_UPLOAD_BYTES) throw new Error("ZIP exceeds the 8 GiB staging safety limit.");
    if (typeof destination !== "string" || destination.length > 4096 || !(0, import_node_path12.isAbsolute)(destination) || /^[\\/]{2}/.test(destination) || destination.includes("\0")) throw new Error("Choose an absolute working directory on this server.");
    const directory = await (0, import_promises13.realpath)(destination);
    if (!samePath(directory, (0, import_node_path12.resolve)(destination)) || !(await (0, import_promises13.lstat)(directory)).isDirectory()) throw new Error("Choose an existing canonical working directory without symbolic links.");
    const id = (0, import_node_crypto10.randomUUID)(), root = (0, import_node_path12.join)(client.root, "jobs", id);
    await privateDirectory(root);
    if (this.journalDirectory) {
      await privateDirectory(this.journalDirectory);
      await writePrivateJson((0, import_node_path12.join)(this.journalDirectory, `${id}.json`), { jobRoot: root, instanceID: client.instanceID });
    }
    const stagingSpace = await (0, import_promises13.statfs)(root);
    if (stagingSpace.bavail * stagingSpace.bsize < source.size + 16 * 1024 * 1024) throw new Error("Not enough private staging space for the ZIP copy.");
    const frozen = (0, import_node_path12.join)(root, "source.zip");
    const handle = await (0, import_promises13.open)(canonical, "r");
    try {
      const before = await handle.stat();
      if (before.dev !== source.dev || before.ino !== source.ino) throw new Error("The ZIP changed while it was being opened.");
      await (0, import_promises14.pipeline)(handle.createReadStream({ autoClose: false }), (0, import_node_fs9.createWriteStream)(frozen, { flags: "wx", mode: 384 }), { signal });
      const after = await handle.stat(), current = await (0, import_promises13.lstat)(sourcePath);
      if ([after, current].some((value) => value.size !== before.size || value.mtimeMs !== before.mtimeMs || value.ino !== before.ino || value.dev !== before.dev)) throw new Error("The ZIP changed during preparation. Wait for the external transfer to finish.");
    } finally {
      await handle.close();
    }
    const extracted = await extract(frozen, root, signal);
    const manifestEntry = extracted.get("manifest.json");
    if (!manifestEntry) throw new Error("The ZIP has no Session Export manifest.");
    const manifest = await readJsonFile(manifestEntry.path, 8 * 1024 * 1024);
    if (!["openchamber-session-export/1", "openchamber-session-export/2"].includes(manifest.schema) || !Array.isArray(manifest.entries) || !Array.isArray(manifest.sessions)) throw new Error("Unsupported or invalid Session Export archive.");
    if (manifest.profile !== void 0 && !["complete", "resume"].includes(manifest.profile)) throw new Error("Unsupported archive profile.");
    const declared = /* @__PURE__ */ new Set(["manifest.json"]);
    for (const entry of manifest.entries) {
      const actual = extracted.get(entry.path);
      if (declared.has(entry.path) || !actual || actual.size !== entry.size || actual.sha256 !== entry.sha256) throw new Error("Archive entries do not match the manifest checksums.");
      declared.add(entry.path);
    }
    if (declared.size !== extracted.size) throw new Error("The archive contains undeclared entries.");
    const restored = (0, import_node_path12.join)(directory, ".openchamber-imports", id), assets = [], assetContents = [], files = [];
    let assetBytes = 0;
    const assetSources = /* @__PURE__ */ new Set();
    for (const decision of manifest.assets?.decisions ?? []) {
      if (decision.status !== "included") continue;
      const entry = extracted.get(decision.archivePath);
      if (!entry || !entry.name.startsWith("assets/") || typeof decision.path !== "string") throw new Error("Invalid archived asset reference.");
      const sourceKey = portableFileKey(decision.path);
      if (assetSources.has(sourceKey)) throw new Error("Duplicate or ambiguous archived asset mapping.");
      assetSources.add(sourceKey);
      const target = (0, import_node_path12.join)(restored, `asset-${files.length}${safeExtension(entry.name)}`);
      files.push({ source: entry.path, destination: target });
      assets.push([decision.path, target]);
      assetContents.push([decision.path, entry.path]);
      assetBytes += entry.size;
    }
    let jsonBytes = 0, messageCount = 0;
    const sourceFiles = [], seen = /* @__PURE__ */ new Set();
    for (const session of manifest.sessions) {
      if (typeof session.id !== "string" || !/^ses_[a-zA-Z0-9_-]{1,200}$/.test(session.id) || seen.has(session.id)) throw new Error("Invalid or duplicate archived session identity.");
      seen.add(session.id);
      const entry = extracted.get(session.id === manifest.target?.sessionID ? "session.json" : `subsessions/${session.id}.json`);
      if (!entry) throw new Error("An archived session is missing.");
      jsonBytes += entry.size;
      if (jsonBytes > MAX_IMPORT_JSON_BYTES) throw new Error("Session JSON exceeds the 64 MiB import safety limit. The ZIP remains available for consultation.");
      const payload = await readJsonFile(entry.path, MAX_IMPORT_JSON_BYTES);
      if (payload.info?.id !== session.id || !Array.isArray(payload.messages) || payload.messages.length !== session.messages) throw new Error("Session content/count mismatch.");
      const instructions = extracted.get(`context/${session.id}/instructions.json`);
      if (instructions) {
        jsonBytes += instructions.size;
        if (jsonBytes > MAX_IMPORT_JSON_BYTES) throw new Error("Instructions exceed the import safety budget.");
        payload.instructions = await readJsonFile(instructions.path, 2 * 1024 * 1024);
      }
      const name = `source-${sourceFiles.length}.json`;
      await writePrivateJson((0, import_node_path12.join)(root, name), payload);
      sourceFiles.push(name);
      messageCount += payload.messages.length;
    }
    if (!sourceFiles.length || !seen.has(manifest.target?.sessionID)) throw new Error("The archive has no main session.");
    const total = [...extracted.values()].reduce((size, entry) => size + entry.size, 0), space = await (0, import_promises13.statfs)(directory);
    if (space.bavail * space.bsize < assetBytes + 1024 * 1024) throw new Error("Not enough disk space for restored files.");
    await writePrivateJson((0, import_node_path12.join)(root, "spec.json"), { directory, files: sourceFiles, assets, assetContents, mainSourceID: manifest.target.sessionID });
    const prepared = await client.request(`/imports/${id}/prepare`, "POST", {});
    const preview = {
      id,
      sourcePath,
      directory,
      restoredDirectory: restored,
      profile: manifest.profile ?? "complete",
      compressedBytes: source.size,
      uncompressedBytes: total,
      sessionCount: sourceFiles.length,
      messageCount,
      fileCount: files.length,
      importJsonLimit: MAX_IMPORT_JSON_BYTES,
      warnings: boundedStrings([
        "Native import restores supported projected messages and captured session instructions. Event logs and optional historical text remain archive-only; unfamiliar API fields are not guaranteed to survive native import.",
        ...Array.isArray(manifest.warnings) ? manifest.warnings : [],
        ...prepared.warnings ?? []
      ]),
      dependencies: boundedStrings(Array.isArray(manifest.dependencies) ? manifest.dependencies : ["Legacy archive: portable instructions and dependency coverage may be incomplete."], 10)
    };
    signal?.throwIfAborted();
    const preparation = { preview, files, started: false, instanceID: client.instanceID };
    if (Buffer.byteLength(JSON.stringify(preparation)) > 2 * 1024 * 1024) throw new Error("Import file mapping exceeds the 2 MiB control-metadata safety limit.");
    await writePrivateJson((0, import_node_path12.join)(root, "import.json"), preparation);
    return preview;
  }
  async start(id) {
    if (!UUID.test(id)) throw new Error("Invalid import identity.");
    if (this.starting.has(id) || this.running.has(id)) throw new Error("This import is already running.");
    if (this.starting.size + this.running.size >= 2) throw new Error("Wait for the current import operations to finish.");
    this.starting.add(id);
    try {
      const client = await this.plugin(), root = (0, import_node_path12.join)(client.root, "jobs", id);
      const preparation = await readJsonFile((0, import_node_path12.join)(root, "import.json"), 2 * 1024 * 1024);
      if (preparation.started) throw new Error("This import has already started. Inspect its recorded result; do not blindly retry a mutation.");
      if (preparation.instanceID !== client.instanceID) throw new Error("The plugin instance changed after preview. No import was submitted.");
      const reservation = await (0, import_promises13.open)((0, import_node_path12.join)(root, "start.lock"), "wx", 384);
      await reservation.close();
      preparation.started = true;
      await writePrivateJson((0, import_node_path12.join)(root, "import.json"), preparation);
      const controller = new AbortController(), state = {
        state: "running",
        phase: "files",
        progress: "Restoring selected files",
        sessions: [],
        warnings: preparation.preview.warnings,
        restoredDirectory: preparation.preview.restoredDirectory,
        restoredFileCount: 0,
        restoredFiles: []
      };
      const persist = () => writePrivateJson((0, import_node_path12.join)(root, "file-restoration-state.json"), state);
      await persist();
      this.running.set(id, { controller, state });
      void (async () => {
        try {
          if (!samePath(await (0, import_promises13.realpath)(preparation.preview.directory), preparation.preview.directory)) throw new Error("The working directory changed after preview.");
          if (preparation.files.length) {
            const base = (0, import_node_path12.join)(preparation.preview.directory, ".openchamber-imports");
            await privateDirectory(base);
            await (0, import_promises13.mkdir)((0, import_node_path12.join)(base, id), { mode: 448 });
            for (const [number, file] of preparation.files.entries()) {
              controller.signal.throwIfAborted();
              state.activeFile = file.destination;
              await persist();
              await (0, import_promises14.pipeline)((0, import_node_fs9.createReadStream)(file.source), (0, import_node_fs9.createWriteStream)(file.destination, { flags: "wx", mode: 384 }), { signal: controller.signal });
              await writePrivateJson((0, import_node_path12.join)(root, `restored-file-${number}.json`), { path: file.destination, completed: true });
              state.restoredFileCount++;
              if (state.restoredFiles.length < 25) state.restoredFiles.push(file.destination);
              delete state.activeFile;
              await persist();
            }
          }
          controller.signal.throwIfAborted();
          state.phase = "submitting";
          state.progress = "Submitting prepared sessions";
          await persist();
          try {
            await client.request(`/imports/${id}/start`, "POST", {});
            state.phase = "submitted";
          } catch {
            state.progress = "Submission acknowledgement lost; inspect the native job status. No request was replayed.";
          }
          await persist();
        } catch (error) {
          if (state.phase === "submitting" || state.phase === "submitted") {
            state.journalWarning = "The local submission journal could not be finalized. Native status must be inspected; no mutation was replayed.";
            try {
              await persist();
            } catch {
            }
          } else {
            state.state = controller.signal.aborted ? "cancelled" : "failed";
            state.progress = "File restoration stopped; source files were not changed";
            state.error = error instanceof Error ? error.message : "File restoration failed.";
            await persist();
          }
        } finally {
          this.running.delete(id);
        }
      })().catch(() => {
        this.running.delete(id);
      });
      return { ...state };
    } finally {
      this.starting.delete(id);
    }
  }
  async status(id) {
    if (!UUID.test(id)) throw new Error("Invalid import identity.");
    if (this.running.has(id)) return { ...this.running.get(id).state };
    let client, location;
    if (this.journalDirectory) {
      try {
        location = await readJsonFile((0, import_node_path12.join)(this.journalDirectory, `${id}.json`), 8192);
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
    }
    try {
      client = await this.plugin();
    } catch {
    }
    location ??= client ? { jobRoot: (0, import_node_path12.join)(client.root, "jobs", id), instanceID: client.instanceID } : void 0;
    if (!location) throw new Error("No live plugin or retained locator is available for this job ID. Inspect the private bridge journals manually.");
    const { jobRoot } = location;
    let local = {};
    try {
      local = await readJsonFile((0, import_node_path12.join)(jobRoot, "file-restoration-state.json"), 256 * 1024);
    } catch {
      local.journalWarning = "Local file-restoration status is unavailable or invalid; native results are checked independently.";
    }
    let native, live = false;
    if (client && client.instanceID === location.instanceID && (0, import_node_path12.join)(client.root, "jobs", id) === jobRoot) {
      try {
        native = await client.request(`/imports/${id}/status`);
        live = true;
      } catch {
      }
    }
    if (!native) {
      try {
        native = await readJsonFile((0, import_node_path12.join)(jobRoot, "state.json"), 256 * 1024);
      } catch {
      }
    }
    if (native && !["prepared", "preparing"].includes(native.state)) {
      if (!live && native.state === "running") native = { ...native, state: "failed", progress: "The original plugin is unavailable. Inspect the recorded created/candidate IDs; no mutation was replayed.", uncertainSessions: native.inFlight?.phase === "import" && !native.sessions?.includes(native.inFlight.sessionID) ? [native.inFlight.sessionID] : native.uncertainSessions };
      return { ...local, ...native, ...!live && native.state === "ready" ? { progress: "Recorded completed import from the original plugin journal. Availability in the current instance has not been verified." } : {}, offlineJournal: !live, journalPath: jobRoot };
    }
    if (local.phase === "files" || (local.state === "failed" || local.state === "cancelled") && !["submitting", "submitted"].includes(local.phase)) return { ...local, state: local.state === "cancelled" ? "cancelled" : "failed", progress: "File restoration stopped or was interrupted; inspect its journal and restored directory before another import." };
    return { ...local, state: "failed", progress: "Submission outcome requires inspection; the native result is unavailable or still prepared. No automatic resubmission occurred.", uncertainJobID: id, journalPath: jobRoot };
  }
  async cancel(id) {
    if (!UUID.test(id)) throw new Error("Invalid import identity.");
    this.running.get(id)?.controller.abort();
    await (await this.plugin()).request(`/imports/${id}/cancel`, "POST", {});
  }
  close() {
    for (const job of this.running.values()) job.controller.abort();
  }
};
function safeExtension(name) {
  return /\.[a-zA-Z0-9]{1,12}$/.exec(name)?.[0].toLowerCase() ?? ".bin";
}
function validName(name) {
  return typeof name === "string" && name.length <= 1024 && !/[\\:\u0000-\u001f\u007f]/.test(name) && !name.startsWith("/") && name.split("/").every((part) => part && part !== "." && part !== ".." && !/[. ]$/.test(part) && !/^(?:con|prn|aux|nul|com[0-9]|lpt[0-9])(?:\.|$)/i.test(part));
}
async function extract(path, root, signal) {
  const zip = await new Promise((resolve4, reject) => import_yauzl.default.open(path, { lazyEntries: true, autoClose: false, validateEntrySizes: true, strictFileNames: true }, (error, value) => error ? reject(error) : resolve4(value)));
  const entries = /* @__PURE__ */ new Map(), names = /* @__PURE__ */ new Map(), directories = /* @__PURE__ */ new Set();
  let expanded = 0, count = 0;
  try {
    await new Promise((resolve4, reject) => {
      zip.on("error", reject);
      zip.once("end", resolve4);
      zip.on("entry", (entry) => {
        void (async () => {
          signal?.throwIfAborted();
          if (++count > MAX_ENTRIES || !validName(entry.fileName.replace(/\/$/, ""))) throw new Error("Unsafe ZIP entry name or too many entries.");
          const name = entry.fileName.replace(/\/$/, "").normalize("NFC").toLowerCase(), directory = entry.fileName.endsWith("/");
          if (names.has(name) || !directory && directories.has(name)) throw new Error("Duplicate or case-colliding ZIP entries.");
          const parts = name.split("/");
          for (let index = 1; index < parts.length; index++) {
            const parent = parts.slice(0, index).join("/");
            if (names.get(parent) === false) throw new Error("ZIP file/directory entry collision.");
            directories.add(parent);
          }
          names.set(name, directory);
          const mode = entry.externalFileAttributes >>> 16 & 61440;
          if (entry.generalPurposeBitFlag & 1 || ![0, 32768, 16384].includes(mode) || ![0, 8].includes(entry.compressionMethod)) throw new Error("Encrypted, linked or unsupported ZIP entry.");
          if (entry.fileName.endsWith("/")) {
            zip.readEntry();
            return;
          }
          expanded += entry.uncompressedSize;
          if (!Number.isSafeInteger(expanded) || expanded > MAX_EXPANDED_BYTES || entry.uncompressedSize > Math.max(1, entry.compressedSize) * 1e4) throw new Error("ZIP expansion exceeds the documented 2 GiB or compression-ratio safety limit.");
          const space = await (0, import_promises13.statfs)(root);
          if (space.bavail * space.bsize < entry.uncompressedSize + 16 * 1024 * 1024) throw new Error("Not enough private staging space to expand this ZIP entry.");
          const input = await new Promise((resolve5, reject2) => zip.openReadStream(entry, (error, stream) => error ? reject2(error) : resolve5(stream)));
          const target = (0, import_node_path12.join)(root, `entry-${(0, import_node_crypto10.randomUUID)()}`), hash = (0, import_node_crypto10.createHash)("sha256");
          let bytes = 0;
          const verifier = new import_node_stream7.Transform({ transform(chunk, _encoding, next2) {
            bytes += chunk.length;
            if (bytes > entry.uncompressedSize) {
              next2(new Error("ZIP entry exceeds its declared size."));
              return;
            }
            hash.update(chunk);
            next2(null, chunk);
          } });
          await (0, import_promises14.pipeline)(input, verifier, (0, import_node_fs9.createWriteStream)(target, { flags: "wx", mode: 384 }), { signal });
          if (bytes !== entry.uncompressedSize) throw new Error("Truncated ZIP entry.");
          entries.set(entry.fileName, { name: entry.fileName, path: target, size: bytes, sha256: hash.digest("hex") });
          zip.readEntry();
        })().catch(reject);
      });
      zip.readEntry();
    });
    return entries;
  } finally {
    zip.close();
  }
}

// src/companion.ts
var import_node_crypto11 = require("node:crypto");
var import_promises15 = require("node:fs/promises");
var import_node_path13 = require("node:path");
var import_promises16 = require("node:stream/promises");

// src/http.ts
async function readBody(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 64e3) throw new Error("The request exceeds the 64 KB bridge limit.");
    chunks.push(Buffer.from(chunk));
  }
  const value = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("The request must contain a JSON object.");
  return value;
}
function sendJson(response, status, value) {
  const text = JSON.stringify(value);
  response.writeHead(Buffer.byteLength(text) > 1024 * 1024 ? 413 : status, { "Content-Type": "application/json", "Cache-Control": "no-store" });
  response.end(Buffer.byteLength(text) > 1024 * 1024 ? '{"error":"Transfer metadata exceeds its safety limit."}' : text);
}

// src/companion.ts
var fingerprint = (metadata) => [metadata.dev, metadata.ino, metadata.size, metadata.mtimeMs].join(":");
var Companion = class {
  tickets = /* @__PURE__ */ new Map();
  grants = /* @__PURE__ */ new Map();
  async issue(path, servicePort, privateUrl) {
    const url = new URL(privateUrl || `http://127.0.0.1:${servicePort}/companion`);
    if (privateUrl && (url.protocol !== "https:" || url.username || url.password || url.search || url.hash || !url.pathname.endsWith("/companion"))) throw new Error("Use a private HTTPS URL ending in /companion, with no credentials, query or fragment. Configure its proxy separately.");
    this.expire();
    if (this.tickets.size + this.grants.size >= 32) throw new Error("Too many pending downloads. Wait for their five-minute authorization window to expire.");
    const metadata = await (0, import_promises15.lstat)(path), canonical = await (0, import_promises15.realpath)(path);
    if (!metadata.isFile() || metadata.isSymbolicLink()) throw new Error("The exported archive is no longer available.");
    const grant = { id: (0, import_node_crypto11.randomUUID)(), path: canonical, fingerprint: fingerprint(metadata), expires: Date.now() + 5 * 60 * 1e3, origin: url.origin, base: url.pathname, secure: url.protocol === "https:" };
    const ticket = (0, import_node_crypto11.randomBytes)(32).toString("hex");
    this.tickets.set(ticket, grant);
    url.hash = ticket;
    return { url: url.toString(), expiresAt: grant.expires };
  }
  expire() {
    for (const map of [this.tickets, this.grants]) for (const [key, grant] of map) if (grant.expires < Date.now()) map.delete(key);
  }
  async handle(request, response, pathname) {
    if (!pathname.startsWith("/companion")) return false;
    this.expire();
    response.setHeader("Cache-Control", "no-store");
    response.setHeader("Referrer-Policy", "no-referrer");
    response.setHeader("X-Content-Type-Options", "nosniff");
    try {
      if (pathname === "/companion" && request.method === "GET") {
        const nonce = (0, import_node_crypto11.randomBytes)(16).toString("base64");
        response.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Content-Security-Policy": `default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'` });
        response.end(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Download session archive</title><style>body{font:1rem/1.6 system-ui;max-width:38rem;margin:3rem auto;padding:0 1rem}a{display:inline-block;padding:.7rem 1rem}#error{color:#b42318}[hidden]{display:none}</style><h1>Download session archive</h1><p id="status">Checking download authorization\u2026</p><p id="error" role="alert"></p><a id="download" hidden>Download ZIP</a><p>This archive may contain private information. An ordinary ZIP is not encrypted.</p><script nonce="${nonce}">(async()=>{
          const ticket=location.hash.slice(1),base=location.pathname.replace(/\\/$/,'');
          history.replaceState(null,'',base);
          try{const response=await fetch(base+'/redeem',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ticket})});
          const result=await response.json();if(!response.ok)throw Error(result.error||'Authorization failed.');
          const link=document.querySelector('#download');link.href=base+'/'+result.id+'/archive.zip';link.hidden=false;
          document.querySelector('#status').textContent='Ready. This download link expires after five minutes.';
          }catch(error){document.querySelector('#status').textContent='Download unavailable';document.querySelector('#error').textContent=error.message+' Return to Session Export or use Files.'}
        })();</script></html>`);
        return true;
      }
      if (pathname === "/companion/redeem" && request.method === "POST") {
        const { ticket } = await readBody(request), grant = this.tickets.get(ticket);
        if (!grant) throw new Error("This download authorization expired or has already been used.");
        const origin = request.headers.origin;
        const localOrigin = `http://${request.headers.host}`;
        if (!origin || origin !== grant.origin && origin !== localOrigin) throw new Error("Download authorization must be redeemed by its own page.");
        this.tickets.delete(ticket);
        grant.cookie = (0, import_node_crypto11.randomBytes)(32).toString("hex");
        this.grants.set(grant.id, grant);
        response.setHeader("Set-Cookie", `session_export_${grant.id}=${grant.cookie}; HttpOnly; SameSite=Strict; Path=${grant.base}/${grant.id}/; Max-Age=300${grant.secure ? "; Secure" : ""}`);
        sendJson(response, 200, { id: grant.id });
        return true;
      }
      const match = /^\/companion\/([a-f0-9-]+)\/archive\.zip$/.exec(pathname);
      if (match && ["GET", "HEAD"].includes(request.method ?? "")) {
        const grant = this.grants.get(match[1]);
        if (!grant || !request.headers.cookie?.split(";").map((value) => value.trim()).includes(`session_export_${grant.id}=${grant.cookie}`)) throw new Error("Download authorization is missing or expired.");
        const file = await (0, import_promises15.open)(grant.path, "r");
        try {
          const metadata = await file.stat();
          if (!metadata.isFile() || metadata.isSymbolicLink() || fingerprint(metadata) !== grant.fingerprint) throw new Error("The archive changed after this download was prepared.");
          let start2 = 0, end = metadata.size - 1, status = 200;
          const range = request.headers.range;
          if (range) {
            const bytes = /^bytes=(\d*)-(\d*)$/.exec(range);
            if (!bytes || !bytes[1] && !bytes[2]) {
              response.writeHead(416).end();
              return true;
            }
            start2 = bytes[1] ? Number(bytes[1]) : Math.max(0, metadata.size - Number(bytes[2]));
            end = bytes[1] && bytes[2] ? Math.min(end, Number(bytes[2])) : end;
            if (!Number.isSafeInteger(start2) || !Number.isSafeInteger(end) || start2 > end || start2 >= metadata.size) {
              response.writeHead(416, { "Content-Range": `bytes */${metadata.size}` }).end();
              return true;
            }
            status = 206;
            response.setHeader("Content-Range", `bytes ${start2}-${end}/${metadata.size}`);
          }
          const name = (0, import_node_path13.basename)(grant.path);
          response.writeHead(status, {
            "Content-Type": "application/zip",
            "Content-Length": end - start2 + 1,
            "Accept-Ranges": "bytes",
            "Content-Disposition": `attachment; filename="session-export.zip"; filename*=UTF-8''${encodeURIComponent(name)}`
          });
          if (request.method === "HEAD") response.end();
          else await (0, import_promises16.pipeline)(file.createReadStream({ start: start2, end, autoClose: false }), response);
        } finally {
          await file.close();
        }
        return true;
      }
      sendJson(response, 404, { error: "Unknown companion route." });
      return true;
    } catch (error) {
      if (!response.headersSent) sendJson(response, 401, { error: error instanceof Error ? error.message : "Download unavailable." });
      else response.destroy();
      return true;
    }
  }
};

// src/transfer-service.ts
var TransferService = class {
  constructor(exporter, plugin2, dataDirectory) {
    this.exporter = exporter;
    this.plugin = plugin2;
    this.uploads = new UploadStore((0, import_node_path14.join)(dataDirectory, "uploads"));
    this.importer = new Importer(plugin2, (0, import_node_path14.join)(dataDirectory, "import-journals"));
  }
  exporter;
  plugin;
  companion = new Companion();
  uploads;
  importer;
  jobs = /* @__PURE__ */ new Map();
  start(progress, work) {
    if ([...this.jobs.values()].filter((job) => job.status.state === "running").length >= 2) throw new Error("Wait for the current transfer operations to finish.");
    if (this.jobs.size >= 32) {
      const expired = [...this.jobs].find(([, job]) => job.status.state !== "running");
      if (expired) this.jobs.delete(expired[0]);
      else throw new Error("Too many active transfer jobs.");
    }
    const id = (0, import_node_crypto12.randomUUID)(), controller = new AbortController(), status = { id, state: "running", progress };
    this.jobs.set(id, { controller, status });
    void work(controller.signal).then((result) => Object.assign(status, controller.signal.aborted ? { state: "cancelled", progress: "Cancelled; no session was imported" } : { state: "ready", result, progress: "Ready" })).catch((error) => Object.assign(status, {
      state: controller.signal.aborted ? "cancelled" : "failed",
      error: error instanceof Error ? error.message : "Transfer operation failed.",
      progress: controller.signal.aborted ? "Cancelled; source sessions and files were not changed" : "Operation failed"
    }));
    return status;
  }
  close() {
    for (const job of this.jobs.values()) job.controller.abort();
    this.importer.close();
  }
  async handle(request, response, url) {
    if (!/^\/(?:transfer|uploads|imports|downloads|size)(?:\/|$)/.test(url.pathname)) return false;
    try {
      if (url.pathname === "/transfer/job" && request.method === "GET") {
        const job = this.jobs.get(url.searchParams.get("id") ?? "");
        if (!job) throw new Error("Unknown transfer operation.");
        sendJson(response, 200, job.status);
        return true;
      }
      if (url.pathname === "/imports/status" && request.method === "GET") {
        sendJson(response, 200, await this.importer.status(url.searchParams.get("id") ?? ""));
        return true;
      }
      if (url.pathname === "/uploads/status" && request.method === "GET") {
        sendJson(response, 200, await this.uploads.status(url.searchParams.get("id") ?? ""));
        return true;
      }
      if (request.method !== "POST") {
        sendJson(response, 405, { error: "Unsupported transfer method." });
        return true;
      }
      const input = await readBody(request);
      switch (url.pathname) {
        case "/transfer/cancel":
          if (this.jobs.has(input.id)) this.jobs.get(input.id).controller.abort();
          else this.exporter.cancel(input.id);
          sendJson(response, 200, { cancelled: true });
          break;
        case "/size": {
          const options2 = { includeFiles: input.options?.includeFiles === true, selectedAssetIDs: input.options?.selectedAssetIDs };
          sendJson(response, 202, this.start(input.exact ? "Compressing to measure exact ZIP size" : "Estimating archive size", (signal) => this.exporter.size(input.preparedID, { ...options2, signal }, input.exact === true)));
          break;
        }
        case "/uploads/start":
          sendJson(response, 200, await this.uploads.start(input.name, input.size));
          break;
        case "/uploads/chunk":
          sendJson(response, 200, await this.uploads.chunk(input.id, input.offset, input.base64, input.sha256));
          break;
        case "/uploads/finish":
          sendJson(response, 202, this.start("Verifying uploaded ZIP", () => this.uploads.finish(input.id, input.sha256)));
          break;
        case "/uploads/cancel":
          await this.uploads.cancel(input.id);
          sendJson(response, 200, { cancelled: true });
          break;
        case "/imports/prepare":
          sendJson(response, 202, this.start("Validating archive and preparing new sessions", async (signal) => this.importer.prepare(input.uploadID ? await this.uploads.path(input.uploadID) : input.path, input.directory, signal)));
          break;
        case "/imports/start":
          sendJson(response, 202, { id: input.id, ...await this.importer.start(input.id) });
          break;
        case "/imports/cancel":
          await this.importer.cancel(input.id);
          sendJson(response, 200, { cancelled: true });
          break;
        case "/downloads/start": {
          const job = this.exporter.status(input.jobID);
          if (job.state !== "ready" || !job.path) throw new Error("Finish exporting the archive first.");
          sendJson(response, 200, await this.companion.issue(job.path, request.socket.localPort, input.privateUrl));
          break;
        }
        default:
          sendJson(response, 404, { error: "Unknown transfer route." });
      }
    } catch (error) {
      sendJson(response, 400, { error: error instanceof Error ? error.message : "Transfer operation failed." });
    }
    return true;
  }
};

// src/service.ts
var import_node_os4 = require("node:os");
var import_node_path15 = require("node:path");
function createService(token2, source, options2 = {}) {
  const expected2 = (0, import_node_crypto13.createHash)("sha256").update(`Bearer ${token2}`).digest();
  const exporter = new Exporter(source), jobs = /* @__PURE__ */ new Map();
  const controllers = /* @__PURE__ */ new Map();
  const transfers = new TransferService(exporter, options2.plugin ?? (async () => {
    throw new Error("Approve the bundled OpenCode plugin in Settings \u2192 Extensions to import sessions.");
  }), options2.dataDirectory ?? (0, import_node_path15.join)((0, import_node_os4.tmpdir)(), "opencode", `session-transfer-${(0, import_node_crypto13.randomUUID)()}`));
  const picker = options2.picker ?? new WindowsSaveDialog();
  const destinations = /* @__PURE__ */ new Map();
  const server = (0, import_node_http.createServer)(async (request, response) => {
    const url = new URL(request.url ?? "/", "http://127.0.0.1");
    if (await transfers.companion.handle(request, response, url.pathname)) return;
    const header = request.headers.authorization;
    if (typeof header !== "string" || !(0, import_node_crypto13.timingSafeEqual)((0, import_node_crypto13.createHash)("sha256").update(header).digest(), expected2)) return respond(response, 401, { error: "Authentication required." });
    try {
      if (await transfers.handle(request, response, url)) return;
      if (url.pathname === "/health" && request.method === "GET") return respond(response, 200, { ok: true, version: RELEASE_VERSION });
      if (url.pathname === "/connection" && request.method === "GET" && source.connection) return respond(response, 200, await source.connection());
      if (url.pathname === "/prepare" && request.method === "POST") {
        const input = await body(request), value = input.target;
        if ([...destinations.values()].some((value2) => value2.job.state === "running")) return respond(response, 409, { error: "Finish or cancel the open Save As dialog first." });
        if ([...jobs.values()].some((job2) => job2.state === "running")) return respond(response, 409, { error: "A preparation is already running." });
        if (!value || typeof value.sessionID !== "string" || !/^ses_[a-zA-Z0-9_-]{1,200}$/.test(value.sessionID) || typeof value.directory !== "string" || !value.directory || value.directory.length > 4096 || value.directory.includes("\0")) throw new Error("Choose a valid session and directory.");
        const target = { sessionID: value.sessionID, directory: value.directory, title: typeof value.title === "string" ? value.title.slice(0, 500) : void 0 };
        if (input.inspectFiles !== void 0 && typeof input.inspectFiles !== "boolean") throw new Error("Invalid file-inventory option.");
        if (input.profile !== void 0 && !["complete", "resume"].includes(input.profile) || input.retainHistory !== void 0 && typeof input.retainHistory !== "boolean") throw new Error("Invalid export profile.");
        const job = { id: (0, import_node_crypto13.randomUUID)(), target, state: "running", progress: "Reading session evidence" }, controller = new AbortController();
        if (jobs.size >= 32) jobs.delete(jobs.keys().next().value);
        jobs.set(job.id, job);
        controllers.set(job.id, controller);
        void exporter.prepare(target, input.inspectFiles === true, { profile: input.profile, retainHistory: input.retainHistory, signal: controller.signal }).then((preview) => {
          Object.assign(job, { state: "ready", progress: "Evidence prepared", prepared: preview });
        }).catch((error) => {
          Object.assign(job, { state: "failed", progress: controller.signal.aborted ? "Preparation cancelled" : "Preparation failed", error: safeError(error) });
        }).finally(() => controllers.delete(job.id));
        return respond(response, 202, job);
      }
      if (url.pathname === "/cancel" && request.method === "POST") {
        const input = await body(request);
        if (controllers.has(input.id)) controllers.get(input.id).abort();
        else exporter.cancel(input.id);
        return respond(response, 200, { cancelled: true });
      }
      if (url.pathname === "/job" && request.method === "GET") {
        const id = url.searchParams.get("id") ?? "";
        const job = jobs.get(id) ?? destinations.get(id)?.job;
        if (job) return respond(response, 200, bounded(job));
        try {
          return respond(response, 200, bounded(exporter.status(id)));
        } catch {
          return respond(response, 404, { error: "Unknown export job." });
        }
      }
      if (url.pathname === "/destination" && request.method === "POST") {
        const input = await body(request);
        if ([...destinations.values()].some((value) => value.job.state === "running")) return respond(response, 409, { error: "A Save As dialog is already open." });
        if (typeof input.preparedID !== "string") throw new Error("Invalid prepared export.");
        const target = exporter.target(input.preparedID), controller = new AbortController();
        const job = { id: (0, import_node_crypto13.randomUUID)(), target, state: "running", progress: "Choose a ZIP destination in the Windows Save As dialog" };
        const record = { job, preparedID: input.preparedID, controller, path: void 0, used: false };
        if (destinations.size >= 32) destinations.delete(destinations.keys().next().value);
        destinations.set(job.id, record);
        void picker.choose(`${target.sessionID}.zip`, controller.signal).then((result) => {
          if (controller.signal.aborted) result = { state: "cancelled" };
          if (result.state === "selected") {
            validateOutputFile(result.path);
            record.path = result.path;
          }
          Object.assign(job, { state: "ready", destination: result.state, progress: result.state === "selected" ? "Destination selected" : result.state === "cancelled" ? "Export cancelled; no archive was written" : "Save As unavailable; choose a manual output directory", ...result.state === "unavailable" ? { error: result.error } : {} });
        }).catch(() => Object.assign(job, { state: "ready", destination: "unavailable", progress: "Save As unavailable; no archive was written", error: "The Save As dialog failed. Choose a manual output directory and export again." }));
        return respond(response, 202, job);
      }
      if (url.pathname === "/destination/cancel" && request.method === "POST") {
        const input = await body(request), record = destinations.get(input.id);
        if (!record) throw new Error("Unknown destination job.");
        record.controller.abort();
        record.path = void 0;
        Object.assign(record.job, { state: "ready", destination: "cancelled", progress: "Export cancelled; no archive was written" });
        return respond(response, 200, record.job);
      }
      if (url.pathname === "/inventory" && request.method === "GET") {
        const offset = Number(url.searchParams.get("offset") ?? 0);
        if (!Number.isSafeInteger(offset) || offset < 0) throw new Error("Invalid inventory offset.");
        try {
          return respond(response, 200, await exporter.inventory(url.searchParams.get("id") ?? "", offset));
        } catch (error) {
          if (error instanceof Error && error.message.startsWith("The prepared export is missing")) return respond(response, 404, { error: "The prepared inventory is unavailable." });
          throw error;
        }
      }
      if (url.pathname === "/export" && request.method === "POST") {
        const input = await body(request), value = input.options ?? {};
        if (typeof input.preparedID !== "string" || input.preparedID.length > 128 || typeof value !== "object" || value === null) throw new Error("Invalid prepared export.");
        if (value.includeFiles !== void 0 && typeof value.includeFiles !== "boolean") throw new Error("Invalid file-collection option.");
        if (value.outputDirectory !== void 0 && (typeof value.outputDirectory !== "string" || value.outputDirectory.length > 4096)) throw new Error("Invalid output directory.");
        if (value.selectedAssetIDs !== void 0 && (!Array.isArray(value.selectedAssetIDs) || value.selectedAssetIDs.length > 1e3 || value.selectedAssetIDs.some((id) => typeof id !== "string"))) throw new Error("Invalid file selection.");
        let destination;
        if (input.destinationID !== void 0) {
          destination = destinations.get(input.destinationID);
          if (!destination || destination.used || destination.controller.signal.aborted || destination.preparedID !== input.preparedID || destination.job.destination !== "selected" || !destination.path) throw new Error("The selected destination is unavailable, cancelled, used or belongs to another export.");
        }
        const job = exporter.start(input.preparedID, { includeFiles: value.includeFiles === true, selectedAssetIDs: value.selectedAssetIDs, outputDirectory: value.outputDirectory, outputFile: destination?.path });
        if (destination) destination.used = true;
        return respond(response, 202, job);
      }
      respond(response, 404, { error: "Unknown extension route." });
    } catch (error) {
      respond(response, 400, { error: safeError(error) });
    }
  });
  server.once("close", () => {
    transfers.close();
    exporter.close();
    for (const controller of controllers.values()) controller.abort();
    for (const record of destinations.values()) record.controller.abort();
  });
  return server;
}
function bounded(job) {
  const warnings = job.warnings ?? job.prepared?.warnings;
  const count = job.warningCount ?? job.prepared?.warningCount ?? warnings?.length ?? 0;
  return { ...job, ...job.prepared ? { prepared: { ...job.prepared, warnings: job.prepared.warnings.slice(0, 25) } } : {}, ...warnings ? { warnings: warnings.slice(0, 25), additionalWarningCount: Math.max(0, count - 25) } : {} };
}
function respond(response, status, value) {
  const text = JSON.stringify(value);
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  if (Buffer.byteLength(text) > 1024 * 1024) {
    response.writeHead(413);
    response.end('{"error":"Extension metadata exceeds the response safety limit."}');
    return;
  }
  response.writeHead(status);
  response.end(text);
}
async function body(request) {
  let bytes = 0;
  const chunks = [];
  for await (const chunk of request) {
    bytes += chunk.length;
    if (bytes > 64e3) throw new Error("The request exceeds the 64 KB bridge limit.");
    chunks.push(Buffer.from(chunk));
  }
  try {
    const value = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error();
    return value;
  } catch {
    throw new Error("The request must contain a JSON object.");
  }
}
function safeError(error) {
  return error instanceof Error ? error.message.slice(0, 1e3) : "The operation failed.";
}

// src/plugin-client.ts
var import_promises17 = require("node:fs/promises");
var import_node_path16 = require("node:path");
init_private_channel();
var PluginClient = class _PluginClient {
  constructor(root, descriptor) {
    this.root = root;
    this.descriptor = descriptor;
  }
  root;
  descriptor;
  static async connect(packageDirectory2, hostPID = process.ppid, home) {
    const { root, packageKey } = await channelPath(packageDirectory2, hostPID, home);
    const directory = await (0, import_promises17.lstat)(root);
    if (!directory.isDirectory() || directory.isSymbolicLink() || process.platform !== "win32" && (directory.uid !== process.getuid?.() || directory.mode & 63)) throw new Error("The bundled plugin channel is not private.");
    const descriptor = await readJsonFile((0, import_node_path16.join)(root, "connection.json"), 8192);
    if (descriptor.schema !== 1 || descriptor.hostPID !== hostPID || descriptor.packageKey !== packageKey || !UUID.test(descriptor.instanceID) || !Number.isInteger(descriptor.port) || descriptor.port < 1 || descriptor.port > 65535 || !/^[a-f0-9]{64}$/.test(descriptor.token)) throw new Error("The bundled plugin belongs to a different or unsupported host instance.");
    const client = new _PluginClient(root, descriptor), identity = await client.request("/identity");
    if (identity.instanceID !== descriptor.instanceID || identity.pid !== descriptor.pid || identity.hostPID !== hostPID) throw new Error("The bundled plugin process changed. Prepare the operation again.");
    return client;
  }
  connection() {
    return { url: `http://127.0.0.1:${this.descriptor.port}`, token: this.descriptor.token, version: this.descriptor.version };
  }
  get instanceID() {
    return this.descriptor.instanceID;
  }
  async request(path, method = "GET", body2) {
    const response = await fetch(this.connection().url + path, {
      method,
      redirect: "error",
      signal: AbortSignal.timeout(15e3),
      headers: { Authorization: `Bearer ${this.descriptor.token}`, "Content-Type": "application/json" },
      ...body2 === void 0 ? {} : { body: JSON.stringify(body2) }
    });
    const text = await response.text();
    if (Buffer.byteLength(text) > 1024 * 1024) throw new Error("Plugin metadata exceeded its safety limit.");
    let value;
    try {
      value = text ? JSON.parse(text) : {};
    } catch {
      throw new Error("The bundled plugin returned invalid metadata.");
    }
    if (!response.ok) throw new Error(value.error ?? `The bundled plugin returned HTTP ${response.status}.`);
    return value;
  }
};

// src/service-entry.ts
var import_node_path17 = require("node:path");
var import_node_url2 = require("node:url");
var import_node_os5 = require("node:os");
init_private_channel();
var token = process.env.OPENCHAMBER_SERVICE_TOKEN;
var port = Number(process.env.OPENCHAMBER_SERVICE_PORT);
if (!token || !Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Start this service through OpenChamber.");
var resolver = new ConnectionResolver();
var packageDirectory = typeof __dirname === "string" ? __dirname : (0, import_node_path17.dirname)((0, import_node_url2.fileURLToPath)(""));
var plugin = () => PluginClient.connect(packageDirectory);
async function start() {
  const dataDirectory = process.env.OPENCHAMBER_SERVICE_DATA_DIR ?? (0, import_node_path17.join)((0, import_node_os5.homedir)(), ".openchamber-session-export", "service-data", (await channelPath(packageDirectory)).packageKey);
  const server = createService(token, {
    capture: async (target, options2) => {
      let connection;
      try {
        connection = (await plugin()).connection();
      } catch {
        if (options2?.profile === "resume") throw new Error("Approve the bundled OpenCode plugin and open this project before preparing a resume snapshot.");
        connection = await resolver.resolve();
      }
      return new SessionSource(connection).capture(target, options2);
    },
    connection: async () => {
      try {
        return { version: (await plugin()).connection().version, transport: "bundled-plugin" };
      } catch {
        return { version: (await resolver.resolve()).version, transport: "host-opencode" };
      }
    }
  }, { plugin, dataDirectory });
  server.listen(port, "127.0.0.1");
  process.once("SIGTERM", () => server.close());
}
void start().catch(() => {
  console.error("Session Export could not initialize its private service directory.");
  process.exitCode = 1;
});
