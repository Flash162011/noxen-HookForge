# HookForge

> Advanced Android Runtime Interception Framework built on top of Noxen

HookForge is a runtime interception framework for Android applications that allows security testers and researchers to inspect, modify, and manipulate Java method calls while the application is running.

Unlike traditional network proxies, HookForge operates inside the application process using Frida, allowing interception of method arguments, return values, device binding functions, cryptographic operations, authentication logic, and business workflows.

---

# Features

## Runtime Request Editing

Modify method arguments before the target method executes.

Examples:

* Modify API request parameters
* Change authentication values
* Modify OTP requests
* Alter device binding parameters
* Modify plaintext data before encryption

---

## Runtime Response Editing

Modify method return values before the application consumes them.

Examples:

* Modify API responses
* Alter authentication results
* Change business logic decisions
* Modify decrypted responses
* Test client-side authorization controls

---

## Interception Modes

HookForge supports three interception modes.

### PRE Mode

Intercepts before the method executes.

Use when you want to modify:

* Request parameters
* Encryption inputs
* Device binding values
* Authentication requests

---

### RETURN Mode

Intercepts after the method executes.

Use when you want to modify:

* Response objects
* Decrypted data
* Validation results
* Authentication decisions

---

### BOTH Mode

Intercepts before and after execution.

Use when you want to inspect:

* Device binding operations
* Fingerprint generation
* Key derivation functions
* Security-sensitive workflows

---

## Automatic JSON Formatting

Automatically formats JSON payloads inside the Intercept and History views.

Benefits:

* Easier reading
* Faster analysis
* Cleaner editing experience

---

## Syntax Highlighting

Provides syntax highlighting for structured data.

Supported formats:

* JSON
* XML
* JWT
* HTTP Payloads

---

## HTTP Flow Reconstruction

Reconstructs request and response flows from intercepted runtime methods.

This is useful when applications use:

* Custom encryption
* Proprietary protocols
* Certificate pinning
* SDK-based communication

Example:

```text
Application
    ↓
Request Builder
    ↓
Encryption
    ↓
Network Layer
    ↓
Response
    ↓
Decryption
    ↓
Business Logic
```

HookForge can reconstruct the complete flow even when the network traffic itself is encrypted.

---

## SSL Pinning Templates

Built-in template support for common SSL pinning bypass scripts.

Templates can be placed in:

```text
templates/
└── ssl_pinning/
```

Examples:

```text
templates/ssl_pinning/okhttp.js
templates/ssl_pinning/trustmanager.js
templates/ssl_pinning/universal_ssl_bypass.js
```

Templates can be loaded directly from the HookForge UI without manually copying Frida scripts.

---

## Root Bypass Templates

Built-in template support for root and emulator detection bypasses.

Templates can be placed in:

```text
templates/
└── root_bypass/
```

Examples:

```text
templates/root_bypass/rootbeer.js
templates/root_bypass/magisk.js
templates/root_bypass/emulator_detection.js
```

Templates are available directly from the UI and can be injected without modifying the primary Frida script.

---

## Automatic Method Discovery

Automatically scans loaded classes and identifies potentially interesting methods.

Categories include:

* Cryptography
* Device Binding
* Authentication
* Storage
* Networking
* Root Detection

Benefits:

* Reduces manual reverse engineering
* Accelerates hook creation
* Helps identify security-relevant methods

---

# Runtime Interception Workflow

HookForge is not limited to encryption and decryption functions.

Any Java method can be intercepted.

Example 1:

```text
login(username, password)

PRE
↓
Modify username/password
↓
Original method executes
```

Example 2:

```text
isRooted()

RETURN
↓
Modify return value
↓
Return false
```

Example 3:

```text
getDeviceFingerprint(salt)

BOTH
↓
Inspect/modify input
↓
Method executes
↓
Inspect/modify output
```

---

# Prerequisites

## Python

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
```

Install:

```bash
pip install frida-tools==13.6.1
pip install frida==16.6.6
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

---

# Installation

## Install NVM

```powershell
winget install CoreyButler.NVMforWindows
```

---

## Install Node.js

```powershell
nvm install 22
nvm use 22
```

---

## Install Dependencies

```powershell
npm install
```

---

## Build

```powershell
npm run build
```

---

## Run HookForge

```powershell
python -m noxen
```

---

# Common Use Cases

* Mobile Banking Assessments
* Runtime API Manipulation
* SSL Pinning Analysis
* Root Detection Bypass
* OneSpan Device Binding Analysis
* Authentication Testing
* Business Logic Testing
* Mobile Application Security Research

---

# Disclaimer

HookForge is intended for authorized security testing, research, and educational purposes only.
