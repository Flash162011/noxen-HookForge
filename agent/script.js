import Java_bridge from 'frida-java-bridge';

const Java = typeof globalThis.Java !== 'undefined' ? globalThis.Java : Java_bridge;

try { globalThis.Java = Java; } catch (_) {}

var lock = null;
var ObjectJava = null;
var UriJava = null;

var blockEnabled = true;
var waiting = false;
var activeDecisionId = null;
var resumeMode = "forward";
var modQueue = [];
var argModQueue = [];
var returnModQueue = [];
var holdCounter = 0;
var decisionCounter = 0;

function getStackTrace() {
  var trace = [];
  var stack = Java.use("java.lang.Thread").currentThread().getStackTrace();
  for (var i = 2; i < stack.length; i++) {
    trace.push(stack[i].toString());
  }
  return trace;
}

function getProcessName() {
  try {
    var ActivityThread = Java.use("android.app.ActivityThread");
    var name = ActivityThread.currentProcessName();
    return name ? String(name) : "";
  } catch (e) {
    return "";
  }
}

function getPackageName() {
  try {
    var ActivityThread = Java.use("android.app.ActivityThread");
    var app = ActivityThread.currentApplication();
    if (app) return String(app.getPackageName());
  } catch (e) {}
  return "";
}

function beginHold(className, methodName) {
  holdCounter += 1;
  var holdId = "noxen-" + Process.id + "-" + holdCounter;
  send({
    "noxenEvent": "hold_start",
    "holdId": holdId,
    "pid": Process.id,
    "packageName": getPackageName(),
    "processName": getProcessName(),
    "className": className,
    "methodName": methodName
  });
  return holdId;
}

function endHold(holdId) {
  if (!holdId) return;
  send({
    "noxenEvent": "hold_end",
    "holdId": holdId,
    "pid": Process.id
  });
}

function dumpIntent(intent) {
  var infoIntent = {};
  if (intent === null) return infoIntent;

  try {
    var component = intent.getComponent();
    infoIntent.component = component ? (component.getPackageName() + "/" + component.getClassName()) : null;
    infoIntent.action = intent.getAction() || null;
    infoIntent.data = intent.getDataString() || null;
    infoIntent.flags = intent.getFlags();

    var cats = intent.getCategories();
    var catList = [];

    if (cats !== null) {
      var iterator = cats.iterator();
      while (iterator.hasNext()) {
        catList.push(iterator.next().toString());
      }
    }

    infoIntent.categories = catList;

    var extrasObj = {};
    var extras = intent.getExtras();

    if (extras) {
      var iterator2 = extras.keySet().iterator();
      while (iterator2.hasNext()) {
        var key = iterator2.next();
        var value = extras.get(key);
        var type = value ? value.getClass().getName() : null;
        extrasObj[key] = {
          type: type,
          value: value ? value.toString() : null
        };
      }
    }

    infoIntent.extras = extrasObj;

  } catch (e) {
    send("[!] Intent dump failed: " + e);
  }

  return infoIntent;
}

function applyModifications(intent) {
  if (!intent || modQueue.length === 0) return;

  try {
    modQueue.forEach(function(mod) {
      if (mod.type === "action") {
        intent.setAction(mod.val);
      }
      else if (mod.type === "data") {
        if (UriJava) intent.setData(UriJava.parse(mod.val));
      }
      else if (mod.type === "cat_add") {
        intent.addCategory(mod.val);
      }
      else if (mod.type === "cat_rem") {
        intent.removeCategory(mod.val);
      }
      else if (mod.type === "flag_add") {
        var f = intent.getFlags();
        intent.setFlags(f | parseInt(mod.val));
      }
      else if (mod.type === "flag_rem") {
        var f2 = intent.getFlags();
        intent.setFlags(f2 & ~parseInt(mod.val));
      }
      else if (mod.type === "extra_rem") {
        intent.removeExtra(mod.key);
      }
      else if (mod.type === "extra_add") {
        var key = mod.key;
        var val = mod.val;
        var eType = mod.extraType || "string";

        if (eType === "int") {
          intent.putExtra.overload("java.lang.String", "int").call(intent, key, parseInt(val));
        }
        else if (eType === "bool" || eType === "boolean") {
          var bVal = (String(val).toLowerCase() === "true");
          intent.putExtra.overload("java.lang.String", "boolean").call(intent, key, bVal);
        }
        else if (eType === "long") {
          intent.putExtra.overload("java.lang.String", "long").call(intent, key, int64(val));
        }
        else if (eType === "float") {
          intent.putExtra.overload("java.lang.String", "float").call(intent, key, parseFloat(val));
        }
        else if (eType === "double") {
          intent.putExtra.overload("java.lang.String", "double").call(intent, key, parseFloat(val));
        }
        else {
          intent.putExtra.overload("java.lang.String", "java.lang.String").call(intent, key, String(val));
        }
      }
    });
  } catch (e) {
    send("[!] Error applying modifications: " + e);
  }

  modQueue = [];
}

