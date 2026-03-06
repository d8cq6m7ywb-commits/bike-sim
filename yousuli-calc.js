/* ──────────────────────────────────────────────────────────────────────
   Yousuli power zone definitions  (% of FTP, expressed as decimals)
   Each zone covers [min, max]. Gaps between zones are assigned to the
   closest lower zone by classifyZone().
   ────────────────────────────────────────────────────────────────────── */
const YOUSULI_ZONES = [
  { name: "Easy",        short: "Easy",    min: 0.40, max: 0.59, cls: "yz-easy"   },
  { name: "Zone 2",      short: "Z2",      min: 0.60, max: 0.74, cls: "yz-z2"     },
  { name: "Endurance",   short: "Endur.",  min: 0.75, max: 0.85, cls: "yz-endur"  },
  { name: "SST",         short: "SST",     min: 0.86, max: 0.95, cls: "yz-sst"    },
  { name: "Threshold",   short: "Thresh.", min: 0.96, max: 1.00, cls: "yz-thresh" },
  { name: "Supra",       short: "Supra",   min: 1.01, max: 1.04, cls: "yz-supra"  },
  { name: "VO2max",      short: "VO2max",  min: 1.05, max: 1.20, cls: "yz-vo2"    },
  { name: "Anaerobic",   short: "Anaer.",  min: 1.30, max: 1.50, cls: "yz-anaer"  },
  { name: "A-lactic",    short: "A-lac.",  min: 2.00, max: 4.00, cls: "yz-alact"  },
];

// Return zone index (into YOUSULI_ZONES) for a given %FTP value.
// Values below the lowest min → zone 0. Gaps → extend the lower zone.
// Returns -1 for coast (power = 0).
function classifyZone(pct) {
  if (pct <= 0) return -1; // coasting
  for (var z = YOUSULI_ZONES.length - 1; z >= 0; z--) {
    if (pct >= YOUSULI_ZONES[z].min) return z;
  }
  return 0; // below Easy minimum — still count as Easy
}

// Build the zone bar + legend HTML from an array of seconds per zone
// zoneSec: Float32Array or plain array of length YOUSULI_ZONES.length,
//          plus coastSec at index YOUSULI_ZONES.length.
function buildZoneBarHTML(zoneSec, coastSec, totalTimeSec) {
  var allSec = zoneSec.concat([coastSec]);
  var allCls = YOUSULI_ZONES.map(function(z) { return z.cls; }).concat(["yz-coast"]);
  var allShort = YOUSULI_ZONES.map(function(z) { return z.short; }).concat(["Coast"]);
  var allName  = YOUSULI_ZONES.map(function(z) { return z.name; }).concat(["Coasting (0 W)"]);

  var track = '';
  var legend = '';
  for (var i = 0; i < allSec.length; i++) {
    var pctT = totalTimeSec > 0 ? (allSec[i] / totalTimeSec) * 100 : 0;
    if (pctT < 0.5) continue;
    track += '<div class="zoneBar__seg ' + allCls[i] + '" style="width:' + pctT.toFixed(1) + '%">'
           + (pctT >= 5 ? pctT.toFixed(0) + "%" : "") + '</div>';
    legend += '<span><span class="dot ' + allCls[i] + '"></span>'
            + allName[i] + ': ' + pctT.toFixed(0) + '%</span>';
  }

  return '<div class="zoneBar__wrap">'
    + '<div class="zoneBar__label">Yousuli power zones — % of ride time</div>'
    + '<div class="zoneBar__track">' + track + '</div>'
    + '<div class="zoneBar__legend">' + legend + '</div>'
    + '</div>';
}

/* -------- input helpers & physics ---------- */

// Smooth elevation array with a moving average to reduce GPS noise
function smoothElevations(elev, halfWin) {
  return elev.map(function(_, i) {
    var lo = Math.max(0, i - halfWin);
    var hi = Math.min(elev.length - 1, i + halfWin);
    var sum = 0;
    for (var j = lo; j <= hi; j++) sum += elev[j];
    return sum / (hi - lo + 1);
  });
}

function changeTyreCondition() {
  document.getElementById("crr_rolling").value =
    document.getElementById("tyreCondition").value;
  calculateResult();
}
function changePosition() {
  document.getElementById("cdaAeroDynamicResistance").value =
    document.getElementById("position").value;
  calculateResult();
}
function changeUnit() {
  const u = document.getElementById("unit").value;
  document
    .querySelectorAll(".metric__row")
    .forEach(
      (el) => (el.style.display = u === "metric" ? "flex" : "none")
    );
  document
    .querySelectorAll(".imperial__row")
    .forEach(
      (el) => (el.style.display = u === "imperial" ? "flex" : "none")
    );
  const maxDescUnit = document.getElementById("max_descent_unit");
  if (maxDescUnit) {
    maxDescUnit.textContent = u === "metric" ? "km/h" : "mi/h";
  }
  calculateResult();
  if (typeof updateChartUnits === "function") {
    updateChartUnits(u);
  }
  if (typeof rebuildTechnicalChallenges === "function") {
    rebuildTechnicalChallenges();
  }
}
function convertWeight(inp, unit, id) {
  let v = parseFloat(inp.value) || 0,
    tgt = document.getElementById(id + "-" + unit);
  if (!tgt) return;
  tgt.value =
    unit === "kg"
      ? (v * 2.20462).toFixed(2)
      : (v / 2.20462).toFixed(2);
}
function convertDistance(inp, unit, id) {
  let v = parseFloat(inp.value) || 0,
    tgt = document.getElementById(id + "-" + unit);
  if (!tgt) return;
  tgt.value =
    unit === "km"
      ? (v / 1.60934).toFixed(2)
      : (v * 1.60934).toFixed(2);
}
function convertLength(inp, unit, id) {
  let v = parseFloat(inp.value) || 0,
    t = document.getElementById(id + "-" + unit);
  if (!t) return;
  t.value =
    unit === "m"
      ? (v * 3.28084).toFixed(2)
      : (v / 3.28084).toFixed(2);
}
function convertTemperature(inp, unit, id) {
  let v = parseFloat(inp.value) || 0,
    t = document.getElementById(id + "-" + unit);
  if (!t) return;
  t.value =
    unit === "c"
      ? (((v - 32) * 5) / 9).toFixed(2)
      : ((v * 9) / 5 + 32).toFixed(2);
}

function pressureAtAltitude(altMeters, pOverride_hPa) {
  if (pOverride_hPa && pOverride_hPa > 0)
    return pOverride_hPa * 100.0;
  const P0 = 101325.0,
    T0 = 288.15,
    g = 9.80665,
    L = 0.0065,
    R = 8.314462618,
    M = 0.0289644;
  const factor = 1 - (L * altMeters) / T0;
  return P0 * Math.pow(factor, (g * M) / (R * L));
}
function saturationVaporPressure_Pa(tempC) {
  return 610.78 * Math.exp((17.27 * tempC) / (tempC + 237.3));
}
function moistAirDensity(pressurePa, tempC, RHpercent) {
  const T = tempC + 273.15;
  const es = saturationVaporPressure_Pa(tempC);
  const e =
    Math.max(0, Math.min(pressurePa * 0.99, es)) *
    (Math.max(0, Math.min(100, RHpercent)) / 100);
  const pd = Math.max(1, pressurePa - e);
  const Rd = 287.05,
    Rv = 461.495;
  return pd / (Rd * T) + e / (Rv * T);
}

