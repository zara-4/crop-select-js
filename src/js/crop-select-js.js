/*
 * CropSelectJs - https://zara4.com/projects/crop-select-js
 *
 * Copyright (c) 2017 Zara 4
 *
 * Released under the GNU GPL 3.0 License
 * https://github.com/zara-4/crop-select-js/blob/master/LICENSE.md
 *
 */
CropSelectJs.prototype.constructor = CropSelectJs ;

//
// Constants
//
CropSelectJs.MINIMUM_SELECTION_BOX_WIDTH = 50;
CropSelectJs.MINIMUM_SELECTION_BOX_HEIGHT = 50;


CropSelectJs.EVENT_NAME__SELECTION_RESIZE = 'crop-select-js.selection.resize';
CropSelectJs.EVENT_NAME__SELECTION_MOVE = 'crop-select-js.selection.move';


// --- --- --- ---


/**
 * @class CropSelectJs
 *
 * @author Colin Stannard
 *
 * @param elem
 * @param options
 *
 * @constructor
 */
function CropSelectJs(elem, options) {
  this.elem = jQuery(elem);

  this.options = $.extend({}, {
    animatedBorder: (this.elem.data('animated-border') != null ? this.elem.data('animated-border') : true),
    aspectRatio: (this.elem.data('aspect-ratio') != null ? this.elem.data('aspect-ratio') : null),

    // Image
    imageSrc: null,
    imageWidth: null,
    imageHeight: null,

    // Stub events
    selectionResize: function() {},
    selectionMove: function() {}

  }, options);

  var $this = this;


  // --- --- --- ---


  //
  // Bind events
  //
  $(elem).bind(CropSelectJs.EVENT_NAME__SELECTION_RESIZE, function(event, data) { $this.options.selectionResize(data); });
  $(elem).bind(CropSelectJs.EVENT_NAME__SELECTION_MOVE, function(event, data) { $this.options.selectionMove(data); });


  // --- --- --- ---


  // Ensure main element has class
  if (!this.elem.hasClass('crop-select-js')) {
    this.elem.addClass('crop-select-js');
  }

  // Initialise elements
  this.initialiseWrapper();
  this.initialiseSelectionBox();
  this.initialiseShadows();
  this.initialiseImage();

  // Destroy any existing elements in the parent
  this.elem.empty();

  // Add constructed wrapper to parent element
  this.elem.append(this.wrapper);


  // Listens for 'mouse up' anywhere in the window
  // to reset moving or resizing the crop window regardless of mouse boundaries.
  $(window).on('mouseup', function(e) { $this.handleMouseUp(e) });
  $(window).on('mousemove', function(e) { $this.handleMouseMove(e); });
  $(window).on('resize', function() { $this.handleWrapperResize(); });
  $(this.cropImage).on('load', function() { $this.handleImageLoad() });

  // --- --- --- ---


  // Enable / disable animated border
  this.options.animatedBorder ? this.enableAnimatedBorder() : this.disableAnimatedBorder();


  // --- --- --- ---


  // Set the image if it's been provided
  if (this.options.imageSrc) { //&& this.options.imageWidth && this.options.imageHeight) {
    this.setImageSrc(this.options.imageSrc);
  }

}



// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---



/*
 *   _____         _  _    _         _  _                ______  _                                _
 *  |_   _|       (_)| |  (_)       | |(_)              |  ____|| |                              | |
 *    | |   _ __   _ | |_  _   __ _ | | _  ___   ___    | |__   | |  ___  _ __ ___    ___  _ __  | |_  ___
 *    | |  | '_ \ | || __|| | / _` || || |/ __| / _ \   |  __|  | | / _ \| '_ ` _ \  / _ \| '_ \ | __|/ __|
 *   _| |_ | | | || || |_ | || (_| || || |\__ \|  __/   | |____ | ||  __/| | | | | ||  __/| | | || |_ \__ \
 *  |_____||_| |_||_| \__||_| \__,_||_||_||___/ \___|   |______||_| \___||_| |_| |_| \___||_| |_| \__||___/
 *
 */

/**
 * Initialise the wrapper element.
 */
CropSelectJs.prototype.initialiseWrapper = function() {
  this.wrapper = this.elem.find(".crop-wrapper");
  if (this.wrapper[0]) {
    this.wrapper.detach();
  } else {
    this.wrapper = $("<div class='crop-wrapper'></div>")[0];
  }
};


/**
 * Initialise the selection box.
 */
CropSelectJs.prototype.initialiseSelectionBox = function() {

  var $this = this;

  this.selectionBox = this.elem.find(".crop-selection");
  if (this.selectionBox[0]) {
    this.selectionBox.detach();
  } else {
    this.selectionBox = $(
      "<div class='crop-selection'>" +
        "<div class='border left'></div>" +
        "<div class='border top'></div>" +
        "<div class='border right'></div>" +
        "<div class='border bottom'></div>" +
        "<div class='handle top-left'></div>" +
        "<div class='handle top'></div>" +
        "<div class='handle top-right'></div>" +
        "<div class='handle right'></div>" +
        "<div class='handle bottom-right'></div>" +
        "<div class='handle bottom'></div>" +
        "<div class='handle bottom-left'></div>" +
        "<div class='handle left'></div>" +
      "</div>"
    )[0];
  }
  this.wrapper.append(this.selectionBox);
  $(this.selectionBox).on('mousedown', function(e) {
    $this.handleMouseDownInsideSelectionBox(e);
  });
};


/**
 * Initialise the crop selection shadows.
 */
