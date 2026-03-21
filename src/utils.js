import { fileURLToPath } from 'url';
import { dirname } from 'path';

export function getDirname(importMetaUrl) {
    const filename = fileURLToPath(importMetaUrl);
    return dirname(filename);
}