function formatTimeFromHours(timeH) {
  const totalSeconds = Math.max(0, timeH * 3600);
  let hh = Math.floor(totalSeconds / 3600);
  let mm = Math.floor((totalSeconds - hh * 3600) / 60);
  let ss = Math.round(totalSeconds - hh * 3600 - mm * 60);
  if (ss === 60) {
    ss = 0;
    mm += 1;
  }
  if (mm === 60) {
    mm = 0;
    hh += 1;
  }
  return (
    String(hh).padStart(2, "0") +
    ":" +
    String(mm).padStart(2, "0") +
    ":" +
    String(ss).padStart(2, "0")
  );
}

function updateCalcModeUI() {
  const mode = document.getElementById("calcMode").value;
  const rowPower = document.getElementById("row_target_power");
  const rowTime = document.getElementById("row_finish_time");
  const advWrap = document.getElementById("advancedWrapper");
  const stratRow = document.getElementById("finishTimeStrategyRow");
  const ftLabel = document.getElementById("finishTimePhysicsLabel");
  const avgWLbl = document.getElementById("avgWLabel");
  const speedLbl = document.getElementById("speedLabel");

  var stratOnlyIds = ["npRow", "viRow", "courseSplitRow"];

  if (mode === "power_to_time") {
    if (rowPower) rowPower.style.display = "flex";
    if (rowTime) rowTime.style.display = "flex";
    if (advWrap) advWrap.style.display = "none";
    if (stratRow) stratRow.style.display = "none";
    if (ftLabel) ftLabel.textContent = "Finish time (physics)";
    if (avgWLbl) avgWLbl.textContent = "Avg W (physics est. / input)";
    if (speedLbl) speedLbl.textContent = "Speed";
    stratOnlyIds.forEach(function(id) { var el = document.getElementById(id); if (el) el.style.display = "none"; });
  } else if (mode === "time_to_power") {
    if (rowPower) rowPower.style.display = "none";
    if (rowTime) rowTime.style.display = "flex";
    if (advWrap) advWrap.style.display = "none";
    if (stratRow) stratRow.style.display = "none";
    if (ftLabel) ftLabel.textContent = "Finish time (physics)";
    if (avgWLbl) avgWLbl.textContent = "Avg W (physics est. / input)";
    if (speedLbl) speedLbl.textContent = "Speed";
    stratOnlyIds.forEach(function(id) { var el = document.getElementById(id); if (el) el.style.display = "none"; });
  } else if (mode === "strategy_power") {
    if (rowPower) rowPower.style.display = "none";
    if (rowTime) rowTime.style.display = "none";
    if (advWrap) advWrap.style.display = "block";
    if (stratRow) stratRow.style.display = "flex";
    if (ftLabel) ftLabel.textContent = "Finish time (flat est.)";
    if (avgWLbl) avgWLbl.textContent = "Avg W (weighted, strategy)";
    if (speedLbl) speedLbl.textContent = "Avg speed (strategy)";
  }
}

function syncFtpFromAdvanced() {
  const advVal =
    parseFloat(
      document.getElementById("advanced_ftp").value || "0"
    ) || 0;
  const ftpField = document.getElementById("known_ftp");
  if (ftpField && advVal > 0) {
    ftpField.value = advVal;
  }
}
function syncAdvancedFromFtp() {
  const baseVal =
    parseFloat(
      document.getElementById("known_ftp").value || "0"
    ) || 0;
  const advField = document.getElementById("advanced_ftp");
  if (advField && baseVal > 0) {
    advField.value = baseVal;
  }
}

function segmentPowerForSpeed(
  v,
  grade,
  totalWeight,
  crr,
  cda,
  rho,
  wind,
  driveEff
) {
  const g = 9.80665;
  const sinTheta = grade / Math.sqrt(1 + grade * grade);
  const cosTheta = 1 / Math.sqrt(1 + grade * grade);
  const vAir = v + wind;
  const vAirAbs = Math.abs(vAir);
  const powerAero =
    0.5 * rho * cda * vAirAbs * vAirAbs * v;
  const powerRoll = g * totalWeight * crr * cosTheta * v;
  const powerClimb = g * totalWeight * sinTheta * v;
  const wheelPower = Math.max(
    0,
    powerAero + powerRoll + powerClimb
  );
  return wheelPower / Math.max(0.01, driveEff);
}

function solveSpeedForTargetPower(
  targetW,
  grade,
  totalWeight,
  crr,
  cda,
  rho,
  wind,
  driveEff
) {
  if (targetW <= 0) return 0;
  let vLow = 0.5;
  let vHigh = 25.0;
  for (let i = 0; i < 32; i++) {
    const vMid = 0.5 * (vLow + vHigh);
    const pMid = segmentPowerForSpeed(
      vMid,
      grade,
      totalWeight,
      crr,
      cda,
      rho,
      wind,
      driveEff
    );
    if (pMid > targetW) vHigh = vMid;
    else vLow = vMid;
  }
  return vLow;
}

// Compute the speed at which a rider coasts (0W) on a descent:
// gravity assist exactly equals drag + rolling resistance.
// Uses unclamped power to find the sign-change crossing.
function terminalVelocity(grade, totalWeight, crr, cda, rho, wind, driveEff) {
  var g = 9.80665;
  var sinTheta = grade / Math.sqrt(1 + grade * grade);
  var cosTheta = 1 / Math.sqrt(1 + grade * grade);
  function rawPower(v) {
    var vAir = v + wind;
    var vAirAbs = Math.abs(vAir);
    var pAero = 0.5 * rho * cda * vAirAbs * vAirAbs * v;
    var pRoll = g * totalWeight * crr * cosTheta * v;
    var pClimb = g * totalWeight * sinTheta * v; // negative on descent
    return pAero + pRoll + pClimb;
  }
  var vLow = 0.5, vHigh = 38.0; // 38 m/s = ~137 km/h ceiling
  if (rawPower(vLow) >= 0) return vLow;  // flat or climb, no coasting boost
  if (rawPower(vHigh) <= 0) return vHigh; // impossibly steep
  for (var i = 0; i < 40; i++) {
    var vMid = 0.5 * (vLow + vHigh);
    if (rawPower(vMid) < 0) vLow = vMid;
    else vHigh = vMid;
  }
  return 0.5 * (vLow + vHigh);
}