CropSelectJs.prototype.initialiseShadows = function() {

  // Left Shadow
  this.cropShadowLeft = this.elem.find(".shadow.left");
  if (this.cropShadowLeft[0]) {
    this.cropShadowLeft.detach();
  } else {
    this.cropShadowLeft = $("<div class='shadow left'></div>")[0];
  }
  this.wrapper.append(this.cropShadowLeft);


  // Right Shadow
  this.cropShadowRight = this.elem.find(".shadow.right");
  if (this.cropShadowRight[0]) {
    this.cropShadowRight.detach();
  } else {
    this.cropShadowRight = $("<div class='shadow right'></div>")[0];
  }
  this.wrapper.append(this.cropShadowRight);


  // Top Shadow
  this.cropShadowTop = this.elem.find(".shadow.top");
  if (this.cropShadowTop[0]) {
    this.cropShadowTop.detach();
  } else {
    this.cropShadowTop = $("<div class='shadow top'></div>")[0];
  }
  this.wrapper.append(this.cropShadowTop);


  // Bottom Shadow
  this.cropShadowBottom = this.elem.find(".shadow.bottom");
  if (this.cropShadowBottom[0]) {
    this.cropShadowBottom.detach();
  } else {
    this.cropShadowBottom = $("<div class='shadow bottom'></div>")[0];
  }
  this.wrapper.append(this.cropShadowBottom);
};


/**
 * Initialise the image element.
 */
CropSelectJs.prototype.initialiseImage = function() {
  this.cropImage = this.elem.find(".crop-image");
  if (this.cropImage[0]) {
    this.cropImage.detach();
  } else {
    this.cropImage = $("<img class='crop-image' />")[0];
  }
  this.wrapper.append(this.cropImage);
};



// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---


/*
 *     _____         _                             _     ______                   _
 *    |_   _|       | |                           | |   |  ____|                 | |
 *      | |   _ __  | |_  ___  _ __  _ __    __ _ | |   | |__ __   __ ___  _ __  | |_  ___
 *      | |  | '_ \ | __|/ _ \| '__|| '_ \  / _` || |   |  __|\ \ / // _ \| '_ \ | __|/ __|
 *     _| |_ | | | || |_|  __/| |   | | | || (_| || |   | |____\ V /|  __/| | | || |_ \__ \
 *    |_____||_| |_| \__|\___||_|   |_| |_| \__,_||_|   |______|\_/  \___||_| |_| \__||___/
 *
 */


/**
 * Handle the mouse up event.
 *
 * @param e
 */
CropSelectJs.prototype.handleMouseUp = function(e) {
  this.cropSelectionMouseStartX = null;
  this.cropSelectionMouseStartY = null;
  this.cropSelectionStartX = null;
  this.cropSelectionStartY = null;
  this.cropSelectionStartWidth = null;
  this.cropSelectionStartHeight = null;
  this.cropSelectionResizeHandle = null;
};


/**
 * Handle mouse move inside wrapper.
 *
 * @param e
 */
CropSelectJs.prototype.handleMouseMove = function(e) {
  if (this.cropSelectionMouseStartX && this.cropSelectionMouseStartY) {
    var changeX = e.pageX - this.cropSelectionMouseStartX;
    var changeY = e.pageY - this.cropSelectionMouseStartY;

    //
    // Handle move
    //
    if (!this.cropSelectionResizeHandle) {

      // Perform move
      this.setSelectionBoxX(this.cropSelectionStartX + changeX);
      this.setSelectionBoxY(this.cropSelectionStartY + changeY);

      // Trigger move event
      this.triggerSelectionMoveEvent();
    }

    //
    // Handle resize
    //
    else {

      // Free Resize
      if (this.options.aspectRatio == null) {
        this.handleFreeResize(changeX, changeY);
      }

      // Aspect ratio locked resize
      else {
        if (this.cropSelectionResizeHandle == 'top-left') {
          this.handleAspectRatioLockedResizeTopLeft(changeX, changeY, this.options.aspectRatio);
        } else if (this.cropSelectionResizeHandle == 'top') {
          this.handleAspectRatioLockedResizeTop(changeX, changeY, this.options.aspectRatio);
        } else if (this.cropSelectionResizeHandle == 'top-right') {
          this.handleAspectRatioLockedResizeTopRight(changeX, changeY, this.options.aspectRatio);
        } else if (this.cropSelectionResizeHandle == 'right') {
          this.handleAspectRatioLockedResizeRight(changeX, changeY, this.options.aspectRatio);
        } else if (this.cropSelectionResizeHandle == 'bottom-right') {
          this.handleAspectRatioLockedResizeBottomRight(changeX, changeY, this.options.aspectRatio);
        } else if (this.cropSelectionResizeHandle == 'bottom') {
          this.handleAspectRatioLockedResizeBottom(changeX, changeY, this.options.aspectRatio);
        } else if (this.cropSelectionResizeHandle == 'bottom-left') {
          this.handleAspectRatioLockedResizeBottomLeft(changeX, changeY, this.options.aspectRatio);
        } else if (this.cropSelectionResizeHandle == 'left') {
          this.handleAspectRatioLockedResizeLeft(changeX, changeY, this.options.aspectRatio);
        }
      }

      // Trigger resize event
      this.triggerSelectionResizeEvent();

      // Trigger move event
      if (this.getSelectionBoxX() != this.cropSelectionStartX || this.getSelectionBoxY() != this.cropSelectionStartY) {
        this.triggerSelectionMoveEvent();
      }

    }
  }
};




/**
 * Handle mouse down event inside the selection box.
 *
 * @param e
 */
