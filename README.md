# HookForge

> Advanced Android Runtime Interception and Mobile Security Testing Framework built on top of Noxen and Frida.

HookForge extends the original Noxen platform with advanced runtime interception capabilities, allowing security testers and researchers to inspect, modify, and manipulate Android application behavior in real time.

Unlike traditional network proxies, HookForge operates inside the application process using Frida, enabling interception of Java methods, Android components, authentication workflows, device binding operations, cryptographic functions, and application business logic.

---

# Features

## Android Component Interception

HookForge retains all original Noxen Android component interception capabilities.

Supported components:

* Activities
* Intents
* Services
* Broadcast Receivers
* PendingIntents

Captured information:

* Action
* Component Name
* Data URI
* Categories
* Flags
* Extras
* Stack Traces

Use cases:

* Analyze component communication
* Modify intent data before forwarding
* Drop intercepted intents
* Discover exported attack surfaces
* Test Android component security

---

## Runtime Request Editing

Modify method arguments before the target method executes.

Examples:

* Modify API request parameters
* Change authentication values
* Alter OTP requests
* Modify JWT claims
* Modify request signatures
* Change device binding parameters
* Modify plaintext data before encryption

---

## Runtime Response Editing

Modify method return values before the application consumes them.

Examples:

* Modify API responses
* Alter authentication results
* Change authorization decisions
* Modify decrypted responses
* Bypass client-side restrictions
* Test business logic controls

---

## Interception Modes

HookForge supports three interception modes.

### PRE Mode

Intercepts before the original method executes.

Available:

* Method arguments
* Method metadata

Common use cases:

* Encryption functions
* Request signing
* JWT generation
* HMAC generation
* Device binding parameters
* Authentication requests

---

### RETURN Mode

Intercepts after the original method executes.

Available:

* Method return value

Common use cases:

* Decryption functions
* Response parsing
* Token validation
* Authentication decisions
* Business logic responses

---

### BOTH Mode

Intercepts before and after execution.

Available:

* Method arguments
* Method return values

Common use cases:

* Device binding analysis
* Fingerprint generation
* Key derivation functions
* Security-sensitive workflows

---

## Automatic JSON Formatting

Automatically detects and formats JSON payloads.

Benefits:

* Improved readability
* Faster analysis
* Cleaner editing experience
* Easier request and response review

---

## Syntax Highlighting

Provides syntax highlighting for structured content.

Supported formats:

* JSON
* XML
* JWT
* HTTP Payloads

Benefits:

* Better readability
* Faster payload analysis
* Easier identification of parameters and values

---

## HTTP Flow Reconstruction

Reconstructs application-layer request and response flows from intercepted runtime methods.

This is especially useful when applications use:

* Custom encryption
* Proprietary protocols
* Certificate pinning
* SDK-based communication
* Non-standard networking frameworks

Example:

```text
Application
    ↓
Request Builder
    ↓
Custom Processing
    ↓
Network Layer
    ↓
Response
    ↓
Response Processing
    ↓
Business Logic
```

HookForge can reconstruct and display the flow even when network traffic cannot be easily inspected.

---

## SSL Pinning Templates

Built-in support for reusable SSL pinning bypass templates.

Templates can be stored under:

```text
templates/
└── ssl_pinning/
```

Example templates:

```text
templates/ssl_pinning/okhttp.js
templates/ssl_pinning/trustmanager.js
templates/ssl_pinning/universal_ssl_bypass.js
```

Templates can be loaded directly from the HookForge UI.

Benefits:

* Faster assessment setup
* Reusable Frida scripts
* Reduced manual scripting effort

---

## Root Bypass Templates

Built-in support for reusable root and emulator detection bypass templates.

Templates can be stored under:

```text
templates/
└── root_bypass/
```

Example templates:

```text
templates/root_bypass/rootbeer.js
templates/root_bypass/magisk.js
templates/root_bypass/emulator_detection.js
```

Templates can be loaded directly from the HookForge UI.

Benefits:

* Rapid testing setup
* Reusable bypass library
* Faster assessment workflows

---

## Automatic Method Discovery

Automatically scans loaded classes and identifies security-relevant methods.

Discovery categories:

* Cryptography
* Device Binding
* Authentication
* Storage
* Networking
* Root Detection
* Biometric Operations

### Automatic Hook Generation

Discovered methods can be automatically exported into HookForge-compatible hook definitions.

Generated output example:

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

Benefits:

* Reduces reverse engineering effort
* Automatically generates hooks.json
* Accelerates hook creation
* Simplifies onboarding for new applications
* Helps identify hidden security-sensitive methods

---

## APK Analysis

HookForge supports APK analysis to assist in identifying Android attack surfaces.

Capabilities include:

* Component discovery
* Exported component identification
* Intent analysis
* Entry-point discovery
* Hook generation preparation

Benefits:

* Faster application onboarding
* Improved visibility of attack surfaces
* Simplified hook configuration generation

---

## History and Session Tracking

All intercepted activities are preserved in the History view.

Stored information includes:

* Method calls
* Android component events
* Arguments
* Return values
* Stack traces
* Interception decisions

Benefits:

* Easier review of previous sessions
* Workflow reconstruction
* Audit trail for testing activities

---

# Runtime Interception Workflow

HookForge is not limited to encryption and decryption functions.

Any Java method can be intercepted.

### Example 1 - Login Request

```text
login(username, password)

PRE
↓
Modify username/password
↓
Original method executes
```

---

### Example 2 - Root Detection

```text
isRooted()

RETURN
↓
Modify return value
↓
Return false
```

---

### Example 3 - Device Binding

```text
getDeviceFingerprint(salt)

BOTH
↓
Inspect or modify input
↓
Method executes
↓
Inspect or modify output
```

---

### Example 4 - Encrypted Application

```text
Request Builder
        ↓
encrypt()
        ↓
Network Request
        ↓
Network Response
        ↓
decrypt()
        ↓
Business Logic
```

HookForge can intercept at any stage of the workflow depending on the configured hooks.

---

# Prerequisites

## Python

Required:

```text
Python 3.10+
```

Verify:

```bash
python --version
```

---

## Node.js

Recommended:

```text
Node.js 22 LTS
```

Verify:

```bash
node -v
```

---

## Frida

Recommended:

```text
Frida 16.6.6
Frida Tools 13.6.1
```

Install:

```bash
pip install frida==16.6.6
pip install frida-tools==13.6.1
```

Verify:

```bash
frida --version
```

---

## Android Requirements

* Android Device or Emulator
* USB Debugging Enabled
* ADB Installed
* Frida Server (when required)

Verify:

```bash
adb devices
```

---

# Installation

## Install NVM (Windows)

```powershell
winget install CoreyButler.NVMforWindows
```

---

## Install Node.js

```powershell
nvm install 22
nvm use 22
```

Verify:

```powershell
node -v
```

---

## Install Python Dependencies

```powershell
pip install -r requirements.txt
```

---

## Install Node Dependencies

```powershell
npm install
```

---

## Build HookForge

```powershell
npm run build
```

---

## Run HookForge

```powershell
python -m noxen
```

---

# Typical Use Cases

* Mobile Banking Assessments
* Runtime API Manipulation
* SSL Pinning Analysis
* Root Detection Bypass
* OneSpan Device Binding Analysis
* Authentication Testing
* Business Logic Testing
* Mobile Application Security Research
* Android Component Analysis
* Runtime Cryptography Analysis

---

# Disclaimer

HookForge is intended for authorized security testing, research, and educational purposes only.

Users are responsible for ensuring they have proper authorization before testing any application, device, or environment.