function rebuildAdvancedPacing() {
  const container = document.getElementById("advancedPacing");
  const mode = document.getElementById("calcMode").value;
  const strategyRow =
    document.getElementById("finishTimeStrategyRow");
  const strategyVal =
    document.getElementById("finishTimeStrategy");

  if (!container) return;

  if (mode !== "strategy_power") {
    container.innerHTML =
      '<p style="margin:0;font-size:14px;color:#555;">Select “Power strategy (advanced)” to see per-segment pacing.</p>';
    if (strategyRow) strategyRow.style.display = "none";
    if (strategyVal) strategyVal.textContent = "—";
    return;
  }

  const profile = window.currentRouteProfile;
  if (
    !profile ||
    !profile.distances ||
    profile.distances.length < 2
  ) {
    container.innerHTML =
      '<p style="margin:0;font-size:14px;color:#555;">Advanced pacing needs a selected course with elevation data.</p>';
    if (strategyRow) strategyRow.style.display = "flex";
    if (strategyVal) strategyVal.textContent = "—";
    return;
  }

  const dist = profile.distances;
  const elev = profile.elevations;
  const totalDistKm = dist[dist.length - 1];

  const unit = document.getElementById("unit").value;
  let wind =
    unit === "metric"
      ? parseFloat(
          document.getElementById("wind-metric").value || "0"
        )
      : parseFloat(
          document.getElementById("wind-imperial").value || "0"
        );
  wind = unit === "metric" ? wind / 3.6 : wind * 0.44704;

  const tempC =
    parseFloat(
      document.getElementById("temperature-c").value || "0"
    ) || 0;
  const alt =
    parseFloat(
      document.getElementById("altitude").value || "0"
    ) || 0;
  const RH =
    parseFloat(
      document.getElementById("relHumidity").value || "0"
    ) || 0;
  const pOverride_hPa =
    parseFloat(
      document.getElementById("pressure-hpa").value || "0"
    ) || 0;

  const pressurePa = pressureAtAltitude(alt, pOverride_hPa);
  const rho = moistAirDensity(pressurePa, tempC, RH);

  const rw =
    parseFloat(
      document.getElementById("rider-weight-kg").value || "0"
    ) || 0;
  const cg =
    parseFloat(
      document.getElementById("clothes-gear-kg").value || "0"
    ) || 0;
  const bw =
    parseFloat(
      document.getElementById("bike-weight-kg").value || "0"
    ) || 0;
  const totalWeight = rw + cg + bw;

  const cda =
    parseFloat(
      document.getElementById("cdaAeroDynamicResistance")
        .value || "0.18"
    ) || 0.18;
  const crr =
    parseFloat(
      document.getElementById("crr_rolling").value || "0.0035"
    ) || 0.0035;
  const driveEff =
    (parseFloat(
      document.getElementById("driveTrainEfficiency").value ||
        "98"
    ) || 98) / 100;

  const ftpAdv =
    parseFloat(
      document.getElementById("advanced_ftp").value ||
        document.getElementById("known_ftp").value ||
        "0"
    ) || 0;

  const flatP =
    parseFloat(
      document.getElementById("flat_power").value || "0"
    ) || 0;
  const climb1P =
    parseFloat(
      document.getElementById("climb1_power").value || "0"
    ) || 0;
  const climb3P =
    parseFloat(
      document.getElementById("climb3_power").value || "0"
    ) || 0;
  const climb10P =
    parseFloat(
      document.getElementById("climb10_power").value || "0"
    ) || 0;

  if (flatP <= 0) {
    container.innerHTML =
      '<p style="margin:0;font-size:14px;color:#555;">Set at least a flat power in the advanced box above.</p>';
    if (strategyRow) strategyRow.style.display = "flex";
    if (strategyVal) strategyVal.textContent = "—";
    return;
  }

  const descentP =
    parseFloat(
      document.getElementById("descent_power").value || "0"
    ) || 0;

  let maxDesc =
    parseFloat(
      document.getElementById("max_descent_speed").value || "0"
    ) || 0;
  let maxDesc_mps = Infinity;
  if (maxDesc > 0) {
    maxDesc_mps =
      unit === "metric"
        ? maxDesc / 3.6
        : maxDesc * 0.44704;
  }

  const targetSegLenKm = totalDistKm >= 120 ? 5 : 3;
  const steepGrade = 0.08;
  const minSteepLenKm = 0.7;
  const segments = [];
  let segStartIdx = 0;
  let segStartDist = dist[0];

  for (let i = 1; i < dist.length; i++) {
    const dKmFromSegStart = dist[i] - segStartDist;
    const stepKm = dist[i] - dist[i - 1];
    const stepM = stepKm * 1000;
    const stepElev = elev[i] - elev[i - 1];
    const stepGrade = stepM > 0 ? stepElev / stepM : 0;
    const isSteep =
      Math.abs(stepGrade) >= steepGrade &&
      stepKm >= minSteepLenKm;
    const longEnough =
      dKmFromSegStart >= targetSegLenKm && i > segStartIdx + 1;

    if (isSteep) {
      if (i - 1 > segStartIdx) {
        segments.push({ start: segStartIdx, end: i - 1 });
      }
      segments.push({ start: i - 1, end: i });
      segStartIdx = i;
      segStartDist = dist[i];
    } else if (longEnough) {
      segments.push({ start: segStartIdx, end: i });
      segStartIdx = i;
      segStartDist = dist[i];
    }
  }
  if (segStartIdx < dist.length - 1) {
    segments.push({ start: segStartIdx, end: dist.length - 1 });
  }

  let totalTimeSec = 0;
  const rows = [];

  for (let idx = 0; idx < segments.length; idx++) {
    const s = segments[idx];
    const dStart = dist[s.start];
    const dEnd = dist[s.end];
    const lenKm = Math.max(0.001, dEnd - dStart);
    const lenM = lenKm * 1000;

    const eStart = elev[s.start];
    const eEnd = elev[s.end];
    const grade = lenM > 0 ? (eEnd - eStart) / lenM : 0;

    let kind = "Flat/rolling";
    if (grade >= 0.01) kind = "Climb";
    else if (grade <= -0.01) kind = "Descent";

    let targetW = flatP;
    let v;

    if (kind === "Descent") {
      if (descentP <= 0) {
        // Coast: rider outputs 0W, accelerates to terminal velocity
        targetW = 0;
        v = terminalVelocity(grade, totalWeight, crr, cda, rho, wind, driveEff);
      } else {
        targetW = descentP;
        v = solveSpeedForTargetPower(descentP, grade, totalWeight, crr, cda, rho, wind, driveEff);
      }
      if (v > maxDesc_mps) v = maxDesc_mps;
    } else if (kind === "Climb") {
      const approxP = climb10P > 0 ? climb10P : flatP;
      let vApprox = solveSpeedForTargetPower(
        approxP, grade, totalWeight, crr, cda, rho, wind, driveEff
      );
      if (vApprox <= 0) vApprox = 5;
      const approxTimeSec = lenM / vApprox;
      if (approxTimeSec <= 60 && climb1P > 0) {
        targetW = climb1P;
      } else if (approxTimeSec <= 180 && climb3P > 0) {
        targetW = climb3P;
      } else if (climb10P > 0) {
        targetW = climb10P;
      } else {
        targetW = flatP;
      }
      v = solveSpeedForTargetPower(targetW, grade, totalWeight, crr, cda, rho, wind, driveEff);
    } else {
      v = solveSpeedForTargetPower(targetW, grade, totalWeight, crr, cda, rho, wind, driveEff);
    }

    if (!v || v <= 0) continue;

    const segTimeSec = lenM / v;
    totalTimeSec += segTimeSec;

    const speedKmh = v * 3.6;
    const speedDisplay =
      unit === "metric"
        ? speedKmh
        : speedKmh / 1.60934;
    const lenDisplay =
      unit === "metric"
        ? lenKm
        : lenKm / 1.60934;
    const startDisplay =
      unit === "metric"
        ? dStart
        : dStart / 1.60934;
    const endDisplay =
      unit === "metric" ? dEnd : dEnd / 1.60934;

    const gradePct = grade * 100;

    function fmtTime(sec) {
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec - h * 3600) / 60);
      const s2 = Math.round(sec - h * 3600 - m * 60);
      const parts = [];
      if (h > 0) parts.push(String(h).padStart(2, "0"));
      parts.push(String(m).padStart(2, "0"));
      parts.push(String(s2).padStart(2, "0"));
      return parts.join(":");
    }

    const elevGainM = eEnd - eStart;
    const vam = (kind === "Climb" && segTimeSec > 0)
      ? Math.round(elevGainM / (segTimeSec / 3600))
      : null;

    rows.push({
      from: startDisplay,
      to: endDisplay,
      len: lenDisplay,
      kind,
      grade: gradePct,
      power: targetW,
      speed: speedDisplay,
      time: segTimeSec,
      timeStr: fmtTime(segTimeSec),
      vam,
    });
  }

  if (!rows.length) {
    container.innerHTML =
      '<p style="margin:0;font-size:14px;color:#555;">Route profile too short to build pacing segments.</p>';
    if (strategyRow) strategyRow.style.display = "flex";
    if (strategyVal) strategyVal.textContent = "—";
    return;
  }

  const unitDistLabel = unit === "metric" ? "km" : "mi";
  const unitSpeedLabel = unit === "metric" ? "km/h" : "mi/h";

  let html =
    '<table class="advTable"><thead><tr>' +
    "<th>#</th><th>From (" +
    unitDistLabel +
    ")</th><th>To (" +
    unitDistLabel +
    ")</th>" +
    "<th>Len (" +
    unitDistLabel +
    ')</th><th>Type</th><th>Grade (%)</th>' +
    "<th>Power (W)</th><th>Speed (" +
    unitSpeedLabel +
    ")</th><th>Time</th><th>VAM</th></tr></thead><tbody>";

  rows.forEach((r, i) => {
    html +=
      "<tr>" +
      "<td>" +
      (i + 1) +
      "</td>" +
      "<td>" +
      r.from.toFixed(1) +
      "</td>" +
      "<td>" +
      r.to.toFixed(1) +
      "</td>" +
      "<td>" +
      r.len.toFixed(1) +
      "</td>" +
      "<td>" +
      r.kind +
      "</td>" +
      "<td>" +
      r.grade.toFixed(1) +
      "</td>" +
      "<td>" +
      r.power.toFixed(0) +
      "</td>" +
      "<td>" +
      r.speed.toFixed(1) +
      "</td>" +
      "<td>" +
      r.timeStr +
      "</td>" +
      "<td>" +
      (r.vam !== null ? r.vam + " m/h" : "—") +
      "</td>" +
      "</tr>";
  });

  function fmtTotal(sec) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec - h * 3600) / 60);
    const s2 = Math.round(sec - h * 3600 - m * 60);
    return (
      String(h).padStart(2, "0") +
      ":" +
      String(m).padStart(2, "0") +
      ":" +
      String(s2).padStart(2, "0")
    );
  }

  // ── Core metrics from segment data ──────────────────────────
  const stratAvgW = rows.reduce(function(s, r) { return s + r.power * r.time; }, 0) / Math.max(1, totalTimeSec);
  const stratAvgSpeedKmh = totalDistKm / Math.max(0.0001, totalTimeSec / 3600);
  const stratAvgSpeedDisplay = unit === "metric" ? stratAvgSpeedKmh : stratAvgSpeedKmh / 1.60934;

  // Normalized Power (approximated from segment blocks, 4th-power weighted)
  const np4avg = rows.reduce(function(s, r) { return s + Math.pow(r.power, 4) * r.time; }, 0) / Math.max(1, totalTimeSec);
  const NP = Math.pow(Math.max(0, np4avg), 0.25);
  const VI = stratAvgW > 0 ? NP / stratAvgW : 1;

  // Total mechanical energy (kJ) — descents at 0W contribute 0
  const totalEnergyKJ = rows.reduce(function(s, r) { return s + r.power * r.time; }, 0) / 1000;

  // Course split (in display units)
  var climbLen = 0, descentLen = 0, flatLen = 0;
  rows.forEach(function(r) {
    if (r.kind === "Climb") climbLen += r.len;
    else if (r.kind === "Descent") descentLen += r.len;
    else flatLen += r.len;
  });

  // Power zones (time in seconds per Yousuli zone)
  const ftpStrat = Math.max(1, parseFloat(document.getElementById("known_ftp").value || "1") || 1);
  var zoneSec = YOUSULI_ZONES.map(function() { return 0; });
  var coastSec = 0;
  rows.forEach(function(r) {
    var zi = classifyZone(r.power / ftpStrat);
    if (zi < 0) coastSec += r.time;
    else zoneSec[zi] += r.time;
  });
  var zoneHtml = buildZoneBarHTML(zoneSec, coastSec, totalTimeSec);

  // ── Assemble final HTML ──────────────────────────────────────
  html += "</tbody></table>";
  html += '<p class="advSummaryLine">Total time: <strong>' + fmtTotal(totalTimeSec) +
    "</strong> &nbsp;&middot;&nbsp; Avg speed: <strong>" + stratAvgSpeedDisplay.toFixed(2) + " " + unitSpeedLabel +
    "</strong> &nbsp;&middot;&nbsp; Avg W: <strong>" + stratAvgW.toFixed(0) +
    " W</strong> &nbsp;&middot;&nbsp; NP: <strong>" + NP.toFixed(0) +
    " W</strong> &nbsp;&middot;&nbsp; VI: <strong>" + VI.toFixed(2) + "</strong></p>";
  html += zoneHtml;

  container.innerHTML = html;

  if (strategyRow) strategyRow.style.display = "flex";
  if (strategyVal) strategyVal.textContent = fmtTotal(totalTimeSec);

  // ── Override main results panel with strategy-accurate values ──
  var speedEl = document.getElementById("speed");
  if (speedEl) speedEl.textContent = stratAvgSpeedDisplay.toFixed(2) + (unit === "metric" ? " km/h" : " mi/h");

  var avgWEl = document.getElementById("avg_w");
  if (avgWEl) avgWEl.textContent = stratAvgW.toFixed(1) + " W";

  var rwStrat = parseFloat(document.getElementById("rider-weight-kg").value || "0") || 0;
  var avgWkgEl = document.getElementById("avg_w_kg");
  if (avgWkgEl) avgWkgEl.textContent = (rwStrat > 0 ? (stratAvgW / rwStrat) : 0).toFixed(2) + " W/kg";

  var IFstrat = stratAvgW / ftpStrat;
  var timeHstrat = totalTimeSec / 3600;
  var TSSstrat = timeHstrat * IFstrat * IFstrat * 100;
  var fitnessStrat = Math.max(1, parseFloat(document.getElementById("fitnessValue").value || "1") || 1);
  var ratioStrat = TSSstrat / fitnessStrat;
  var descStrat = "Easy workout";
  if (ratioStrat > 2.01) descStrat = "Extreme workout";
  else if (ratioStrat > 1.5) descStrat = "Hard workout";
  else if (ratioStrat > 1.25) descStrat = "Moderately hard workout";
  else if (ratioStrat > 0.75) descStrat = "Average workout";

  var intEl = document.getElementById("intensity");
  if (intEl) intEl.textContent = IFstrat.toFixed(2) + " IF";
  var tssEl = document.getElementById("stressScore");
  if (tssEl) tssEl.textContent = TSSstrat.toFixed(2);
  var descEl2 = document.getElementById("workoutDesc");
  if (descEl2) descEl2.textContent = descStrat;

  // New metrics
  var eKJ = document.getElementById("energyKJ");
  if (eKJ) eKJ.textContent = totalEnergyKJ.toFixed(0) + " kJ";

  var npEl = document.getElementById("normalizedPower");
  if (npEl) npEl.textContent = NP.toFixed(0) + " W";
  var viEl = document.getElementById("variabilityIndex");
  if (viEl) viEl.textContent = VI.toFixed(3);

  var distLabel = unit === "metric" ? " km" : " mi";
  var csEl = document.getElementById("courseSplit");
  if (csEl) csEl.textContent =
    "↑ " + climbLen.toFixed(1) + distLabel +
    " · → " + flatLen.toFixed(1) + distLabel +
    " · ↓ " + descentLen.toFixed(1) + distLabel;

  // Show strategy-only rows
  ["npRow","viRow","courseSplitRow"].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = "flex";
  });
}

