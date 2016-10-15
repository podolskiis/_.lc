$( function() {
















// Resize
  $(window).on('resize', function() {
    // function...
  }); $(window).trigger('resize');

// load
  $(window).on('load', function() {
    // function...
    $(window).trigger('resize');
  });

// if IE 8
  if (!Modernizr.input.placeholder) {
    $('[placeholder]').placeholder();
  }

} ); // END READY