function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object.keys(descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;
  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }
  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);
  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }
  if (desc.initializer === void 0) {
    Object.defineProperty(target, property, desc);
    desc = null;
  }
  return desc;
}

// make PromiseIndex a nominal typing
var PromiseIndexBrand;
(function (PromiseIndexBrand) {
  PromiseIndexBrand[PromiseIndexBrand["_"] = -1] = "_";
})(PromiseIndexBrand || (PromiseIndexBrand = {}));
const TYPE_KEY = "typeInfo";
var TypeBrand;
(function (TypeBrand) {
  TypeBrand["BIGINT"] = "bigint";
  TypeBrand["DATE"] = "date";
})(TypeBrand || (TypeBrand = {}));
const ERR_INCONSISTENT_STATE = "The collection is an inconsistent state. Did previous smart contract execution terminate unexpectedly?";
const ERR_INDEX_OUT_OF_BOUNDS = "Index out of bounds";
/**
 * Asserts that the expression passed to the function is truthy, otherwise throws a new Error with the provided message.
 *
 * @param expression - The expression to be asserted.
 * @param message - The error message to be printed.
 */
function assert(expression, message) {
  if (!expression) {
    throw new Error("assertion failed: " + message);
  }
}
function getValueWithOptions(value, options = {
  deserializer: deserialize
}) {
  if (value === null) {
    return options?.defaultValue ?? null;
  }
  const deserialized = deserialize(value);
  if (deserialized === undefined || deserialized === null) {
    return options?.defaultValue ?? null;
  }
  if (options?.reconstructor) {
    return options.reconstructor(deserialized);
  }
  return deserialized;
}
function serializeValueWithOptions(value, {
  serializer
} = {
  serializer: serialize
}) {
  return serializer(value);
}
function serialize(valueToSerialize) {
  return encode(JSON.stringify(valueToSerialize, function (key, value) {
    if (typeof value === "bigint") {
      return {
        value: value.toString(),
        [TYPE_KEY]: TypeBrand.BIGINT
      };
    }
    if (typeof this[key] === "object" && this[key] !== null && this[key] instanceof Date) {
      return {
        value: this[key].toISOString(),
        [TYPE_KEY]: TypeBrand.DATE
      };
    }
    return value;
  }));
}
function deserialize(valueToDeserialize) {
  return JSON.parse(decode(valueToDeserialize), (_, value) => {
    if (value !== null && typeof value === "object" && Object.keys(value).length === 2 && Object.keys(value).every(key => ["value", TYPE_KEY].includes(key))) {
      switch (value[TYPE_KEY]) {
        case TypeBrand.BIGINT:
          return BigInt(value["value"]);
        case TypeBrand.DATE:
          return new Date(value["value"]);
      }
    }
    return value;
  });
}
/**
 * Convert a string to Uint8Array, each character must have a char code between 0-255.
 * @param s - string that with only Latin1 character to convert
 * @returns result Uint8Array
 */
function bytes(s) {
  return env.latin1_string_to_uint8array(s);
}
/**
 * Convert a Uint8Array to string, each uint8 to the single character of that char code
 * @param a - Uint8Array to convert
 * @returns result string
 */
function str(a) {
  return env.uint8array_to_latin1_string(a);
}
/**
 * Encode the string to Uint8Array with UTF-8 encoding
 * @param s - String to encode
 * @returns result Uint8Array
 */
function encode(s) {
  return env.utf8_string_to_uint8array(s);
}
/**
 * Decode the Uint8Array to string in UTF-8 encoding
 * @param a - array to decode
 * @returns result string
 */
function decode(a) {
  return env.uint8array_to_utf8_string(a);
}

var CurveType;
(function (CurveType) {
  CurveType[CurveType["ED25519"] = 0] = "ED25519";
  CurveType[CurveType["SECP256K1"] = 1] = "SECP256K1";
})(CurveType || (CurveType = {}));
var DataLength;
(function (DataLength) {
  DataLength[DataLength["ED25519"] = 32] = "ED25519";
  DataLength[DataLength["SECP256K1"] = 64] = "SECP256K1";
})(DataLength || (DataLength = {}));