CropSelectJs.prototype.handleMouseDownInsideSelectionBox = function(e) {

  this.cropSelectionMouseStartX = e.pageX;
  this.cropSelectionMouseStartY = e.pageY;

  this.cropSelectionStartX = this.getSelectionBoxX();
  this.cropSelectionStartY = this.getSelectionBoxY();
  this.cropSelectionStartWidth = this.getSelectionBoxWidth();
  this.cropSelectionStartHeight = this.getSelectionBoxHeight();

  var target = $(e.target);
  if (target.hasClass('handle')) {
    if (target.hasClass('top-left')) { this.cropSelectionResizeHandle = 'top-left'; }
    if (target.hasClass('top')) { this.cropSelectionResizeHandle = 'top'; }
    if (target.hasClass('top-right')) { this.cropSelectionResizeHandle = 'top-right'; }
    if (target.hasClass('right')) { this.cropSelectionResizeHandle = 'right'; }
    if (target.hasClass('bottom-right')) { this.cropSelectionResizeHandle = 'bottom-right'; }
    if (target.hasClass('bottom')) { this.cropSelectionResizeHandle = 'bottom'; }
    if (target.hasClass('bottom-left')) { this.cropSelectionResizeHandle = 'bottom-left'; }
    if (target.hasClass('left')) { this.cropSelectionResizeHandle = 'left'; }
  }
};


/**
 * Handle resize.
 */
CropSelectJs.prototype.handleWrapperResize = function() {

  var changeInWrapperWidth = this.previousWrapperWidth - this.getCropWrapperWidth();
  var changeInWrapperHeight = this.previousWrapperHeight - this.getCropWrapperHeight();

  // Check for a resize...
  if (changeInWrapperWidth != 0 || changeInWrapperHeight != 0) {

    // Rescale the selection for the new wrapper dimensions
    var previousImageXScaleFactor = this.getImageWidth() / this.previousWrapperWidth;
    var previousImageYScaleFactor = this.getImageHeight() / this.previousWrapperHeight;

    var previousScaledSelectionBoxWidth = previousImageXScaleFactor * this.getSelectionBoxWidth();
    var previousScaledSelectionBoxHeight = previousImageYScaleFactor * this.getSelectionBoxHeight();
    var previousScaledSelectionBoxX = previousImageXScaleFactor * this.getSelectionBoxX();
    var previousScaledSelectionBoxY = previousImageYScaleFactor * this.getSelectionBoxY();

    var newImageXScaleFactor = this.getImageXScaleFactor();
    var newImageYScaleFactor = this.getImageYScaleFactor();

    var newSelectionBoxWidth = Math.round(previousScaledSelectionBoxWidth / newImageXScaleFactor);
    var newSelectionBoxHeight = Math.round(previousScaledSelectionBoxHeight / newImageYScaleFactor);
    var newSelectionBoxX = Math.round(previousScaledSelectionBoxX / newImageXScaleFactor);
    var newSelectionBoxY = Math.round(previousScaledSelectionBoxY / newImageYScaleFactor);

    this.setSelectionBoxWidth(newSelectionBoxWidth);
    this.setSelectionBoxHeight(newSelectionBoxHeight);
    this.setSelectionBoxX(newSelectionBoxX);
    this.setSelectionBoxY(newSelectionBoxY);


    // Update to detect next resize
    this.previousWrapperWidth = this.getCropWrapperWidth();
    this.previousWrapperHeight = this.getCropWrapperHeight();

    // Trigger events
    this.triggerSelectionResizeEvent();
    this.triggerSelectionMoveEvent();
  }
};


/**
 * What to do when an image is loaded.
 */
CropSelectJs.prototype.handleImageLoad = function() {

  // Record known wrapper size for resizing (height set based on image aspect ratio)
  this.previousWrapperWidth = this.getCropWrapperWidth();
  this.previousWrapperHeight = this.getCropWrapperHeight();

  // Perform Selection
  if (this.options.aspectRatio) {
    this.selectCentredFittedAspectRatio(this.options.aspectRatio);
  } else {
    this.selectEverything();
  }

};




// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---



/*
 *      _______     _                               ______                   _
 *     |__   __|   (_)                             |  ____|                 | |
 *        | | _ __  _   __ _   __ _   ___  _ __    | |__ __   __ ___  _ __  | |_
 *        | || '__|| | / _` | / _` | / _ \| '__|   |  __|\ \ / // _ \| '_ \ | __|
 *        | || |   | || (_| || (_| ||  __/| |      | |____\ V /|  __/| | | || |_
 *        |_||_|   |_| \__, | \__, | \___||_|      |______|\_/  \___||_| |_| \__|
 *                      __/ |  __/ |
 *                     |___/  |___/
 */

/**
 *
 */
CropSelectJs.prototype.triggerSelectionResizeEvent = function() {
  $(this.elem).trigger(CropSelectJs.EVENT_NAME__SELECTION_RESIZE, {
    width: this.getSelectionBoxWidth(),
    height: this.getSelectionBoxWidth(),
    widthScaledToImage: this.getScaledSelectionBoxWidth(),
    heightScaledToImage: this.getScaledSelectionBoxHeight()
  });
};


/**
 *
 */
CropSelectJs.prototype.triggerSelectionMoveEvent = function() {
  $(this.elem).trigger(CropSelectJs.EVENT_NAME__SELECTION_MOVE, {
    x: this.getSelectionBoxX(),
    y: this.getSelectionBoxY(),
    xScaledToImage: this.getScaledSelectionBoxX(),
    yScaledToImage: this.getScaledSelectionBoxY()
  });
};



// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---



