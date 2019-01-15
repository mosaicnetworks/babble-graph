// Axis 
// ---- x
// |
// | y

// Setup the scene
const setupStage = () => {
    stage = new Konva.Stage({
        container: 'container',
        width: window.innerWidth,
        height: window.innerHeight,
    });

    layer = new Konva.Layer();

    legendLayer = new Konva.Layer();

    hgGroup = new Konva.Group({
        draggable: true,
        dragBoundFunc: pos => {
            let yPos = pos.y > hgBack.getHeight() ? hgBack.getHeight() : pos.y;

            yPos = yPos < window.innerHeight ? window.innerHeight : yPos;

            return {
                x: 0,
                y: yPos,
            };
        },
    });

    hgBack = new Konva.Rect({
        x: 100,
        y: -window.innerHeight,
        width: window.innerWidth - 100,
        height: window.innerHeight,
    });

    blockGroup = new Konva.Group({
        y: window.innerHeight,
        draggable: true,
        dragBoundFunc: pos => {
            let yPos = pos.y > blockBack.getHeight() ? blockBack.getHeight() : pos.y;

            yPos = yPos < window.innerHeight ? window.innerHeight : yPos;

            return {
                x: 0,
                y: yPos,
            };
        },
    });

    blockBack = new Konva.Rect({
        x: 0,
        y: -window.innerHeight,
        width: 100,
        height: window.innerHeight,
        fill: '#555555',
    });

    hgGroup.add(hgBack);

    blockGroup.add(blockBack);

    layer.add(hgGroup);
    layer.add(blockGroup);

    stage.add(layer);
    stage.add(legendLayer);
};

// Return the color of the event
const getEventColor = event => {
    let color = '#555555';

    if (event.FamousEnum === 1) {
        color = '#00ffff';
    } else if (event.FamousEnum === 2) {
        color = '#ffaa00';
    } else if (event.Witness) {
        color = '#5555ff';
    } else if (event.Consensus) {
        color = '#00ff00';
    } else if (event.Body != null && event.Body.Index === -1) {
        color = '#ff0000';
    }

    return color;
};

// Draw the event, the associated index text
// and set the borderLine (stroke) if it contains a Tx
const drawEvent = (id, event) => {
    // The event circle
    event.circle = new Konva.Circle({
        x: event.x,
        y: -event.y,
        radius: 10,
        fill: getEventColor(event),
    });

    // The event index
    event.text = new Konva.Text({
        x: event.x + 15,
        y: -event.y - 5,
        text: id.substring(2, 6),
        //text: event.Body.Index === -1 ? '' : '' + event.Body.Index,
        fontSize: 12,
        fontFamily: 'Calibri',
        fill: 'white',
    });

    if (!settingValues.showEventIds) {
        event.text.hide();
    }

    // If its root, draw the NodeId text
    if (event.Body.Index === -1) {
        let nodeId = new Konva.Text({
            x: event.x - xInterval / 2,
            y: 50,
            text: event.EventId.replace('Root', ''),
            fontSize: 12,
            fontFamily: 'Calibri',
            fill: 'white',
        });

        hgGroup.add(nodeId);
    }

    // Set the border line if it contains a transaction
    if (event.Body.Transactions && event.Body.Transactions.length) {
        event.circle.setStroke('#000000');
        event.circle.setStrokeWidth(3);
    }


    hgGroup.add(event.circle);
    hgGroup.add(event.text);

    // Round ID
    if (event.Witness) {
        event.roundId = new Konva.Text({
            x: event.x + 15,
            y: -event.y - 5,
            text: '' + event.Round,
            fontSize: 12,
            fontFamily: 'Calibri',
            fill: 'white',
        });

        hgGroup.add(event.roundId);
    }

    if (settingValues.autoScroll) {
        hgGroup.setY(_.max([window.innerHeight, hgGroup.getY(), event.y + 100]));
    }
};

// Draw the links between an event and its parents
const drawEventLinks = event => {
    _.each(event.ParentEvents, parentEvent => {
        let arrow = new Konva.Arrow({
            points: [
                parentEvent.x,
                -parentEvent.y,
                event.x,
                -event.y,
            ],
            pointerLength: 5,
            pointerWidth: 5,
            fill: 'black',
            stroke: 'black',
            strokeWidth: 1,
        });

        hgGroup.add(arrow);

        arrow.moveToBottom();
    });
};

// Draw the round separators
// const drawRoundLines = rounds => {
//     // Dirty tmp fix for events that are in the first and second round
//     if (rounds.length >= 2) {
//         rounds[1].CreatedEvents = _.fromPairs(_.differenceBy(_.toPairs(rounds[1].CreatedEvents), _.toPairs(rounds[0].CreatedEvents), ([rId, round]) => rId));
//     }

//     _(rounds)
//         .each((round, rId) => {
//             // Dont draw existing round
//             if (rId <= actualRound) {
//                 return;
//             }

//             let roundEvents = [];

//             _.forIn(round.CreatedEvents, (event, reId) => {
//                 roundEvents.push(_.find(events, ([eId, e]) => eId === reId))
//             });


//             roundEvents = _.compact(roundEvents);

//             if (roundEvents.length === 0) {
//                 return
//             }

//             let [eId, ev] = _.minBy(roundEvents, ([eId, ev]) => ev.y);

//             let line = new Konva.Line({
//                 points: [
//                     100,
//                     -(ev.y - yInterval / 2),
//                     100 + (_.keys(participants).length + 1) * xInterval,
//                     -(ev.y - yInterval / 2),
//                 ],
//                 stroke: 'white',
//                 strokeWidth: 2,
//             });