/* --- Technical challenges --- */

function bearingDeg(lat1, lon1, lat2, lon2) {
  const toRad = (x) => (x * Math.PI) / 180;
  const toDeg = (x) => (x * 180) / Math.PI;
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δλ = toRad(lon2 - lon1);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  let θ = Math.atan2(y, x);
  θ = toDeg(θ);
  return (θ + 360) % 360;
}

function rebuildTechnicalChallenges() {
  const container = document.getElementById("techChallenges");
  if (!container) return;

  const profile = window.currentRouteProfile;
  if (
    !profile ||
    !profile.distances ||
    !profile.elevations ||
    !profile.latlngs
  ) {
    container.innerHTML =
      '<p style="margin:0;font-size:13px;color:#92400e;">Select a route above to list climbs ≥ 3%, descents ≤ −3%, and sharp turns (&gt; 80°).</p>';
    return;
  }

  const dist = profile.distances;
  const elev = profile.elevations;
  const latlngs = profile.latlngs;
  const n = Math.min(
    dist.length,
    elev.length,
    latlngs.length
  );
  if (n < 3) {
    container.innerHTML =
      '<p style="margin:0;font-size:13px;color:#92400e;">Route profile is too short to extract technical challenges.</p>';
    return;
  }

  const unit = document.getElementById("unit").value;
  const distFactor = unit === "metric" ? 1 : 1 / 1.60934;
  const distLabel = unit === "metric" ? "km" : "mi";

  const gradeThreshold = 0.03;

  const climbSegments = [];
  const descSegments = [];

  let currentType = null;
  let segStartIdx = 0;

  for (let i = 1; i < n; i++) {
    const stepKm = dist[i] - dist[i - 1];
    const stepM = stepKm * 1000;
    if (stepM <= 0) continue;
    const dElev = elev[i] - elev[i - 1];
    const g = dElev / stepM;

    let type = null;
    if (g >= gradeThreshold) type = "climb";
    else if (g <= -gradeThreshold) type = "descent";

    if (type === currentType) {
      continue;
    } else {
      if (currentType && i - 1 > segStartIdx) {
        const startIdx = segStartIdx;
        const endIdx = i - 1;
        const dStartKm = dist[startIdx];
        const dEndKm = dist[endIdx];
        const lenKm = Math.max(0, dEndKm - dStartKm);
        const dElevSeg = elev[endIdx] - elev[startIdx];
        const avgGrade =
          lenKm > 0 ? dElevSeg / (lenKm * 1000) : 0;
        const segObj = {
          startIdx,
          endIdx,
          startKm: dStartKm,
          endKm: dEndKm,
          lenKm,
          avgGrade,
        };
        if (currentType === "climb") climbSegments.push(segObj);
        else if (currentType === "descent")
          descSegments.push(segObj);
      }
      if (type) {
        segStartIdx = i - 1;
        currentType = type;
      } else {
        currentType = null;
      }
    }
  }
  if (currentType && segStartIdx < n - 1) {
    const startIdx = segStartIdx;
    const endIdx = n - 1;
    const dStartKm = dist[startIdx];
    const dEndKm = dist[endIdx];
    const lenKm = Math.max(0, dEndKm - dStartKm);
    const dElevSeg = elev[endIdx] - elev[startIdx];
    const avgGrade =
      lenKm > 0 ? dElevSeg / (lenKm * 1000) : 0;
    const segObj = {
      startIdx,
      endIdx,
      startKm: dStartKm,
      endKm: dEndKm,
      lenKm,
      avgGrade,
    };
    if (currentType === "climb") climbSegments.push(segObj);
    else if (currentType === "descent") descSegments.push(segObj);
  }

  const sharpTurns = [];
  const angleThresh = 80;

  for (let i = 1; i < n - 1; i++) {
    const [lat0, lon0] = latlngs[i - 1];
    const [lat1, lon1] = latlngs[i];
    const [lat2, lon2] = latlngs[i + 1];
    const b1 = bearingDeg(lat0, lon0, lat1, lon1);
    const b2 = bearingDeg(lat1, lon1, lat2, lon2);
    let delta = Math.abs(b2 - b1);
    if (delta > 180) delta = 360 - delta;
    if (delta > angleThresh) {
      sharpTurns.push({
        idx: i,
        km: dist[i],
        angle: delta,
      });
    }
  }

  if (
    !climbSegments.length &&
    !descSegments.length &&
    !sharpTurns.length
  ) {
    container.innerHTML =
      '<p style="margin:0;font-size:13px;color:#92400e;">No climbs ≥ 3%, descents ≤ −3%, or turns &gt; 80° found on this route.</p>';
    return;
  }

  let html = "";

  if (climbSegments.length) {
    html += "<h4>Climbs ≥ 3% grade</h4>";
    html +=
      '<table class="techTable"><thead><tr>' +
      "<th>#</th><th>From (" +
      distLabel +
      ")</th><th>To (" +
      distLabel +
      ")</th><th>Distance (" +
      distLabel +
      ")</th><th>Avg grade (%)</th>" +
      "</tr></thead><tbody>";
    climbSegments.forEach((s, idx) => {
      const from = s.startKm * distFactor;
      const to = s.endKm * distFactor;
      const len = s.lenKm * distFactor;
      const avgGradePct = s.avgGrade * 100;
      html +=
        "<tr>" +
        "<td>" +
        (idx + 1) +
        "</td>" +
        "<td>" +
        from.toFixed(2) +
        "</td>" +
        "<td>" +
        to.toFixed(2) +
        "</td>" +
        "<td>" +
        len.toFixed(2) +
        "</td>" +
        "<td>" +
        avgGradePct.toFixed(1) +
        "</td>" +
        "</tr>";
    });
    html += "</tbody></table>";
  }

  if (descSegments.length) {
    html += "<h4>Descents ≤ −3% grade</h4>";
    html +=
      '<table class="techTable"><thead><tr>' +
      "<th>#</th><th>From (" +
      distLabel +
      ")</th><th>To (" +
      distLabel +
      ")</th><th>Distance (" +
      distLabel +
      ")</th><th>Avg grade (%)</th>" +
      "</tr></thead><tbody>";
    descSegments.forEach((s, idx) => {
      const from = s.startKm * distFactor;
      const to = s.endKm * distFactor;
      const len = s.lenKm * distFactor;
      const avgGradePct = s.avgGrade * 100;
      html +=
        "<tr>" +
        "<td>" +
        (idx + 1) +
        "</td>" +
        "<td>" +
        from.toFixed(2) +
        "</td>" +
        "<td>" +
        to.toFixed(2) +
        "</td>" +
        "<td>" +
        len.toFixed(2) +
        "</td>" +
        "<td>" +
        avgGradePct.toFixed(1) +
        "</td>" +
        "</tr>";
    });
    html += "</tbody></table>";
  }

  if (sharpTurns.length) {
    html += "<h4>Sharp turns (&gt; 80°)</h4>";
    html +=
      '<table class="techTable"><thead><tr>' +
      "<th>#</th><th>At (" +
      distLabel +
      ")</th><th>Turn angle (°)</th>" +
      "</tr></thead><tbody>";
    sharpTurns.forEach((t, idx) => {
      const d = t.km * distFactor;
      html +=
        "<tr>" +
        "<td>" +
        (idx + 1) +
        "</td>" +
        "<td>" +
        d.toFixed(2) +
        "</td>" +
        "<td>" +
        t.angle.toFixed(1) +
        "</td>" +
        "</tr>";
    });
    html += "</tbody></table>";
  }

  container.innerHTML = html;
}