/*
 *     _    _                    _  _           _____             _       _
 *    | |  | |                  | || |         |  __ \           (_)     (_)
 *    | |__| |  __ _  _ __    __| || |  ___    | |__) | ___  ___  _  ____ _  _ __    __ _
 *    |  __  | / _` || '_ \  / _` || | / _ \   |  _  / / _ \/ __|| ||_  /| || '_ \  / _` |
 *    | |  | || (_| || | | || (_| || ||  __/   | | \ \|  __/\__ \| | / / | || | | || (_| |
 *    |_|  |_| \__,_||_| |_| \__,_||_| \___|   |_|  \_\\___||___/|_|/___||_||_| |_| \__, |
 *                                                                                   __/ |
 *                                                                                  |___/
 */



/**
 * Handle a free resize of the selection box (no aspect ratio)
 *
 * @param changeX
 * @param changeY
 */
CropSelectJs.prototype.handleFreeResize = function(changeX, changeY) {

  // Vertical resize
  if (this.cropSelectionResizeHandle.includes('top')) {
    this.setSelectionBoxHeight(Math.min(this.cropSelectionStartHeight - changeY, this.cropSelectionStartY + this.cropSelectionStartHeight));
    this.setSelectionBoxY(Math.min(this.cropSelectionStartY + changeY, this.cropSelectionStartY + this.cropSelectionStartHeight - CropSelectJs.MINIMUM_SELECTION_BOX_HEIGHT));
  } else if (this.cropSelectionResizeHandle.includes('bottom')) {
    this.setSelectionBoxHeight(Math.min(this.cropSelectionStartHeight + changeY, this.getCropWrapperHeight() - this.cropSelectionStartY));
  }

  // Horizontal resize
  if (this.cropSelectionResizeHandle.includes('left')) {
    this.setSelectionBoxWidth(Math.min(this.cropSelectionStartWidth - changeX, this.cropSelectionStartX + this.cropSelectionStartWidth));
    this.setSelectionBoxX(Math.min(this.cropSelectionStartX + changeX, this.cropSelectionStartX + this.cropSelectionStartWidth - CropSelectJs.MINIMUM_SELECTION_BOX_WIDTH));
  } else if (this.cropSelectionResizeHandle.includes('right')) {
    this.setSelectionBoxWidth(Math.min(this.cropSelectionStartWidth + changeX, this.getCropWrapperWidth() - this.cropSelectionStartX));
  }

};


// --- --- --- --- --- --- --- --- --- --- --- ---


/**
 *
 *
 * @param changeX
 * @param changeY
 * @param aspectRatio
 */
CropSelectJs.prototype.handleAspectRatioLockedResizeTopLeft = function(changeX, changeY, aspectRatio) {
  var maxHeight = this.cropSelectionStartY + this.cropSelectionStartHeight;
  var maxWidth = this.cropSelectionStartX + this.cropSelectionStartWidth;

  maxWidth = Math.min(maxWidth, maxHeight * aspectRatio);
  maxHeight = Math.min(maxHeight, maxWidth / aspectRatio);

  var calculatedHeight = Math.min(this.cropSelectionStartHeight - changeY, maxHeight);
  var calculatedWidth = Math.min(this.cropSelectionStartWidth - changeX, maxWidth);

  var aspectCalculatedWidth = calculatedHeight * aspectRatio;
  var aspectCalculatedHeight = calculatedWidth / aspectRatio;

  var newHeight, newWidth;
  if (calculatedWidth > aspectCalculatedWidth) {
    newWidth = calculatedWidth;
    newHeight = aspectCalculatedHeight;
  } else {
    newHeight = calculatedHeight;
    newWidth = aspectCalculatedWidth;
  }

  var actualChangeInWidth = newWidth - this.cropSelectionStartWidth;
  var actualChangeInHeight = newHeight - this.cropSelectionStartHeight;

  var newX = this.cropSelectionStartX - actualChangeInWidth;
  var newY = this.cropSelectionStartY - actualChangeInHeight;

  newX = Math.min(newX, this.cropSelectionStartX + this.cropSelectionStartWidth - CropSelectJs.MINIMUM_SELECTION_BOX_WIDTH);
  newY = Math.min(newY, this.cropSelectionStartY + this.cropSelectionStartHeight - CropSelectJs.MINIMUM_SELECTION_BOX_HEIGHT);

  this.setSelectionBoxWidth(newWidth);
  this.setSelectionBoxHeight(newHeight);
  this.setSelectionBoxX(newX);
  this.setSelectionBoxY(newY);
};


/**
 *
 *
 * @param changeX
 * @param changeY
 * @param aspectRatio
 */
CropSelectJs.prototype.handleAspectRatioLockedResizeTop = function(changeX, changeY, aspectRatio) {
  var maxHeight = this.cropSelectionStartY + this.cropSelectionStartHeight;
  var maxWidth = this.cropSelectionStartX + this.cropSelectionStartWidth;

  var newHeight = Math.min(this.cropSelectionStartHeight - changeY, maxHeight);
  var newWidth = newHeight * aspectRatio;
  if (newWidth > maxWidth) {
    newWidth = maxWidth;
    newHeight = newWidth / aspectRatio;
  }

  var actualChangeInWidth = newWidth - this.cropSelectionStartWidth;
  var actualChangeInHeight = newHeight - this.cropSelectionStartHeight;

  var newX = this.cropSelectionStartX - actualChangeInWidth;
  var newY = this.cropSelectionStartY - actualChangeInHeight;

  newX = Math.min(newX, this.cropSelectionStartX + this.cropSelectionStartWidth - CropSelectJs.MINIMUM_SELECTION_BOX_WIDTH);
  newY = Math.min(newY, this.cropSelectionStartY + this.cropSelectionStartHeight - CropSelectJs.MINIMUM_SELECTION_BOX_HEIGHT);

  this.setSelectionBoxWidth(newWidth);
  this.setSelectionBoxHeight(newHeight);
  this.setSelectionBoxX(newX);
  this.setSelectionBoxY(newY);
};