//             let txt = new Konva.Text({
//                 x: 100 + 5 + (_.keys(participants).length + 1) * xInterval,
//                 y: -(ev.y - yInterval / 2 + 6),
//                 text: '' + rId,
//                 fontSize: 12,
//                 fontFamily: 'Calibri',
//                 fill: 'white',
//             });

//             hgGroup.add(line);
//             hgGroup.add(txt);
//         });

//     actualRound = rounds.length - 1;
// };

const drawBlocks = blocks => {
    _.each(blocks, (block, bId) => {
        if (bId <= actualBlock) {
            return
        }

        let b = new Konva.Rect({
            x: 20,
            y: -20 - yInterval - (yInterval * bId),
            height: 20,
            width: 60,
            fill: '#999999',
            stroke: '#000000',
            strokeWidth: 1,
        });

        let txt = new Konva.Text({
            x: 40,
            y: -20 - yInterval - (yInterval * bId) + 5,
            text: '' + bId + ' (' + block.Body.Transactions.length + ')',
            fontSize: 12,
            fontFamily: 'Calibri',
            fill: 'black',
        });

        blockGroup.add(b, txt);

        if (settingValues.autoScroll) {
            blockGroup.setY(_.max([window.innerHeight, (40 + yInterval + (yInterval * bId) + 5) + 30]));
        }
    })

    actualBlock = blocks.length - 1;

    let maxY = _.max([(40 + yInterval + (yInterval * actualBlock) + 5) + 30, window.innerHeight]);

    blockBack.setHeight(maxY);
    blockBack.setY(-maxY);
};

// Main draw function
const draw = (evs, rounds, blocks) => {
    _.each(evs, ([eId, event]) => {
        drawEvent(eId, event);

        if (event.ParentEvents.length === 0) {
            return;
        }

        drawEventLinks(event);
    });

    // drawRoundLines(rounds);

    drawBlocks(blocks)

    layer.draw();

    let maxY = _.maxBy(events, ([eId, event]) => event.y)[1].y;

    maxY = _.max([maxY + 100, window.innerHeight]);

    hgBack.setHeight(maxY);
    hgBack.setY(-maxY);
};

// Draw the legend
const drawLegend = () => {
    let legends = [
        {
            name: 'Root',
            color: getEventColor({ Body: { Index: -1 } }),
        },
        {
            name: 'Consensus',
            color: getEventColor({ Consensus: true }),
        },
        {
            name: 'Famous',
            color: getEventColor({ FamousEnum: 1 }),
        },
        {
            name: 'Not Famous',
            color: getEventColor({ FamousEnum: 2 }),
        },
        {
            name: 'Witness',
            color: getEventColor({ Witness: true }),
        },
        {
            name: 'Normal',
            color: getEventColor({ Body: {} }),
        },
        {
            name: 'Transaction',
            color: '#999999',
        },
    ];

    _.each(legends, (legend, i) => {
        let circle = new Konva.Circle({
            x: 15 + (i * 100),
            y: 20,
            radius: 10,
            fill: legend.color,
        });

        if (legend.name === 'Transaction') {
            circle.setStroke('black');
            circle.setStrokeWidth(3);
        }

        let text = new Konva.Text({
            x: 30 + (i * 100),
            y: 15,
            text: legend.name,
            fontSize: 12,
            fontFamily: 'Calibri',
            fill: 'black',
        });

        legendLayer.add(circle, text);
    });

    legendBackground = new Konva.Rect({
        x: 0,
        y: 0,
        height: 40,
        width: window.innerWidth,
        fill: '#999999',
        stroke: '#000000',
        strokeWidth: 1,
    });

    legendLayer.add(legendBackground);
    legendBackground.moveToBottom();

    legendLayer.draw();
};

// Draw the legend
const drawSettings = () => {
    let settings = [
        {
            label: 'Show event ids',
            name: 'showEventIds',
            trigger: () => {
                if (settingValues.showRounds && settingValues.showEventIds) {
                    toggle(settings[1]);
                }

                _.each(events, ([eId, event]) => settingValues.showEventIds ? event.text.show() : event.text.hide());
                layer.draw();
            }
        },
        {
            label: 'Show rounds',
            name: 'showRounds',
            trigger: () => {
                if (settingValues.showRounds && settingValues.showEventIds) {
                    toggle(settings[0]);
                }

                _.each(events, ([eId, event]) => {
                    if (event.roundId == null) {
                        return;
                    }

                    settingValues.showRounds ? event.roundId.show() : event.roundId.hide();
                });
                layer.draw();
            }
        },
        {
            label: 'Auto scroll',
            name: 'autoScroll',
            trigger: () => { },
        }
    ];

    let toggle = (setting) => {
        settingValues[setting.name] = !settingValues[setting.name];

        setting.rect.setFill(getSettingColor(settingValues[setting.name]));

        setting.trigger();

        legendLayer.draw();
    };

    let getSettingColor = (val) => val ? '#00ff00' : '#ff0000';

    _.each(settings, (setting, i) => {
        setting.rect = new Konva.Rect({
            x: 800 + 15 + (i * 120),
            y: 10,
            width: 20,
            height: 20,
            fill: getSettingColor(settingValues[setting.name]),
            stroke: 'black',
        });

        setting.text = new Konva.Text({
            x: 800 + 40 + (i * 120),
            y: 15,
            text: setting.label,
            fontSize: 12,
            fontFamily: 'Calibri',
            fill: 'black',
        });

        legendLayer.add(setting.rect, setting.text);

        setting.rect.on('mousedown', () => toggle(setting))
    });

    legendLayer.draw();
};
