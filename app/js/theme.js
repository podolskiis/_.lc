jQuery(function($){



// Resize
  $(window).resize(function() {
    // function...
  }); $(window).resize();

// load
  $(window).load(function() {
    // function...
    $(window).resize();
  });

// if IE 8
  if (!Modernizr.input.placeholder) {
    $('[placeholder]').placeholder();
  }

});