/**
 *
 *
 * @param changeX
 * @param changeY
 * @param aspectRatio
 */
CropSelectJs.prototype.handleAspectRatioLockedResizeTopRight = function(changeX, changeY, aspectRatio) {

  var maxWidth = this.getCropWrapperWidth() - this.cropSelectionStartX;
  var maxHeight = this.cropSelectionStartY + this.cropSelectionStartHeight;

  maxWidth = Math.min(maxWidth, maxHeight * aspectRatio);
  maxHeight = Math.min(maxHeight, maxWidth / aspectRatio);


  var calculatedHeight = Math.min(this.cropSelectionStartHeight - changeY, maxHeight);
  var calculatedWidth = Math.min(this.cropSelectionStartWidth + changeX, maxWidth);

  var aspectCalculatedWidth = calculatedHeight * aspectRatio;
  var aspectCalculatedHeight = calculatedWidth / aspectRatio;

  // --- --- ---

  var newHeight, newWidth;
  if (calculatedWidth > aspectCalculatedWidth) {
    newWidth = calculatedWidth;
    newHeight = aspectCalculatedHeight;
  } else {
    newHeight = calculatedHeight;
    newWidth = aspectCalculatedWidth;
  }

  var actualChangeInHeight = newHeight - this.cropSelectionStartHeight;

  var newY = this.cropSelectionStartY - actualChangeInHeight;
  newY = Math.max(newY, this.cropSelectionStartY - maxHeight);
  newY = Math.min(newY, this.cropSelectionStartY + this.cropSelectionStartHeight - CropSelectJs.MINIMUM_SELECTION_BOX_HEIGHT);


  this.setSelectionBoxWidth(newWidth);
  this.setSelectionBoxHeight(newHeight);
  this.setSelectionBoxY(newY);

};


/**
 *
 *
 * @param changeX
 * @param changeY
 * @param aspectRatio
 */
CropSelectJs.prototype.handleAspectRatioLockedResizeRight = function(changeX, changeY, aspectRatio) {
  var maxHeight = this.getCropWrapperHeight() - this.cropSelectionStartY;
  var maxWidth = this.getCropWrapperWidth() - this.cropSelectionStartX;

  var newWidth = Math.min(this.cropSelectionStartWidth + changeX, maxWidth);
  var newHeight = newWidth / aspectRatio;
  if (newHeight > maxHeight) {
    newHeight = maxHeight;
    newWidth = newHeight * aspectRatio;
  }

  this.setSelectionBoxWidth(newWidth);
  this.setSelectionBoxHeight(newHeight);
};


/**
 *
 *
 * @param changeX
 * @param changeY
 * @param aspectRatio
 */
CropSelectJs.prototype.handleAspectRatioLockedResizeBottomRight = function(changeX, changeY, aspectRatio) {

  var maxHeight = this.getCropWrapperHeight() - this.cropSelectionStartY;
  var maxWidth = this.getCropWrapperWidth() - this.cropSelectionStartX;

  maxWidth = Math.min(maxWidth, maxHeight * aspectRatio);
  maxHeight = Math.min(maxHeight, maxWidth / aspectRatio);

  var calculatedHeight = Math.min(this.cropSelectionStartHeight + changeY, maxHeight);
  var calculatedWidth = Math.min(this.cropSelectionStartWidth + changeX, maxWidth);

  var aspectCalculatedWidth = calculatedHeight * aspectRatio;
  var aspectCalculatedHeight = calculatedWidth / aspectRatio;

  var newWidth, newHeight;
  if (calculatedWidth > aspectCalculatedWidth) {
    newWidth = calculatedWidth;
    newHeight = aspectCalculatedHeight;
  } else {
    newHeight = calculatedHeight;
    newWidth = aspectCalculatedWidth;
  }

  this.setSelectionBoxWidth(newWidth);
  this.setSelectionBoxHeight(newHeight);
};


/**
 *
 *
 * @param changeX
 * @param changeY
 * @param aspectRatio
 */
CropSelectJs.prototype.handleAspectRatioLockedResizeBottom = function(changeX, changeY, aspectRatio) {
  var maxHeight = this.getCropWrapperHeight() - this.cropSelectionStartY;
  var maxWidth = this.getCropWrapperWidth() - this.cropSelectionStartX;

  var newHeight = Math.min(this.cropSelectionStartHeight + changeY, maxHeight);
  var newWidth = newHeight * aspectRatio;
  if (newWidth > maxWidth) {
    newWidth = maxWidth;
    newHeight = newWidth / aspectRatio;
  }

  this.setSelectionBoxWidth(newWidth);
  this.setSelectionBoxHeight(newHeight);
};


/**
 *
 *
 * @param changeX
 * @param changeY
 * @param aspectRatio
 */