var RECEIVING_METHODS = {
  "getIntent": true,
  "onNewIntent": true,
  "onActivityResult": true,
  "setResult": true,
  "onReceive": true,
  "onStartCommand": true,
  "onBind": true
};

function buildAttackSurface(methodName, intent, self, firstArg) {
  var result = {};

  try {
    if (RECEIVING_METHODS[methodName]) {
      var context = (methodName === "onReceive") ? firstArg : self;
      var pm = context.getPackageManager();
      var pkgName = context.getPackageName();
      var runtimeClass = self.$className;
      var ComponentName = Java.use("android.content.ComponentName");
      var cn = ComponentName.$new(pkgName, runtimeClass);
      var exported;

      if (methodName === "onReceive") {
        exported = pm.getReceiverInfo(cn, 0).exported.value;
      } else if (methodName === "onStartCommand" || methodName === "onBind") {
        exported = pm.getServiceInfo(cn, 0).exported.value;
      } else {
        exported = pm.getActivityInfo(cn, 0).exported.value;
      }

      result.callerExported = exported;

    } else if (intent !== null) {
      result.intentExplicit = intent.getComponent() !== null;
    }
  } catch(e) {}

  return result;
}

function dumpArgs(args) {
  var out = [];

  for (var i = 0; i < args.length; i++) {
    try {
      var v = args[i];

      out.push({
        index: i,
        type: v && v.$className ? v.$className : typeof v,
        value: v === null || v === undefined ? null : String(v)
      });

    } catch (e) {
      out.push({
        index: i,
        type: "unknown",
        value: "<error: " + e + ">"
      });
    }
  }

  return out;
}

function applyArgumentModifications(args) {
  if (!args || argModQueue.length === 0) return args;

  try {
    argModQueue.forEach(function(mod) {
      var idx = parseInt(mod.index);

      if (idx < 0 || idx >= args.length) {
        send("[!] Invalid argument index: " + idx);
        return;
      }

      if (mod.type === "java.lang.String" || mod.type === "string") {
        args[idx] = Java.use("java.lang.String").$new(String(mod.value));
      } else if (mod.type === "int") {
        args[idx] = parseInt(mod.value);
      } else if (mod.type === "boolean" || mod.type === "bool") {
        args[idx] = String(mod.value).toLowerCase() === "true";
      } else {
        args[idx] = mod.value;
      }

      send("[+] Applied argument modification: arg[" + idx + "]");
    });
  } catch (e) {
    send("[!] Error applying argument modifications: " + e);
  }

  argModQueue = [];
  return args;
}

function applyReturnModification(result, returnType) {
  if (returnModQueue.length === 0) return result;

  try {
    var mod = returnModQueue[returnModQueue.length - 1];
    returnModQueue = [];

    send("[+] Applied return value modification");

    if (returnType === "java.lang.String" || returnType === "string") {
      return Java.use("java.lang.String").$new(String(mod.value));
    }

    if (returnType === "boolean" || returnType === "bool") {
      return String(mod.value).toLowerCase() === "true";
    }

    if (returnType === "int") {
      return parseInt(mod.value);
    }

    return mod.value;
  } catch (e) {
    send("[!] Error applying return value modification: " + e);
    return result;
  }
}

