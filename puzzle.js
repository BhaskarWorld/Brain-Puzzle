function start() {
  startTime = new Date();
  return startTime;
}

function end() {
  endTime = new Date();
}

function msToTime(duration) {
  var milliseconds = parseInt((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  hours = hours < 10 ? "0" + hours : hours;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;

  return hours + ":" + minutes + ":" + seconds + ":" + milliseconds;
}

function checkSolved() {
  solved = 0;
  $("table input").each((idx, el) => {
    row = parseInt($(el).attr("data-row"));
    col = parseInt($(el).attr("data-col"));
    index = gridCol * row + col;
    if ($(el).siblings().children().attr("src") === image_src[index]) {
      solved += 1;
    }
  });
  return solved;
}

function setup() {
  $("#section2").addClass("d-none");
  $("#section2").removeClass("d-flex");
  $("#section1").addClass("d-flex");
  $("#section1").removeClass("d-none");
  $("label").addClass("m-0");
  $("table input").addClass("d-none");
  $("img").css("outline", "none");
  $("img").draggable({ disabled: true });
}

function shuffle() {
  if (!has_shuffled && file_uploaded) {
    var img_src_list = [];
    $("table img").each((idx, el) => {
      img_src_list.push($(el).attr("src"));
    });
    $("table img").each((idx, el) => {
      rand_num = Math.floor(Math.random() * img_src_list.length);
      img_src = img_src_list.splice(rand_num, 1);
      $(el).attr("src", img_src);
    });
    $("#score").text("Moves: " + count_swap);
    $("table input").prop("disabled", false);
    $("#shuffle").addClass("disabled");
    has_shuffled = true;
  } else if (!file_uploaded) {
    alert(
      "Please upload an image first by drag/drop an image \nor\n click on the table to choose an image"
    );
  } 
}

function CheckandSwapItem() {
  if (has_shuffled) {
    var clicked_inp = [];

    var direction = [
      [-1, 0],
      [1, 0],
      [0, 1],
      [0, -1],
      [-1, -1],
      [1, 1],
      [-1, 1],
      [1, -1],
    ];
    $("table input").each((idx, el) => {
      if ($(el).is(":checked")) {
        clicked_inp.push($(el));
        $(el).siblings().children().css({ outline: "solid 3px blue " });
      } else {
        $(el).siblings().children().css({ outline: "none " });
      }
    });

    if (clicked_inp.length === 2) {
      for (var element of direction) {
        element[0] += parseInt(clicked_inp[0].attr("data-row"));
        element[1] += parseInt(clicked_inp[0].attr("data-col"));

        if (
          element[0] === parseInt(clicked_inp[1].attr("data-row")) &&
          element[1] === parseInt(clicked_inp[1].attr("data-col"))
        ) {
          is_present = true;
          break;
        } else {
          is_present = false;
        }
      }

      if (is_present) {
        can_swap = true;
        swap(clicked_inp);
        clicked_inp.forEach((input) => {
          input.prop("checked", false);
          input.siblings("label").children("img").css({ outline: "none " });
        });
      } else {
        can_swap = false;
        clicked_inp.forEach((input) => {
          input.prop("checked", false);
          image = input.siblings("label").children("img");
          image.effect("shake", { times: 4, distance: 1 }, 50);
          image
            .css({
              outline: "2px solid red",
            })
            .animate(
              {
                outlineColor: "transparent",
              },
              300
            );
        });
      }
    } else {
      can_swap = false;
    }
  } else {
    $("#get_image").click();
  }
}

function swap(to_swap) {
  if (can_swap) {
    img_1 = to_swap[0].siblings("label").children("img")[0];
    img_2 = to_swap[1].siblings("label").children("img")[0];
    img1_src = img_1.src;
    img2_src = img_2.src;
    img_1.src = img2_src;
    img_2.src = img1_src;

    count_swap += 1;
    $("#score").text("Moves: " + count_swap);

    if (checkSolved() === gridRow * gridCol) {
      end();
      setTimeout(() => {
        alert(
          "Congratulations!\nYou have solved the puzzle!!\nYour Score: " +
            count_swap +
            "(lowest is better)\nTime Elapsed: " +
            msToTime(endTime.getTime() - startTime.getTime())
        );
        count_swap = 0;
        has_shuffled = false;
        can_swap = false;

        $("table input").prop("disabled", true);
        $("#shuffle").removeClass("disabled");
        setup();
      }, 10);
    }
  }
}

function handleDrop(event) {
  let dt = event.originalEvent.dataTransfer;
  let files = dt.files;
  if (files.length === 1) {
    load_image_file(files);
  } else {
    alert("Please drag & drop a single image file");
  }
}

function handleChange(event) {
  var files = event.target.files;
  if (files.length === 1) {
    load_image_file(files);
  } else {
    alert("Please select a single image file");
  }
}

function Image1Dto2D(Imagedata, canvas_width) {
  ImageArray = [];
  ImageRow = [];
  Pixel = [];
  Imagedata.forEach((component) => {
    Pixel.push(component);
    if (Pixel.length === 4) {
      ImageRow.push(Pixel);
      Pixel = [];
    }
    if (ImageRow.length === canvas_width) {
      ImageArray.push(ImageRow);
      ImageRow = [];
    }
  });
  return ImageArray;
}

function splitImage(ImageArray, gridRow, gridCol) {
  imageHeight = ImageArray.length;
  imageWidth = ImageArray[0].length;
  gridHeight = parseInt(imageHeight / gridRow);
  gridWidth = parseInt(imageWidth / gridCol);
  ImageGrid = [];
  for (var i = 0; i < gridRow; i++) {
    rows = ImageArray.splice(0, gridHeight);
    col = [];
    for (var j = 0; j < gridCol; j++) {
      grid = [];
      rows.forEach((row) => {
        grid.push(row.splice(0, gridWidth));
      });
      col.push(grid);
    }
    ImageGrid.push(col);
  }
  return ImageGrid;
}

function Image2Dto1D(grid) {
  Image1D = [];
  grid.forEach((row) => {
    row.forEach((pixel) => {
      pixel.forEach((component) => {
        Image1D.push(component);
      });
    });
  });
  return Image1D;
}

function load_image_file(files) {
  const reader = new FileReader();
  reader.addEventListener("load", (file_reader_Load_event) => {
    var canvas = document.createElement("canvas");
    context = canvas.getContext("2d");
    image = new Image();
    image.addEventListener("load", () => {
      size = parseInt(h);
      canvas.width = canvas_width = size;
      canvas.height = canvas_height = size;
      context.drawImage(image, 0, 0, canvas_width, canvas_height);
      Imagedata = context.getImageData(0, 0, canvas_width, canvas_height).data;
      ImageArray = Image1Dto2D(Imagedata, canvas_width);
      grids = splitImage(ImageArray, gridRow, gridCol);

      image_src = [];
      grids.forEach((row, idx) => {
        row.forEach((grid, inner_idx) => {
          var new_canvas = document.createElement("canvas");
          var ctx = new_canvas.getContext("2d");
          new_canvas.width = grid[0].length;
          new_canvas.height = grid.length;
          grid1D = Image2Dto1D(grid);
          imageData = new ImageData(
            Uint8ClampedArray.from(grid1D),
            new_canvas.width,
            new_canvas.height
          );
          ctx.putImageData(imageData, 0, 0);
          var DataURL = new_canvas.toDataURL("image/png");
          $("#img_row_" + idx + "_col_" + inner_idx).attr("src", DataURL);
          image_src.push(DataURL);
        });
      });

      if (image_src.length === gridCol * gridRow) {
        file_uploaded = true;
        has_shuffled = false;
        $("#shuffle").removeClass("disabled");
      }
    });
    image.src = file_reader_Load_event.target.result;
  });
  file = files[0];
  AllowedExtensions = /(\/jpg|\/jpeg|\/png|\/gif)$/i;
  if (file != null && file != undefined && AllowedExtensions.exec(file.type))
    reader.readAsDataURL(file);
  else {
    alert("Please select an image file.");
  }
}

function restart() {
  gridRow = parseInt($("#in-row").val());
  gridCol = parseInt($("#in-col").val());

  if (gridCol > 1 && gridCol < 10 && gridRow > 1 && gridRow < 10) {
    var innerhtml = "";
    for (var p = 0; p < gridRow; p++) {
      innerhtml += '<tr class = "row ">';
      for (var q = 0; q < gridCol; q++) {
        innerhtml +=
          '<td class="  "><input data-row = ' +
          p +
          " data-col=" +
          q +
          '  id="row-' +
          p +
          "-col-" +
          q +
          '" type="checkbox"><label for="row-' +
          p +
          "-col-" +
          q +
          '" ><img  id="img_row_' +
          p +
          "_col_" +
          q +
          '"  alt="" width=' +
          h / gridCol +
          " height=" +
          h / gridRow +
          "></label></div>";
      }
      innerhtml += "</tr>";
    }
    $("table").html(innerhtml);
    start();
    setup();
    $("#section1").addClass("d-none");
    $("#section1").removeClass("d-flex");
    $("#section2").addClass("d-flex");
    $("#section2").removeClass("d-none");
    $("table input").prop("disabled", true);
    $("#shuffle").addClass("disabled");

    $("#score").text("Moves: " + count_swap);
    alert(
      "select an image by clicking on the table\nor\n Drag/Drop an image in the table."
    );
    dragEvents = ["dragenter", "dragover", "dragleave", "drop"];
    dragEvents.forEach((eventName) => {
      $("table").on(eventName, (event) => {
        event.preventDefault();
        event.stopPropagation();
      });
    });
  } else {
    alert("Enter rows and col in range 2-9");
  }
}

$("#row-col").on("click", restart);

$("#shuffle").on("click", shuffle);
$("table").on("click", CheckandSwapItem);

$("table").on("drop", handleDrop);
$("#get_image").on("change", handleChange);

function initiate() {
  setup();

  var r = 255,
    g = 0,
    b = 0;

  setInterval(() => {
    if (r > 0 && b == 0) {
      r--;
      g++;
    }
    if (g > 0 && r == 0) {
      g--;
      b++;
    }
    if (b > 0 && g == 0) {
      b--;
      r++;
    }

    $("body").css({
      backgroundColor: "2px solid rgba(" + r + "," + g + "," + b + ", 0.5)",
    });
  }, 10);
  $(".loader").addClass("d-none");
  $(".main").css("display", "block");
}
var to_swap, startTime, endTime;
var has_shuffled = false;
var file_uploaded = false;
var can_swap = false;
var count_swap = 0;
var image_src = [];
var gridRow, gridCol;
var h =
  window.innerHeight * 0.5 < window.innerWidth * 0.5
    ? window.innerHeight * 0.5
    : window.innerWidth * 0.5;
$(document).ready(initiate);