CropSelectJs.prototype.handleAspectRatioLockedResizeBottomLeft = function(changeX, changeY, aspectRatio) {

  var maxWidth = this.cropSelectionStartX + this.cropSelectionStartWidth;
  var maxHeight = this.getCropWrapperHeight() - this.cropSelectionStartY;

  maxWidth = Math.min(maxWidth, maxHeight * aspectRatio);
  maxHeight = Math.min(maxHeight, maxWidth / aspectRatio);


  var calculatedWidth = Math.min(this.cropSelectionStartWidth - changeX, maxWidth);
  var calculatedHeight = Math.min(this.cropSelectionStartHeight + changeY, maxHeight);

  var aspectCalculatedWidth = calculatedHeight * aspectRatio;
  var aspectCalculatedHeight = calculatedWidth / aspectRatio;

  // --- --- ---

  var newHeight, newWidth;
  if (calculatedWidth > aspectCalculatedWidth) {
    newWidth = calculatedWidth;
    newHeight = aspectCalculatedHeight;
  } else {
    newHeight = calculatedHeight;
    newWidth = aspectCalculatedWidth;
  }

  var actualChangeInWidth = newWidth - this.cropSelectionStartWidth;

  var newX = this.cropSelectionStartX - actualChangeInWidth;
  newX = Math.max(newX, this.cropSelectionStartX - maxWidth);
  newX = Math.min(newX, this.cropSelectionStartX + this.cropSelectionStartWidth - CropSelectJs.MINIMUM_SELECTION_BOX_WIDTH);

  this.setSelectionBoxWidth(newWidth);
  this.setSelectionBoxHeight(newHeight);
  this.setSelectionBoxX(newX);

};


/**
 *
 *
 * @param changeX
 * @param changeY
 * @param aspectRatio
 */
CropSelectJs.prototype.handleAspectRatioLockedResizeLeft = function(changeX, changeY, aspectRatio) {

  var maxHeight = this.cropSelectionStartY + this.cropSelectionStartHeight;
  var maxWidth = this.cropSelectionStartX + this.cropSelectionStartWidth;

  var newWidth = Math.min(this.cropSelectionStartHeight - changeX, maxWidth);
  var newHeight = newWidth / aspectRatio;
  if (newHeight > maxHeight) {
    newHeight = maxHeight;
    newWidth = newHeight * aspectRatio;
  }

  var actualChangeInWidth = newWidth - this.cropSelectionStartWidth;
  var actualChangeInHeight = newHeight - this.cropSelectionStartHeight;

  var newX = this.cropSelectionStartX - actualChangeInWidth;
  var newY = this.cropSelectionStartY - actualChangeInHeight;

  newX = Math.min(newX, this.cropSelectionStartX + this.cropSelectionStartWidth - CropSelectJs.MINIMUM_SELECTION_BOX_WIDTH);
  newY = Math.min(newY, this.cropSelectionStartY + this.cropSelectionStartHeight - CropSelectJs.MINIMUM_SELECTION_BOX_HEIGHT);


  this.setSelectionBoxWidth(newWidth);
  this.setSelectionBoxHeight(newHeight);
  this.setSelectionBoxX(newX);
  this.setSelectionBoxY(newY);
};




// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---



/*
 *                    _                    _             _     ____                   _
 *      /\           (_)                  | |           | |   |  _ \                 | |
 *     /  \    _ __   _  _ __ ___    __ _ | |_  ___   __| |   | |_) |  ___   _ __  __| |  ___  _ __
 *    / /\ \  | '_ \ | || '_ ` _ \  / _` || __|/ _ \ / _` |   |  _ <  / _ \ | '__|/ _` | / _ \| '__|
 *   / ____ \ | | | || || | | | | || (_| || |_|  __/| (_| |   | |_) || (_) || |  | (_| ||  __/| |
 *  /_/    \_\|_| |_||_||_| |_| |_| \__,_| \__|\___| \__,_|   |____/  \___/ |_|   \__,_| \___||_|
 *
 */


/**
 * Enable the animated border.
 */
CropSelectJs.prototype.enableAnimatedBorder = function() {
  $(this.selectionBox).addClass('animated');
};


/**
 * Disable the animated border.
 */
CropSelectJs.prototype.disableAnimatedBorder = function() {
  $(this.selectionBox).removeClass('animated');
};



// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---



/*
 *                                           _       _____         _    _
 *      /\                                  | |     |  __ \       | |  (_)
 *     /  \    ___   ___  _ __    ___   ___ | |_    | |__) | __ _ | |_  _   ___
 *    / /\ \  / __| / __|| '_ \  / _ \ / __|| __|   |  _  / / _` || __|| | / _ \
 *   / ____ \ \__ \| (__ | |_) ||  __/| (__ | |_    | | \ \| (_| || |_ | || (_) |
 *  /_/    \_\|___/ \___|| .__/  \___| \___| \__|   |_|  \_\\__,_| \__||_| \___/
 *                       | |
 *                       |_|
 */

/**
 * Set the selection aspect ratio
 */
CropSelectJs.prototype.setSelectionAspectRatio = function(aspectRatio) {
  this.options.aspectRatio = aspectRatio;

  this.selectCentredFittedAspectRatio(aspectRatio);
};


/**
 * Clear the selection aspect ratio
 */
CropSelectJs.prototype.clearSelectionAspectRatio = function() {
  this.options.aspectRatio = null;
};



// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---



/*
 *  __          __
 *  \ \        / /
 *   \ \  /\  / /_ __  __ _  _ __   _ __    ___  _ __
 *    \ \/  \/ /| '__|/ _` || '_ \ | '_ \  / _ \| '__|
 *     \  /\  / | |  | (_| || |_) || |_) ||  __/| |
 *      \/  \/  |_|   \__,_|| .__/ | .__/  \___||_|
 *                          | |    | |
 *                          |_|    |_|
 */


/**
 *
 * @returns {int}
 */
CropSelectJs.prototype.getCropWrapperWidth = function() {
  return $(this.wrapper).outerWidth();
};


