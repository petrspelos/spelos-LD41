let longestStreak = 0;

function hitMessage(text) {
    if(typeof(text) == "object")
    {
        let items = text;
        var item = items[Math.floor(Math.random()*items.length)];
        text = item;
    }

    let x = $(window).width() / 2;
    let y = $(window).height() / 2;
    var tl = new TimelineLite();
    $box = $('<span class="particle-text">' + text + '</span>');
    $box.css("top", y);
    $box.css("left", x);
    if(text.length == 2) {
        $box.addClass("emoji");
    }
    $("body").append($box);
    tl.to($box, 1, {
         x:randomInt(-50, 50),
         y:randomInt(-50, 50), 
         ease: Elastic, 
         opacity: 0, 
         onComplete: removeJQueryElement, 
         onCompleteParams: [$box]
    });
    tl.play();
}

function runPackage(icon, callback) {
    var tl = new TimelineLite();
    $box = $('<button class="btn btn-outline-secondary btn-item">' + icon + '</button>');
    $("body").append($box);
    $box.on("click", callback);
    tl.to($box, 1, {x:randomWidth(),y:randomHeight(), ease: Elastic})
     .to($box, 1, {x:randomWidth(),y:randomHeight(), ease: Elastic})
     .to($box, 1, {x:randomWidth(),y:randomHeight(), ease: Elastic})
     .to($box, 1, {x:randomWidth(),y:randomHeight(), ease: Elastic})
     .to($box, 1, {x:randomWidth(),y:randomHeight(), ease: Elastic})
     .to($box, 1, {x:randomWidth(),y:randomHeight(), ease: Elastic})
     .to($box, 1, {x:randomWidth(),y:randomHeight(), ease: Elastic})
     .to($box, 1, {x:randomWidth(),y:randomHeight(), ease: Elastic})
     .to($box, 1, {x:randomWidth(),y:randomHeight(), ease: Elastic})
     .to($box, 1, {x:randomWidth(),y:randomHeight(), ease: Elastic})
     .to($box, 1, {x:-100,y:-100,onComplete: removeJQueryElement, onCompleteParams: [$box]});
    tl.play();
}

// runPackage("💎", (a)=> {
//     $(a.target).attr("disabled", "disabled");
//     $(a.target).remove();
// });

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function randomWidth() {
    let windowWidth = $(window).width();
    return randomInt(0, windowWidth);
}

function randomHeight() {
    let windowHeight = $(window).height();
    return randomInt(0, windowHeight);
}

// GAME LOOP
let looping = false;
let interval = 500;

function startLoop() {
    looping = true;
    setTimeout(onTick, interval);
}

function stopLoop() {
    looping = false;
}

function onTick() {
    moveWall();
    if(looping) setTimeout(onTick, interval);
}

// GAMEPLAY
let scoreModGood = 10;
let scoreModWarn = 5;
let scoreModBad = -5;

let gapWidth = 1;

const LEFT = 0;
const RIGHT = 1;
let wallMoveDirection = RIGHT;

const GOOD = 0;
const WARN = 1;
const DANGER = 2;
const FAIL = 3;
let playerState = GOOD;

let lastState = GOOD;
let streak = 0;

let bestScore = null;
let bestScoreBeaten = false;

function moveWall() {
    if(wallMoveDirection === RIGHT) {
        bSub();
    }
    else if(wallMoveDirection === LEFT) {
        bAdd();
    }

    gapWidth = 100 - aCount - bCount;

    updateLabels();

    lastState = playerState;
    updatePlayerState();

    if(playerState === GOOD && lastState === playerState) {
        streak++;
        score += 10;
        hitMessage(streak + " STREAK");
        if(streak > longestStreak) {
            longestStreak = streak;
            bestStreakLabel.text(longestStreak);
        }
    } else {
        streak = 0;
    }

    if(gapWidth == 1) {
        hitMessage([
            "CAREFUL!",
            "Whoa!",
            "CLOSE CALL!",
            "Chill out, will ya?",
            "Living on he edge, huh?",
            "👈",
            "RISKY!"
        ]);
    }
    
    if(playerState === DANGER) {
        score += scoreModBad;
        setMidStatus("far");
    } else if(playerState === WARN) {
        score += scoreModWarn;
        setMidStatus("caution");
    } else {
        score += scoreModGood;
        setMidStatus("right");
    }

    scoreLabel.text(score);

    if(!bestScoreBeaten && bestScore !== null && score > bestScore) {
        bestScoreBeaten = true;
        addNotification("❤️ Nice!", "You've just beaten your best score.");
    }

    if(playerState === FAIL) onCrash();
}

function updatePlayerState() {
    if(gapWidth > 5) playerState = DANGER;
    else if(gapWidth > 3) playerState = WARN;
    else if(gapWidth <= 0) playerState = FAIL;
    else playerState = GOOD;
}

