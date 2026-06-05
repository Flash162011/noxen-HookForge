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
            if (v === null || v === undefined) return "<null>";
            return v.toString();
        } catch (e) {
            return "<toString-error: " + e + ">";
        }
    }

    function bytesToHex(bytes) {
        if (!bytes) return "<null>";

        var hex = "";

        for (var i = 0; i < bytes.length; i++) {
            var b = bytes[i] & 0xff;
            hex += ("0" + b.toString(16)).slice(-2);
        }

        return hex;
    }

    function bytesToBase64(bytes) {
        try {
            if (!bytes) return "<null>";

            var Base64 = Java.use("android.util.Base64");
            return Base64.encodeToString(bytes, 2); // NO_WRAP
        } catch (e) {
            return "<base64-error: " + e + ">";
        }
    }

    function printKey(keyObj) {
        try {
            if (!keyObj) {
                log("    Key Object    : <null>");
                return;
            }

            var SecretKeySpec = Java.use("javax.crypto.spec.SecretKeySpec");
            var key = Java.cast(keyObj, SecretKeySpec);

            var encoded = key.getEncoded();

            log("    Key Class     : " + safe(keyObj.$className));
            log("    Key Algorithm : " + safe(key.getAlgorithm()));
            log("    Key Format    : " + safe(key.getFormat()));
            log("    Key Hex       : " + bytesToHex(encoded));
            log("    Key Base64    : " + bytesToBase64(encoded));

        } catch (e) {
            log("    Key parse error: " + e);
            log("    Raw Key Object : " + safe(keyObj));
        }
    }

    try {

        var CryptoWrapper = Java.use("com.dib.cryptoutil.CryptoWrapper");

        log("[+] CryptoWrapper extra hooks loaded");

        var generateKey = CryptoWrapper.generateKey.overload(
            "java.lang.String",
            "java.lang.String"
        );

        generateKey.implementation = function (passphrase, keyAlgorithm) {

            log("\n========== CryptoWrapper.generateKey ==========");
            log("    Passphrase : " + safe(passphrase));
            log("    Algorithm  : " + safe(keyAlgorithm));

            var result = generateKey.call(this, passphrase, keyAlgorithm);

            log("    Result     : " + safe(result));
            printKey(result);

            return result;
        };

        var encrypt = CryptoWrapper.encrypt.overload(
            "java.lang.String",
            "java.lang.Object"
        );

        encrypt.implementation = function (inputString, keyObj) {

            log("\n========== CryptoWrapper.encrypt ==========");
            log("    Plaintext  : " + safe(inputString));
            printKey(keyObj);

            var result = encrypt.call(this, inputString, keyObj);

            log("    Ciphertext : " + safe(result));

            return result;
        };

        var decrypt = CryptoWrapper.decrypt.overload(
            "java.lang.String",
            "java.lang.Object"
        );

        decrypt.implementation = function (encryptedBase64String, keyObj) {

            log("\n========== CryptoWrapper.decrypt ==========");
            log("    Ciphertext : " + safe(encryptedBase64String));
            printKey(keyObj);

            var result = decrypt.call(this, encryptedBase64String, keyObj);

            log("    Plaintext  : " + safe(result));

            return result;
        };

        log("[+] CryptoWrapper hooks installed successfully");

    } catch (e) {
        log("[-] Failed to hook CryptoWrapper: " + e);
    }
});