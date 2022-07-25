const urlBase = "http://localhost:3001";
const options = {
  method: "GET",
  cache: "no-cache",
};

/**
 * Resets fields in the Ohm's Law Calculator panel.
 */
function resetOhmsLaw() {
  $("#olVoltsInput").val("");
  $("#olOhmsInput").val("");
  $("#olAmpsInput").val("");
  $("#ohmsLawResult").val("");
}

/**
 * Executes the ohm's law data retrieval and fetching in a very unsanitary manner.
 * Only for study purposes.
 */
async function execOhmsLaw() {
  let qVolts = $("#olVoltsInput")[0].valueAsNumber;
  let qOhms = $("#olOhmsInput")[0].valueAsNumber;
  let qAmps = $("#olAmpsInput")[0].valueAsNumber;
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
  console.log(olResponse);
  let { volts, ohms, amps } = olResponse;

  if (volts) $("#ohmsLawResult").val(`${volts} Volts`);
  if (ohms) $("#ohmsLawResult").val(`${ohms} Ohms`);
  if (amps) $("#ohmsLawResult").val(`${amps} Amps`);
}