function closeNotification(notification) {
    $button = $(notification);
    $card = $button.parent().parent();
    $card.remove();
}

function addNotification(title, message) {
    $notif = $('<div class="card bg-light mb-3 notification"><div class="card-header"><button onclick="closeNotification(this);" type="button" class="close" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + title + ' </div><div class="card-body"><p class="card-text">' + message + '</p></div></div>');
    $("#notification-wrapper").append($notif);
    var tween = TweenLite.to($notif, 2, {
        x: 600,
        ease: Power1.easeInOut,
        delay: 5,
        onComplete: removeJQueryElement,
        onCompleteParams: [$notif]
    });
}

function showSafeToPanic() {
    addNotification('Notification', '<div class="alert alert-primary" role="alert">It’s safe to panic now.</div>');
}

let playing = false;

const defaultaCount = 1;
const defaultbCount = 98;
let aCount = defaultaCount;
let bCount = defaultbCount;

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

function restart() {
    subABtn.removeAttr("disabled");
    stopLoop();
    if(bestScoreBeaten || bestScore == null) {
        bestScore = score;
        bestScoreLabel.text(bestScore);
    }

    bestScoreBeaten = false;
    interval = 500;
    lastState = GOOD;
    streak = 0;
    
    if(!persistentScore) score = 0;
    else persistentScore = false;
    //hasPull = false;
    currentPayload = 0;
    payloadOrder = [];
    for(let i = 0; i < payloads.length; i++) {
        payloadOrder.push(i);
    }
    payloadOrder = shuffle(payloadOrder);
    aCount = defaultaCount;
    bCount = defaultbCount;
    wallMoveDirection = RIGHT;
    playerState = GOOD;
}

function clearDisabledButton() {
    addABtn.removeAttr("disabled");
}

let addABtn = $("#addABtn");
let subABtn = $("#subABtn");
let aBar = $("#aBar");
let bBar = $("#bBar");
let midBar = $("#midBar");
let statusCard = $("#status-card");
let statusMessage = $("#status-message");
let scoreLabel = $("#scoreLabel");
let bestScoreLabel = $("#bestScoreLabel");
let bestStreakLabel = $("#bestStreakLabel");

let score = 0;

let gapLabel = $("#gapLabel");

function aAdd() {
    if(!playing) {
        restart();
        startLoop();
        playing = true;
    }
    aCount++;
    adjustProgress();
}

function aSub() {
    if(aCount == 0) return;
    aCount--;
    adjustProgress();
}

function bAdd() {
    bCount++;

    let i = Math.floor(Math.random() * 600) + 250;
    if(bCount === 75) interval = i;
    else if(bCount === 50) {
        interval = i;
        runPayload();
    }
    else if(bCount === 25) interval = i;


    if(bCount === 95) wallMoveDirection = RIGHT;
    adjustProgress();
}

function bSub() {
    if(bCount == 0) {
        //addNotification("YAY!", "Congrats!");
        wallMoveDirection = LEFT;
        payloadsActive = true;
        //abortTimer();
        return;
    }

    bCount--;
    adjustProgress();
    
    let i = Math.floor(Math.random() * 600) + 250;
    if(bCount === 75) interval = i;
    else if(bCount === 50) {
        interval = i;
        runPayload();
    }
    else if(bCount === 25) {
        if(!hasPull) {
            hasPull = true;
            subABtn.removeClass("btnHidden");
            addNotification("◀️ PULL", "Sometimes the door opens the other way. Same thing with this game.");
        }
        interval = i;
    }
}

let hasPull = false;

function adjustProgress() {
    aBar.css("width", aCount + "%");
    bBar.css("width", bCount + "%");
    let midCount = 100 - aCount - bCount;
    midBar.css("width", midCount + "%");
}

var loopTimer;
let tooFar = false;

function onUpdate() {
    if(toRight) bSub();
    else bAdd();

    updateLabels();
    let midCount = 100 - aCount - bCount;
    
    if(midCount > 5) {
        setMidStatus("far");
    } else if(midCount > 3) {
        setMidStatus("caution");
    } else {
        setMidStatus("right");
    }

    if(midCount < 0) onCrash();
    
    // if(!tooFar && midCount > 5) onTooFar();
    // else if(tooFar && midCount <= 5) resetTooFar();
}

function setMidStatus(status) {
    midBar.removeClass("bg-bg");
    midBar.removeClass("bg-far");
    midBar.removeClass("bg-caution");
    midBar.removeClass("bg-right");

    midBar.addClass("bg-" + status);
    
    statusCard.removeClass("bg-warning");
    statusCard.removeClass("bg-danger");
    statusCard.removeClass("bg-success");

    if(status === "far") {
        statusMessage.html("DUDE! GET CLOSER!");
        statusCard.addClass("bg-danger");
    } else if (status === "caution") {
        statusMessage.html("Faster!");
        statusCard.addClass("bg-warning");
    } else {
        statusMessage.html("GOOD");
        statusCard.addClass("bg-success");
    }
}

let toRight = true;

function changeTimerTime(milliseconds, type) {
    abortTimer();
    startTimer(milliseconds);
}

function startTimer(milliseconds) {
    loopTimer = setInterval(onUpdate, milliseconds);
}

function abortTimer() {
  clearInterval(loopTimer);
}

function updateLabels() {
    let midCount = 100 - aCount - bCount;
    gapLabel.text(midCount);
}

function onCrash() {
    addABtn.attr("disabled", "disabled");
    setTimeout(clearDisabledButton, 1000);
    statusCard.removeClass("bg-success");
    statusCard.removeClass("bg-warning");
    statusCard.addClass("bg-danger");
    subABtn.attr("disabled", "disabled");
    playing = false;
    statusMessage.html("YOU BLEW IT! (Push to restart)");
    stopLoop();
}

function onTooFar() {
    tooFar = true;
    statusCard.removeClass("bg-success");
    statusCard.addClass("bg-warning");
    addNotification("WARNING", "You are too far from the goal!");
}

function resetTooFar() {
    tooFar = false;
    statusCard.removeClass("bg-warning");
    statusCard.addClass("bg-success");
}

var tween = TweenLite.to($("#blocker"), 2, {
    //x: $(window).width(),
    opacity: 0,
    ease: Power1.easeInOut,
    onComplete: removeBlocker,
    delay: 1
});

function removeBlocker() {
    $("#blocker").remove();
}

function startGameAnimation(btn) {
    $(btn).attr("disabled", "disabled");
    TweenLite.to($("#menu"), 2, {
        y: -$(window).height(),
        ease: Power1.easeInOut,
        onComplete: removeElement,
        onCompleteParams: ['#menu']
    });

    let intro1 = $("#intro1");
    intro1.removeClass("offscreen");
    TweenLite.fromTo(
        intro1,
        2,
        {y: $(window).height()},
        {y: 0, onComplete: infoNotification, ease: Power1.easeInOut}
    );
}

function infoNotification() {
    addNotification("What's going on?", "Use the 'Push' button to make sure the middle gap stays green.");
}

function removeElement(selector) {
    $(selector).remove();
}

function removeJQueryElement(element) {
    element.remove();
}

// PAYLOADS
let payloadsActive = false;
let payloads = [];
let payloadOrder = [];
let currentPayload = 0;

payloads.push(()=>{
    for(let i = 0; i < 5; i++) {
        runPackage("💣", (a)=> {
            $(a.target).attr("disabled", "disabled");
            $(a.target).remove();
            addNotification("Oh no!", "You clicked on a bomb and lost your score.");
            score = 0;
        });
    }
    showSafeToPanic();
});

payloads.push(()=>{
    for(let i = 0; i < 2; i++)
    runPackage("⏱️", (a)=> {
        interval = 1000;
        addNotification("Plenty of time!", "Every tick takes a second. No rush...");
        score = 0;
        $(".btn-item").remove();
    });

    for(let i = 0; i < 2; i++)
    runPackage("👻", (a)=> {
        persistentScore = true;
        addNotification("A ghost!", "Spooky, but <b>your score stays for the next round.</b>");
        $(".btn-item").remove();
    });

    for(let i = 0; i < 2; i++)
    runPackage("🍔", (a)=> {
        addNotification("Yummy!", "There's nothing better than a good burger. <b>(+50 score)</b>");
        score += 50;
        $(".btn-item").remove();
    });

    for(let i = 0; i < 3; i++)
    runPackage("🥊", (a)=> {
        addNotification("K.O.", "You're down! You can only Push.");
        subABtn.attr("disabled", "disabled");
        $(".btn-item").remove();
    });

    runPackage("📩", (a)=> {
        addNotification("You've got mail!", "Mark it as SPAM.");
        for(let i = 0; i < 15; i++) {
            addNotification("SPAM SPAM SPAM SPAM", "BUY OUR PRODUCT! SPAM! YES!");
        }
        $(".btn-item").remove();
    });
});

let persistentScore = false;

// payloads.push(()=>{
//     runPackage("💣", (a)=> {
//         $(a.target).attr("disabled", "disabled");
//         $(a.target).remove();
//     });
// });

function runPayload() {
    if(!payloadsActive) return;
    payloads[currentPayload]();
    if(currentPayload === payloads.length - 1) currentPayload = 0;
    else currentPayload++;
}