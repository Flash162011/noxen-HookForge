# HookForge

> Advanced Android Runtime Interception Framework built on top of Noxen

HookForge is an enhanced runtime interception framework for Android applications that enables Burp-like runtime analysis and manipulation directly at the Java method layer.

Unlike traditional network proxies, HookForge operates inside the application runtime using Frida, allowing interception and modification of method arguments, return values, encrypted requests, decrypted responses, device binding operations, cryptographic functions, and application security controls.

---

# Key Features

## Runtime Request Editing

Intercept and modify method arguments before the target method executes.

Typical use cases:

* Modify plaintext requests before encryption
* Modify JWT claims before signing
* Change HMAC inputs
* Manipulate OTP and authentication parameters
* Test business logic controls

---

## Runtime Response Editing

Intercept and modify return values before they are consumed by the application.

Typical use cases:

* Modify decrypted API responses
* Test client-side authorization controls
* Alter business data at runtime
* Bypass client-side restrictions

---

## Interception Modes

HookForge supports three interception modes.

### PRE Mode

Intercepts execution before the original method is called.

**Available:**

* Arguments
* Method metadata

**Use cases:**

* Encryption
* Request signing
* JWT generation
* Device Binding SALT modification

---

### RETURN Mode

Intercepts execution after the original method completes.

**Available:**

* Return value

**Use cases:**

* Decryption
* Response processing
* Token validation
* Business response manipulation

---

### BOTH Mode

Intercepts execution both before and after the method call.

**Available:**

* Arguments
* Return values

**Use cases:**

* Device Binding analysis
* Fingerprint generation
* Key derivation functions
* Alias generation

---

## Automatic JSON Formatting

Automatically detects JSON payloads and formats them for readability.

Benefits:

* Easier payload review
* Cleaner editing experience
* Reduced manual formatting

---

## Syntax Highlighting

Provides syntax highlighting for:

* JSON
* XML
* JWT
* HTTP Payloads

Benefits:

* Improved readability
* Faster identification of parameters
* Better payload analysis

---

## HTTP Flow Reconstruction

Reconstructs application-layer HTTP communication from runtime method interceptions.

Benefits:

* Visualize request/response pairs
* Analyze encrypted applications
* Understand API workflows without network visibility

---

## SSL Pinning Templates

Built-in Frida templates for bypassing common SSL pinning implementations.

Supported categories include:

* OkHttp
* TrustManager
* WebView SSL Validation
* Certificate Pinning
* Custom SSL Validators

Benefits:

* Faster assessment setup
* Reduced scripting effort

---

## Root Bypass Templates

Built-in templates for bypassing root and device integrity checks.

Supported categories include:

* RootBeer
* Magisk Detection
* File-Based Detection
* Package Detection
* Emulator Detection

Benefits:

* Rapid security assessment setup
* Reusable bypass library

---

## Automatic Method Discovery

Automatically scans loaded classes and identifies security-relevant methods.

Discovery categories include:

* Cryptography
* Device Binding
* Authentication
* Storage
* Networking
* Root Detection
* Biometric Operations

Benefits:

* Reduces reverse engineering effort
* Accelerates hook generation
* Simplifies assessment workflows

---

# Runtime Interception Workflow

## Request Flow

```text
Plaintext Request
        ↓
HookForge PRE Interception
        ↓
Modify Arguments
        ↓
encrypt()
        ↓
Encrypted Request
```

## Response Flow

```text
Encrypted Response
        ↓
decrypt()
        ↓
HookForge RETURN Interception
        ↓
Modify Return Value
        ↓
Application Consumes Response
```

---

# Architecture

```text
Android Application
        ↓
Frida Agent
        ↓
HookForge Runtime Engine
        ↓
Interception Framework
        ↓
UI / History / Flow Reconstruction
```

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

Install:

```bash
pip install frida-tools
```

Verify:

```bash
frida --version
```

---

## Android Device

Requirements:

* Android Device or Emulator
* USB Debugging Enabled
* Frida Server (if required)
* ADB Installed

---

# Installation

## Install NVM

Windows:

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

# Supported Analysis Scenarios

* Mobile Banking Applications
* FinTech Applications
* OneSpan DigiPass Analysis
* Device Binding Analysis
* Runtime API Manipulation
* Authentication Testing
* Business Logic Testing
* SSL Pinning Bypass
* Root Detection Bypass
* Mobile Application Security Assessments

---

# Disclaimer

HookForge is intended for authorized security testing, research, and educational purposes only.

Users are responsible for ensuring compliance with applicable laws, regulations, and authorization requirements before using this software.
