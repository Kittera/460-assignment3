// regex to help with input validation for comma separated values
const csvArrRGX = /^[0-9]+(,[0-9]+)*$/;

//regex to help validate decimal numbers
const decNumRGX = /^\d*[0-9](|.\d*[0-9]|,\d*[0-9])?$/;

const urlBase = "http://localhost:3001";
const options = {
  method: "GET",
  cache: "no-cache",
};

/**
 * Resets fields in the Ohm's Law Calculator panel.
 */
const resetOhmsLawPanel = () => $("#ohmsLawCalculator input").val("");
/**
 * Resets fields in the Component Group Value Calculator panel.
 */
const resetGroupPanel = () => $("#componentGroupCalculator input").val("");
/**
 * Resets fields in the Capacitor Stored Energy Calculator panel.
 */
const resetEnergyPanel = () => $("#capacitorEnergyCalculator input").val("");
/**
 * Resets fields in the Capacitor Charging Behavior Calculator panel.
 */
const resetChargingPanel = () =>
  $("#capacitorChargingCalculator input").val("");

/**
 * Executes the ohm's law data retrieval and fetching in a very unsanitary manner.
 * Only for study purposes.
 */
async function execOhmsLaw() {
  // gather input data
  let qVolts = $("#olVoltsInput")[0].valueAsNumber;
  let qOhms = $("#olOhmsInput")[0].valueAsNumber;
  let qAmps = $("#olAmpsInput")[0].valueAsNumber;

  // setup and send api request
  let qString = new URL(`${urlBase}/assign3/api/ohmslaw/`);
  if (!qVolts) {
    qString.searchParams.append("ohms", qOhms);
    qString.searchParams.append("amps", qAmps);
  } else if (!qOhms) {
    qString.searchParams.append("volts", qVolts);
    qString.searchParams.append("amps", qAmps);
  } else if (!qAmps) {
    qString.searchParams.append("volts", qVolts);
    qString.searchParams.append("ohms", qOhms);
  }
  let olResponse = await (await fetch(qString, options)).json();
  let { volts, ohms, amps } = olResponse;

  // update DOM
  if (volts) $("#ohmsLawResult").val(`${volts} Volts`);
  if (ohms) $("#ohmsLawResult").val(`${ohms} Ohms`);
  if (amps) $("#ohmsLawResult").val(`${amps} Amps`);
}

/**
 * Calculates values for a group of electrical components grouped either in series or parallel.
 */
async function execComponentGroup(isSeries) {
  let qValues = $("#componentGroupValuesInput")[0].value.replace(/\s/g, "");
  let qString = new URL(`${urlBase}/assign3/api/componentgroups/`);
  qString.searchParams.append("values", qValues);
  qString.searchParams.append("isSeries", isSeries);

  let cgResponse = await (await fetch(qString, options)).json();
  let { equiv_value } = cgResponse;

  // update DOM
  if (equiv_value) {
    $("#componentGroupResult").val(
      `${isSeries ? "Series" : "Parallel"} Value: ${equiv_value.toFixed(3)}`
    );
  }
}

/**
 * Calculates the potential energy in a capacitor of a given value charged to a given voltage.
 */
async function execCapacitorEnergy() {
  let qFarads = $("#capEnergyFaradsInput")[0].valueAsNumber;
  let qVolts = $("#capEnergyVoltsInput")[0].valueAsNumber;

  console.log(qFarads, qVolts);

  let qString = new URL(`${urlBase}/assign3/api/capacitorenergy/`);
  qString.searchParams.append("capacitance", qFarads);
  qString.searchParams.append("chargeVoltage", qVolts);

  let ceResponse = await (await fetch(qString, options)).json();
  let { stored_energy } = ceResponse;

  // update DOM
  if (stored_energy) {
    $("#capEnergyResult").val(`${stored_energy} Joules`);
  }
}

/**
 * Calculates the charging curve for a given capacitor,
 * as well as a default and a user-requested point on that curve.
 */
async function execCapacitorCharging() {
  let qCapacitance = $("#capChargingFaradsInput")[0].valueAsNumber;
  let qVoltage = $("#capChargingVoltsInput")[0].valueAsNumber;
  let qResistance = $("#capChargingResistanceInput")[0].valueAsNumber;
  let qTimestamp = $("#capChargingTimeInput")[0].valueAsNumber;

  let qString = new URL(`${urlBase}/assign3/api/RC/`);
  qString.searchParams.append("capacitance", qCapacitance);
  qString.searchParams.append("seriesResistance", qResistance);
  qString.searchParams.append("isCharging", true);
  qString.searchParams.append("chargingVoltage", qVoltage);
  qString.searchParams.append("reqTime", qTimestamp);

  let ccResponse = await (await fetch(qString, options)).json();
  let {
    charge_after_req_time_volts,
    cap_mostly_charged_at_time,
    time_constant,
  } = ccResponse;

  // update DOM
  if (charge_after_req_time_volts) {
    $("#capChargingTimeConstantResult").val(`${time_constant} Seconds`);
    $("#capChargingReqTimeResult").val(
      `${charge_after_req_time_volts.toFixed(2)} Volts`
    );
    $("#capChargingNomTimeResult").val(`${cap_mostly_charged_at_time} Seconds`);
  }
}