/* ------------- main physics result --------------- */

function calculateResult() {
  const rw =
    parseFloat(
      document.getElementById("rider-weight-kg").value || 0
    ) || 0;
  const cg =
    parseFloat(
      document.getElementById("clothes-gear-kg").value || 0
    ) || 0;
  const bw =
    parseFloat(
      document.getElementById("bike-weight-kg").value || 0
    ) || 0;
  const totalWeight = rw + cg + bw;

  const distKm =
    parseFloat(
      document.getElementById("distance-km").value || 0
    ) || 0;
  const climbM =
    parseFloat(
      document.getElementById("total-climb-m").value || 0
    ) || 0;

  const unit = document.getElementById("unit").value;
  let wind =
    unit === "metric"
      ? parseFloat(
          document.getElementById("wind-metric").value || 0
        )
      : parseFloat(
          document.getElementById("wind-imperial").value || 0
        );
  wind = unit === "metric" ? wind / 3.6 : wind * 0.44704;
  const tempC =
    parseFloat(
      document.getElementById("temperature-c").value || 0
    ) || 0;
  const alt =
    parseFloat(
      document.getElementById("altitude").value || 0
    ) || 0;
  const RH =
    parseFloat(
      document.getElementById("relHumidity").value || 0
    ) || 0;
  const pOverride_hPa =
    parseFloat(
      document.getElementById("pressure-hpa").value || 0
    ) || 0;

  const pressurePa = pressureAtAltitude(alt, pOverride_hPa);
  const rho = moistAirDensity(pressurePa, tempC, RH);

  const cda =
    parseFloat(
      document.getElementById("cdaAeroDynamicResistance")
        .value
    ) || 0.18;
  const crr =
    parseFloat(
      document.getElementById("crr_rolling").value
    ) || 0.0035;
  const g = 9.80665;
  const driveEff =
    (parseFloat(
      document.getElementById("driveTrainEfficiency").value
    ) || 98) / 100;

  const grade =
    distKm > 0 ? climbM / (distKm * 1000) : 0;
  const sinTheta = grade / Math.sqrt(1 + grade * grade);
  const cosTheta = 1 / Math.sqrt(1 + grade * grade);

  function powerForSpeed(v) {
    const vAir = v + wind;
    const vAirAbs = Math.abs(vAir);
    const powerAero =
      0.5 * rho * cda * vAirAbs * vAirAbs * v;
    const powerRoll =
      g * totalWeight * crr * cosTheta * v;
    const powerClimb =
      g * totalWeight * sinTheta * v;
    const wheelPower = Math.max(
      0,
      powerAero + powerRoll + powerClimb
    );
    return wheelPower / Math.max(0.01, driveEff);
  }

  const calcMode = document.getElementById("calcMode").value;
  let avgW = 0;
  let v = 0;
  let timeH = 1 / 3600;

  if (calcMode === "power_to_time") {
    const targetP =
      parseFloat(
        document.getElementById("target_power").value || 0
      ) || 0;
    if (targetP > 0) {
      let vLow = 0.1;
      let vHigh = 30.0;

      for (let i = 0; i < 40; i++) {
        const vMid = 0.5 * (vLow + vHigh);
        const pMid = powerForSpeed(vMid);
        if (pMid > targetP) {
          vHigh = vMid;
        } else {
          vLow = vMid;
        }
      }
      v = 0.5 * (vLow + vHigh);

      const speedKmH = v * 3.6;
      timeH = distKm / Math.max(speedKmH, 0.1);
      avgW = targetP;

      const totalSeconds = timeH * 3600;
      let hh = Math.floor(totalSeconds / 3600);
      let mm = Math.floor(
        (totalSeconds - hh * 3600) / 60
      );
      let ss = Math.round(
        totalSeconds - hh * 3600 - mm * 60
      );
      if (ss === 60) {
        ss = 0;
        mm += 1;
      }
      if (mm === 60) {
        mm = 0;
        hh += 1;
      }

      const hhEl = document.getElementById("hh");
      const mmEl = document.getElementById("mm");
      const ssEl = document.getElementById("ss");
      if (hhEl)
        hhEl.value = String(hh).padStart(2, "0");
      if (mmEl)
        mmEl.value = String(mm).padStart(2, "0");
      if (ssEl)
        ssEl.value = String(ss).padStart(2, "0");
    } else {
      const hh =
        parseFloat(
          document.getElementById("hh").value || 0
        ) || 0;
      const mm =
        parseFloat(
          document.getElementById("mm").value || 0
        ) || 0;
      const ss =
        parseFloat(
          document.getElementById("ss").value || 0
        ) || 0;
      timeH = (hh + mm / 60 + ss / 3600) || 1 / 3600;
      const speedKmH = distKm / timeH;
      v = (speedKmH * 1000) / 3600;
      avgW = powerForSpeed(v);
    }
  } else if (calcMode === "time_to_power") {
    const hh =
      parseFloat(
        document.getElementById("hh").value || 0
      ) || 0;
    const mm =
      parseFloat(
        document.getElementById("mm").value || 0
      ) || 0;
    const ss =
      parseFloat(
        document.getElementById("ss").value || 0
      ) || 0;
    timeH = (hh + mm / 60 + ss / 3600) || 1 / 3600;
    const speedKmH = distKm / timeH;
    v = (speedKmH * 1000) / 3600;
    avgW = powerForSpeed(v);
  } else if (calcMode === "strategy_power") {
    const flatP =
      parseFloat(
        document.getElementById("flat_power").value || 0
      ) || 0;
    if (flatP > 0) {
      let vLow = 0.1;
      let vHigh = 30.0;
      for (let i = 0; i < 40; i++) {
        const vMid = 0.5 * (vLow + vHigh);
        const pMid = powerForSpeed(vMid);
        if (pMid > flatP) {
          vHigh = vMid;
        } else {
          vLow = vMid;
        }
      }
      v = 0.5 * (vLow + vHigh);
      const speedKmH = v * 3.6;
      timeH = distKm / Math.max(speedKmH, 0.1);
      avgW = flatP;
    } else {
      const hh =
        parseFloat(
          document.getElementById("hh").value || 0
        ) || 0;
      const mm =
        parseFloat(
          document.getElementById("mm").value || 0
        ) || 0;
      const ss =
        parseFloat(
          document.getElementById("ss").value || 0
        ) || 0;
      timeH = (hh + mm / 60 + ss / 3600) || 1 / 3600;
      const speedKmH = distKm / timeH;
      v = (speedKmH * 1000) / 3600;
      avgW = powerForSpeed(v);
    }
  }

  const speedKmH = v * 3.6;
  const avgWkg = rw ? avgW / rw : 0;

  const ftp =
    Math.max(
      1,
      parseFloat(
        document.getElementById("known_ftp").value || 1
      ) || 1
    );
  const IF = avgW / ftp;
  const TSS = timeH * IF * IF * 100;

  let desc = "Easy workout";
  const fitness =
    Math.max(
      1,
      parseFloat(
        document.getElementById("fitnessValue").value || 1
      ) || 1
    );
  const ratio = TSS / fitness;
  if (ratio > 2.01) desc = "Extreme workout";
  else if (ratio > 1.5) desc = "Hard workout";
  else if (ratio > 1.25) desc = "Moderately hard workout";
  else if (ratio > 0.75) desc = "Average workout";

  document.getElementById("intensity").textContent =
    IF.toFixed(2) + " IF";
  document.getElementById("stressScore").textContent =
    TSS.toFixed(2);
  document.getElementById("workoutDesc").textContent = desc;
  document.getElementById("avg_w").textContent =
    avgW.toFixed(1) + " W";
  document.getElementById("avg_w_kg").textContent =
    avgWkg.toFixed(2) + " W/kg";
  document.getElementById("speed").textContent =
    speedKmH.toFixed(2) +
    (unit === "metric" ? " km/h" : " mi/h");
  document.getElementById("slopeGrade").textContent =
    (grade * 100).toFixed(4) + " %";
  document.getElementById("rhoUsed").textContent =
    rho.toFixed(4) + " kg/m³";
  document.getElementById("pressureUsed").textContent =
    (pressurePa / 100).toFixed(1) + " hPa";
  document.getElementById("finishTimePhysics").textContent =
    formatTimeFromHours(timeH);

  const eKJSimple = document.getElementById("energyKJ");
  if (eKJSimple) eKJSimple.textContent = (avgW * timeH * 3600 / 1000).toFixed(0) + " kJ";

  rebuildAdvancedPacing();
}

