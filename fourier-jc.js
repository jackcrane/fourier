const fs = require("fs");
const path = require("path");
const math = require("mathjs");
const { ArgumentParser } = require("argparse");

const parser = new ArgumentParser({
  description:
    "Fourier series approximation of points with separate equations for x and y",
});
parser.add_argument("-p", "--points", { help: "Path to points JSON file" });
parser.add_argument("-e", "--error", {
  help: "Error threshold for approximation",
  type: "float",
});

const args = parser.parse_args();

const pointsData = JSON.parse(fs.readFileSync(args.points));

const xPoints = pointsData.map((point, index) => [index, point[0]]);
const yPoints = pointsData.map((point, index) => [index, point[1]]);

let error = Infinity;
let iterations = 0;
let previousCoefficients = [];
let xFunction = (
  outerAdditor,
  innerAdditor,
  outerCoefficient,
  innerCoefficient,
  x
) => {
  return (
    outerAdditor +
    innerAdditor * math.cos(outerCoefficient * x + innerCoefficient)
  );
};
let yFunction = xFunction;

let xOuterAdditor = 0;
let xInnerAdditor = 0;
let xOuterCoefficient = 0;
let xInnerCoefficient = 0;
let yOuterAdditor = 0;
let yInnerAdditor = 0;
let yOuterCoefficient = 0;
let yInnerCoefficient = 0;

let previousXError = Infinity;
let previousYError = Infinity;
