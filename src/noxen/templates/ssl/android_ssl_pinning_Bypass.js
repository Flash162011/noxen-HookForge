/*  
    --- Change Log ---
        - Removed okhttp3 (double bypass)
        - Removed New Coooooooooooooooode
        - Removed OpenSSLSocketImpl
        - Added new hook for OkHttp3
        - Added new hook for TrustManager Android > 7
        - Added Fabric PinningTrustManager
        - Added OpenSSLSocketImpl Conscrypt
        - Added OpenSSLEngineSocketImpl Conscrypt
        - Added OpenSSLSocketImpl Apache
        - Added Conscrypt CertPinManager
        - Added Conscrypt CertPinManager (Legacy)
        - Added Worklight Androidgap WLCertificatePinningPlugin
        - Added Netty FingerprintTrustManagerFactory
        - Added Squareup CertificatePinner [OkHTTP<v3] (double bypass)
        - Added Squareup OkHostnameVerifier [OkHTTP v3] (double bypass)
        - Added Android WebViewClient (quadruple bypass)
        - Added Apache Cordova WebViewClient
        - Added Boye AbstractVerifier
        - Added Apache AbstractVerifier
        - Added Chromium Cronet
        - Added Flutter Pinning packages http_certificate_pinning and ssl_pinning_plugin (double bypass)
        - Added Dynamic SSLPeerUnverifiedException Patcher

    --- Execute Example ---
        frida -U -f [APP_ID] -l SecureMisr-SSL-2023-04-03.js --no-pause
*/

