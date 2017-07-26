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
  if (this.options.imageSrc) {
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
  $(this.wrapper).append(this.selectionBox);
  $(this.selectionBox).on('mousedown', function(e) {
    $this.handleMouseDownInsideSelectionBox(e);
  });
};


/**
 * Initialise the crop selection shadows.
 */
CropSelectJs.prototype.initialiseShadows = function() {

  // Left Shadow
  this.shadowLeft = this.elem.find(".shadow.left");
  if (this.shadowLeft[0]) {
    this.shadowLeft.detach();
  } else {
    this.shadowLeft = $("<div class='shadow left'></div>")[0];
  }
  $(this.wrapper).append(this.shadowLeft);


  // Right Shadow
  this.shadowRight = this.elem.find(".shadow.right");
  if (this.shadowRight[0]) {
    this.shadowRight.detach();
  } else {
    this.shadowRight = $("<div class='shadow right'></div>")[0];
  }
  $(this.wrapper).append(this.shadowRight);


  // Top Shadow
  this.shadowTop = this.elem.find(".shadow.top");
  if (this.shadowTop[0]) {
    this.shadowTop.detach();
  } else {
    this.shadowTop = $("<div class='shadow top'></div>")[0];
  }
  $(this.wrapper).append(this.shadowTop);


  // Bottom Shadow
  this.shadowBottom = this.elem.find(".shadow.bottom");
  if (this.shadowBottom[0]) {
    this.shadowBottom.detach();
  } else {
    this.shadowBottom = $("<div class='shadow bottom'></div>")[0];
  }
  $(this.wrapper).append(this.shadowBottom);
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
  $(this.wrapper).append(this.cropImage);
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
  this.selectionMouseStartX = null;
  this.selectionMouseStartY = null;
  this.selectionStartX = null;
  this.selectionStartY = null;
  this.selectionStartWidth = null;
  this.selectionStartHeight = null;
  this.selectionResizeHandle = null;
};


/**
 * Handle mouse move inside wrapper.
 *
 * @param e
 */
