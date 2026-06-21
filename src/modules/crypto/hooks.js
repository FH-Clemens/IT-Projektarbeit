import crypto from "crypto";

function getSecret(name) {

    if (process.env[name]) {
        return {
            value: process.env[name],
            generated: false
        };
    }

    const generated = crypto.randomBytes(32).toString("hex");

    console.warn(
        `WARNING: ${name} is not set. Generating temporary secret for this runtime.`
    );

    return {
        value: generated,
        generated: true
    };
}

async function genSecret(config, out) {

    const jwt = getSecret("JWT_SECRET");
    const csrf = getSecret("CSRF_SECRET");

    config.JWT_SECRET = jwt.value;
    config.CSRF_SECRET = csrf.value;

    if (jwt.generated || csrf.generated) {
        out.sequential = true;
    }

    if (!jwt.generated && !csrf.generated) {
        console.log("Secrets loaded from environment.");
    } else {
        console.warn("Running with temporary secrets. Authentication state is not persistent.");
    }
}

export default genSecret;