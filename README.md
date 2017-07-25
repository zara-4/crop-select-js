# CropSelectJs

![Example](doc/crop.gif)


By [Zara 4 image compression](https://zara4.com) service



# Installation

- Bower: `bower install crop-select-js --save`
- NPM: `npm install crop-select-js`
- Zip: [Download](https://github.com/CropSelectJs/CropSelectJs/archive/master.zip)

You will need to include both `crop-select-js.min.js` and `crop-select-js.min.css` into your web page.



# Basic Example

```html
<div id='crop-select'></div>
```


```javascript
$('#crop-select').CropSelectJs({
  imageSrc: 'path/to/image.jpg'
});
```





# Functions

To call a function on a CropSelectJs element, follow the pattern below.
Replace the text 'function' with the name of the function you wish to call.

```javascript
$('#crop-select').CropSelectJs('function')
```

The functions available are listed below:

| Function                       | Description                                    |
| :----------------------------- | :--------------------------------------------- |
| enableAnimatedBorder           |                                                |
| disableAnimatedBorder          |                                                |
| getSelectionBoxX               |                                                |
| setSelectionBoxX               |                                                |
| getSelectionBoxY               |                                                |
| setSelectionBoxY               |                                                |
| getSelectionBoxWidth           |                                                |
| setSelectionBoxWidth           |                                                |
| getSelectionBoxHeight          |                                                |
| setSelectionBoxHeight          |                                                |
| setSelectionAspectRatio        |                                                |
| clearSelectionAspectRatio      |                                                |
| getImageSrc                    |                                                |
| getImageWidth                  |                                                |
| getImageHeight                 |                                                |
| getImageAspectRatio            |                                                |
| setImageSrc                    |                                                |
| selectEverything               |                                                |
| selectCentredSquare            |                                                |
| selectCentredFittedAspectRatio |                                                |



# License

CropSelectJs is released under the GNU GPL 3.0 license. [View license](LICENSE.md)