# Public development signing identity

This keystore is intentionally distributed, including its private key, ONLY to keep
sideloaded debug APK updates compatible across fresh CI runners. It is not secret.
Store/key password: `android`. Alias: `androiddebugkey`. PKCS12; RSA 2048.

Do not regenerate casually; existing test installs depend on it. Never use it for
production/store signing. No real production credentials are included in this project.
