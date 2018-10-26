// Globals (Ouuuh le vilain)
let stage;
let layer;
let hgGroup;
let hgBack;
let legendLayer;
let blockBack;
let blockGroup;

const events = [];       // [[id, event]]
const participants = {}; // {hash: id}

const xInterval = 80;
const yInterval = 30;

let intervalHandler;

let actualRound = -1;
let actualBlock = -1;

const settingValues = {
    showEventIds: false,
    autoScroll: true,
};

// Main loop
const loop = () => {
    fetch("/data")
        .then(res => res.json())
        .then(data => {
            let newEvents = filterPopulate(data.ParticipantEvents);

            assignRound(data.Rounds);

            _.each(newEvents, assignParents);

            processParents(newEvents);

            draw(newEvents, data.Rounds, data.Blocks);
        })
        .catch(err => {
            console.log("ERROR: fetch", err);

            clearInterval(intervalHandler);
        });
};

// Main function
const main = () => {
    setupStage();

    drawLegend();

    drawSettings();

    intervalHandler = setInterval(loop, 1000);
};

main();
