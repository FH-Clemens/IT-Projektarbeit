
/* Beispiel Funktion für eine Startup hook:

async function setFlag(properties, out) {
    properties['didThing'] = true;
    out.sequential = true;
    console.log("Did thing");
}

*/

import {loadConfig} from "./config.js";

class StartupManager {

    constructor() {
        this.hooks = [];
        this.config = null;
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

        this.config = await loadConfig();

        if (this.hooks.length === 0) return;

        let parallelPromises = [];

        function logError(err) {
            console.error(`Error in startup hook: `, err);
        }

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
                const result = hook(this.config, outParams);

                if (result instanceof Promise) {
                    if (outParams.sequential) {
                        await result;
                    } else {
                        const safePromise = result.catch(logError);
                        parallelPromises.push(safePromise);
                    }
                }

            } catch (e) {
                logError(e);
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

const instance = new StartupManager();

export default instance;
