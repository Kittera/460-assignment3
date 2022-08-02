// regex to help with input validation for comma separated values
const csvArrRGX = /^\[?[0-9]+(,[0-9]+)*\[?$/;

//regex to help validate decimal numbers
const decNumRGX = /^\d*[0-9](|.\d*[0-9]|,\d*[0-9])?$/;

//
//
//
// Library functions for calculator
//
//
//

//ohm's Law calculator

function ohmsLaw(volts, resistance, current) {
  if (!volts && resistance && current) {
    return resistance * current;
  } else if (volts && !resistance && current) {
    return volts / current;
  } else if (volts && resistance && !current) {
    return volts / resistance;
  }
}

//resistor/capacitor grouping calculator

function groupResistorsCapacitors(values, isSeries = false) {
  isSeries = "true" == isSeries.toLowerCase() || isSeries == true;
  let sum = 0;
  values.forEach((value) => {
    if (isSeries) {
      sum += parseFloat(value);
    } else {
      sum += 1 / parseFloat(value);
    }
  });
  return isSeries ? sum : 1 / sum;
}

//
//
// API begins here
//
//
//

const api = require("express")();
api.use(require("cors")());

api.get("/assign3/api/RC/", (req, res) => {
  let { capacitance, seriesResistance, isCharging, chargingVoltage, reqTime } =
    req.query;
  // parse input into numbers to work with
  capacitance = parseFloat(capacitance); // in farads
  seriesResistance = parseFloat(seriesResistance); // in ohms
  chargingVoltage = parseFloat(chargingVoltage); // in volts
  isCharging = "true" == isCharging.toLowerCase() || isCharging == true; // best way I could come up with

  const timeConstant = seriesResistance * capacitance; // in seconds
  reqTime = parseFloat(reqTime) || timeConstant; // in seconds

  // capacitor discharging or charging? that affects the equation.
  function capFunc(time) {
    let factor = Math.pow(Math.E, -(time / timeConstant));
    return chargingVoltage * capacitance * (isCharging ? 1 - factor : factor); // in coulombs
  }
  let reqTimeChargeResultCoulombs = capFunc(reqTime);
  let reqTimeChargeResultVolts = reqTimeChargeResultCoulombs / capacitance;

  res.json({
    cap_mostly_charged_at_time: 5 * timeConstant, // in seconds
    time_constant: timeConstant, // also in seconds
    charge_after_req_time_volts: reqTimeChargeResultVolts, // in volts
  });
});

/**
 * Implements the Ohm's Law Calculator microservice. NOT SANITARY.
 */
api.get("/assign3/api/ohmslaw/", (req, res) => {
  let { volts, ohms, amps } = req.query;
  volts = parseFloat(volts);
  ohms = parseFloat(ohms);
  amps = parseFloat(amps);

  let result = ohmsLaw(volts, ohms, amps);
  if (!volts) {
    res.json({ volts: result });
  } else if (!ohms) {
    res.json({ ohms: result });
  } else if (!amps) {
    res.json({ amps: result });
  } else {
    res.json({ error: "must leave one parameter unspecified to solve for it" });
  }
});

api.get("/assign3/api/componentgroups/", (req, res) => {
  let { values, isSeries } = req.query;
  if (values && isSeries && csvArrRGX.test(values)) {
    values = values.split(",");
    res.json({
      equiv_value: groupResistorsCapacitors(values, isSeries),
    });
  } else {
    res.json("error");
  }
});

api.get("/assign3/api/capacitorenergy/", (req, res) => {
  let { capacitance, chargeVoltage } = req.query;
  if (
    capacitance &&
    chargeVoltage &&
    decNumRGX.test(capacitance) &&
    decNumRGX.test(chargeVoltage)
  ) {
    res.json({
      stored_energy: (capacitance * chargeVoltage * chargeVoltage) / 2.0, // 1/2 (C(V)^2)
    });
  } else {
    res.json("error");
  }
});

api.listen(process.env.PORT || 3001, () =>
  console.log("E&M Calculator Backend running.")
);