/* ---------------- Map + Chart ---------------- */

const map = L.map("map").setView([0, 0], 2);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

let polyline = null;

const elevCtx =
  document.getElementById("elevChart").getContext("2d");
const elevChart = new Chart(elevCtx, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        data: [],
        fill: false,
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.2,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: "Distance (km)",
        },
        ticks: {
          maxTicksLimit: 10,
          callback: (val) => {
            const num =
              typeof val === "number"
                ? val
                : parseFloat(val);
            if (!isFinite(num)) return val;
            return num.toFixed(1);
          },
        },
      },
      y: {
        title: {
          display: true,
          text: "Elevation (m)",
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          title: (items) => {
            if (!items.length) return "";
            const raw = items[0].label;
            const num =
              typeof raw === "number"
                ? raw
                : parseFloat(raw);
            if (!isFinite(num)) return "";
            return "km " + num.toFixed(2);
          },
          label: (item) =>
            "Elevation: " + item.parsed.y + " m",
        },
      },
    },
  },
});

function updateChartUnits(units) {
  if (!window.currentRouteProfile) return;

  const isImperial = units === "imperial";
  const dist = window.currentRouteProfile.distances || [];
  const elev = window.currentRouteProfile.elevations || [];

  const distDisplay = isImperial
    ? dist.map((d) => d / 1.60934)
    : dist.slice();

  const elevDisplay = isImperial
    ? elev.map((e) => e * 3.28084)
    : elev.slice();

  let yminRaw;
  let ymaxRaw;
  if (
    typeof window.currentRouteProfile.elev_min === "number" &&
    typeof window.currentRouteProfile.elev_max === "number"
  ) {
    const pad = 10;
    yminRaw = window.currentRouteProfile.elev_min - pad;
    ymaxRaw = window.currentRouteProfile.elev_max + pad;
  } else if (elev.length) {
    const pad = 10;
    let minE = elev[0],
      maxE = elev[0];
    for (let i = 1; i < elev.length; i++) {
      if (elev[i] < minE) minE = elev[i];
      if (elev[i] > maxE) maxE = elev[i];
    }
    yminRaw = minE - pad;
    ymaxRaw = maxE + pad;
  } else {
    yminRaw = 0;
    ymaxRaw = 1;
  }

  const yminDisplay = isImperial ? yminRaw * 3.28084 : yminRaw;
  const ymaxDisplay = isImperial ? ymaxRaw * 3.28084 : ymaxRaw;

  elevChart.data.labels = distDisplay;
  elevChart.data.datasets[0].data = elevDisplay;

  elevChart.options.scales.x.title.text = isImperial
    ? "Distance (mi)"
    : "Distance (km)";
  elevChart.options.scales.y.title.text = isImperial
    ? "Elevation (ft)"
    : "Elevation (m)";
  elevChart.options.scales.y.min = yminDisplay;
  elevChart.options.scales.y.max = ymaxDisplay;

  elevChart.options.plugins.tooltip.callbacks.title = (items) => {
    if (!items.length) return "";
    const label = items[0].label;
    const val =
      (typeof label === "number"
        ? label
        : parseFloat(label)) || 0;
    return (isImperial ? "mi " : "km ") + val.toFixed(2);
  };

  elevChart.options.plugins.tooltip.callbacks.label = (item) => {
    const y = item.parsed.y || 0;
    return (
      "Elevation: " +
      y.toFixed(0) +
      (isImperial ? " ft" : " m")
    );
  };

  elevChart.update();
}