CropSelectJs.prototype.handleMouseMove = function(e) {
  if (this.selectionMouseStartX && this.selectionMouseStartY) {
    var changeX = e.pageX - this.selectionMouseStartX;
    var changeY = e.pageY - this.selectionMouseStartY;

    //
    // Handle move
    //
    if (!this.selectionResizeHandle) {

      // Perform move
      this.setSelectionBoxX(this.selectionStartX + changeX);
      this.setSelectionBoxY(this.selectionStartY + changeY);

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
        if (this.selectionResizeHandle == 'top-left') {
          this.handleAspectRatioLockedResizeTopLeft(changeX, changeY, this.options.aspectRatio);
        } else if (this.selectionResizeHandle == 'top') {
          this.handleAspectRatioLockedResizeTop(changeX, changeY, this.options.aspectRatio);
        } else if (this.selectionResizeHandle == 'top-right') {
          this.handleAspectRatioLockedResizeTopRight(changeX, changeY, this.options.aspectRatio);
        } else if (this.selectionResizeHandle == 'right') {
          this.handleAspectRatioLockedResizeRight(changeX, changeY, this.options.aspectRatio);
        } else if (this.selectionResizeHandle == 'bottom-right') {
          this.handleAspectRatioLockedResizeBottomRight(changeX, changeY, this.options.aspectRatio);
        } else if (this.selectionResizeHandle == 'bottom') {
          this.handleAspectRatioLockedResizeBottom(changeX, changeY, this.options.aspectRatio);
        } else if (this.selectionResizeHandle == 'bottom-left') {
          this.handleAspectRatioLockedResizeBottomLeft(changeX, changeY, this.options.aspectRatio);
        } else if (this.selectionResizeHandle == 'left') {
          this.handleAspectRatioLockedResizeLeft(changeX, changeY, this.options.aspectRatio);
        }
      }

      // Trigger resize event
      this.triggerSelectionResizeEvent();

      // Trigger move event
      if (this.getSelectionBoxX() != this.selectionStartX || this.getSelectionBoxY() != this.selectionStartY) {
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

  this.selectionMouseStartX = e.pageX;
  this.selectionMouseStartY = e.pageY;

  this.selectionStartX = this.getSelectionBoxX();
  this.selectionStartY = this.getSelectionBoxY();
  this.selectionStartWidth = this.getSelectionBoxWidth();
  this.selectionStartHeight = this.getSelectionBoxHeight();

  var target = $(e.target);
  if (target.hasClass('handle')) {
    if (target.hasClass('top-left')) { this.selectionResizeHandle = 'top-left'; }
    if (target.hasClass('top')) { this.selectionResizeHandle = 'top'; }
    if (target.hasClass('top-right')) { this.selectionResizeHandle = 'top-right'; }
    if (target.hasClass('right')) { this.selectionResizeHandle = 'right'; }
    if (target.hasClass('bottom-right')) { this.selectionResizeHandle = 'bottom-right'; }
    if (target.hasClass('bottom')) { this.selectionResizeHandle = 'bottom'; }
    if (target.hasClass('bottom-left')) { this.selectionResizeHandle = 'bottom-left'; }
    if (target.hasClass('left')) { this.selectionResizeHandle = 'left'; }
  }
};


/**
 * Handle resize.
 */
CropSelectJs.prototype.handleWrapperResize = function() {

  var changeInWrapperWidth = this.previousWrapperWidth - this.getWrapperWidth();
  var changeInWrapperHeight = this.previousWrapperHeight - this.getWrapperHeight();

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
    this.previousWrapperWidth = this.getWrapperWidth();
    this.previousWrapperHeight = this.getWrapperHeight();

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
  this.previousWrapperWidth = this.getWrapperWidth();
  this.previousWrapperHeight = this.getWrapperHeight();

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
  if (this.selectionResizeHandle.includes('top')) {
    this.setSelectionBoxHeight(Math.min(this.selectionStartHeight - changeY, this.selectionStartY + this.selectionStartHeight));
    this.setSelectionBoxY(Math.min(this.selectionStartY + changeY, this.selectionStartY + this.selectionStartHeight - CropSelectJs.MINIMUM_SELECTION_BOX_HEIGHT));
  } else if (this.selectionResizeHandle.includes('bottom')) {
    this.setSelectionBoxHeight(Math.min(this.selectionStartHeight + changeY, this.getWrapperHeight() - this.selectionStartY));
  }

  // Horizontal resize
  if (this.selectionResizeHandle.includes('left')) {
    this.setSelectionBoxWidth(Math.min(this.selectionStartWidth - changeX, this.selectionStartX + this.selectionStartWidth));
    this.setSelectionBoxX(Math.min(this.selectionStartX + changeX, this.selectionStartX + this.selectionStartWidth - CropSelectJs.MINIMUM_SELECTION_BOX_WIDTH));
  } else if (this.selectionResizeHandle.includes('right')) {
    this.setSelectionBoxWidth(Math.min(this.selectionStartWidth + changeX, this.getWrapperWidth() - this.selectionStartX));
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
  var maxHeight = this.selectionStartY + this.selectionStartHeight;
  var maxWidth = this.selectionStartX + this.selectionStartWidth;

  maxWidth = Math.min(maxWidth, maxHeight * aspectRatio);
  maxHeight = Math.min(maxHeight, maxWidth / aspectRatio);

  var calculatedHeight = Math.min(this.selectionStartHeight - changeY, maxHeight);
  var calculatedWidth = Math.min(this.selectionStartWidth - changeX, maxWidth);

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

  var actualChangeInWidth = newWidth - this.selectionStartWidth;
  var actualChangeInHeight = newHeight - this.selectionStartHeight;

  var newX = this.selectionStartX - actualChangeInWidth;
  var newY = this.selectionStartY - actualChangeInHeight;

  newX = Math.min(newX, this.selectionStartX + this.selectionStartWidth - CropSelectJs.MINIMUM_SELECTION_BOX_WIDTH);
  newY = Math.min(newY, this.selectionStartY + this.selectionStartHeight - CropSelectJs.MINIMUM_SELECTION_BOX_HEIGHT);

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
  var maxHeight = this.selectionStartY + this.selectionStartHeight;
  var maxWidth = this.selectionStartX + this.selectionStartWidth;

  var newHeight = Math.min(this.selectionStartHeight - changeY, maxHeight);
  var newWidth = newHeight * aspectRatio;
  if (newWidth > maxWidth) {
    newWidth = maxWidth;
    newHeight = newWidth / aspectRatio;
  }

  var actualChangeInWidth = newWidth - this.selectionStartWidth;
  var actualChangeInHeight = newHeight - this.selectionStartHeight;

  var newX = this.selectionStartX - actualChangeInWidth;
  var newY = this.selectionStartY - actualChangeInHeight;

  newX = Math.min(newX, this.selectionStartX + this.selectionStartWidth - CropSelectJs.MINIMUM_SELECTION_BOX_WIDTH);
  newY = Math.min(newY, this.selectionStartY + this.selectionStartHeight - CropSelectJs.MINIMUM_SELECTION_BOX_HEIGHT);

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

  var maxWidth = this.getWrapperWidth() - this.selectionStartX;
  var maxHeight = this.selectionStartY + this.selectionStartHeight;

  maxWidth = Math.min(maxWidth, maxHeight * aspectRatio);
  maxHeight = Math.min(maxHeight, maxWidth / aspectRatio);


  var calculatedHeight = Math.min(this.selectionStartHeight - changeY, maxHeight);
  var calculatedWidth = Math.min(this.selectionStartWidth + changeX, maxWidth);

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

  var actualChangeInHeight = newHeight - this.selectionStartHeight;

  var newY = this.selectionStartY - actualChangeInHeight;
  newY = Math.max(newY, this.selectionStartY - maxHeight);
  newY = Math.min(newY, this.selectionStartY + this.selectionStartHeight - CropSelectJs.MINIMUM_SELECTION_BOX_HEIGHT);


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
  var maxHeight = this.getWrapperHeight() - this.selectionStartY;
  var maxWidth = this.getWrapperWidth() - this.selectionStartX;

  var newWidth = Math.min(this.selectionStartWidth + changeX, maxWidth);
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

  var maxHeight = this.getWrapperHeight() - this.selectionStartY;
  var maxWidth = this.getWrapperWidth() - this.selectionStartX;

  maxWidth = Math.min(maxWidth, maxHeight * aspectRatio);
  maxHeight = Math.min(maxHeight, maxWidth / aspectRatio);

  var calculatedHeight = Math.min(this.selectionStartHeight + changeY, maxHeight);
  var calculatedWidth = Math.min(this.selectionStartWidth + changeX, maxWidth);

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
  var maxHeight = this.getWrapperHeight() - this.selectionStartY;
  var maxWidth = this.getWrapperWidth() - this.selectionStartX;

  var newHeight = Math.min(this.selectionStartHeight + changeY, maxHeight);
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

  var maxWidth = this.selectionStartX + this.selectionStartWidth;
  var maxHeight = this.getWrapperHeight() - this.selectionStartY;

  maxWidth = Math.min(maxWidth, maxHeight * aspectRatio);
  maxHeight = Math.min(maxHeight, maxWidth / aspectRatio);


  var calculatedWidth = Math.min(this.selectionStartWidth - changeX, maxWidth);
  var calculatedHeight = Math.min(this.selectionStartHeight + changeY, maxHeight);

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

  var actualChangeInWidth = newWidth - this.selectionStartWidth;

  var newX = this.selectionStartX - actualChangeInWidth;
  newX = Math.max(newX, this.selectionStartX - maxWidth);
  newX = Math.min(newX, this.selectionStartX + this.selectionStartWidth - CropSelectJs.MINIMUM_SELECTION_BOX_WIDTH);

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

  var maxHeight = this.selectionStartY + this.selectionStartHeight;
  var maxWidth = this.selectionStartX + this.selectionStartWidth;

  var newWidth = Math.min(this.selectionStartHeight - changeX, maxWidth);
  var newHeight = newWidth / aspectRatio;
  if (newHeight > maxHeight) {
    newHeight = maxHeight;
    newWidth = newHeight * aspectRatio;
  }

  var actualChangeInWidth = newWidth - this.selectionStartWidth;
  var actualChangeInHeight = newHeight - this.selectionStartHeight;

  var newX = this.selectionStartX - actualChangeInWidth;
  var newY = this.selectionStartY - actualChangeInHeight;

  newX = Math.min(newX, this.selectionStartX + this.selectionStartWidth - CropSelectJs.MINIMUM_SELECTION_BOX_WIDTH);
  newY = Math.min(newY, this.selectionStartY + this.selectionStartHeight - CropSelectJs.MINIMUM_SELECTION_BOX_HEIGHT);


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
CropSelectJs.prototype.getWrapperWidth = function() {
  return $(this.wrapper)[0].getBoundingClientRect().width;
};


/**
 *
 * @returns {int}
 */
CropSelectJs.prototype.getWrapperHeight = function() {
  return $(this.wrapper)[0].getBoundingClientRect().height;
};



// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---



/*
 *      _____               _          _
 *    / ____|             | |        (_)
 *   | |      ___   _ __  | |_  __ _  _  _ __    ___  _ __
 *   | |     / _ \ | '_ \ | __|/ _` || || '_ \  / _ \| '__|
 *   | |____| (_) || | | || |_| (_| || || | | ||  __/| |
 *    \_____|\___/ |_| |_| \__|\__,_||_||_| |_| \___||_|
 *
 */


/**
 * Get the width of the container this element sits within.
 *
 * @returns {int}
 */
CropSelectJs.prototype.getContainerWidth = function() {
  $(this.elem).parent().width();
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
  var wrapperWidth = this.getWrapperWidth();
  var cropSelectionWidth = this.getSelectionBoxWidth();

  // Restrict movement to edges
  x = Math.max(0, Math.min(x, wrapperWidth - cropSelectionWidth));
  this.selectionBox.style.left = x + 'px';

  // Update crop selection shadow
  this.shadowLeft.style.width = x + 'px';
  this.shadowRight.style.width = wrapperWidth - x - cropSelectionWidth + 'px';
  this.shadowTop.style.left = x + 'px';
  this.shadowBottom.style.left = x + 'px';
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
  var wrapperHeight = this.getWrapperHeight();
  var cropSelectionHeight = this.getSelectionBoxHeight();

  // Restrict movement to edges
  y = Math.max(0, Math.min(y, wrapperHeight - cropSelectionHeight));
  this.selectionBox.style.top = y + 'px';

  // Update crop selection shadow
  this.shadowTop.style.height = y + 'px';
  this.shadowBottom.style.height = wrapperHeight - y - cropSelectionHeight + 'px';
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

  var wrapperWidth = this.getWrapperWidth();

  // Update crop selection shadow
  this.shadowTop.style.width = width + "px";
  this.shadowBottom.style.width = width + "px";
  this.shadowRight.style.width = wrapperWidth - this.getSelectionBoxX() - width + 'px';
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
  this.shadowBottom.style.height = this.getWrapperHeight() - this.getSelectionBoxY() - height + 'px';
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
  this.setSelectionBoxWidth(this.getWrapperWidth());
  this.setSelectionBoxHeight(this.getWrapperHeight());

  this.triggerSelectionMoveEvent();
  this.triggerSelectionResizeEvent();
};


/**
 *
 * @param aspectRatio
 */
CropSelectJs.prototype.selectCentredFittedAspectRatio = function(aspectRatio) {

  var wrapperWidth = this.getWrapperWidth();
  var wrapperHeight = this.getWrapperHeight();

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