/**
 *
 * @returns {int}
 */
CropSelectJs.prototype.getCropWrapperHeight = function() {
  return $(this.wrapper).outerHeight();
};



// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---



/*
 *    _____        _              _    _                   ____
 *   / ____|      | |            | |  (_)                 |  _ \
 *  | (___    ___ | |  ___   ___ | |_  _   ___   _ __     | |_) |  ___ __  __
 *   \___ \  / _ \| | / _ \ / __|| __|| | / _ \ | '_ \    |  _ <  / _ \\ \/ /
 *   ____) ||  __/| ||  __/| (__ | |_ | || (_) || | | |   | |_) || (_) |>  <
 *  |_____/  \___||_| \___| \___| \__||_| \___/ |_| |_|   |____/  \___//_/\_\
 *
 */


/**
 * Get the selection X coordinate
 *
 * @returns {int}
 */
CropSelectJs.prototype.getSelectionBoxX = function() {
  return $(this.selectionBox).offset().left - $(this.selectionBox).parent().offset().left;
};


/**
 * Set the selection X coordinate
 *
 * @param x
 */
CropSelectJs.prototype.setSelectionBoxX = function(x) {
  var wrapperWidth = this.getCropWrapperWidth();
  var cropSelectionWidth = this.getSelectionBoxWidth();

  // Restrict movement to edges
  x = Math.max(0, Math.min(x, wrapperWidth - cropSelectionWidth));
  this.selectionBox.style.left = x + 'px';

  // Update crop selection shadow
  this.cropShadowLeft.style.width = x + 'px';
  this.cropShadowRight.style.width = wrapperWidth - x - cropSelectionWidth + 'px';
  this.cropShadowTop.style.left = x + 'px';
  this.cropShadowBottom.style.left = x + 'px';
};


/**
 *
 * @returns {int}
 */
CropSelectJs.prototype.getSelectionBoxY = function() {
  return $(this.selectionBox).offset().top - $(this.selectionBox).parent().offset().top;
};


/**
 *
 *
 * @param y
 */
CropSelectJs.prototype.setSelectionBoxY = function(y) {
  var wrapperHeight = this.getCropWrapperHeight();
  var cropSelectionHeight = this.getSelectionBoxHeight();

  // Restrict movement to edges
  y = Math.max(0, Math.min(y, wrapperHeight - cropSelectionHeight));
  this.selectionBox.style.top = y + 'px';

  // Update crop selection shadow
  this.cropShadowTop.style.height = y + 'px';
  this.cropShadowBottom.style.height = wrapperHeight - y - cropSelectionHeight + 'px';
};


/**
 *
 * @returns {int}
 */
CropSelectJs.prototype.getSelectionBoxWidth = function() {
  return $(this.selectionBox).outerWidth();
};


/**
 *
 * @param width
 */
CropSelectJs.prototype.setSelectionBoxWidth = function(width) {

  width = Math.max(width, CropSelectJs.MINIMUM_SELECTION_BOX_WIDTH);
  this.selectionBox.style.width = width + "px";

  var wrapperWidth = this.getCropWrapperWidth();

  // Update crop selection shadow
  this.cropShadowTop.style.width = width + "px";
  this.cropShadowBottom.style.width = width + "px";
  this.cropShadowRight.style.width = wrapperWidth - this.getSelectionBoxX() - width + 'px';
};


/**
 *
 * @returns {int}
 */
CropSelectJs.prototype.getSelectionBoxHeight = function() {
  return $(this.selectionBox).outerHeight();
};


/**
 *
 * @param height
 */
CropSelectJs.prototype.setSelectionBoxHeight = function(height) {
  height = Math.max(height, CropSelectJs.MINIMUM_SELECTION_BOX_HEIGHT);
  this.selectionBox.style.height = height + "px";
  this.cropShadowBottom.style.height = this.getCropWrapperHeight() - this.getSelectionBoxY() - height + 'px';
};



// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---



/*
 *    _____        _              _    _                    _____  _                 _
 *   / ____|      | |            | |  (_)                  / ____|| |               | |
 *  | (___    ___ | |  ___   ___ | |_  _   ___   _ __     | (___  | |__    __ _   __| |  ___ __      __
 *   \___ \  / _ \| | / _ \ / __|| __|| | / _ \ | '_ \     \___ \ | '_ \  / _` | / _` | / _ \\ \ /\ / /
 *   ____) ||  __/| ||  __/| (__ | |_ | || (_) || | | |    ____) || | | || (_| || (_| || (_) |\ V  V /
 *  |_____/  \___||_| \___| \___| \__||_| \___/ |_| |_|   |_____/ |_| |_| \__,_| \__,_| \___/  \_/\_/
 *
 */

/**
 * Refresh the selection box shadow.
 */
CropSelectJs.prototype.refreshSelectionBoxShadow = function() {
  this.setSelectionBoxWidth(this.getSelectionBoxWidth());
  this.setSelectionBoxHeight(this.getSelectionBoxHeight());
  this.setSelectionBoxX(this.getSelectionBoxX());
  this.setSelectionBoxY(this.getSelectionBoxY());
};



// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---



/*
 *      _____
 *     |_   _|
 *       | |   _ __ ___    __ _   __ _   ___
 *       | |  | '_ ` _ \  / _` | / _` | / _ \
 *      _| |_ | | | | | || (_| || (_| ||  __/
 *     |_____||_| |_| |_| \__,_| \__, | \___|
 *                                __/ |
 *                               |___/
 */

/**
 *
 * @returns {string}
 */
CropSelectJs.prototype.getImageSrc = function() {
  return $(this.cropImage).attr('src');
};