/**
 * A Promise result in near can be one of:
 * - NotReady = 0 - the promise you are specifying is still not ready, not yet failed nor successful.
 * - Successful = 1 - the promise has been successfully executed and you can retrieve the resulting value.
 * - Failed = 2 - the promise execution has failed.
 */
var PromiseResult;
(function (PromiseResult) {
  PromiseResult[PromiseResult["NotReady"] = 0] = "NotReady";
  PromiseResult[PromiseResult["Successful"] = 1] = "Successful";
  PromiseResult[PromiseResult["Failed"] = 2] = "Failed";
})(PromiseResult || (PromiseResult = {}));
/**
 * A promise error can either be due to the promise failing or not yet being ready.
 */
var PromiseError;
(function (PromiseError) {
  PromiseError[PromiseError["Failed"] = 0] = "Failed";
  PromiseError[PromiseError["NotReady"] = 1] = "NotReady";
})(PromiseError || (PromiseError = {}));

const U64_MAX = 2n ** 64n - 1n;
const EVICTED_REGISTER = U64_MAX - 1n;
/**
 * Logs parameters in the NEAR WASM virtual machine.
 *
 * @param params - Parameters to log.
 */
function log(...params) {
  env.log(params.reduce((accumulated, parameter, index) => {
    // Stringify undefined
    const param = parameter === undefined ? "undefined" : parameter;
    // Convert Objects to strings and convert to string
    const stringified = typeof param === "object" ? JSON.stringify(param) : `${param}`;
    if (index === 0) {
      return stringified;
    }
    return `${accumulated} ${stringified}`;
  }, ""));
}
/**
 * Returns the account ID of the account that called the function.
 * Can only be called in a call or initialize function.
 */
function predecessorAccountId() {
  env.predecessor_account_id(0);
  return str(env.read_register(0));
}
/**
 * Returns the account ID of the current contract - the contract that is being executed.
 */
function currentAccountId() {
  env.current_account_id(0);
  return str(env.read_register(0));
}
/**
 * Returns the amount of NEAR attached to this function call.
 * Can only be called in payable functions.
 */
function attachedDeposit() {
  return env.attached_deposit();
}
/**
 * Reads the value from NEAR storage that is stored under the provided key.
 *
 * @param key - The key to read from storage.
 */
function storageReadRaw(key) {
  const returnValue = env.storage_read(key, 0);
  if (returnValue !== 1n) {
    return null;
  }
  return env.read_register(0);
}
/**
 * Get the last written or removed value from NEAR storage.
 */
function storageGetEvictedRaw() {
  return env.read_register(EVICTED_REGISTER);
}
/**
 * Writes the provided bytes to NEAR storage under the provided key.
 *
 * @param key - The key under which to store the value.
 * @param value - The value to store.
 */
function storageWriteRaw(key, value) {
  return env.storage_write(key, value, EVICTED_REGISTER) === 1n;
}
/**
 * Removes the value of the provided key from NEAR storage.
 *
 * @param key - The key to be removed.
 */
function storageRemoveRaw(key) {
  return env.storage_remove(key, EVICTED_REGISTER) === 1n;
}
/**
 * Returns the arguments passed to the current smart contract call.
 */
function inputRaw() {
  env.input(0);
  return env.read_register(0);
}
/**
 * Returns the arguments passed to the current smart contract call as utf-8 string.
 */
function input() {
  return decode(inputRaw());
}
/**
 * Returns a random string of bytes.
 */
function randomSeed() {
  env.random_seed(0);
  return env.read_register(0);
}
/**
 * Create a NEAR promise which will have multiple promise actions inside.
 *
 * @param accountId - The account ID of the target contract.
 */
function promiseBatchCreate(accountId) {
  return env.promise_batch_create(accountId);
}
/**
 * Attach a transfer promise action to the NEAR promise index with the provided promise index.
 *
 * @param promiseIndex - The index of the promise to attach a transfer action to.
 * @param amount - The amount of NEAR to transfer.
 */
function promiseBatchActionTransfer(promiseIndex, amount) {
  env.promise_batch_action_transfer(promiseIndex, amount);
}

function indexToKey(prefix, index) {
  const data = new Uint32Array([index]);
  const array = new Uint8Array(data.buffer);
  const key = str(array);
  return prefix + key;
}
/**
 * An iterable implementation of vector that stores its content on the trie.
 * Uses the following map: index -> element
 */
