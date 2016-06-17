(function($) {

    var matchingGame = {};

    // game saving
    matchingGame.savingObject = {};

    matchingGame.savingObject.pack = [];

    // an array to store which card is removed by storing their index.
    matchingGame.savingObject.removedCards = [];

    // store the counting elapsed time.
    matchingGame.savingObject.currentElapsedTime = 0;


    matchingGame.pack = [
        'image1', 'image1',
        'image2', 'image2',
        'image3', 'image3',
        'image4', 'image4',
        'image5', 'image5',
        'image6', 'image6',
    ];


    function shuffle() {
        return 0.5 - Math.random();
    }

    // write selectCard() function, which will determine if a card will be flipped or not after clicking on it. And if 2 cards have already been flipped, then to apply the checkPattern() function. It will be invoked later on each card element when listening for click event on them.
    function selectCard() {
        // we do nothing if there are already two card flipped.
        if ($(".card-flipped").size() > 1) {
            return;
        }
        // Otherwise, we add class ".card-flipped" on that card on click event.
        $(this).addClass("card-flipped");
        // check the pattern of both flipped card 0.7s later.
        if ($(".card-flipped").size() === 2) {
            setTimeout(checkPattern, 700);
        }
    }

    function isMatchPattern() {
        var cards = $(".card-flipped");
        var pattern = $(cards[0]).data("pattern");
        var anotherPattern = $(cards[1]).data("pattern");
        return (pattern === anotherPattern);
    }

    function checkPattern() {
        if (isMatchPattern()) {
            $(".card-flipped").removeClass("card-flipped").addClass("card-removed");
            $(".card-removed").bind("transitionend", removeTookCards);
        } else {
            // If the pattern does not match, just flip back the already flipped cards.
            $(".card-flipped").removeClass('card-flipped');
        }
    }


    function removeTookCards() {
        // add each removed card into the array which store which cards are removed
        $(".card-removed").each(function() {
            matchingGame.savingObject.removedCards.push($(this).data("card-index"));
            $(this).remove();
        });

        // check if all cards are removed and show game over
        if ($(".card").length === 0) {
            gameover();
        }
    }


    // Function to save the encoded savingObject into localStorage. This function effectively saves the game's progress
    function saveSavingObject() {
        // save the encoded saving object into local storage
        localStorage["savingObject"] = JSON.stringify(matchingGame.savingObject);
    }


    function gameover() {
        // stop the timer
        clearInterval(matchingGame.timer);

        // display the elapsed time in the game over popup
        $(".score").html($("#elapsed-time"));

        // load the saved last score and save time from local storage
        var lastScore = localStorage.getItem("last-score");

        // check if there is no any saved record
        lastScoreObj = JSON.parse(lastScore);
        if (lastScoreObj === null) {
            // create an empty record if there is no any saved record
            lastScoreObj = {
                "savedTime": "no record",
                "score": 0
            };
        }
        var lastElapsedTime = lastScoreObj.score;

        // convert the elapsed seconds into minute:second format
        // calculate the minutes and seconds from elapsed time
        var minute = Math.floor(lastElapsedTime / 60);
        var second = lastElapsedTime % 60;

        // add padding 0 if minute and second is less then 10
        if (minute < 10) minute = "0" + minute;
        if (second < 10) second = "0" + second;

        // display the last elapsed time in game over popup
        $(".last-score").html(minute + ":" + second);

        // display the saved time of last score
        var savedTime = lastScoreObj.savedTime;
        $(".saved-time").html(savedTime);

        // get the current datetime
        var currentTime = new Date();

        // convert the date time into string.
        var now = currentTime.toLocaleString();

        //construct the object of datetime and game score
        var obj = {
            "savedTime": now,
            "score": matchingGame.elapsedTime
        };

        // save the score into local storage
        localStorage.setItem("last-score", JSON.stringify(obj));

        // show the game over popup
        $("#popup").removeClass("hide");

        // Ribbon
        if (lastElapsedTime === 0 || matchingGame.elapsedTime < lastElapsedTime) {
            $(".ribbon").removeClass("hide");
        }

        //at last, we clear the saved savingObject
        localStorage.removeItem("savingObject");
    }

    // Count the elapsed time
    function countTimer() {
        matchingGame.elapsedTime++;

        // save the current elapsed time into savingObject.
        matchingGame.savingObject.currentElapsedTime =
            matchingGame.elapsedTime;

        // calculate the minutes and seconds from elapsed time
        var minute = Math.floor(matchingGame.elapsedTime / 60);
        var second = matchingGame.elapsedTime % 60;

        // add padding 0 if minute and second is less then 10
        if (minute < 10) minute = "0" + minute;
        if (second < 10) second = "0" + second;

        // display the elapsed time
        $("#elapsed-time").html(minute + ":" + second);

        // save the game progress
        saveSavingObject();
    }

    // Returns the saved savingObject from the local storage.
    function savedSavingObject() {
        // returns the saved saving object from local storage
        var savingObject = localStorage["savingObject"];
        if (savingObject !== undefined) {
            savingObject = JSON.parse(savingObject);
        }
        return savingObject;
    }


    $(document).ready(function() {

        // reset the elapsed time to 0.
        matchingGame.elapsedTime = 0;

        // start the timer
        matchingGame.timer = setInterval(countTimer, 1000);

        // shuffle the pack.
        matchingGame.pack.sort(shuffle);

        // re-create the saved pack
        var savedObject = savedSavingObject();
        if (savedObject !== undefined) {
            matchingGame.pack = savedObject.pack;
        }

        // reset the elapsed time to 0.
        matchingGame.elapsedTime = 0;

        // restore the saved elapsed time
        if (savedObject !== undefined) {
            matchingGame.elapsedTime = savedObject.currentElapsedTime;
            matchingGame.savingObject.currentElapsedTime = savedObject.
            currentElapsedTime;
        }

        // copying the pack into saving object.
        matchingGame.savingObject.pack = matchingGame.pack.slice();


        for (var i = 0; i < 11; i++) {
            $(".card:first-child").clone().appendTo("#cards");
        }

        $("#cards").children().each(function(index) {
            var x = ($(this).width() + 20) * (index % 4);
            var y = ($(this).height() + 20) * Math.floor(index / 4);
            $(this).css("transform", "translateX(" + x + "px) translateY(" + y + "px)");

            // get a pattern from the shuffled pack
            var pattern = matchingGame.pack.pop();

            // visually apply the pattern on the card's back side.
            $(this).find(".back").addClass(pattern);

            // embed the pattern data into the DOM element.
            $(this).attr("data-pattern", pattern);

            // save the index into the DOM element, so we know which is the next card.
            $(this).attr("data-card-index", index);

            // listen the click event on each card DIV element.
            $(this).click(selectCard);
        });

        // removed cards that were removed in savedObject.
        if (savedObject !== undefined) {
            matchingGame.savingObject.removedCards =
                savedObject.removedCards;
            // find those cards and remove them.
            for (var i in matchingGame.savingObject.removedCards) {
                $(".card[data-card-index=" + matchingGame.savingObject.removedCards[i] + "]").remove();
            }
        }
    });
})(jQuery);
