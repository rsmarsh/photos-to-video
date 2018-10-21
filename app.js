const videoshow = require('videoshow');
const fs = require('fs');


//interface for allowing users to enter inputs on the command line 
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

let config = {};

/** How many images per second in the final video
 *  Note that videoshow uses the 'loop' key for this
 *  This is annoyingly in seconds not milliseconds, so 0.033 for 30fps
*/
let receiveFPS = function(fps) {
    fps = parseInt(fps);

    if (isNaN(fps)) {
        console.log("Error: invalid number entered. Please try again.");
        readInput('Enter the video FPS: ', receiveFPS);
    } else {
        console.log(fps+"FPS is valid, converting to "+1/fps);
        config.fps = 1/fps;
        createImageList('images');
    }
    
};

// custom fit at the moment to support files named IMG123-123456789.png, sorted by the number following IMG and before '-'
let createImageList = function(path) {
    console.log("create image list");

    fs.readdir(path, function(err, items) {
        console.log(items.length+' images found');

        // Sort the images into chronological order
        items.sort(function(img1, img2){
            
            var img1num = parseInt(img1.substring(
                img1.indexOf("G")+1, 
                img1.indexOf("-")
            ));
            var img2num = parseInt(img2.substring(
                img2.indexOf("G")+1, 
                img2.indexOf("-")
            ));
            return img1num == img2num ? 0 : img1num < img2num ? -1 : 1;
        });

        

        // Prepend file path to the image names
        for (var i = 0; i < items.length; i++) {
            if (items[i]) {
                
                items[i] = './'+path+'/'+items[i];
                
            }
        }
        console.log("got "+items.length);
        console.log(items);
        startVideoProcessing(items);
    });

}


// Prompt the user for an input
let readInput = function(message, callback) {
    readline.question(message, (input) => {
        readline.close();

        callback(input);
    });
};


// Once all the video parameters have been input, begin the process
let startVideoProcessing = function(images) {

    let videoConfig = {
        fps: 25,
        loop: 0.1, // seconds, doesn't really work with any kind of rounding error prone numbers
        transition: false,
        videoBitrate: 1024,
        videoCodec: 'libx264',
        size: '720x480',
        audioBitrate: '128k',
        audioChannels: 2,
        format: 'mp4',
      pixelFormat: 'yuv420p'
    };

    videoshow(images, videoConfig)
    .save('video.mp4')
    // .on('start', function (command) {
        // console.log('ffmpeg process started:', command)
    // })
    .on('progress', function(progress) {
        console.log(progress.percent);
    })
    .on('error', function (err, stdout, stderr) {
        console.error('Error:', err)
        console.error('ffmpeg stderr:', stderr)
    })
    .on('end', function (output) {
        console.error('Video created in:', output)
    });

};


readInput('Enter the video FPS: NO EFFECT CURRENTLY', receiveFPS);
// createImageList();

