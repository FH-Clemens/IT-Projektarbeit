
import { readFile } from "fs/promises";
import path from "path";

let config = {};
let loaded = false;

export async function loadConfig() {

    const configPath = path.join(__DATA_DIR__, "config.json");

    try {
        const raw = await readFile(configPath, "utf-8");
        config = JSON.parse(raw);
    } catch (e) {
        console.warn("Config missing or invalid, using empty config:", e.message);
        config = {};
    }

    loaded = true;
    return config;
}