function processReturnIntercept(className, methodName, methodArgs, result, returnType) {
  var shouldDrop = false;
  var holdId = null;
  var decisionId = null;
  var isBlocking = false;

  try {
    var willBlock = blockEnabled && !waiting;

    if (willBlock) {
      waiting = true;
      isBlocking = true;
      decisionCounter += 1;
      decisionId = "decision-" + Process.id + "-" + decisionCounter;
      activeDecisionId = decisionId;
      resumeMode = "forward";
      modQueue = [];
      argModQueue = [];
      returnModQueue = [];
    }

    send({
      "className": className,
      "methodName": methodName,
      "stackTrace": getStackTrace(),
      "infoIntent": {},
      "methodArgs": methodArgs || [],
      "methodReturn": {
        "type": returnType || "unknown",
        "value": result === null || result === undefined ? null : String(result)
      },
      "pendingIntentFlags": null,
      "attackSurface": {},
      "decision": {
        "required": willBlock,
        "id": decisionId,
        "reason": willBlock ? null : (blockEnabled ? "busy" : "intercept_off")
      }
    });

    if (!willBlock) return { drop: false, value: result };

    holdId = beginHold(className, methodName + " return");

    Java.synchronized(lock, function () {
      lock.wait();
    });

    var mode = resumeMode;

    if (mode === "drop") {
      shouldDrop = true;
    } else if (mode === "forward") {
      result = applyReturnModification(result, returnType);
    }

    resumeMode = "forward";
  } catch (e) {
    send("[Return Blocking Error] " + e);
  } finally {
    if (isBlocking) {
      endHold(holdId);
      waiting = false;
      activeDecisionId = null;
    }
  }

  return { drop: shouldDrop, value: result };
}

function processIntercept(className, methodName, intent, pendingIntentFlags, attackSurface, methodArgs) {
  var shouldDrop = false;
  var holdId = null;
  var decisionId = null;
  var isBlocking = false;

  try {
    var willBlock = blockEnabled && !waiting;

    if (willBlock) {
      waiting = true;
      isBlocking = true;
      decisionCounter += 1;
      decisionId = "decision-" + Process.id + "-" + decisionCounter;
      activeDecisionId = decisionId;
      resumeMode = "forward";
      modQueue = [];
      argModQueue = [];
    }

    var infoIntent = dumpIntent(intent);

    console.log("[DEBUG] methodArgs:");
    console.log(JSON.stringify(methodArgs));

    send({
      "className": className,
      "methodName": methodName,
      "stackTrace": getStackTrace(),
      "infoIntent": infoIntent,
      "methodArgs": methodArgs || [],
      "pendingIntentFlags": pendingIntentFlags !== undefined ? pendingIntentFlags : null,
      "attackSurface": attackSurface || null,
      "decision": {
        "required": willBlock,
        "id": decisionId,
        "reason": willBlock ? null : (blockEnabled ? "busy" : "intercept_off")
      }
    });

    if (!willBlock) return false;

    holdId = beginHold(className, methodName);

    Java.synchronized(lock, function () {
      lock.wait();
    });

    var mode = resumeMode;

    if (mode === "drop") {
      shouldDrop = true;
    } else if (mode === "forward") {
      applyModifications(intent);
    }

    resumeMode = "forward";

  } catch (e) {
    send("[Blocking Error] " + e);
  } finally {
    if (isBlocking) {
      endHold(holdId);
      waiting = false;
      activeDecisionId = null;
    }
  }

  return shouldDrop;
}

function matchesActiveDecision(decisionId) {
  return waiting && (!decisionId || decisionId === activeDecisionId);
}