const routeSelectEl = document.getElementById("routeSelect");
const routeSearchEl = document.getElementById("routeSearch");
const resetRouteBtn = document.getElementById("resetRouteBtn");
const routeMetaEl = document.getElementById("routeMeta");

routeSelectEl.addEventListener("change", (e) => {
  const key = e.target.value;
  if (key) {
    loadRoute(key);
  } else {
    clearRouteView();
    localStorage.removeItem("bikesim_last_route");
  }
});

/* ---- Normalisation helpers for route JSON ---- */

function haversineMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = Math.PI / 180;
  const φ1 = lat1 * toRad;
  const φ2 = lat2 * toRad;
  const dφ = (lat2 - lat1) * toRad;
  const dλ = (lon2 - lon1) * toRad;

  const a =
    Math.sin(dφ / 2) * Math.sin(dφ / 2) +
    Math.cos(φ1) *
      Math.cos(φ2) *
      Math.sin(dλ / 2) *
      Math.sin(dλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function buildNormalizedRoute(raw) {
  const out = Object.assign({}, raw);

  const latlngsRaw = Array.isArray(raw.latlngs)
    ? raw.latlngs
    : [];
  const elevRaw = Array.isArray(raw.elevations)
    ? raw.elevations
    : [];

  const n = Math.min(latlngsRaw.length, elevRaw.length);
  if (n < 2) {
    out.distances = Array.isArray(raw.distances)
      ? raw.distances
      : [];
    out.elevations = elevRaw;
    out.latlngs = latlngsRaw;
    out.total_climb_m =
      typeof raw.total_climb_m === "number"
        ? raw.total_climb_m
        : 0;
    out.distance_km =
      typeof raw.distance_km === "number"
        ? raw.distance_km
        : 0;
    out.elev_min =
      typeof raw.elev_min === "number" ? raw.elev_min : 0;
    out.elev_max =
      typeof raw.elev_max === "number" ? raw.elev_max : 0;
    return out;
  }

  const latlngs = [];
  const elevations = [];
  for (let i = 0; i < n; i++) {
    const pt = latlngsRaw[i];
    const lat = Number(pt[0]);
    const lon = Number(pt[1]);
    latlngs.push([lat, lon]);
    elevations.push(Number(elevRaw[i]));
  }

  const distances = [];
  let cumKm = 0;
  distances.push(0);
  for (let i = 1; i < n; i++) {
    const [lat1, lon1] = latlngs[i - 1];
    const [lat2, lon2] = latlngs[i];
    const dM = haversineMeters(lat1, lon1, lat2, lon2);
    cumKm += dM / 1000;
    distances.push(Number(cumKm.toFixed(3)));
  }

  let totalClimb = 0;
  let minE = elevations[0];
  let maxE = elevations[0];
  for (let i = 1; i < n; i++) {
    const de = elevations[i] - elevations[i - 1];
    if (de > 0) totalClimb += de;
    if (elevations[i] < minE) minE = elevations[i];
    if (elevations[i] > maxE) maxE = elevations[i];
  }

  const computedDistKm =
    distances[distances.length - 1] || 0;
  const distKmFinal =
    typeof raw.distance_km === "number" &&
    raw.distance_km > 0.1
      ? raw.distance_km
      : computedDistKm;

  out.distances = distances;
  out.elevations = elevations;
  out.latlngs = latlngs;
  out.distance_km = distKmFinal;
  out.total_climb_m =
    typeof raw.total_climb_m === "number" &&
    raw.total_climb_m > 0
      ? raw.total_climb_m
      : Math.round(totalClimb);
  out.elev_min =
    typeof raw.elev_min === "number" ? raw.elev_min : minE;
  out.elev_max =
    typeof raw.elev_max === "number" ? raw.elev_max : maxE;

  return out;
}

async function loadRoute(key) {
  if (!key) return;
  const meta = ROUTE_INDEX[key];
  if (!meta) return;

  try {
    const res = await fetch(meta.file);
    if (!res.ok) {
      throw new Error("HTTP " + res.status);
    }
    const raw = await res.json();
    const r = buildNormalizedRoute(raw);
    // Apply elevation smoothing (halfWin=3 → 7-point moving average)
    // Reduces GPS noise without losing meaningful terrain shape
    if (Array.isArray(r.elevations) && r.elevations.length > 6) {
      r.elevations = smoothElevations(r.elevations, 3);
    }
    window.currentRouteProfile = r;

    if (polyline) {
      map.removeLayer(polyline);
      polyline = null;
    }
    if (Array.isArray(r.latlngs) && r.latlngs.length > 1) {
      polyline = L.polyline(r.latlngs, {
        weight: 4,
        color: "#ef4444",
      }).addTo(map);
      map.fitBounds(polyline.getBounds(), {
        padding: [20, 20],
      });
    } else {
      map.setView([0, 0], 2);
    }

    const currentUnits =
      document.getElementById("unit").value || "metric";
    updateChartUnits(currentUnits);

    if (
      typeof r.distance_km === "number" &&
      r.distance_km > 0
    ) {
      const km = r.distance_km;
      const mi = km / 1.60934;
      const distKmEl =
        document.getElementById("distance-km");
      const distMiEl =
        document.getElementById("distance-mi");
      if (distKmEl) distKmEl.value = km.toFixed(1);
      if (distMiEl) distMiEl.value = mi.toFixed(2);
    }

    if (
      typeof r.total_climb_m === "number" &&
      r.total_climb_m > 0
    ) {
      const m = r.total_climb_m;
      const ft = m * 3.28084;
      const climbMEl =
        document.getElementById("total-climb-m");
      const climbFtEl =
        document.getElementById("total-climb-ft");
      if (climbMEl) climbMEl.value = m.toFixed(0);
      if (climbFtEl) climbFtEl.value = ft.toFixed(0);
    }

    if (
      Array.isArray(r.elevations) &&
      r.elevations.length > 0
    ) {
      const startAlt = r.elevations[0];
      const altEl = document.getElementById("altitude");
      if (altEl) altEl.value = Math.round(startAlt);
    }

    const distTot =
      typeof r.distance_km === "number" &&
      r.distance_km > 0
        ? r.distance_km
        : Array.isArray(r.distances) &&
          r.distances.length
        ? r.distances[r.distances.length - 1]
        : 0;

    const climbTot =
      typeof r.total_climb_m === "number"
        ? r.total_climb_m
        : 0;
    const avgGrade =
      distTot > 0 ? climbTot / (distTot * 10) : 0;

    const elevMin =
      typeof r.elev_min === "number"
        ? r.elev_min
        : Array.isArray(r.elevations) &&
          r.elevations.length
        ? Math.min.apply(null, r.elevations)
        : 0;

    const elevMax =
      typeof r.elev_max === "number"
        ? r.elev_max
        : Array.isArray(r.elevations) &&
          r.elevations.length
        ? Math.max.apply(null, r.elevations)
        : 0;

    const name = r.name || meta.name || key;

    routeMetaEl.textContent =
      `${name} – ${distTot.toFixed(
        1
      )} km, climb ≈ ${climbTot.toFixed(
        0
      )} m (avg grade ≈ ${avgGrade.toFixed(
        1
      )}%), elevation ${elevMin.toFixed(
        0
      )}–${elevMax.toFixed(0)} m`;

    localStorage.setItem("bikesim_last_route", key);

    calculateResult();
    rebuildTechnicalChallenges();
  } catch (err) {
    console.error("Failed to load route", key, err);
    routeMetaEl.textContent =
      "Error loading route data.";
    const tech =
      document.getElementById("techChallenges");
    if (tech) {
      tech.innerHTML =
        '<p style="margin:0;font-size:13px;color:#92400e;">Error loading route data, cannot compute technical challenges.</p>';
    }
  }
}

function clearRouteView() {
  if (polyline) {
    map.removeLayer(polyline);
    polyline = null;
  }
  map.setView([0, 0], 2);
  elevChart.data.labels = [];
  elevChart.data.datasets[0].data = [];
  elevChart.update();
  routeMetaEl.textContent =
    "No route selected. You can still enter distance, climb, and altitude manually.";
  window.currentRouteProfile = null;
  rebuildAdvancedPacing();
  const tech =
    document.getElementById("techChallenges");
  if (tech) {
    tech.innerHTML =
      '<p style="margin:0;font-size:13px;color:#92400e;">Select a route above to list climbs ≥ 3%, descents ≤ −3%, and sharp turns (&gt; 80°).</p>';
  }
}

function rebuildRouteOptions(filterText) {
  const txt = (filterText || "").toLowerCase();

  while (routeSelectEl.options.length > 0) {
    routeSelectEl.remove(0);
  }

  const defaultOpt = document.createElement("option");
  defaultOpt.value = "";
  defaultOpt.textContent = "— No route selected —";
  routeSelectEl.appendChild(defaultOpt);

  const entries = Object.entries(ROUTE_INDEX).sort(([, a], [, b]) =>
    (a.name || "").localeCompare(b.name || "")
  );

  entries.forEach(([key, meta]) => {
    const name = meta.name || key;
    const haystack = (name + " " + key).toLowerCase();

    if (!txt || haystack.includes(txt)) {
      const opt = document.createElement("option");
      opt.value = key;
      opt.textContent = name;
      routeSelectEl.appendChild(opt);
    }
  });

  if (filterText && routeSelectEl.options.length === 2) {
    routeSelectEl.selectedIndex = 1;
    loadRoute(routeSelectEl.value);
  } else {
    routeSelectEl.value = "";
  }
}

routeSearchEl.addEventListener("input", (e) => {
  const text = e.target.value;
  rebuildRouteOptions(text);

  if (!text) {
    clearRouteView();
    localStorage.removeItem("bikesim_last_route");
  }
});

resetRouteBtn.addEventListener("click", () => {
  routeSearchEl.value = "";
  rebuildRouteOptions("");
  clearRouteView();
  localStorage.removeItem("bikesim_last_route");
});

changeUnit();
changeTyreCondition();
updateCalcModeUI();
calculateResult();
if (typeof updateChartUnits === "function") {
  const u0 =
    document.getElementById("unit").value || "metric";
  updateChartUnits(u0);
}
if (typeof rebuildTechnicalChallenges === "function") {
  rebuildTechnicalChallenges();
}

const courseToggleBtn =
  document.getElementById("toggleCourseAnalysis");
const courseAnalysisEl =
  document.getElementById("courseAnalysis");
if (courseToggleBtn && courseAnalysisEl) {
  courseToggleBtn.addEventListener("click", () => {
    const isHidden =
      courseAnalysisEl.classList.toggle(
        "courseAnalysis--hidden"
      );
    courseToggleBtn.textContent = isHidden
      ? "Show course analysis"
      : "Hide course analysis";
    if (!isHidden) {
      setTimeout(() => {
        if (typeof map !== "undefined" && map) {
          map.invalidateSize();
        }
      }, 50);
    }
  });
}

rebuildRouteOptions("");
const savedRoute =
  localStorage.getItem("bikesim_last_route");
if (savedRoute && ROUTE_INDEX[savedRoute]) {
  routeSelectEl.value = savedRoute;
  loadRoute(savedRoute);
} else {
  clearRouteView();
}
