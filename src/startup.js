
/* Beispiel Funktion für eine Startup hook:

async function setFlag(properties, out) {
    properties['didThing'] = true;
    out.sequential = true;
    console.log("Did thing");
}

*/

import {readFile} from "node:fs/promises";

export default class StartupManager {

    constructor() {
        this.hooks = [];
        this.startupProperties = {};
    }

    addHook(func) {

        if (func == null) {
            throw new Error('Unable to register startup hook: function is null');
        }

        if (typeof func !== 'function') {
            throw new Error('Unable to register startup hook: not a function');
        }

        this.hooks.push(func);

        return this;
    }

    async run() {

        let config = null;

        try {
            const configPath = __APP_DIR__ + "/config.json";
            const response = await readFile(configPath, 'utf-8');

            config = JSON.parse(response);
        } catch (e) {
            console.error('Error reading config file: ', e);
        }

        if (config) {
            Object.assign(this.startupProperties, config);
        }

        if (this.hooks.length === 0) return;

        let parallelPromises = [];

        function abortStartup(reason, code) {

            this.__abort = true;

            if (reason == null) {
                console.warn("Signalled startup interrupt without reason");
                return;
            }

            this.__abortReason = reason;

            if (code != null && typeof code === 'number') {
                this.__abortCode = code;
            }
        }

        for (const hook of this.hooks) {

            const outParams = {
                sequential: false,
                __abort: false,
                __abortCode: -1,
                __abortReason: null,
                __abortStartup: abortStartup
            };

            try {
                const result = hook(this.startupProperties, outParams);

                if (result instanceof Promise) {
                    if (outParams.sequential) {
                        await result;
                    } else {
                        parallelPromises.push(result);
                    }
                }

            } catch (e) {
                console.error('Error in startup hook: ', e);
            }

            if (outParams.__abort === true) {
                await Promise.all(parallelPromises);
                console.error("Program exited during startup: ", outParams.__abortReason);
                process.exit(outParams.__abortCode);
            }
        }

        await Promise.all(parallelPromises);
    }
}
