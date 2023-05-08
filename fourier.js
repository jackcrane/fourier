const fs = require("fs");
const path = require("path");
const math = require("mathjs");
const { ArgumentParser } = require("argparse");

const parser = new ArgumentParser({
  description:
    "Fourier series approximation of points with separate equations for x and y",
});
parser.add_argument("-p", "--points", { help: "Path to points JSON file" });
parser.add_argument("-n", "--iterations", {
  help: "Number of iterations for the approximation",
  type: "int",
});

const args = parser.parse_args();

const pointsData = JSON.parse(fs.readFileSync(args.points));
const n = args.iterations;

const xPoints = pointsData.map((point) => point[0]);
const yPoints = pointsData.map((point) => point[1]);
const N = pointsData.length;

const evaluateFunction = (coefficients, x) => {
  return coefficients.reduce(
    (sum, c, index) =>
      sum +
      c *
        (index % 2 === 0
          ? Math.cos((index * Math.PI * x) / N)
          : Math.sin((index * Math.PI * x) / N)),
    0
  );
};

const calculateError = (originalPoints, approximatedPoints) => {
  return math.sum(
    originalPoints.map((point, index) =>
      Math.abs(point - approximatedPoints[index])
    )
  );
};

const bruteForceFourier = (points, iterations) => {
  const coefficients = Array(iterations).fill(0);
  let minError = Infinity;
  let bestCoefficients = null;
  let bestApproximatedPoints = null;

  const incrementCoefficient = (index) => {
    if (index >= iterations) {
      return false;
    }
    coefficients[index] += 1;
    if (coefficients[index] > 10) {
      coefficients[index] = 0;
      return incrementCoefficient(index + 1);
    }
    return true;
  };

  while (incrementCoefficient(0)) {
    const approximatedPoints = pointsData.map((_, index) =>
      evaluateFunction(coefficients, index)
    );
    const error = calculateError(points, approximatedPoints);

    if (error < minError) {
      minError = error;
      bestCoefficients = coefficients.slice();
      bestApproximatedPoints = approximatedPoints.slice();
    }

    console.log(
      `Coefficients: ${coefficients.map((c) => c.toFixed(2)).join(", ")}`,
      `Error: ${error.toFixed(2)}`
    );
  }

  const equation = `f(t) = ${bestCoefficients
    .map(
      (c, index) =>
        `${c.toFixed(2)}${
          index % 2 === 0
            ? `\\cos(\\frac{${index}\\pi t}{${N}})`
            : `\\sin(\\frac{${index}\\pi t}{${N}})`
        }`
    )
    .join(" + ")}`;

  return { bestApproximatedPoints, equation };
};

const { bestApproximatedPoints: xApproximatedPoints, equation: xEquation } =
  bruteForceFourier(xPoints, n);
const { bestApproximatedPoints: yApproximatedPoints, equation: yEquation } =
  bruteForceFourier(yPoints, n);

const approximatedPoints = xApproximatedPoints.map((x, index) => [
  x,
  yApproximatedPoints[index],
]);
const error = calculateError(pointsData.flat(), approximatedPoints.flat());

console.log(`Error: ${error}`);
console.log(`X Equation: $${xEquation}$`);
console.log(`Y Equation: $${yEquation}$`);
