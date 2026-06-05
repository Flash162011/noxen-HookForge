Java.perform(function () {

    function log(msg) {
        console.log(msg);

        send({
            type: "crypto_log",
            message: msg
        });
    }

    function safe(v) {
        try {
            if (v === null || v === undefined)
                return "<null>";

            return v.toString();

        } catch (e) {
            return "<toString-error: " + e + ">";
        }
    }

    function bytesToHex(bytes) {

        if (!bytes)
            return "<null>";

        var hex = "";

        for (var i = 0; i < bytes.length; i++) {

            var b = bytes[i] & 0xff;
            hex += ("0" + b.toString(16)).slice(-2);
        }

        return hex;
    }

    function bytesToBase64(bytes) {

        try {

            if (!bytes)
                return "<null>";

            var Base64 = Java.use("android.util.Base64");

            return Base64.encodeToString(bytes, 2);

        } catch (e) {

            return "<base64-error: " + e + ">";
        }
    }

    function printKey(keyObj) {

        try {

            if (!keyObj) {

                log("    Key Object : <null>");
                return;
            }

            log("    Key Class     : " + safe(keyObj.$className));

            if (keyObj.getAlgorithm)
                log("    Algorithm     : " + safe(keyObj.getAlgorithm()));

            if (keyObj.getFormat)
                log("    Format        : " + safe(keyObj.getFormat()));

            if (keyObj.getEncoded) {

                var enc = keyObj.getEncoded();

                log("    Key Hex       : " + bytesToHex(enc));
                log("    Key Base64    : " + bytesToBase64(enc));
            }

        } catch(e) {

            log("    Key Parse Error: " + e);
        }
    }

    try {

        var CryptoUtil =
            Java.use("com.kony.crypto.aed.CryptoUtil");

        log("[+] CryptoUtil loaded");

        CryptoUtil.generateKey.overloads.forEach(function(o){

            o.implementation=function(){

                log("\n========== CryptoUtil.generateKey ==========");

                for(var i=0;i<arguments.length;i++){

                    log("    Arg["+i+"] : "
                        + safe(arguments[i]));
                }

                var result =
                    o.apply(this, arguments);

                log("    Result : "
                    + safe(result));

                printKey(result);

                return result;
            };

        });

    } catch(e){

        log("[-] Failed CryptoUtil hook: "
            + e);
    }


    try {

        var AESUtil =
            Java.use("com.kony.crypto.aed.AESUtil");

        log("[+] AESUtil loaded");


        AESUtil.encrypt.overloads.forEach(function(o){

            o.implementation=function(){

                log("\n========== AESUtil.encrypt ==========");

                for(var i=0;i<arguments.length;i++){

                    log("    Arg["+i+"] : "
                        + safe(arguments[i]));
                }

                if(arguments.length>1)
                    printKey(arguments[1]);

                var result =
                    o.apply(this, arguments);

                log("    Ciphertext : "
                    + safe(result));

                return result;
            };

        });


        AESUtil.decrypt.overloads.forEach(function(o){

            o.implementation=function(){

                log("\n========== AESUtil.decrypt ==========");

                for(var i=0;i<arguments.length;i++){

                    log("    Arg["+i+"] : "
                        + safe(arguments[i]));
                }

                if(arguments.length>1)
                    printKey(arguments[1]);

                var result =
                    o.apply(this, arguments);

                log("    Plaintext : "
                    + safe(result));

                return result;
            };

        });

    } catch(e){

        log("[-] Failed AESUtil hook: "
            + e);
    }

    log("[+] SME crypto hooks installed");


    // ============================================================
    // OneSpan / Vasco Device Binding Salt Hooks - Full SME Coverage
    // ============================================================
    // This block hooks all OneSpan Device Binding classes/methods listed
    // in hooks.json and logs detailed output to the Noxen Log tab.
    //
    // It is class-loader aware and retries because OneSpan SDK classes
    // may be loaded after app startup.
    //
    // Salt override:
    // Keep null for logging only. Set to a string to force runtime salt.
    var ONESPAN_SALT_OVERRIDE = null;
    // var ONESPAN_SALT_OVERRIDE = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

    var ONESPAN_RETRY_COUNT = 15;
    var ONESPAN_RETRY_DELAY_MS = 1500;
    var __onespanInstalled = {};

    var ONESPAN_HOOKS = [
        {
                "clazz": "com.xd.devicebinding.Utils",
                "method": "fetchAndroidIDOnlyDF",
                "args": [
                        "android.content.Context",
                        "java.lang.String"
                ],
                "interceptMode": "pre"
        },
        {
                "clazz": "com.xd.devicebinding.Utils",
                "method": "fetchSerialOnlyDF",
                "args": [
                        "android.content.Context",
                        "java.lang.String"
                ],
                "interceptMode": "pre"
        },
        {
                "clazz": "com.xd.devicebinding.Utils",
                "method": "fetchAndroidIDSerialDF",
                "args": [
                        "android.content.Context",
                        "java.lang.String"
                ],
                "interceptMode": "pre"
        },
        {
                "clazz": "com.xd.devicebinding.Utils",
                "method": "fetchHardwareWithTEEDF",
                "args": [
                        "android.content.Context",
                        "java.lang.String"
                ],
                "interceptMode": "pre"
        },
        {
                "clazz": "com.xd.devicebinding.Utils",
                "method": "fetchHardwareWithStrongBoxDF",
                "args": [
                        "android.content.Context",
                        "java.lang.String"
                ],
                "interceptMode": "pre"
        },
        {
                "clazz": "com.vasco.digipass.sdk.utils.devicebinding.DeviceBindingSDK",
                "method": "getDeviceFingerprint",
                "args": [
                        "java.lang.String",
                        "android.content.Context"
                ],
                "interceptMode": "pre"
        },
        {
                "clazz": "com.vasco.digipass.sdk.utils.devicebinding.DeviceBindingSDK",
                "method": "getFingerprint",
                "args": [
                        "com.vasco.digipass.sdk.utils.devicebinding.DeviceBindingSDKParams"
                ],
                "interceptMode": "pre"
        },
        {
                "clazz": "com.vasco.digipass.sdk.utils.devicebinding.DeviceBindingSDKParams",
                "method": "$init",
                "args": [
                        "java.lang.String",
                        "android.content.Context"
                ],
                "interceptMode": "pre"
        },
        {
                "clazz": "com.vasco.digipass.sdk.utils.devicebinding.DeviceBindingSDKParams",
                "method": "getSalt",
                "args": [],
                "interceptMode": "return"
        },
        {
                "clazz": "com.vasco.digipass.sdk.utils.devicebinding.obfuscated.f",
                "method": "fingerprint",
                "args": [
                        "java.lang.String"
                ],
                "interceptMode": "pre"
        },
        {
                "clazz": "com.vasco.digipass.sdk.utils.devicebinding.obfuscated.g",
                "method": "fingerprint",
                "args": [
                        "java.lang.String"
                ],
                "interceptMode": "pre"
        },
        {
                "clazz": "com.vasco.digipass.sdk.utils.devicebinding.obfuscated.h",
                "method": "fingerprint",
                "args": [
                        "java.lang.String"
                ],
                "interceptMode": "pre"
        },
        {
                "clazz": "com.vasco.digipass.sdk.utils.devicebinding.obfuscated.j",
                "method": "fingerprint",
                "args": [
                        "java.lang.String"
                ],
                "interceptMode": "pre"
        },
        {
                "clazz": "com.vasco.digipass.sdk.utils.devicebinding.obfuscated.i",
                "method": "fingerprint",
                "args": [
                        "java.lang.String",
                        "com.vasco.digipass.sdk.utils.devicebinding.DeviceBindingBiometricAuthenticationCallback",
                        "boolean",
                        "boolean",
                        "boolean"
                ],
                "interceptMode": "pre"
        },
        {
                "clazz": "com.vasco.digipass.sdk.utils.devicebinding.obfuscated.m",
                "method": "a",
                "args": [
                        "java.lang.String",
                        "java.lang.String"
                ],
                "interceptMode": "both"
        }
];

    function oneSpanSection(title) {
        log("\n========== " + title + " ==========");
    }

    function oneSpanStack(maxLines) {
        try {
            var Thread = Java.use("java.lang.Thread");
            var stack = Thread.currentThread().getStackTrace();
            var out = [];
            var limit = Math.min(stack.length, maxLines || 18);

            for (var i = 2; i < limit; i++) {
                out.push("        at " + stack[i].toString());
            }

            return out.join("\n");
        } catch (e) {
            return "        <stack-error: " + e + ">";
        }
    }

    function oneSpanOverrideEnabled() {
        return ONESPAN_SALT_OVERRIDE !== null &&
            ONESPAN_SALT_OVERRIDE !== undefined &&
            String(ONESPAN_SALT_OVERRIDE).length > 0;
    }

    function oneSpanMaybeReplaceSalt(originalSalt, source, details) {
        oneSpanSection("OneSpan Device Binding Salt");
        log("    Source       : " + source);
        if (details) log("    Details      : " + details);
        log("    Salt         : " + safe(originalSalt));
        log("    Salt Length  : " + (originalSalt ? String(originalSalt).length : 0));
        log("    Override     : " + (oneSpanOverrideEnabled() ? "ENABLED" : "DISABLED"));

        if (oneSpanOverrideEnabled()) {
            var replacement = Java.use("java.lang.String").$new(String(ONESPAN_SALT_OVERRIDE));
            log("    New Salt     : " + safe(replacement));
            log("    New Length   : " + String(ONESPAN_SALT_OVERRIDE).length);
            log("    Stack Trace  :\n" + oneSpanStack(20));
            return replacement;
        }

        log("    Stack Trace  :\n" + oneSpanStack(20));
        return originalSalt;
    }

    function oneSpanClassExistsWithLoader(className, loader) {
        try {
            var Class = Java.use("java.lang.Class");
            Class.forName(className, false, loader);
            return true;
        } catch (e) {
            return false;
        }
    }

    function oneSpanLoaderName(loader) {
        try {
            return loader ? loader.toString() : "<default>";
        } catch (e) {
            return "<loader-toString-error>";
        }
    }

    function oneSpanWithLoader(loader, fn) {
        var oldLoader = null;
        try {
            oldLoader = Java.classFactory.loader;
        } catch (e) {}

        try {
            if (loader) Java.classFactory.loader = loader;
            return fn();
        } finally {
            try {
                if (oldLoader) Java.classFactory.loader = oldLoader;
            } catch (e2) {}
        }
    }

    function oneSpanFindLoadersForClass(className) {
        var loaders = [];

        try {
            Java.use(className);
            loaders.push(null);
        } catch (e) {}

        try {
            Java.enumerateClassLoaders({
                onMatch: function(loader) {
                    try {
                        if (oneSpanClassExistsWithLoader(className, loader)) {
                            loaders.push(loader);
                        }
                    } catch (e) {}
                },
                onComplete: function() {}
            });
        } catch (e) {
            log("[-] OneSpan ClassLoader enumeration failed for " + className + ": " + e);
        }

        return loaders;
    }

    function oneSpanIsLikelySaltArg(hook, argIndex, argType) {
        if (argType !== "java.lang.String") return false;

        // Known salt locations from Device Binding SDK:
        // - Utils.fetch*DF(Context, String salt): index 1
        // - DeviceBindingSDK.getDeviceFingerprint(String salt, Context): index 0
        // - DeviceBindingSDKParams.$init(String salt, Context): index 0
        // - obfuscated.*.fingerprint(String salt): index 0
        // - obfuscated.m.a(String salt, String prefix): index 0
        if (hook.clazz === "com.xd.devicebinding.Utils" && argIndex === 1) return true;
        if (hook.clazz === "com.vasco.digipass.sdk.utils.devicebinding.DeviceBindingSDK" &&
            hook.method === "getDeviceFingerprint" && argIndex === 0) return true;
        if (hook.clazz === "com.vasco.digipass.sdk.utils.devicebinding.DeviceBindingSDKParams" &&
            hook.method === "$init" && argIndex === 0) return true;
        if (hook.method === "fingerprint" && argIndex === 0) return true;
        if (hook.clazz === "com.vasco.digipass.sdk.utils.devicebinding.obfuscated.m" &&
            hook.method === "a" && argIndex === 0) return true;

        return false;
    }

    function oneSpanInstallHook(hook) {
        var className = hook.clazz;
        var methodName = hook.method;
        var overloadArgs = hook.args || [];
        var loaders = oneSpanFindLoadersForClass(className);

        if (loaders.length === 0) {
            log("[-] OneSpan class not found yet: " + className);
            return false;
        }

        var installedAny = false;

        loaders.forEach(function(loader) {
            var installKey = className + "." + methodName + "(" + overloadArgs.join(",") + ")@" + oneSpanLoaderName(loader);
            if (__onespanInstalled[installKey]) return;

            try {
                oneSpanWithLoader(loader, function() {
                    var Cls = Java.use(className);
                    var method;

                    if (methodName === "$init") {
                        method = Cls.$init.overload.apply(Cls.$init, overloadArgs);
                    } else {
                        method = Cls[methodName].overload.apply(Cls[methodName], overloadArgs);
                    }

                    method.implementation = function() {
                        var args = [];
                        for (var i = 0; i < arguments.length; i++) args.push(arguments[i]);

                        oneSpanSection("OneSpan SDK Method Invoked");
                        log("    Class        : " + className);
                        log("    Method       : " + methodName);
                        log("    Loader       : " + oneSpanLoaderName(loader));
                        log("    Mode         : " + safe(hook.interceptMode));
                        log("    Args Count   : " + args.length);

                        for (var j = 0; j < args.length; j++) {
                            log("    Arg[" + j + "] Type : " + safe(overloadArgs[j]));
                            log("    Arg[" + j + "] Val  : " + safe(args[j]));

                            if (oneSpanIsLikelySaltArg(hook, j, overloadArgs[j])) {
                                args[j] = oneSpanMaybeReplaceSalt(
                                    args[j],
                                    className + "." + methodName,
                                    "argIndex=" + j + ", overload=(" + overloadArgs.join(", ") + ")"
                                );
                            }
                        }

                        if (methodName === "$init") {
                            var initResult = method.apply(this, args);
                            log("    Constructor  : completed");
                            return initResult;
                        }

                        var result = method.apply(this, args);

                        log("    Return       : " + safe(result));

                        if (className === "com.vasco.digipass.sdk.utils.devicebinding.DeviceBindingSDKParams" &&
                            methodName === "getSalt") {
                            oneSpanSection("OneSpan DeviceBindingSDKParams.getSalt Return");
                            log("    Salt         : " + safe(result));
                            log("    Salt Length  : " + (result ? String(result).length : 0));
                            log("    Stack Trace  :\n" + oneSpanStack(20));

                            if (oneSpanOverrideEnabled()) {
                                var replacement = Java.use("java.lang.String").$new(String(ONESPAN_SALT_OVERRIDE));
                                log("    Override     : ENABLED");
                                log("    New Salt     : " + safe(replacement));
                                return replacement;
                            }
                        }

                        return result;
                    };
                });

                __onespanInstalled[installKey] = true;
                installedAny = true;
                log("[+] OneSpan hook installed: " + installKey);

            } catch (e) {
                log("[-] OneSpan hook failed: " + installKey + " => " + e);
            }
        });

        return installedAny;
    }

    function oneSpanDiscoverLoadedClasses() {
        try {
            var count = 0;
            oneSpanSection("OneSpan Loaded Class Discovery");
            Java.enumerateLoadedClasses({
                onMatch: function(name) {
                    if (
                        name.indexOf("com.vasco.digipass.sdk.utils.devicebinding") >= 0 ||
                        name.indexOf("com.xd.devicebinding") >= 0 ||
                        name.toLowerCase().indexOf("devicebinding") >= 0
                    ) {
                        count++;
                        log("    Loaded Class : " + name);
                    }
                },
                onComplete: function() {
                    log("    Total Loaded : " + count);
                }
            });
        } catch (e) {
            log("[-] OneSpan class discovery failed: " + e);
        }
    }

    function oneSpanInstallAttempt(attempt) {
        var installed = 0;
        log("\n[*] OneSpan hook installation attempt " + attempt + " / " + ONESPAN_RETRY_COUNT);
        oneSpanDiscoverLoadedClasses();

        for (var i = 0; i < ONESPAN_HOOKS.length; i++) {
            if (oneSpanInstallHook(ONESPAN_HOOKS[i])) installed++;
        }

        log("[*] OneSpan attempt " + attempt + " installed/confirmed groups: " + installed);
    }

    function oneSpanStartRetryInstaller() {
        var attempt = 1;

        function run() {
            try {
                oneSpanInstallAttempt(attempt);
            } catch (e) {
                log("[-] OneSpan installer failed on attempt " + attempt + ": " + e);
            }

            attempt++;
            if (attempt <= ONESPAN_RETRY_COUNT) {
                setTimeout(run, ONESPAN_RETRY_DELAY_MS);
            } else {
                log("[*] OneSpan retry installer completed");
            }
        }

        run();
    }

    oneSpanStartRetryInstaller();


});