
const minTime = 1
const maxTime = 9

var queueSize = 6
var parallelWorkerCount = 3

const allAsyncOps = []
let queueEndReached = false;
var jobId = 0 , doneCount = 0;

//-->job cunstructor<--//
function Job() {
        this.id = jobId,
        this.timeMs = Math.floor((Math.random() * (maxTime - minTime) + minTime) * 1000),
        this.time = (jobId++, (Math.floor((this.timeMs) / 100) / 10))
}

$(document).ready(function () {
    var tempQueue = $('.col-sm-1').eq(0).clone()
    var tempparallelWorkerCount = $('.col').eq(0).clone()
    $('.col-sm-1').eq(0).remove()
    $('.col').eq(0).remove()
    $('.tedad').eq(2).html(doneCount)   

    for (let i = 0; i < parallelWorkerCount; i++) {
        tempparallelWorkerCount.clone().find('span').html(i+1).end().appendTo($('#doing'));
        $('.tedad').eq(1).html(parallelWorkerCount)
    }

    var queue = ','.repeat(queueSize - 1).split(',').map(() => {
        var newJob = new Job();
        tempQueue.clone().find('h6').html(newJob.id).end().find('p').html(newJob.time + " s").end().appendTo($('#Todo'));
        $('.tedad').eq(0).html(queueSize)
        return newJob
    })

    $('.btn').click(function () {
        queue +=','.repeat(0).split(',').map(() => {
            var newJob = new Job();
            tempQueue.clone().find('h6').html(newJob.id).end().find('p').html(newJob.time + " s").end().appendTo($('#Todo'));
            $('.tedad').eq(0).html(queueSize)
            return newJob
        })
        queueSize++;
        $('.tedad').eq(0).html(queueSize)
    })


    
    const workers = ','.repeat(parallelWorkerCount - 1).split(',').map((v, i) => i + 1)

    console.log('queue:', queue)
    console.log('workers:', workers)

    const queueGenerator = (function* () {
        for (const item of queue) yield item;
    })()

    const sampleAsyncOp = (job,worker) => new Promise((res, rej) => {
        moveTodoToDoing(job.id,worker)
        setTimeout(() => {
        if(moveDoingToDone(job.id,worker))
              res(job)
    }, job.timeMs)})


    workers.forEach(async worker => {
        console.log("Worker", worker, "started!")
        for (const job of queueGenerator) {
            console.log("Worker", worker, "PICKED Job", job.id, `(takes ${job.time}s)`)
            const asyncOp = sampleAsyncOp(job,worker)
            allAsyncOps.push(asyncOp)
            const jobResult = await asyncOp
            console.log("Worker", worker, "FINISHED Job", job, `(confirmed ${jobResult == job})`)
        }
        console.log("Worker", worker, "has no job!")
        if (!queueEndReached) {
            console.log("First jobless worker. End of Queue Reached! Waiting for all to finish.")
            Promise.all(allAsyncOps).then(results => console.log("ALL FINISHED!!!", results))
            queueEndReached = true;
        }
    })

    function moveTodoToDoing(id,worker) {
        for (let index = 0; index < queueSize; index++) {
            if($('.col-sm-1>div').find('h6').eq(index).html() == id){
                // console.log($('.col-sm-1>div').eq(index))
                 $('#doing>div').eq(worker-1).append($('.col-sm-1>div').eq(index))
                 queueSize--;
                 $('.tedad').eq(0).html(queueSize)
            }
        }
        return true;
    }

    function moveDoingToDone(id,worker){
        $('#Done').append('<div class="col-sm-1"></div>')
        for (let index = 0; index < parallelWorkerCount; index++) {
            if($('.insideBorder>.card').find('h6').eq(index).html() == id){
                 $('#Done>div:last-child').append( $('.insideBorder>.card').eq(index))
                 doneCount++;
                 $('.tedad').eq(2).html(doneCount)
            }   
        }
        return true
    }

})
