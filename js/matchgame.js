(function($){

  var matchingGame = {};
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
    // We do nothing if there are already two cards flipped
    if ($(".card-flipped").size() > 1 ) {
      return;
    }
    // Otherwise, we apply class ".card-flipped" on that card on click event.
    $(this).addClass("card-flipped");

    // And now that 2 cards been clicked, check the pattern of both cards after 0.7s
    if ($(".card-flipped").size() === 2) {
      setTimeout(checkPattern, 700);
    }
  }

    // Function to check if the 2 flipped card's pattern matches
  function isMatchPattern() {
    var cards = $(".card-flipped");
    var pattern = $(cards[0]).data("pattern");
    var anotherPattern = $(cards[1]).data("pattern");
    return (pattern === anotherPattern);
  }

  function checkPattern() {
    if (isMatchPattern()) {
      $(".card-flipped").removeClass("card-flipped").addClass("card-removed");
      $(".card-removed").bind("transitioned", removeTookCards);
    } else {
      // If the pattern does not match, just flip back the already flipped cards.
      $(".card-flipped").removeClass('card-flipped');
    }
  }


  function removeTookCards() {
    $(".card-removed").remove();
  }

  $(function(){
    matchingGame.pack.sort(shuffle);

    for(var i=0;i<11;i++){
      $(".card:first-child").clone().appendTo("#cards");
    }

    $("#cards").children().each(function(index) {
      var x = ($(this).width()  + 20) * (index % 4);
      var y = ($(this).height() + 20) * Math.floor(index / 4);
      $(this).css("transform", "translateX(" + x + "px) translateY(" + y + "px)");

      // get a pattern from the shuffled pack
      var pattern = matchingGame.pack.pop();

      // visually apply the pattern on the card's back side. So, by the end of this looping function, all cards in the pack will have a "pattern" class added to their back. Which is what I will comapare with the data() method in isMatchPattern() function.
      $(this).find(".back").addClass(pattern);

      // embed the pattern data into the DOM element.
      $(this).attr("data-pattern", pattern);

      // listen the click event on each card DIV element.
      $(this).click(selectCard);
    });

  });

})(jQuery);
