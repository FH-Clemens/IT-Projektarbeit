import fs from 'fs';
import path from 'path';

function saveQueue(queue){
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const folderName = `${year}${month}${day}`;
    const fileName = `${hours}${minutes}${seconds}.json`;

    const folderPath = path.join(__APP_DIR__, 'queue-data', folderName);
    const filePath = path.join(folderPath, fileName);

    if(!fs.existsSync(folderPath)){
        fs.mkdirSync(folderPath, {recursive: true})
    }

    fs.writeFileSync(filePath, JSON.stringify(queue, null, 2));
}

export default saveQueue;