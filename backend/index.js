// Q = CV
const capacitorVoltsToCoulombs = (capacitance, volts) => {
  capacitance * volts;
};

// V = Q/C
function capacitorCoulombsToVolts(capacitance, coulombs) {
  return coulombs / capacitance;
}

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
  isSeries = "true" == isSeries.toLowerCase();
  let sum = 0;
  console.log(values);
  values.forEach((value) => {
    if (isSeries) {
      sum += value;
    } else {
      sum += 1 / value;
    }
  });
  console.log(`sum=${sum}`);
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
  console.log(req.query);
  let { capacitance, seriesResistance, isCharging, chargingVoltage, reqTime } =
    req.query;
  // parse input into numbers to work with
  capacitance = parseFloat(capacitance); // in farads
  seriesResistance = parseFloat(seriesResistance); // in ohms
  chargingVoltage = parseFloat(chargingVoltage); // in volts
  isCharging = "true" == isCharging.toLowerCase(); // best way I could come up with

  const timeConstant = seriesResistance * capacitance; // in seconds
  reqTime = parseFloat(reqTime) || timeConstant; // in seconds

  // capacitor discharging or charging? that affects the equation.
  function capFunc(time) {
    let factor = Math.pow(Math.E, -(time / timeConstant));
    return chargingVoltage * (isCharging ? 1 - factor : factor); // in coulombs
  }

  res.json({
    charge_after_req_time: capacitorCoulombsToVolts(
      capacitance,
      capFunc(reqTime)
    ), // in volts
    cap_mostly_charged_at_time: 5 * timeConstant, // in seconds
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

api.get("/assign3/api/resistorgroups/", (req, res) => {
  let { values, isSeries } = req.query;
  values = JSON.parse(values);
  if (values && isSeries) {
    res.json({ equiv_resistance: groupResistorsCapacitors(values, isSeries) });
  } else {
    res.json("error");
  }
});

api.get("/assign3/api/capacitorgroups/", (req, res) => {
  console.log(req.query);
  let { values, isSeries } = req.query;
  values = JSON.parse(values);
  if (values && isSeries) {
    res.json({ equiv_capacitance: groupResistorsCapacitors(values, isSeries) });
  } else {
    res.json("error");
  }
});

api.get("/assign3/api/inductorgroups/", (req, res) => {
  console.log(req.query);
  let { values, isSeries } = req.query;
  values = JSON.parse(values);
  isSeries = "true" == isSeries.toLowerCase();

  if (values && isSeries) {
    res.json({
      equiv_capacitance: groupResistorsCapacitors(values, !isSeries),
    });
  } else {
    res.json("error");
  }
});

api.listen(process.env.PORT || 3001, () => console.log("E&M Calculator Backend running."));