function createHook(targetWrapper, className, methodName, overloadArgs, interceptMode) {
  const method = targetWrapper[methodName].overload.apply(targetWrapper[methodName], overloadArgs);
  const isBoolean = method.returnType.className === "boolean";
  const isPendingIntent = className === "android.app.PendingIntent";
  interceptMode = interceptMode || "pre";
  
  method.implementation = function () {
    var firstArg = arguments.length > 0 ? arguments[0] : null;

    if (methodName === "getIntent") {
      var resultIntent = method.apply(this, arguments);
      var as = buildAttackSurface(methodName, resultIntent, this, null);

      var shouldDrop = processIntercept(
        this.$className,
        methodName,
        resultIntent,
        null,
        as,
        dumpArgs(arguments)
      );

      if (shouldDrop) return null;
      return resultIntent;
    }

    let intent = null;
    let pendingIntentFlags = null;

    if (isPendingIntent) {
      intent = arguments[2];
      pendingIntentFlags = arguments[3];
    } else {
      for (const arg of arguments) {
        if (arg && arg.$className === "android.content.Intent") {
          intent = arg;
          break;
        }
      }
    }

    var as2 = buildAttackSurface(methodName, intent, this, firstArg);
	  
	var shouldPreIntercept =
      interceptMode === "pre" || interceptMode === "both";

    var shouldReturnIntercept =
      interceptMode === "return" || interceptMode === "both";

    if (shouldPreIntercept) {
      var shouldDrop2 = processIntercept(
        this.$className,
        methodName,
        intent,
        pendingIntentFlags,
        as2,
        dumpArgs(arguments)
      );

      if (shouldDrop2) return isBoolean ? false : null;
    }

    try {
      var finalArgs = applyArgumentModifications(arguments);
      var result = method.apply(this, finalArgs);
      var returnType = method.returnType ? method.returnType.className : "unknown";

      if (shouldReturnIntercept) {
        var returnDecision = processReturnIntercept(
          className,
          methodName,
          dumpArgs(finalArgs),
          result,
          returnType
        );

        if (returnDecision.drop) {
          return null;
        }

        result = returnDecision.value;
      }

      return result;
    } catch (e) {
      send("[!] Forward error in " + methodName + ": " + e);
      return isBoolean ? false : null;
    }
  };
}



function discoveryCategoryAndScore(className, methodName, argTypes, returnType) {
  var hay = (className + "." + methodName + " " + argTypes.join(" ") + " " + returnType).toLowerCase();
  var category = "Other";
  var score = 10;

  function bump(cat, points) {
    category = cat;
    score = Math.max(score, points);
  }

  if (hay.indexOf("devicebinding") >= 0 || hay.indexOf("fingerprint") >= 0 || hay.indexOf("getsalt") >= 0 || hay.indexOf("salt") >= 0) bump("Device Binding", 95);
  if (hay.indexOf("encrypt") >= 0 || hay.indexOf("decrypt") >= 0 || hay.indexOf("crypto") >= 0 || hay.indexOf("cipher") >= 0 || hay.indexOf("aes") >= 0 || hay.indexOf("rsa") >= 0) bump("Crypto", 90);
  if (hay.indexOf("sign") >= 0 || hay.indexOf("verify") >= 0 || hay.indexOf("hmac") >= 0 || hay.indexOf("mac") >= 0) bump("Signing", 85);
  if (hay.indexOf("keystore") >= 0 || hay.indexOf("secretkey") >= 0 || hay.indexOf("generatekey") >= 0 || hay.indexOf("getkey") >= 0) bump("Key Storage", 82);
  if (hay.indexOf("token") >= 0 || hay.indexOf("otp") >= 0 || hay.indexOf("pin") >= 0 || hay.indexOf("password") >= 0 || hay.indexOf("auth") >= 0) bump("Authentication", 75);
  if (hay.indexOf("root") >= 0 || hay.indexOf("emulator") >= 0 || hay.indexOf("debug") >= 0 || hay.indexOf("frida") >= 0 || hay.indexOf("tamper") >= 0) bump("Runtime Checks", 70);
  if (hay.indexOf("http") >= 0 || hay.indexOf("request") >= 0 || hay.indexOf("response") >= 0 || hay.indexOf("okhttp") >= 0 || hay.indexOf("retrofit") >= 0) bump("Network", 65);

  return { category: category, score: score };
}

