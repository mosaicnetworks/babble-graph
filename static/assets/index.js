// Globals (Ouuuh le vilain)
let stage;
let layer;
let hgGroup;
let hgBack;
let legendLayer;
let blockBack;
let blockGroup;
let legendBackground;

const events = [];       // [[id, event]]
const participants = {}; // {hash: id}

const xInterval = 80;
const yInterval = 30;

let intervalHandler;

let actualRound = -1;
let actualBlock = -1;

const settingValues = {
    showEventHash: false,
    showEventIdx: true,
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

hgGroup.on('wheel', e => {
    hgGroup.move({
        y: -e.evt.deltaY
    });

    let yPos = hgGroup.y() > hgBack.getHeight() ? hgBack.getHeight() : hgGroup.y();

    yPos = yPos < window.innerHeight ? window.innerHeight : yPos;

    hgGroup.setY(yPos);

    stage.draw();
});

blockGroup.on('wheel', e => {
    blockGroup.move({
        y: -e.evt.deltaY
    });

    let yPos = blockGroup.y() > blockBack.getHeight() ? blockBack.getHeight() : blockGroup.y();

    yPos = yPos < window.innerHeight ? window.innerHeight : yPos;

    blockGroup.setY(yPos);

    stage.draw();
});

window.addEventListener("resize", () => {
    let width = window.innerWidth;
    let height = window.innerHeight;

    stage.width(width);
    stage.height(height);

    hgBack.y(-height);
    hgBack.width(width - 100);
    hgBack.height(height);

    blockGroup.y(height);

    blockBack.y(-height);
    blockBack.height(height);

    legendBackground.width(width);

    stage.draw()
});