/**
 *
 * @param imageSrc
 */
CropSelectJs.prototype.setImageSrc = function(imageSrc) {
  var $this = this;

  // Reads the provided image's dimensions by loading the image
  var img = new Image();
  img.onload = function() {

    // Read the dimensions from the loaded image
    $this.setImageWidth(this.width);
    $this.setImageHeight(this.height);

    // Set the display image source
    $($this.cropImage).attr('src', imageSrc);

  };
  img.src = imageSrc;
};


/**
 *
 * @param width
 */
CropSelectJs.prototype.setImageWidth = function(width) {
  this.imageWidth = width;
};


/**
 *
 * @returns {int}
 */
CropSelectJs.prototype.getImageWidth = function() {
  return this.imageWidth;
};


/**
 *
 * @param width
 */
CropSelectJs.prototype.setImageWidth = function(width) {
  this.imageWidth = width;
};


/**
 *
 * @returns {int}
 */
CropSelectJs.prototype.getImageHeight = function() {
  return this.imageHeight;
};


/**
 *
 * @param height
 */
CropSelectJs.prototype.setImageHeight = function(height) {
  this.imageHeight = height;
};


/**
 *
 * @returns {number}
 */
CropSelectJs.prototype.getImageAspectRatio = function() {
  if (!this.getImageWidth() || !this.getImageHeight()) {
    return null;
  }

  return this.getImageWidth() / this.getImageHeight();
};



// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---



/*
 *       _____              _  _
 *      / ____|            | |(_)
 *     | (___    ___  __ _ | | _  _ __    __ _
 *     \___ \  / __|/ _` || || || '_ \  / _` |
 *     ____) || (__| (_| || || || | | || (_| |
 *    |_____/  \___|\__,_||_||_||_| |_| \__, |
 *                                       __/ |
 *                                      |___/
 */

/**
 *
 *
 * @returns {number}
 */
CropSelectJs.prototype.getImageXScaleFactor = function() {
  return this.getImageWidth() / $(this.cropImage).width();
};


/**
 *
 *
 * @returns {number}
 */
CropSelectJs.prototype.getImageYScaleFactor = function() {
  return this.getImageHeight() / $(this.cropImage).height();
};


/**
 *
 * @returns {number}
 */
CropSelectJs.prototype.getScaledSelectionBoxWidth = function() {
  return Math.round(this.getImageXScaleFactor() * this.getSelectionBoxWidth());
};


/**
 *
 * @returns {number}
 */
CropSelectJs.prototype.getScaledSelectionBoxHeight = function() {
  return Math.round(this.getImageYScaleFactor() * this.getSelectionBoxHeight());
};


/**
 *
 * @returns {number}
 */
CropSelectJs.prototype.getScaledSelectionBoxX = function() {
  return Math.round(this.getImageXScaleFactor() * this.getSelectionBoxX());
};


/**
 *
 * @returns {number}
 */
CropSelectJs.prototype.getScaledSelectionBoxY = function() {
  return Math.round(this.getImageYScaleFactor() * this.getSelectionBoxY());
};



// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---



/*
 *        _____        _              _    _                    _____                                                _
 *       / ____|      | |            | |  (_)                  / ____|                                              | |
 *      | (___    ___ | |  ___   ___ | |_  _   ___   _ __     | |      ___   _ __ ___   _ __ ___    __ _  _ __    __| | ___
 *       \___ \  / _ \| | / _ \ / __|| __|| | / _ \ | '_ \    | |     / _ \ | '_ ` _ \ | '_ ` _ \  / _` || '_ \  / _` |/ __|
 *       ____) ||  __/| ||  __/| (__ | |_ | || (_) || | | |   | |____| (_) || | | | | || | | | | || (_| || | | || (_| |\__ \
 *      |_____/  \___||_| \___| \___| \__||_| \___/ |_| |_|    \_____|\___/ |_| |_| |_||_| |_| |_| \__,_||_| |_| \__,_||___/
 */


/**
 *
 */
CropSelectJs.prototype.selectEverything = function() {
  this.setSelectionBoxX(0);
  this.setSelectionBoxY(0);
  this.setSelectionBoxWidth(this.getCropWrapperWidth());
  this.setSelectionBoxHeight(this.getCropWrapperHeight());

  this.triggerSelectionMoveEvent();
  this.triggerSelectionResizeEvent();
};


/**
 *
 * @param aspectRatio
 */
CropSelectJs.prototype.selectCentredFittedAspectRatio = function(aspectRatio) {

  var wrapperWidth = this.getCropWrapperWidth();
  var wrapperHeight = this.getCropWrapperHeight();

  var aspectCalculatedWidth = wrapperHeight * aspectRatio;
  var aspectCalculatedHeight = wrapperWidth / aspectRatio;

  var width, height;
  if (aspectCalculatedWidth > wrapperWidth) {
    width = wrapperWidth;
    height = Math.round(aspectCalculatedHeight);
  } else {
    width = Math.round(aspectCalculatedWidth);
    height = wrapperHeight;
  }

  var x = Math.floor((wrapperWidth - width) / 2);
  var y = Math.floor((wrapperHeight - height) / 2);

  this.setSelectionBoxWidth(width);
  this.setSelectionBoxHeight(height);
  this.setSelectionBoxX(x);
  this.setSelectionBoxY(y);

  // --- --- ---

  this.triggerSelectionResizeEvent();
  this.triggerSelectionMoveEvent();
};


/**
 *
 */
CropSelectJs.prototype.selectCentredSquare = function() {
  this.selectCentredFittedAspectRatio(1);
};