function suggestedInterceptMode(methodName, returnType) {
  var m = String(methodName || "").toLowerCase();
  var r = String(returnType || "").toLowerCase();
  if (m.indexOf("decrypt") >= 0 || m.indexOf("get") === 0 || m.indexOf("is") === 0 || m.indexOf("verify") >= 0) return "return";
  if (m.indexOf("fingerprint") >= 0 || m === "a" || m.indexOf("derive") >= 0) return "both";
  if (m.indexOf("encrypt") >= 0 || m.indexOf("sign") >= 0 || m.indexOf("generate") >= 0 || m.indexOf("set") === 0) return "pre";
  if (r && r !== "void") return "return";
  return "pre";
}

function discoverMethodsInternal(options) {
  options = options || {};
  var maxResults = parseInt(options.maxResults || 300);
  var maxClasses = parseInt(options.maxClasses || 200);
  var prefixes = options.prefixes || [
    "com.kony.crypto",
    "com.kony",
    "com.xd",
    "com.vasco.digipass.sdk.utils.devicebinding",
    "okhttp3",
    "retrofit2",
    "javax.crypto",
    "java.security"
  ];
  var keywords = options.keywords || [
    "encrypt", "decrypt", "crypto", "cipher", "aes", "rsa", "sign", "verify", "hmac",
    "key", "keystore", "secret", "token", "otp", "pin", "password", "auth",
    "devicebinding", "fingerprint", "salt", "root", "emulator", "debug", "frida", "tamper",
    "request", "response", "http"
  ];

  var results = [];
  var scannedClasses = 0;
  var matchedClasses = 0;
  var classNames = [];

  Java.enumerateLoadedClasses({
    onMatch: function (name) {
      if (matchedClasses >= maxClasses) return;
      var lower = String(name).toLowerCase();
      var prefixMatch = prefixes.length === 0;
      for (var p = 0; p < prefixes.length; p++) {
        var pref = String(prefixes[p] || "").toLowerCase().trim();
        if (pref && lower.indexOf(pref) === 0) { prefixMatch = true; break; }
      }
      if (!prefixMatch) return;

      var keywordMatch = false;
      for (var k = 0; k < keywords.length; k++) {
        var kw = String(keywords[k] || "").toLowerCase().trim();
        if (kw && lower.indexOf(kw) >= 0) { keywordMatch = true; break; }
      }
      // Keep important prefixes even if class name itself does not include keywords.
      if (!keywordMatch && lower.indexOf("com.xd") !== 0 && lower.indexOf("com.vasco.digipass.sdk.utils.devicebinding") !== 0 && lower.indexOf("com.kony.crypto") !== 0) return;

      classNames.push(String(name));
      matchedClasses += 1;
    },
    onComplete: function () {}
  });

  for (var c = 0; c < classNames.length && results.length < maxResults; c++) {
    var className = classNames[c];
    scannedClasses += 1;
    try {
      var Cls = Java.use(className);
      var methods = Cls.class.getDeclaredMethods();
      var perClassCount = Math.min(methods.length, 80);
      for (var i = 0; i < perClassCount && results.length < maxResults; i++) {
        var methodObj = methods[i];
        var methodName = String(methodObj.getName());
        var lowerMethod = methodName.toLowerCase();
        var methodKeyword = false;
        for (var k2 = 0; k2 < keywords.length; k2++) {
          var kw2 = String(keywords[k2] || "").toLowerCase().trim();
          if (kw2 && lowerMethod.indexOf(kw2) >= 0) { methodKeyword = true; break; }
        }
        if (!methodKeyword && className.indexOf("com.vasco.digipass.sdk.utils.devicebinding") !== 0 && className.indexOf("com.xd.devicebinding") !== 0 && className.indexOf("com.kony.crypto") !== 0) continue;

        var paramTypes = methodObj.getParameterTypes();
        var argTypes = [];
        for (var a = 0; a < paramTypes.length; a++) argTypes.push(String(paramTypes[a].getName()));
        var returnType = String(methodObj.getReturnType().getName());
        var cat = discoveryCategoryAndScore(className, methodName, argTypes, returnType);
        results.push({
          clazz: className,
          method: methodName,
          args: argTypes,
          returnType: returnType,
          category: cat.category,
          score: cat.score,
          interceptMode: suggestedInterceptMode(methodName, returnType)
        });
      }
    } catch (e) {
      // Skip problematic classes instead of crashing target app.
    }
  }

  results.sort(function (a, b) { return (b.score || 0) - (a.score || 0); });
  return {
    results: results,
    scannedClasses: scannedClasses,
    matchedClasses: matchedClasses,
    maxResults: maxResults,
    maxClasses: maxClasses
  };
}

