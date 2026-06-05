from importlib.resources import files

BUILTIN_SCRIPT_TEMPLATES = {
    "None": None,
    "SSL / Android SSL Pinning Bypass": "templates/ssl/android_ssl_pinning_bypass.js",
    "Root / Android Root Detection Bypass": "templates/root/android_root_bypass.js",
    "Crypto / Crypto Logger": "templates/crypto/crypto_logger.js",
    "HTTP / HTTP Logger": "templates/http/http_logger.js",
}


def load_builtin_template(name: str) -> str:
    rel_path = BUILTIN_SCRIPT_TEMPLATES.get(name)

    if not rel_path:
        return ""

    return files("noxen").joinpath(rel_path).read_text(encoding="utf-8")