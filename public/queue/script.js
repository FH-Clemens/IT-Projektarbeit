
const queueButton = document.getElementById('enter-queue-button');
const userNumberSpan = document.getElementById('user-number');
const queueRenderList = document.getElementById('queue-render');

function queueUp() {

    fetch("/api/queue/enter").then(response => {

        if (!response.ok) {
            console.warn(`Failed to enter queue: ${response.statusText}`);
            return;
        }

        response.json().then(responseJSON => {
            userNumberSpan.textContent = responseJSON['queueNumber'];
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
    queueUp();
    refreshQueueStatus();
    event.stopPropagation();
})