setTimeout(function() {
    Java.perform(function () {
        console.log('');
        console.log('======');
        console.log('[#] Android Bypass for various SSL Pinning methods [#]');
        console.log('======');

        // OkHttp3 4.2+ SSL Pinning Bypass //
        ////////////////////////////////////
        try{
            var okhttp3_Activity_1 = Java.use('okhttp3.CertificatePinner');
            okhttp3_Activity_1.check.overload('java.lang.String', 'java.util.List').implementation = function (str,list) {
                console.log('[+] OkHTTPv3 {1} : ' + str + ' : Bypassing');
                return true;
            };
            console.log('[+] OkHTTPv3 {1} : Bypassed');
        } catch(err) {
            console.log('[-] OkHTTPv3 {1} : Skipped');
        }

        try{
            var okhttp3_Activity_2 = Java.use('okhttp3.CertificatePinner');
            okhttp3_Activity_2.check.overload('java.lang.String', 'java.security.cert.Certificate').implementation = function (str,cert) {
                console.log('[+] OkHTTPv3 {2} : ' + str + ' : Bypassing');
                return true;
            };
            console.log('[+] OkHTTPv3 {2} : Bypassed');
        } catch(err) {
            console.log('[-] OkHTTPv3 {2} : Skipped');
        }

        try {
            var okhttp3_Activity_3 = Java.use('okhttp3.CertificatePinner');
            okhttp3_Activity_3.check.overload('java.lang.String', '[Ljava.security.cert.Certificate;').implementation = function (str,cert_array) {
                console.log('[+] OkHTTPv3 {3} : ' + str + ' : Bypassing');
                return true;
            };
            console.log('[+] OkHTTPv3 {3} : Bypassed');
        } catch(err) {
            console.log('[-] OkHTTPv3 {3} : Skipped');
        }

        try {
            var okhttp3_Activity_4 = Java.use('okhttp3.CertificatePinner');
            okhttp3_Activity_4.check$okhttp.overload('java.lang.String', 'kotlin.jvm.functions.Function0').implementation = function(str, obj) {        
            console.log('[+] OkHTTPv3 {4} : ' + str + ' : Bypassing');
            return;
            };
            console.log('[+] OkHTTPv3 {5} : Bypassed');
        } catch(err) {
            console.log('[-] OkHTTPv3 {4}: Skipped');
            //console.log(err);
        }

        try {
            var okhttp3_CertificatePinner_class = Java.use('okhttp3.CertificatePinner');
            okhttp3_CertificatePinner_class['check$okhttp'].implementation = function (str,obj) {
                console.log('[+] OkHTTPv3 (4.2+) {5} : ' + str + ' : Bypassed');
            };
            console.log('[+] OkHTTPv3 (4.2+) {5} : Bypassed');
        } catch(err) {
            console.log('[-] OkHTTPv3 (4.2+) {5} : Skipped');
        }
//---------------------------------------------------------------------------------------------------------------------
        // TrustManager (Android < 7)  //
        ////////////////////////////////
        var X509TrustManager = Java.use('javax.net.ssl.X509TrustManager');
        var SSLContext = Java.use('javax.net.ssl.SSLContext');
        
        var TrustManager = Java.registerClass({
            // Implement a custom TrustManager
            name: 'dev.asd.test.TrustManager',
            implements: [X509TrustManager],
            methods: {
                checkClientTrusted: function (chain, authType) {},
                checkServerTrusted: function (chain, authType) {},
                getAcceptedIssuers: function () {return []; }
            }
        });
    
        // Prepare the TrustManager array to pass to SSLContext.init()
        var TrustManagers = [TrustManager.$new()];
        // Get a handle on the init() on the SSLContext class
        var SSLContext_init = SSLContext.init.overload(
            '[Ljavax.net.ssl.KeyManager;', '[Ljavax.net.ssl.TrustManager;', 'java.security.SecureRandom');
        try {
            // Override the init method, specifying the custom TrustManager
            SSLContext_init.implementation = function(keyManager, trustManager, secureRandom) {
                console.log('[+] Trustmanager (Android < 7) : Bypassing');
                SSLContext_init.call(this, keyManager, TrustManagers, secureRandom);
            };
            console.log('[+] TrustManager (Android < 7) : Bypassed');
        } catch (err) {
            console.log('[-] TrustManager (Android < 7) : Skipped');
        }
//---------------------------------------------------------------------------------------------------------------------
        // TrustManagerImpl (Android > 7)  //
        ////////////////////////////////////
        try {
            // Bypass TrustManagerImpl (Android > 7) {1}
            var array_list = Java.use("java.util.ArrayList");
            var TrustManagerImpl_Activity_1 = Java.use('com.android.org.conscrypt.TrustManagerImpl');
            TrustManagerImpl_Activity_1.checkTrustedRecursive.implementation = function(certs, ocspData, tlsSctData, host, clientAuth, untrustedChain, trustAnchorChain, used) {
                console.log('[+] TrustManagerImpl (Android > 7) {1} : ' + host + ' : Bypassing');
                return array_list.$new();
            };
            console.log('[+] TrustManagerImpl (Android > 7) {1} : Bypassed');
        } catch (err) {
            console.log('[-] TrustManagerImpl (Android > 7) {1} : Skipped');
            //console.log(err);
        }  
        try {
            // Bypass TrustManagerImpl (Android > 7) {2} (probably no more necessary)
            var TrustManagerImpl_Activity_2 = Java.use('com.android.org.conscrypt.TrustManagerImpl');
            TrustManagerImpl_Activity_2.verifyChain.implementation = function(untrustedChain, trustAnchorChain, host, clientAuth, ocspData, tlsSctData) {
                console.log('[+] TrustManagerImpl (Android > 7) {2} : ' + host + ' : Bypassing');
                return untrustedChain;
            };
            console.log('[+] TrustManagerImpl (Android > 7) {2} : Bypassed');
        } catch (err) {
            console.log('[-] TrustManagerImpl (Android > 7) {2} : Skipped');
            //console.log(err);
        }
//---------------------------------------------------------------------------------------------------------------------
        // Trustkit (triple bypass) //
        //////////////////////////////
        try {
            // Bypass Trustkit {1}
            var trustkit_Activity_1 = Java.use('com.datatheorem.android.trustkit.pinning.OkHostnameVerifier');
            trustkit_Activity_1.verify.overload('java.lang.String', 'javax.net.ssl.SSLSession').implementation = function(a, b) {
                console.log('[+] Trustkit {1} : ' + a + ' : Bypassing');
                return true;
            };
            console.log('[-] Trustkit hook {1} : Bypassed');
        } catch (err) {
            console.log('[-] Trustkit hook {1} : Skipped');
        }

        try {
            // Bypass Trustkit {2}
            var trustkit_Activity_2 = Java.use('com.datatheorem.android.trustkit.pinning.OkHostnameVerifier');
            trustkit_Activity_2.verify.overload('java.lang.String', 'java.security.cert.X509Certificate').implementation = function(a, b) {
                console.log('[+] Trustkit hook {2} : ' + a + ' : Bypassing');
                return true;
            };
            console.log('[-] Trustkit hook {2} : Bypassed');
        } catch (err) {
            console.log('[-] Trustkit hook {2} : Skipped');
        }

        try {
            // Bypass Trustkit {3}
            var trustkit_PinningTrustManager = Java.use('com.datatheorem.android.trustkit.pinning.PinningTrustManager');
            trustkit_PinningTrustManager.checkServerTrusted.overload('[Ljava.security.cert.X509Certificate;', 'java.lang.String').implementation = function(chain, authType) {
                console.log('[+] Trustkit hook {3} : Bypassing');
                //return;
            };
            console.log('[-] Trustkit hook {3} : Bypassed');
        } catch (err) {
            console.log('[-] Trustkit hook {3} : Skipped');
        }
    
        
//---------------------------------------------------------------------------------------------------------------------
        // Appcelerator Titanium  //
        ////////////////////////////
        try {
            var appcelerator_PinningTrustManager = Java.use('appcelerator.https.PinningTrustManager');
            appcelerator_PinningTrustManager.checkServerTrusted.implementation = function () {
                console.log('[+] Appcelerator Titanium : Bypassing');
            };

            console.log('[+] Appcelerator Titanium : Bypassed');
        } catch (err) {
            console.log('[-] Appcelerator Titanium : Skipped');
        }
//---------------------------------------------------------------------------------------------------------------------
        // Fabric PinningTrustManager //
        ////////////////////////////////
        try {
            var fabric_PinningTrustManager = Java.use('io.fabric.sdk.android.services.network.PinningTrustManager');
            fabric_PinningTrustManager.checkServerTrusted.implementation = function(chain, authType) {
                console.log('[+] Fabric PinningTrustManager : Bypassing');
                return;
            };
            console.log('[+] Fabric PinningTrustManager : Bypassed');
        } catch (err) {
            console.log('[-] Fabric PinningTrustManager : Skipped');
        }
//---------------------------------------------------------------------------------------------------------------------
        // OpenSSLSocketImpl Conscrypt  \\
        try {
            var OpenSSLSocketImpl = Java.use('com.android.org.conscrypt.OpenSSLSocketImpl');
            OpenSSLSocketImpl.verifyCertificateChain.implementation = function(certRefs, JavaObject, authMethod) {
                console.log('[+] OpenSSLSocketImpl Conscrypt {1} : Bypassing');
            };
            console.log('[+] OpenSSLSocketImpl Conscrypt {1} : Bypassed');
        } catch (err) {
            console.log('[-] OpenSSLSocketImpl Conscrypt {1} : Skipped');       
        }
        try {
            var OpenSSLSocketImpl = Java.use('com.android.org.conscrypt.OpenSSLSocketImpl');
            OpenSSLSocketImpl.verifyCertificateChain.implementation = function(certChain, authMethod) {
                console.log('[+] OpenSSLSocketImpl Conscrypt {2} : Bypassing');
            };
            console.log('[+] OpenSSLSocketImpl Conscrypt {2} : Bypassed');
        } catch (err) {
            console.log('[-] OpenSSLSocketImpl Conscrypt {2} : Skipped');       
        }
//---------------------------------------------------------------------------------------------------------------------
        // OpenSSLEngineSocketImpl Conscrypt //
        ///////////////////////////////////////
        try {
            var OpenSSLEngineSocketImpl_Activity = Java.use('com.android.org.conscrypt.OpenSSLEngineSocketImpl');
            OpenSSLEngineSocketImpl_Activity.verifyCertificateChain.overload('[Ljava.lang.Long;', 'java.lang.String').implementation = function(a, b) {
                console.log('[+] Bypassing OpenSSLEngineSocketImpl Conscrypt : ' + b + ' : Bypassing');
            };
            console.log('[+] OpenSSLEngineSocketImpl Conscrypt : Bypassed');
        } catch (err) {
            console.log('[-] OpenSSLEngineSocketImpl Conscrypt : Skipped');
        }
//---------------------------------------------------------------------------------------------------------------------
        // OpenSSLSocketImpl Apache Harmony //
        //////////////////////////////////////
        try {
            var OpenSSLSocketImpl_Harmony = Java.use('org.apache.harmony.xnet.provider.jsse.OpenSSLSocketImpl');
            OpenSSLSocketImpl_Harmony.verifyCertificateChain.implementation = function(asn1DerEncodedCertificateChain, authMethod) {
                console.log('[+] OpenSSLSocketImpl Apache Harmony : Bypassing');
            };
            console.log('[+] OpenSSLSocketImpl Apache Harmony : Bypassed');   
        } catch (err) {
            console.log('[-] OpenSSLSocketImpl Apache Harmony : Skipped');    
        }
//---------------------------------------------------------------------------------------------------------------------
        // PhoneGap sslCertificateChecker //
        ////////////////////////////////////
        try {
            var phonegap_Activity = Java.use('nl.xservices.plugins.sslCertificateChecker');
            phonegap_Activity.execute.overload('java.lang.String', 'org.json.JSONArray', 'org.apache.cordova.CallbackContext').implementation = function(a, b, c) {
                console.log('[+] Bypassing PhoneGap sslCertificateChecker : ' + a + ' : Bypassing');
                return true;
            };
            console.log('[+] PhoneGap sslCertificateChecker : Bypassed');
        } catch (err) {
            console.log('[-] PhoneGap sslCertificateChecker : Skipped');
        }
//---------------------------------------------------------------------------------------------------------------------
        // IBM MobileFirst pinTrustedCertificatePublicKey (double bypass) //
        ///////////////////////////////////////////////////////////////////
        try {
            // Bypass IBM MobileFirst {1}
            var WLClient_Activity_1 = Java.use('com.worklight.wlclient.api.WLClient');
            WLClient_Activity_1.getInstance().pinTrustedCertificatePublicKey.overload('java.lang.String').implementation = function(cert) {
                console.log('[+] IBM MobileFirst pinTrustedCertificatePublicKey {1} : ' + cert + ' : Bypassing');
                return;
            };
            console.log('[+] IBM MobileFirst pinTrustedCertificatePublicKey {1} : Bypassed');
        } catch (err) {
            console.log('[-] IBM MobileFirst pinTrustedCertificatePublicKey {1} : Skipped');
        }
        try {
            // Bypass IBM MobileFirst {2}
            var WLClient_Activity_2 = Java.use('com.worklight.wlclient.api.WLClient');
            WLClient_Activity_2.getInstance().pinTrustedCertificatePublicKey.overload('[Ljava.lang.String;').implementation = function(cert) {
                console.log('[+] IBM MobileFirst pinTrustedCertificatePublicKey {2} : ' + cert + ' : Bypassing');
                return;
            };
            console.log('[+] IBM MobileFirst pinTrustedCertificatePublicKey {2} : Bypassed');
        } catch (err) {
            console.log('[-] IBM MobileFirst pinTrustedCertificatePublicKey {2} : Skipped');
        }
//---------------------------------------------------------------------------------------------------------------------
        // IBM WorkLight (ancestor of MobileFirst) HostNameVerifierWithCertificatePinning (quadruple bypass)  //
        ///////////////////////////////////////////////////////////////////////////////////////////////////////
        try {
            // Bypass IBM WorkLight {1}
            var worklight_Activity_1 = Java.use('com.worklight.wlclient.certificatepinning.HostNameVerifierWithCertificatePinning');
            worklight_Activity_1.verify.overload('java.lang.String', 'javax.net.ssl.SSLSocket').implementation = function(a, b) {
                console.log('[+] IBM WorkLight HostNameVerifierWithCertificatePinning {1} : ' + a + ' : Bypassing');                
                return;
            };
            console.log('[+] IBM WorkLight HostNameVerifierWithCertificatePinning {1} : Bypassed');
        } catch (err) {
            console.log('[-] IBM WorkLight HostNameVerifierWithCertificatePinning {1} : Skipped');
            //console.log(err);
        }
        try {
            // Bypass IBM WorkLight {2}
            var worklight_Activity_2 = Java.use('com.worklight.wlclient.certificatepinning.HostNameVerifierWithCertificatePinning');
            worklight_Activity_2.verify.overload('java.lang.String', 'java.security.cert.X509Certificate').implementation = function(a, b) {
                console.log('[+] IBM WorkLight HostNameVerifierWithCertificatePinning {2} : ' + a + ' : Bypassing');
                return;
            };
            console.log('[+] IBM WorkLight HostNameVerifierWithCertificatePinning {2} : Bypassed');
        } catch (err) {
            console.log('[-] IBM WorkLight HostNameVerifierWithCertificatePinning {2} : Skipped');
            //console.log(err);
        }
        try {
            // Bypass IBM WorkLight {3}
            var worklight_Activity_3 = Java.use('com.worklight.wlclient.certificatepinning.HostNameVerifierWithCertificatePinning');
            worklight_Activity_3.verify.overload('java.lang.String', '[Ljava.lang.String;', '[Ljava.lang.String;').implementation = function(a, b) {
                console.log('[+] IBM WorkLight HostNameVerifierWithCertificatePinning {3} : ' + a + ' : Bypassing');
                return;
            };
            console.log('[+] IBM WorkLight HostNameVerifierWithCertificatePinning {3} : Bypassed');
        } catch (err) {
            console.log('[-] IBM WorkLight HostNameVerifierWithCertificatePinning {3} : Skipped');
            //console.log(err);
        }
        try {
            // Bypass IBM WorkLight {4}
            var worklight_Activity_4 = Java.use('com.worklight.wlclient.certificatepinning.HostNameVerifierWithCertificatePinning');
            worklight_Activity_4.verify.overload('java.lang.String', 'javax.net.ssl.SSLSession').implementation = function(a, b) {
                console.log('[+] IBM WorkLight HostNameVerifierWithCertificatePinning {4} : ' + a + ' : Bypassing');
                return true;
            };
            console.log('[+] IBM WorkLight HostNameVerifierWithCertificatePinning {4} : Bypassed');
        } catch (err) {
            console.log('[-] IBM WorkLight HostNameVerifierWithCertificatePinning {4} : Skipped');
            //console.log(err);
        }
//---------------------------------------------------------------------------------------------------------------------
        // Conscrypt CertPinManager //
        //////////////////////////////
        try {
            var conscrypt_CertPinManager_Activity = Java.use('com.android.org.conscrypt.CertPinManager');
            conscrypt_CertPinManager_Activity.checkChainPinning.overload('java.lang.String', 'java.util.List').implementation = function(a, b) {
                console.log('[+] Conscrypt CertPinManager : ' + a + ' : Bypassing');
                //return;
                return true;
            };
            console.log('[+] Conscrypt CertPinManager : Bypassed');
        } catch (err) {
            console.log('[-] Conscrypt CertPinManager : Skipped');
            //console.log(err);
        }
//---------------------------------------------------------------------------------------------------------------------
        // Conscrypt CertPinManager (Legacy) //
        ///////////////////////////////////////
        try {
            var legacy_conscrypt_CertPinManager_Activity = Java.use('com.android.org.conscrypt.CertPinManager');
            legacy_conscrypt_CertPinManager_Activity.isChainValid.overload('java.lang.String', 'java.util.List').implementation = function(a, b) {
                console.log('[+] Conscrypt CertPinManager (Legacy) : ' + a + ' : Bypassing');
                return true;
            };
            console.log('[+] Conscrypt CertPinManager (Legacy) : Bypassed');
        } catch (err) {
            console.log('[-] Conscrypt CertPinManager (Legacy) : Skipped');
            //console.log(err);
        }
//---------------------------------------------------------------------------------------------------------------------
        // Worklight Androidgap WLCertificatePinningPlugin //
        /////////////////////////////////////////////////////
        try {
            var androidgap_WLCertificatePinningPlugin_Activity = Java.use('com.worklight.androidgap.plugin.WLCertificatePinningPlugin');
            androidgap_WLCertificatePinningPlugin_Activity.execute.overload('java.lang.String', 'org.json.JSONArray', 'org.apache.cordova.CallbackContext').implementation = function(a, b, c) {
                console.log('[+] Worklight Androidgap WLCertificatePinningPlugin : ' + a + ' : Bypassing');
                return true;
            };
            console.log('[+] Worklight Androidgap WLCertificatePinningPlugin : Bypassed');
        } catch (err) {
            console.log('[-] Worklight Androidgap WLCertificatePinningPlugin : Skipped');
            //console.log(err);
        }
//---------------------------------------------------------------------------------------------------------------------
        // Netty FingerprintTrustManagerFactory //
        //////////////////////////////////////////
        try {
            var netty_FingerprintTrustManagerFactory = Java.use('io.netty.handler.ssl.util.FingerprintTrustManagerFactory');
            //NOTE: sometimes this below implementation could be useful 
            //var netty_FingerprintTrustManagerFactory = Java.use('org.jboss.netty.handler.ssl.util.FingerprintTrustManagerFactory');
            netty_FingerprintTrustManagerFactory.checkTrusted.implementation = function(type, chain) {
                console.log('[+] Netty FingerprintTrustManagerFactory : Bypassing');
            };
            console.log('[+] Netty FingerprintTrustManagerFactory : Bypassed');
        } catch (err) {
            console.log('[-] Netty FingerprintTrustManagerFactory : Skipped');
            //console.log(err);
        }
//---------------------------------------------------------------------------------------------------------------------
        // Squareup CertificatePinner [OkHTTP<v3] (double bypass) //
        ////////////////////////////////////////////////////////////
        try {
            // Bypass Squareup CertificatePinner  {1}
            var Squareup_CertificatePinner_Activity_1 = Java.use('com.squareup.okhttp.CertificatePinner');
            Squareup_CertificatePinner_Activity_1.check.overload('java.lang.String', 'java.security.cert.Certificate').implementation = function(a, b) {
                console.log('[+] Squareup CertificatePinner {1} : ' + a + ' : Bypassing');
                return;
            };
            console.log('[+] Squareup CertificatePinner {1} : Bypassed');
        } catch (err) {
            console.log('[-] Squareup CertificatePinner {1} : Skipped');
            //console.log(err);
        }
        try {
            // Bypass Squareup CertificatePinner {2}
            var Squareup_CertificatePinner_Activity_2 = Java.use('com.squareup.okhttp.CertificatePinner');
            Squareup_CertificatePinner_Activity_2.check.overload('java.lang.String', 'java.util.List').implementation = function(a, b) {
                console.log('[+] Squareup CertificatePinner {2} : ' + a + ' : Bypassing');
                return;
            };
            console.log('[+] Squareup CertificatePinner {2} : Bypassed');
        } catch (err) {
            console.log('[-] Squareup CertificatePinner {2} : Skipped');
            //console.log(err);
        }
//---------------------------------------------------------------------------------------------------------------------
        // Squareup OkHostnameVerifier [OkHTTP v3] (double bypass) //
        /////////////////////////////////////////////////////////////
        try {
            // Bypass Squareup OkHostnameVerifier {1}
            var Squareup_OkHostnameVerifier_Activity_1 = Java.use('com.squareup.okhttp.internal.tls.OkHostnameVerifier');
            Squareup_OkHostnameVerifier_Activity_1.verify.overload('java.lang.String', 'java.security.cert.X509Certificate').implementation = function(a, b) {
                console.log('[+] Squareup OkHostnameVerifier {1} : ' + a + ' : Bypassing');
                return true;
            };
            console.log('[+] Squareup OkHostnameVerifier {1} : Bypassed');
        } catch (err) {
            console.log('[-] Squareup OkHostnameVerifier {1} : Skipped');
            //console.log(err);
        }    
        try {
            // Bypass Squareup OkHostnameVerifier {2}
            var Squareup_OkHostnameVerifier_Activity_2 = Java.use('com.squareup.okhttp.internal.tls.OkHostnameVerifier');
            Squareup_OkHostnameVerifier_Activity_2.verify.overload('java.lang.String', 'javax.net.ssl.SSLSession').implementation = function(a, b) {
                console.log('[+] Squareup OkHostnameVerifier {2} : ' + a + ' : Bypassing');
                return true;
            };
            console.log('[+] Squareup OkHostnameVerifier {2} : Bypassed');
        } catch (err) {
            console.log('[-] Squareup OkHostnameVerifier {2} : Skipped');
            //console.log(err);
        }
//---------------------------------------------------------------------------------------------------------------------
        // Android WebViewClient (quadruple bypass) //
        //////////////////////////////////////////////
        try {
            // Bypass WebViewClient {1} (deprecated from Android 6)
            var AndroidWebViewClient_Activity_1 = Java.use('android.webkit.WebViewClient');
            AndroidWebViewClient_Activity_1.onReceivedSslError.overload('android.webkit.WebView', 'android.webkit.SslErrorHandler', 'android.net.http.SslError').implementation = function(obj1, obj2, obj3) {
                console.log('[+] Android WebViewClient {1} : Bypassing');
            };
            console.log('[+] Android WebViewClient {1} : Bypassed');
        } catch (err) {
            console.log('[-] Android WebViewClient {1} : Skipped');
            //console.log(err)
        }
        try {
            // Bypass WebViewClient {2}
            var AndroidWebViewClient_Activity_2 = Java.use('android.webkit.WebViewClient');
            AndroidWebViewClient_Activity_2.onReceivedSslError.overload('android.webkit.WebView', 'android.webkit.WebResourceRequest', 'android.webkit.WebResourceError').implementation = function(obj1, obj2, obj3) {
                console.log('[+] Android WebViewClient {2} : Bypassing');
            };
            console.log('[+] Android WebViewClient {2} : Bypassed');
        } catch (err) {
            console.log('[-] Android WebViewClient {2} : Skipped');
            //console.log(err)
        }
        try {
            // Bypass WebViewClient {3}
            var AndroidWebViewClient_Activity_3 = Java.use('android.webkit.WebViewClient');
            AndroidWebViewClient_Activity_3.onReceivedError.overload('android.webkit.WebView', 'int', 'java.lang.String', 'java.lang.String').implementation = function(obj1, obj2, obj3, obj4) {
                console.log('[+] Android WebViewClient {3} : Bypassing');
            };
            console.log('[+] Android WebViewClient {3} : Bypassed');
        } catch (err) {
            console.log('[-] Android WebViewClient {3} : Skipped');
            //console.log(err)
        }
        try {
            // Bypass WebViewClient {4}
            var AndroidWebViewClient_Activity_4 = Java.use('android.webkit.WebViewClient');
            AndroidWebViewClient_Activity_4.onReceivedError.overload('android.webkit.WebView', 'android.webkit.WebResourceRequest', 'android.webkit.WebResourceError').implementation = function(obj1, obj2, obj3) {
                console.log('[+] Android WebViewClient {4} : Bypassing');
            };
            console.log('[+] Android WebViewClient {4} : Bypassed');
        } catch (err) {
            console.log('[-] Android WebViewClient {4} : Skipped');
            //console.log(err)
        }
//---------------------------------------------------------------------------------------------------------------------
        // Apache Cordova WebViewClient //
        //////////////////////////////////
        try {
            var CordovaWebViewClient_Activity = Java.use('org.apache.cordova.CordovaWebViewClient');
            CordovaWebViewClient_Activity.onReceivedSslError.overload('android.webkit.WebView', 'android.webkit.SslErrorHandler', 'android.net.http.SslError').implementation = function(obj1, obj2, obj3) {
                console.log('[+] Apache Cordova WebViewClient : Bypassing');
                obj3.proceed();
            };
            console.log('[+] Apache Cordova WebViewClient : Bypassed');
        } catch (err) {
            console.log('[-] Apache Cordova WebViewClient : Skipped');
            //console.log(err);
        }
//---------------------------------------------------------------------------------------------------------------------
        // Boye AbstractVerifier //
        ///////////////////////////
        try {
            var boye_AbstractVerifier = Java.use('ch.boye.httpclientandroidlib.conn.ssl.AbstractVerifier');
            boye_AbstractVerifier.verify.implementation = function(host, ssl) {
                console.log('[+] Boye AbstractVerifier check : ' + host + ' : Bypassing');
            };
            console.log('[+] Boye AbstractVerifier : Bypassed');
        } catch (err) {
            console.log('[-] Boye AbstractVerifier : Skipped');
            //console.log(err);
        }
//---------------------------------------------------------------------------------------------------------------------
        // Apache AbstractVerifier //
        /////////////////////////////
        try {
            var apache_AbstractVerifier = Java.use('org.apache.http.conn.ssl.AbstractVerifier');
            apache_AbstractVerifier.verify.implementation = function(a, b, c, d) {
                console.log('[+] Apache AbstractVerifier : ' + a + ' : Bypassing');
                return;
            };
            console.log('[+] Apache AbstractVerifier : Bypassed');
        } catch (err) {
            console.log('[-] Apache AbstractVerifier : Skipped');
            //console.log(err);
        }
//---------------------------------------------------------------------------------------------------------------------
        // Chromium Cronet //
        /////////////////////    
        try {
            var CronetEngineBuilderImpl_Activity = Java.use("org.chromium.net.impl.CronetEngineBuilderImpl");
            // Setting argument to TRUE (default is TRUE) to disable Public Key pinning for local trust anchors
            CronetEngine_Activity.enablePublicKeyPinningBypassForLocalTrustAnchors.overload('boolean').implementation = function(a) {
                console.log("[+] Disabling Public Key pinning for local trust anchors in Chromium Cronet");
                var cronet_obj_1 = CronetEngine_Activity.enablePublicKeyPinningBypassForLocalTrustAnchors.call(this, true);
                return cronet_obj_1;
            };
            // Bypassing Chromium Cronet pinner
            CronetEngine_Activity.addPublicKeyPins.overload('java.lang.String', 'java.util.Set', 'boolean', 'java.util.Date').implementation = function(hostName, pinsSha256, includeSubdomains, expirationDate) {
                console.log("[+] Chromium Cronet pinner: " + hostName + ' : Bypassing');
                var cronet_obj_2 = CronetEngine_Activity.addPublicKeyPins.call(this, hostName, pinsSha256, includeSubdomains, expirationDate);
                return cronet_obj_2;
            };
            console.log('[+] Chromium Cronet : Bypassed');
        } catch (err) {
            console.log('[-] Chromium Cronet : Skipped')
            //console.log(err);
        }
//---------------------------------------------------------------------------------------------------------------------
        // Flutter Pinning packages http_certificate_pinning and ssl_pinning_plugin (double bypass) //
        //////////////////////////////////////////////////////////////////////////////////////////////
        try {
            // Bypass HttpCertificatePinning.check {1}
            var HttpCertificatePinning_Activity = Java.use('diefferson.http_certificate_pinning.HttpCertificatePinning');
            HttpCertificatePinning_Activity.checkConnexion.overload("java.lang.String", "java.util.List", "java.util.Map", "int", "java.lang.String").implementation = function (a, b, c ,d, e) {
                console.log('[+] Flutter HttpCertificatePinning : ' + a + ' : Bypassing');
                return true;
            };
            console.log('[+] Flutter HttpCertificatePinning : Bypassed');
        } catch (err) {
            console.log('[-] Flutter HttpCertificatePinning : Skipped');
            //console.log(err);
        }
        try {
            // Bypass SslPinningPlugin.check {2}
            var SslPinningPlugin_Activity = Java.use('com.macif.plugin.sslpinningplugin.SslPinningPlugin');
            SslPinningPlugin_Activity.checkConnexion.overload("java.lang.String", "java.util.List", "java.util.Map", "int", "java.lang.String").implementation = function (a, b, c ,d, e) {
                console.log('[+] Flutter SslPinningPlugin : ' + a + ' : Bypassing');
                return true;
            };
            console.log('[+] Flutter SslPinningPlugin : Bypassed');
        } catch (err) {
            console.log('[-] Flutter SslPinningPlugin : Skipped');
            //console.log(err);
        }
//---------------------------------------------------------------------------------------------------------------------
        // Dynamic SSLPeerUnverifiedException Patcher                                //
        // An useful technique to bypass SSLPeerUnverifiedException failures raising //
        // when the Android app uses some uncommon SSL Pinning methods or an heavily //
        // code obfuscation. Inspired by an idea of: https://github.com/httptoolkit  //
        ///////////////////////////////////////////////////////////////////////////////
        function rudimentaryFix(typeName) {
            // This is a improvable rudimentary fix, if not works you can patch it manually
            if (typeName === undefined){
                return;
            } else if (typeName === 'boolean') {
                return true;
            } else {
                return null;
            }
        }
        try {
            var UnverifiedCertError = Java.use('javax.net.ssl.SSLPeerUnverifiedException');
            UnverifiedCertError.$init.implementation = function (str) {
                console.log('[!] Unexpected SSLPeerUnverifiedException occurred, trying to patch it dynamically...');
                try {
                    var stackTrace = Java.use('java.lang.Thread').currentThread().getStackTrace();
                    var exceptionStackIndex = stackTrace.findIndex(stack =>
                        stack.getClassName() === "javax.net.ssl.SSLPeerUnverifiedException"
                    );
                    // Retrieve the method raising the SSLPeerUnverifiedException
                    var callingFunctionStack = stackTrace[exceptionStackIndex + 1];
                    var className = callingFunctionStack.getClassName();
                    var methodName = callingFunctionStack.getMethodName();
                    var callingClass = Java.use(className);
                    var callingMethod = callingClass[methodName];
                    console.log('[!] Attempting to bypass uncommon SSL Pinning method on: ' + className + '.' + methodName);                    
                    // Skip it when already patched by Frida
                    if (callingMethod.implementation) {
                        return; 
                    }
                    // Trying to patch the uncommon SSL Pinning method via implementation
                    var returnTypeName = callingMethod.returnType.type;
                    callingMethod.implementation = function() {
                        rudimentaryFix(returnTypeName);
                    };
                } catch (e) {
                    // Dynamic patching via implementation does not works, then trying via function overloading
                    //console.log('[!] The uncommon SSL Pinning method has more than one overload); 
                    if (String(e).includes(".overload")) {
                        var splittedList = String(e).split(".overload");
                        for (let i=2; i<splittedList.length; i++) {
                            var extractedOverload = splittedList[i].trim().split("(")[1].slice(0,-1).replaceAll("'","");
                            // Check if extractedOverload has multiple arguments
                            if (extractedOverload.includes(",")) {
                                // Go here if overloaded method has multiple arguments (NOTE: max 6 args are covered here)
                                var argList = extractedOverload.split(", ");
                                console.log('[!] Attempting overload of ' + className + '.' + methodName + ' with arguments: ' + extractedOverload);
                                if (argList.length == 2) {
                                    callingMethod.overload(argList[0], argList[1]).implementation = function(a,b) {
                                        rudimentaryFix(returnTypeName);
                                    }
                                } else if (argNum == 3) {
                                    callingMethod.overload(argList[0], argList[1], argList[2]).implementation = function(a,b,c) {
                                        rudimentaryFix(returnTypeName);
                                    }
                                }  else if (argNum == 4) {
                                    callingMethod.overload(argList[0], argList[1], argList[2], argList[3]).implementation = function(a,b,c,d) {
                                        rudimentaryFix(returnTypeName);
                                    }
                                }  else if (argNum == 5) {
                                    callingMethod.overload(argList[0], argList[1], argList[2], argList[3], argList[4]).implementation = function(a,b,c,d,e) {
                                        rudimentaryFix(returnTypeName);
                                    }
                                }  else if (argNum == 6) {
                                    callingMethod.overload(argList[0], argList[1], argList[2], argList[3], argList[4], argList[5]).implementation = function(a,b,c,d,e,f) {
                                        rudimentaryFix(returnTypeName);
                                    }
                                } 
                            // Go here if overloaded method has a single argument
                            } else {
                                callingMethod.overload(extractedOverload).implementation = function(a) {
                                    rudimentaryFix(returnTypeName);
                                }
                            }
                        }
                    } else {
                        console.log('[-] Failed to dynamically patch SSLPeerUnverifiedException ' + e);
                    }
                }
                //console.log('\x1b[36m[+] SSLPeerUnverifiedException hooked\x1b[0m');
                return this.$init(str);
            };
        } catch (err) {
            //console.log('\x1b[36m[-] SSLPeerUnverifiedException not found\x1b[0m');
            //console.log('\x1b[36m'+err+'\x1b[0m');
        }
//---------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------
    });
}, 0);