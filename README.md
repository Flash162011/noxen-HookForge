## Automatic Method Discovery

HookForge can automatically scan loaded application classes and identify security-relevant methods.

Discovery categories include:

* Cryptography
* Device Binding
* Authentication
* Storage
* Networking
* Root Detection
* Biometric Operations

The Discovery tab helps reduce manual reverse engineering by identifying potential methods that may be useful for runtime interception.

### Automatic Hook Generation

Discovered methods can be exported directly into a HookForge-compatible `hooks.json` file.

Example generated output:

```json
{
  "clazz": "com.kony.crypto.aes.AESUtil",
  "method": "decrypt",
  "args": [
    "java.lang.String",
    "java.lang.Object"
  ],
  "interceptMode": "return"
}
```

HookForge automatically suggests the most appropriate interception mode:

| Method Type               | Suggested Mode |
| ------------------------- | -------------- |
| Encryption                | PRE            |
| Request Signing           | PRE            |
| Device Binding            | BOTH           |
| Decryption                | RETURN         |
| Response Parsing          | RETURN         |
| Authentication Validation | RETURN         |

Benefits:

* Reduces reverse engineering effort
* Automatically generates `hooks.json`
* Accelerates hook creation
* Simplifies onboarding for new applications
* Helps identify hidden security-sensitive methods
