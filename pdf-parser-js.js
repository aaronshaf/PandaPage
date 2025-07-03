class $PanicError extends Error {}
function $panic() {
  throw new $PanicError();
}
function $bound_check(arr, index) {
  if (index < 0 || index >= arr.length) throw new Error("Index out of bounds");
}
function moonbitlang$core$abort$$abort$0$(msg) {
  return $panic();
}
function moonbitlang$core$builtin$$StringBuilder$new(size_hint) {
  return { val: "" };
}
function moonbitlang$core$builtin$$println$1$(input) {
  console.log(input);
}
function moonbitlang$core$builtin$$Logger$write_char$2$(self, ch) {
  const _bind = self;
  _bind.val = `${_bind.val}${String.fromCodePoint(ch)}`;
}
function moonbitlang$core$builtin$$Logger$write_string$2$(self, str) {
  const _bind = self;
  _bind.val = `${_bind.val}${str}`;
}
function moonbitlang$core$builtin$$output$46$abs$124$2118(n) {
  return n < 0 ? 0 - n | 0 : n;
}
function moonbitlang$core$builtin$$output$46$write_digits$124$2120(_env, num) {
  const radix = _env._1;
  const logger = _env._0;
  const num2 = num / radix | 0;
  if (num2 !== 0) {
    moonbitlang$core$builtin$$output$46$write_digits$124$2120(_env, num2);
  }
  const _tmp = moonbitlang$core$builtin$$output$46$abs$124$2118(num % radix | 0);
  $bound_check("0123456789abcdefghijklmnopqrstuvwxyz", _tmp);
  logger.method_2(logger.self, "0123456789abcdefghijklmnopqrstuvwxyz".charCodeAt(_tmp));
}
function moonbitlang$core$int$$Int$output(self, logger, radix) {
  if (self < 0) {
    logger.method_2(logger.self, 45);
  }
  const _env = { _0: logger, _1: radix };
  moonbitlang$core$builtin$$output$46$write_digits$124$2120(_env, moonbitlang$core$builtin$$output$46$abs$124$2118(self));
}
function moonbitlang$core$int$$Int$output_size_hint(radix) {
  return radix >= 2 && radix < 7 ? 36 : radix >= 8 && radix < 15 ? 18 : radix >= 16 && radix <= 36 ? 10 : moonbitlang$core$abort$$abort$0$("radix must be between 2 and 36");
}
function moonbitlang$core$string$$String$substring(self, start, end) {
  const len = self.length;
  let end$2;
  if (end === undefined) {
    end$2 = len;
  } else {
    const _Some = end;
    const _end = _Some;
    end$2 = _end;
  }
  return start >= 0 && (start <= end$2 && end$2 <= len) ? self.substring(start, end$2) : $panic();
}
function moonbitlang$core$builtin$$Logger$write_substring$2$(self, str, start, len) {
  const _bind = self;
  _bind.val = `${_bind.val}${moonbitlang$core$string$$String$substring(str, start, start + len | 0)}`;
}
function moonbitlang$core$int$$Int$to_string(self, radix) {
  const buf = moonbitlang$core$builtin$$StringBuilder$new(moonbitlang$core$int$$Int$output_size_hint(radix));
  moonbitlang$core$int$$Int$output(self, { self: buf, method_0: moonbitlang$core$builtin$$Logger$write_string$2$, method_1: moonbitlang$core$builtin$$Logger$write_substring$2$, method_2: moonbitlang$core$builtin$$Logger$write_char$2$ }, radix);
  return buf.val;
}
(() => {
  moonbitlang$core$builtin$$println$1$("WASM is working! 🎉");
  moonbitlang$core$builtin$$println$1$("PDFWasm Parser v0.1.0 - MoonBit + WebAssembly");
  const _p = 5;
  const _p$2 = 3;
  moonbitlang$core$builtin$$println$1$(`Test addition: ${moonbitlang$core$int$$Int$to_string(_p + _p$2 | 0, 10)}`);
})();
