/*!
 * CropSelectJs - https://zara4.com/projects/crop-select-js
 *
 * Copyright (c) 2017 Zara 4
 *
 * Released under the GNU GPL 3.0 License
 * @license https://github.com/zara-4/crop-select-js/blob/master/LICENSE.md
 *
 */
(function($) {

  var methods = {

    //
    // Initialise
    //
    init: function( arguments ) {
      this.data('cropselectjs', new CropSelectJs(this, arguments));
      return this;
    },


    //
    // Animated Border
    //
    enableAnimatedBorder: function() { return this.data('cropselectjs').enableAnimatedBorder(); },
    disableAnimatedBorder: function() { return this.data('cropselectjs').disableAnimatedBorder(); },


    //
    // Selection Box
    //
    getSelectionBoxX: function() { return this.data('cropselectjs').getSelectionBoxX(); },
    setSelectionBoxX: function(x) { return this.data('cropselectjs').setSelectionBoxX(x); },
    getSelectionBoxY: function() { return this.data('cropselectjs').getSelectionBoxY(); },
    setSelectionBoxY: function(y) { return this.data('cropselectjs').setSelectionBoxY(y); },
    getSelectionBoxWidth: function() { return this.data('cropselectjs').getSelectionBoxWidth(); },
    setSelectionBoxWidth: function(width) { return this.data('cropselectjs').setSelectionBoxWidth(width); },
    getSelectionBoxHeight: function() { return this.data('cropselectjs').getSelectionBoxHeight(); },
    setSelectionBoxHeight: function(height) { return this.data('cropselectjs').setSelectionBoxHeight(height); },


    //
    // Aspect Ratio
    //
    setSelectionAspectRatio: function(aspectRatio) { return this.data('cropselectjs').setSelectionAspectRatio(aspectRatio); },
    clearSelectionAspectRatio: function(aspectRatio) { return this.data('cropselectjs').clearSelectionAspectRatio(aspectRatio); },


    //
    // Image
    //
    getImageSrc: function() { return this.data('cropselectjs').getImageSrc(); },
    getImageWidth: function() { return this.data('cropselectjs').getImageWidth(); },
    getImageHeight: function() { return this.data('cropselectjs').getImageHeight(); },
    getImageAspectRatio: function() { return this.data('cropselectjs').getImageAspectRatio(); },
    setImageSrc: function(src) { return this.data('cropselectjs').setImageSrc(src); },


    //
    // Selection Commands
    //
    selectEverything: function() { this.data('cropselectjs').selectEverything(); },
    selectCentredSquare: function() { this.data('cropselectjs').selectCentredSquare(); },
    selectCentredFittedAspectRatio: function(aspectRatio) { this.data('cropselectjs').selectCentredFittedAspectRatio(aspectRatio); }

  };


  /**
   * jQuery function.
   *
   * @param methodOrOptions
   * @returns {*}
   */
  $.fn.CropSelectJs = function(methodOrOptions) {
    if (methods[methodOrOptions]) {
      return methods[methodOrOptions].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof methodOrOptions === 'object' || !methodOrOptions) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method ' +  methodOrOptions + ' does not exist on jQuery.CropSelectJs');
    }
  };


}(jQuery));