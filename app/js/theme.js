jQuery(function($){

//->wait page loading
  $(window).load(function() {
    $('#preloader').each(function(){
      $(this).find('i').delay(150).fadeOut("slow");
      $(this).delay(300).fadeOut("slow");
    });
  });

//->Btn-toggle (slideToggle)
  $('.btn-toggle').each(function(){
    $(this).on('click', function(event) {
      event.preventDefault();
      $(this).next().slideToggle(function(){
        if ($(this).is('.on')) {
          $(this).removeClass('on').addClass('off');
        } else{
          $(this).removeClass('off').addClass('on');
        };
      });
    });
  });

//->Adaptive fit to max height
  function setEqualHeight(p,e){
    $(p).each(function(){
      if ($(this).find(e).css('float')=='left') {
        var maxHeight = 0;
        $(this).find(e).css('height','auto').each(function(){
          if ( $(this).height() > maxHeight ) maxHeight = $(this).height();
        }); $(this).find(e).height(maxHeight);
      } else {
        $(this).find(e).css('height','auto');
      };
    });
  }
  $(window).resize(function(){
    setEqualHeight('.same-height','[class*="col-"]');
    setEqualHeight('.same-height','.box-height');
  }); $(window).resize();
  $(window).load(function(){ $(window).resize(); });

//->Placeholder
  $('[placeholder]').each(function(){
    var dV = $(this).attr('placeholder');
    if ($(this).is('[class*=validate]')){$(this).attr({'data-validation-placeholder':dV});}
    if ( navigator.appVersion.indexOf("MSIE 8.") != -1 || navigator.appVersion.indexOf("MSIE 9.") != -1 ){
      $(this).val(dV).css('color','#aaa');
      if ($(this).val()!=dV) $(this).css('color','#333');
      $(this).focus(function(){
        if ( this.value==dV ) $(this).val('').css('color','#333');
      }).blur(function(){
        if ($.trim(this.value)=='') $(this).val(dV).css('color','#aaa');
      });
    }
  });

}); // jQuery