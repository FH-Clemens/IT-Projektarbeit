import { loadQueueFromDisk, removeStaleQueueData} from "./persistence.js";

export async function loadQueueFromDiskHook(_, out) {
    out.sequential = true;
    await loadQueueFromDisk();
}

export async function removeStaleDataHook(properties, out){

    out.sequential = true;
    const retainDays = properties["queue.retain-data-days"] || 3;

    console.info(`Removing stale data. Retaining ${retainDays} days...`);

    return removeStaleQueueData(retainDays).then(didRemove => {
        if (didRemove) {
            console.info('Done.');
        } else {
            console.info('Nothing to clean');
        }
    })
}