rpc.exports = {
  proxy: function (hookConfig) {
    Java.perform(function () {
      send("[*] Initializing app hooks");

      ObjectJava = Java.use("java.lang.Object");
      UriJava = Java.use("android.net.Uri");

      if (lock === null) lock = ObjectJava.$new();

      var sdkInt = Java.use("android.os.Build$VERSION").SDK_INT.value;

      hookConfig.forEach(function(h) {
        if (h.minApi && sdkInt < h.minApi) {
          var sig = h.method + "(" + h.args.map(function(a) {
            return a.split(".").pop();
          }).join(", ") + ")";

          send("[~] Skipping " + h.clazz + "." + sig + " (requires API " + h.minApi + ", device API " + sdkInt + ")");
          return;
        }

        try {
          var targetClass = Java.use(h.clazz);
          createHook(targetClass, h.clazz, h.method, h.args, h.interceptMode || "pre");
        } catch (e) {
          send("[!] Error registering hook " + h.clazz + ": " + e);
        }
      });

      send("[+] App hooks initialized");
    });
  },

  forward: function (decisionId) {
    var resumed = false;

    try {
      Java.performNow(function () {
        if (matchesActiveDecision(decisionId) && lock) {
          resumeMode = "forward";
          Java.synchronized(lock, function () {
            lock.notify();
          });
          resumed = true;
        }
      });
    } catch (e) {
      send("[!] Forward resume failed: " + e);
    }

    return resumed;
  },

  drop: function (decisionId) {
    var resumed = false;

    try {
      Java.performNow(function () {
        if (matchesActiveDecision(decisionId) && lock) {
          resumeMode = "drop";
          Java.synchronized(lock, function () {
            lock.notify();
          });
          resumed = true;
        }
      });
    } catch (e) {
      send("[!] Drop resume failed: " + e);
    }

    return resumed;
  },

  stageMod: function (type, key, val, extraType, decisionId) {
    if (matchesActiveDecision(decisionId)) {
      modQueue.push({
        type: type,
        key: key,
        val: val,
        extraType: extraType
      });

      send("[+] Modification staged: " + type + (extraType ? " (" + extraType + ")" : ""));
      return true;
    } else {
      send("[!] Error: No intent blocked to modify.");
      return false;
    }
  },

  stageArgMod: function (index, value, type, decisionId) {
    if (matchesActiveDecision(decisionId)) {
      argModQueue.push({
        index: parseInt(index),
        value: value,
        type: type || "java.lang.String"
      });

      send("[+] Argument modification staged: arg[" + index + "] = " + value);
      return true;
    } else {
      send("[!] Error: No active intercepted method to modify.");
      return false;
    }
  },

  stageReturnMod: function (value, type, decisionId) {
    if (matchesActiveDecision(decisionId)) {
      returnModQueue.push({
        value: value,
        type: type || "java.lang.String"
      });

      send("[+] Return value modification staged");
      return true;
    } else {
      send("[!] Error: No active intercepted return value to modify.");
      return false;
    }
  },

  interceptoff: function () {
    try {
      Java.performNow(function () {
        blockEnabled = false;

        if (waiting && lock) {
          resumeMode = "forward";
          Java.synchronized(lock, function () {
            lock.notify();
          });
        }
      });
    } catch (e) {
      send("[!] Intercept off failed: " + e);
    }
  },

  intercepton: function () {
    blockEnabled = true;
  },

  discoverMethods: function (options) {
    var response = { results: [], error: null };
    Java.performNow(function () {
      try {
        response = discoverMethodsInternal(options || {});
      } catch (e) {
        response = { results: [], error: String(e) };
      }
    });
    return response;
  },

  getSdkInt: function () {
    var sdkInt = 0;

    Java.performNow(function () {
      sdkInt = Java.use("android.os.Build$VERSION").SDK_INT.value;
    });

    return sdkInt;
  }
};