class Vector {
  /**
   * @param prefix - The byte prefix to use when storing elements inside this collection.
   * @param length - The initial length of the collection. By default 0.
   */
  constructor(prefix, length = 0) {
    this.prefix = prefix;
    this.length = length;
  }
  /**
   * Checks whether the collection is empty.
   */
  isEmpty() {
    return this.length === 0;
  }
  /**
   * Get the data stored at the provided index.
   *
   * @param index - The index at which to look for the data.
   * @param options - Options for retrieving the data.
   */
  get(index, options) {
    if (index >= this.length) {
      return options?.defaultValue ?? null;
    }
    const storageKey = indexToKey(this.prefix, index);
    const value = storageReadRaw(bytes(storageKey));
    return getValueWithOptions(value, options);
  }
  /**
   * Removes an element from the vector and returns it in serialized form.
   * The removed element is replaced by the last element of the vector.
   * Does not preserve ordering, but is `O(1)`.
   *
   * @param index - The index at which to remove the element.
   * @param options - Options for retrieving and storing the data.
   */
  swapRemove(index, options) {
    assert(index < this.length, ERR_INDEX_OUT_OF_BOUNDS);
    if (index + 1 === this.length) {
      return this.pop(options);
    }
    const key = indexToKey(this.prefix, index);
    const last = this.pop(options);
    assert(storageWriteRaw(bytes(key), serializeValueWithOptions(last, options)), ERR_INCONSISTENT_STATE);
    const value = storageGetEvictedRaw();
    return getValueWithOptions(value, options);
  }
  /**
   * Adds data to the collection.
   *
   * @param element - The data to store.
   * @param options - Options for storing the data.
   */
  push(element, options) {
    const key = indexToKey(this.prefix, this.length);
    this.length += 1;
    storageWriteRaw(bytes(key), serializeValueWithOptions(element, options));
  }
  /**
   * Removes and retrieves the element with the highest index.
   *
   * @param options - Options for retrieving the data.
   */
  pop(options) {
    if (this.isEmpty()) {
      return options?.defaultValue ?? null;
    }
    const lastIndex = this.length - 1;
    const lastKey = indexToKey(this.prefix, lastIndex);
    this.length -= 1;
    assert(storageRemoveRaw(bytes(lastKey)), ERR_INCONSISTENT_STATE);
    const value = storageGetEvictedRaw();
    return getValueWithOptions(value, options);
  }
  /**
   * Replaces the data stored at the provided index with the provided data and returns the previously stored data.
   *
   * @param index - The index at which to replace the data.
   * @param element - The data to replace with.
   * @param options - Options for retrieving and storing the data.
   */
  replace(index, element, options) {
    assert(index < this.length, ERR_INDEX_OUT_OF_BOUNDS);
    const key = indexToKey(this.prefix, index);
    assert(storageWriteRaw(bytes(key), serializeValueWithOptions(element, options)), ERR_INCONSISTENT_STATE);
    const value = storageGetEvictedRaw();
    return getValueWithOptions(value, options);
  }
  /**
   * Extends the current collection with the passed in array of elements.
   *
   * @param elements - The elements to extend the collection with.
   */
  extend(elements) {
    for (const element of elements) {
      this.push(element);
    }
  }
  [Symbol.iterator]() {
    return new VectorIterator(this);
  }
  /**
   * Create a iterator on top of the default collection iterator using custom options.
   *
   * @param options - Options for retrieving and storing the data.
   */
  createIteratorWithOptions(options) {
    return {
      [Symbol.iterator]: () => new VectorIterator(this, options)
    };
  }
  /**
   * Return a JavaScript array of the data stored within the collection.
   *
   * @param options - Options for retrieving and storing the data.
   */
  toArray(options) {
    const array = [];
    const iterator = options ? this.createIteratorWithOptions(options) : this;
    for (const value of iterator) {
      array.push(value);
    }
    return array;
  }
  /**
   * Remove all of the elements stored within the collection.
   */
  clear() {
    for (let index = 0; index < this.length; index++) {
      const key = indexToKey(this.prefix, index);
      storageRemoveRaw(bytes(key));
    }
    this.length = 0;
  }
  /**
   * Serialize the collection.
   *
   * @param options - Options for storing the data.
   */
  serialize(options) {
    return serializeValueWithOptions(this, options);
  }
  /**
   * Converts the deserialized data from storage to a JavaScript instance of the collection.
   *
   * @param data - The deserialized data to create an instance from.
   */
  static reconstruct(data) {
    const vector = new Vector(data.prefix, data.length);
    return vector;
  }
}
/**
 * An iterator for the Vector collection.
 */
