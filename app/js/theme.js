jQuery(function($){

//-> 


//-> 


//-> 



//-> Equal Heights
  $('.eqHtJs > *').equalHeights();

//-> IE 8
  if (!Modernizr.input.placeholder) {
    $('[placeholder]').placeholder();
  }

}); // jQuery
