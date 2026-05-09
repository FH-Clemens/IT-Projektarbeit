import { saveQueueEntry, getValidEntry} from "./localStorageManger.js";

const queueButton = document.getElementById('enter-queue-button');
const userNumberSpan = document.getElementById('user-number');
const queueRenderList = document.getElementById('queue-render');

function queueUp() {

    fetch("/api/queue/enter", {
        method: 'POST'
    }).then(response => {

        if (!response.ok) {
            console.warn(`Failed to enter queue: ${response.statusText}`);
            return;
        }

        response.json().then(responseJSON => {
            userNumberSpan.textContent = responseJSON['queueNumber'];

            saveQueueEntry(responseJSON['queueNumber']);
        })
    });
}

function refreshQueueStatus() {

    fetch("/api/queue/get-queue").then(response => {

        if (!response.ok) {
            console.warn(`Failed to fetch queue status: ${response.statusText}`);
            return;
        }

        response.json().then(responseJSON => {
            queueRenderList.innerHTML = "";
            responseJSON.queue.forEach(entry => {
                const li = document.createElement('li');
                li.textContent = entry.queueNumber;
                li.classList.add('list-group-item');
                queueRenderList.appendChild(li);
            })
        })
    });

}

queueButton.addEventListener('click', event => {
    const storedEntry = getValidEntry();
    if(!storedEntry) {
        queueUp();
    }else {
        userNumberSpan.textContent = storedEntry.queueNumber;
    }

    refreshQueueStatus();
    event.stopPropagation();
})

const storedEntry = getValidEntry();
if(storedEntry) userNumberSpan.textContent = storedEntry.queueNumber;

refreshQueueStatus();