class VectorIterator {
  /**
   * @param vector - The vector collection to create an iterator for.
   * @param options - Options for retrieving and storing data.
   */
  constructor(vector, options) {
    this.vector = vector;
    this.options = options;
    this.current = 0;
  }
  next() {
    if (this.current >= this.vector.length) {
      return {
        value: null,
        done: true
      };
    }
    const value = this.vector.get(this.current, this.options);
    this.current += 1;
    return {
      value,
      done: false
    };
  }
}

/**
 * Tells the SDK to expose this function as a view function.
 *
 * @param _empty - An empty object.
 */
function view(_empty) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (_target, _key, _descriptor
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  ) {};
}
function call({
  privateFunction = false,
  payableFunction = false
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (_target, _key, descriptor) {
    const originalMethod = descriptor.value;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    descriptor.value = function (...args) {
      if (privateFunction && predecessorAccountId() !== currentAccountId()) {
        throw new Error("Function is private");
      }
      if (!payableFunction && attachedDeposit() > 0n) {
        throw new Error("Function is not payable");
      }
      return originalMethod.apply(this, args);
    };
  };
}
function NearBindgen({
  requireInit = false,
  serializer = serialize,
  deserializer = deserialize
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return target => {
    return class extends target {
      static _create() {
        return new target();
      }
      static _getState() {
        const rawState = storageReadRaw(bytes("STATE"));
        return rawState ? this._deserialize(rawState) : null;
      }
      static _saveToStorage(objectToSave) {
        storageWriteRaw(bytes("STATE"), this._serialize(objectToSave));
      }
      static _getArgs() {
        return JSON.parse(input() || "{}");
      }
      static _serialize(value, forReturn = false) {
        if (forReturn) {
          return encode(JSON.stringify(value, (_, value) => typeof value === "bigint" ? `${value}` : value));
        }
        return serializer(value);
      }
      static _deserialize(value) {
        return deserializer(value);
      }
      static _reconstruct(classObject, plainObject) {
        for (const item in classObject) {
          const reconstructor = classObject[item].constructor?.reconstruct;
          classObject[item] = reconstructor ? reconstructor(plainObject[item]) : plainObject[item];
        }
        return classObject;
      }
      static _requireInit() {
        return requireInit;
      }
    };
  };
}

// 0.5 NEAR in YoctoNEAR as smart contracts always calculate in YoctoNEAR
const POINT_FIVE = '500000000000000000000000';
class GeneratedFilmCombination {
  /**
  * Generates a new film combination based on specified parameters.
  * @returns {GeneratedFilmCombination} A new film combination.
  */
  constructor(size, format, iso) {
    this.size = size;
    this.format = format;
    this.iso = iso;
  }
}

var t = function (r, n) {
  return t = Object.setPrototypeOf || {
    __proto__: []
  } instanceof Array && function (t, r) {
    t.__proto__ = r;
  } || function (t, r) {
    for (var n in r) Object.prototype.hasOwnProperty.call(r, n) && (t[n] = r[n]);
  }, t(r, n);
};
function r(r, n) {
  if ("function" != typeof n && null !== n) throw new TypeError("Class extends value " + String(n) + " is not a constructor or null");
  function i() {
    this.constructor = r;
  }
  t(r, n), r.prototype = null === n ? Object.create(n) : (i.prototype = n.prototype, new i());
}
var n,
  i = function () {
    function t() {}
    return t._xfnv1a = function (t) {
      for (var r = 2166136261, n = 0; n < t.length; n++) r = Math.imul(r ^ t.charCodeAt(n), 16777619);
      return function () {
        return r += r << 13, r ^= r >>> 7, r += r << 3, r ^= r >>> 17, (r += r << 5) >>> 0;
      };
    }, t;
  }(),
  s = function (t) {
    function n(r) {
      var i = t.call(this) || this;
      return i.a = n._xfnv1a(r)(), i;
    }
    return r(n, t), n.prototype.next = function () {
      var t = this.a += 1831565813;
      return t = Math.imul(t ^ t >>> 15, 1 | t), (((t ^= t + Math.imul(t ^ t >>> 7, 61 | t)) ^ t >>> 14) >>> 0) / 4294967296;
    }, n;
  }(i),
  o = function (t) {
    function n(r) {
      var i = t.call(this) || this,
        s = n._xfnv1a(r);
      return i.a = s(), i.b = s(), i.c = s(), i.d = s(), i;
    }
    return r(n, t), n.prototype.next = function () {
      this.a >>>= 0, this.b >>>= 0, this.c >>>= 0, this.d >>>= 0;
      var t = this.a + this.b | 0;
      return this.a = this.b ^ this.b >>> 9, this.b = this.c + (this.c << 3) | 0, this.c = this.c << 21 | this.c >>> 11, this.d = this.d + 1 | 0, t = t + this.d | 0, this.c = this.c + t | 0, (t >>> 0) / 4294967296;
    }, n;
  }(i),
  e = function (t) {
    function n(r) {
      var i = t.call(this) || this,
        s = n._xfnv1a(r);
      return i.a = s(), i.b = s(), i.c = s(), i.d = s(), i;
    }
    return r(n, t), n.prototype.next = function () {
      var t = this.b << 9,
        r = 5 * this.a;
      return r = r << 7 | 9 * (r >>> 25), this.c ^= this.a, this.d ^= this.b, this.b ^= this.c, this.a ^= this.d, this.c ^= t, this.d = this.d << 11 | this.d >>> 21, (r >>> 0) / 4294967296;
    }, n;
  }(i);
!function (t) {
  t.sfc32 = "sfc32", t.mulberry32 = "mulberry32", t.xoshiro128ss = "xoshiro128ss";
}(n || (n = {}));
var u = function () {
  function t(t, r) {
    void 0 === r && (r = n.sfc32), this.str = t, this.prng = r, this.generator = this._initializeGenerator();
  }
  return t.prototype.next = function () {
    return this.generator.next();
  }, t.prototype._initializeGenerator = function () {
    if (function (t) {
      return null === t;
    }(t = this.str) || function (t) {
      return void 0 === t;
    }(t)) return this.wrap();
    var t;
    switch (this.prng) {
      case "sfc32":
        return new o(this.str);
      case "mulberry32":
        return new s(this.str);
      case "xoshiro128ss":
        return new e(this.str);
      default:
        return this.wrap();
    }
  }, t.prototype.wrap = function () {
    return {
      next: function () {
        return Math.random();
      }
    };
  }, t;
}();

var _dec, _dec2, _dec3, _dec4, _dec5, _class, _class2;

// helper function to take care of random generation and value definition
function generateNewFilmCombination() {
  // define possible values for film size, format, and ISO
  const sizes = ["135", "120"];
  const formats = ["Color", "BnW"];
  const isoValues = ["25", "32", "50", "100", "125", "160", "200", "400", "800", "1600", "3200"];

  // use NEAR random seed for seeding the random number generator,
  // which will then be used to pick random values from the arrays above
  const rand = new u(randomSeed().toString());

  // randomly select values for size, format, and ISO
  const randomSize = sizes[Math.floor(rand.next() * sizes.length)];
  //near.log(randomSize);
  const randomFormat = formats[Math.floor(rand.next() * formats.length)];
  //near.log(randomFormat);
  const randomIso = isoValues[Math.floor(rand.next() * isoValues.length)];
  //near.log(randomIso);

  const generatedFilmCombination = new GeneratedFilmCombination(randomSize, randomFormat, randomIso);
  return generatedFilmCombination;
}

// ### The Film Combination Generator###

// Annotation for declaring a NEAR contract
let FilmGeneratorNear = (_dec = NearBindgen({}), _dec2 = view(), _dec3 = call({
  payableFunction: true
}), _dec4 = view(), _dec5 = call({
  payableFunction: true
}), _dec(_class = (_class2 = class FilmGeneratorNear {
  film_combinations = new Vector("v-uid");

  // view functions are read-only, no transaction fees
  // Returns the last 10 saved film combinations, any older than that and they have to be viewed on the Blockchain explorer
  get_film_combinations({
    from_index = 0,
    limit = 10
  }) {
    const sorted_film_combinations = this.film_combinations.toArray().sort((a, b) => b.date.getTime() - a.date.getTime());
    return sorted_film_combinations.slice(from_index, from_index + limit);
  }

  // call functions require tokens for the transfer/storage cost
  // Public - Saves a generated film combination to the blockchain
  save_film_combination({
    size,
    format,
    iso,
    camera,
    date
  }) {
    // If the user attaches more than 0.1N the message is premium
    const analogSupporter = attachedDeposit() >= BigInt(POINT_FIVE);
    const photographer = predecessorAccountId();
    const dateConverted = new Date(date);
    const SavedFilmCombination = {
      analogSupporter,
      photographer,
      size,
      format,
      iso,
      camera,
      date: dateConverted
    };
    this.film_combinations.push(SavedFilmCombination);
  }
  // Returns a freshly generated, random film combination
  get_film_combination() {
    return generateNewFilmCombination();
  }

  // essentially a regular transaction to donate attached deposit to a photographer (ex. from the list in the fronted)
  donate_to_photographer({
    photographerToDonateTo
  }) {
    // Get who is calling the method and how much $NEAR they attached
    let donor = predecessorAccountId();
    let donationAmount = attachedDeposit();
    let toTransfer = donationAmount;
    log(`Thank you ${donor} for donating ${donationAmount} to ${photographerToDonateTo}! You have supported their analog journey with digital currency`);

    // Send the money to the beneficiary
    const promise = promiseBatchCreate(photographerToDonateTo);
    promiseBatchActionTransfer(promise, toTransfer);
  }
}, (_applyDecoratedDescriptor(_class2.prototype, "get_film_combinations", [_dec2], Object.getOwnPropertyDescriptor(_class2.prototype, "get_film_combinations"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "save_film_combination", [_dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "save_film_combination"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "get_film_combination", [_dec4], Object.getOwnPropertyDescriptor(_class2.prototype, "get_film_combination"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "donate_to_photographer", [_dec5], Object.getOwnPropertyDescriptor(_class2.prototype, "donate_to_photographer"), _class2.prototype)), _class2)) || _class);
function donate_to_photographer() {
  const _state = FilmGeneratorNear._getState();
  if (!_state && FilmGeneratorNear._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = FilmGeneratorNear._create();
  if (_state) {
    FilmGeneratorNear._reconstruct(_contract, _state);
  }
  const _args = FilmGeneratorNear._getArgs();
  const _result = _contract.donate_to_photographer(_args);
  FilmGeneratorNear._saveToStorage(_contract);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(FilmGeneratorNear._serialize(_result, true));
}
function get_film_combination() {
  const _state = FilmGeneratorNear._getState();
  if (!_state && FilmGeneratorNear._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = FilmGeneratorNear._create();
  if (_state) {
    FilmGeneratorNear._reconstruct(_contract, _state);
  }
  const _args = FilmGeneratorNear._getArgs();
  const _result = _contract.get_film_combination(_args);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(FilmGeneratorNear._serialize(_result, true));
}
function save_film_combination() {
  const _state = FilmGeneratorNear._getState();
  if (!_state && FilmGeneratorNear._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = FilmGeneratorNear._create();
  if (_state) {
    FilmGeneratorNear._reconstruct(_contract, _state);
  }
  const _args = FilmGeneratorNear._getArgs();
  const _result = _contract.save_film_combination(_args);
  FilmGeneratorNear._saveToStorage(_contract);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(FilmGeneratorNear._serialize(_result, true));
}
function get_film_combinations() {
  const _state = FilmGeneratorNear._getState();
  if (!_state && FilmGeneratorNear._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = FilmGeneratorNear._create();
  if (_state) {
    FilmGeneratorNear._reconstruct(_contract, _state);
  }
  const _args = FilmGeneratorNear._getArgs();
  const _result = _contract.get_film_combinations(_args);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(FilmGeneratorNear._serialize(_result, true));
}

export { donate_to_photographer, get_film_combination, get_film_combinations, save_film_combination };
//# sourceMappingURL=film-generator-near.js.map
