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

  var stratOnlyIds = ["npRow", "viRow", "courseSplitRow", "nutritionRow"];
  var isStrat = (mode === "strategy_power");

  if (mode === "power_to_time") {
    if (rowPower) rowPower.style.display = "flex";
    if (rowTime)  rowTime.style.display  = "flex";
    if (advWrap)  advWrap.style.display  = "none";
    if (stratRow) stratRow.style.display = "none";
    if (ftLabel)  ftLabel.textContent  = "Finish time (physics)";
    if (avgWLbl)  avgWLbl.textContent  = "Avg W (physics est. / input)";
    if (speedLbl) speedLbl.textContent = "Speed";
    stratOnlyIds.forEach(function(id) { var el = document.getElementById(id); if (el) el.style.display = "none"; });
  } else if (mode === "time_to_power") {
    if (rowPower) rowPower.style.display = "none";
    if (rowTime)  rowTime.style.display  = "flex";
    if (advWrap)  advWrap.style.display  = "none";
    if (stratRow) stratRow.style.display = "none";
    if (ftLabel)  ftLabel.textContent  = "Finish time (physics)";
    if (avgWLbl)  avgWLbl.textContent  = "Avg W (physics est. / input)";
    if (speedLbl) speedLbl.textContent = "Speed";
    stratOnlyIds.forEach(function(id) { var el = document.getElementById(id); if (el) el.style.display = "none"; });
  } else if (mode === "strategy_power") {
    if (rowPower) rowPower.style.display = "none";
    if (rowTime)  rowTime.style.display  = "none";
    if (advWrap)  advWrap.style.display  = "block";
    if (stratRow) stratRow.style.display = "flex";
    if (ftLabel)  ftLabel.textContent  = "Finish time (flat est.)";
    if (avgWLbl)  avgWLbl.textContent  = "Avg W (weighted, strategy)";
    if (speedLbl) speedLbl.textContent = "Avg speed (strategy)";
  }

  // Hide A/B and sensitivity sections when not in strategy mode
  var abSec   = document.getElementById("abSection");
  var sensSec = document.getElementById("sensSection");
  if (!isStrat) {
    if (abSec)   abSec.style.display   = "none";
    if (sensSec) sensSec.style.display = "none";
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

/* ─── runSimulation(cfg) ──────────────────────────────────────────────────
   Pure physics engine. Accepts a config object, returns simulation results.
   cfg fields:
     dist []             cumulative distances (km)
     elev []             elevations (m)
     latlngs []          [[lat,lon],…] optional – enables bearing-based wind
     flatP / climb1P / climb3P / climb10P / descentP  (W)
     maxDesc_mps         max descent speed m/s (Infinity = no cap)
     totalWeight         system mass kg
     crr / cda           rolling + aero coefficients
     cdaClimbDelta       extra CdA on grade ≥ 4% (m², 0 = off)
     rho                 air density kg/m³
     windScalar          signed wind m/s (+ = headwind); used when no direction
     windSpeed_mps       wind magnitude m/s (used with windDirDeg)
     windDirDeg          wind FROM direction °; null/undefined → scalar mode
     driveEff            drivetrain efficiency 0–1
     nLaps               integer ≥ 1
     powerFadePctPerHr   % power loss per hour (0 = none)
     unit                "metric" | "imperial"
     checkpointIntervalKm  0 = off
   Returns:
     { rows, totalTimeSec, totalDistKm, checkpointTimes }
   ────────────────────────────────────────────────────────────────────────── */
function runSimulation(cfg) {
  var dist   = cfg.dist;
  var elev   = cfg.elev;
  var ll     = cfg.latlngs || null;
  var flatP  = cfg.flatP  || 0;
  var c1P    = cfg.climb1P  || 0;
  var c3P    = cfg.climb3P  || 0;
  var c10P   = cfg.climb10P || 0;
  var descP  = cfg.descentP || 0;
  var mxD    = cfg.maxDesc_mps !== undefined ? cfg.maxDesc_mps : Infinity;
  var mass   = cfg.totalWeight || 75;
  var crr    = cfg.crr || 0.0035;
  var cdaB   = cfg.cda || 0.18;
  var cdaDelta = cfg.cdaClimbDelta || 0;
  var rho    = cfg.rho || 1.2;
  var wSc    = cfg.windScalar || 0;         // signed scalar wind m/s
  var wSpd   = cfg.windSpeed_mps || 0;      // magnitude for bearing mode
  var wDir   = cfg.windDirDeg;              // null/undefined → scalar
  var useBW  = (ll && ll.length >= 2 && wDir !== null && wDir !== undefined && !isNaN(wDir));
  var eff    = cfg.driveEff || 0.98;
  var nLaps  = Math.max(1, Math.round(cfg.nLaps || 1));
  var fadeP  = cfg.powerFadePctPerHr || 0;
  var unit   = cfg.unit || "metric";
  var cpInt  = cfg.checkpointIntervalKm || 0;

  var dBase  = dist[dist.length - 1];
  var tSegKm = dBase >= 120 ? 5 : 3;

  // ── Build segment list (indices into dist/elev arrays) ──────────────
  var baseSegs = [];
  var si = 0, sDist = dist[0];
  for (var i = 1; i < dist.length; i++) {
    var stepKm = dist[i] - dist[i - 1];
    var stepM  = stepKm * 1000;
    var stepEl = elev[i] - elev[i - 1];
    var sg     = stepM > 0 ? stepEl / stepM : 0;
    var isSteep = Math.abs(sg) >= 0.08 && stepKm >= 0.7;
    var longEnough = (dist[i] - sDist) >= tSegKm && i > si + 1;
    if (isSteep) {
      if (i - 1 > si) baseSegs.push({ s: si, e: i - 1 });
      baseSegs.push({ s: i - 1, e: i });
      si = i; sDist = dist[i];
    } else if (longEnough) {
      baseSegs.push({ s: si, e: i });
      si = i; sDist = dist[i];
    }
  }
  if (si < dist.length - 1) baseSegs.push({ s: si, e: dist.length - 1 });

  var rows   = [];
  var total  = 0;
  var cpTimes = [];
  var nextCp  = cpInt > 0 ? cpInt : Infinity;

  function fmtSec(sec) {
    var h = Math.floor(sec / 3600);
    var m = Math.floor((sec - h * 3600) / 60);
    var s = Math.round(sec - h * 3600 - m * 60);
    if (s === 60) { s = 0; m++; }
    if (m === 60) { m = 0; h++; }
    var parts = [];
    if (h > 0) parts.push(String(h).padStart(2, "0"));
    parts.push(String(m).padStart(2, "0"));
    parts.push(String(s).padStart(2, "0"));
    return parts.join(":");
  }

  for (var lap = 0; lap < nLaps; lap++) {
    var off = lap * dBase;

    for (var b = 0; b < baseSegs.length; b++) {
      var seg  = baseSegs[b];
      var dS   = dist[seg.s] + off;
      var dE   = dist[seg.e] + off;
      var lenK = Math.max(0.001, dE - dS);
      var lenM = lenK * 1000;
      var eS   = elev[seg.s];
      var eE   = elev[seg.e];
      var grade = lenM > 0 ? (eE - eS) / lenM : 0;

      // Effective CdA (extra on steep climbs)
      var cda = (cdaDelta > 0 && grade >= 0.04) ? cdaB + cdaDelta : cdaB;

      // Effective wind (bearing-based or scalar)
      var wind;
      if (useBW && ll) {
        var mi   = Math.min(Math.round((seg.s + seg.e) / 2), ll.length - 2);
        var bear = bearingDeg(ll[mi][0], ll[mi][1], ll[mi + 1][0], ll[mi + 1][1]);
        // headwind = wSpd × cos(riderBearing − windFromDir)
        wind = wSpd * Math.cos((bear - wDir) * Math.PI / 180);
      } else {
        wind = wSc;
      }

      // Power fade (linear, % per hour)
      var fade = fadeP > 0 ? Math.max(0, 1 - (fadeP / 100) * (total / 3600)) : 1;

      var kind = grade >= 0.01 ? "Climb" : (grade <= -0.01 ? "Descent" : "Flat/rolling");
      var targetW, v;

      if (kind === "Descent") {
        if (descP <= 0) {
          targetW = 0;
          v = terminalVelocity(grade, mass, crr, cda, rho, wind, eff);
        } else {
          targetW = descP * fade;
          v = solveSpeedForTargetPower(targetW, grade, mass, crr, cda, rho, wind, eff);
        }
        if (v > mxD) v = mxD;
      } else if (kind === "Climb") {
        var ap = ((c10P > 0 ? c10P : flatP)) * fade;
        var va = solveSpeedForTargetPower(ap, grade, mass, crr, cda, rho, wind, eff);
        if (va <= 0) va = 5;
        var ta = lenM / va;
        var bP = (ta <= 60  && c1P > 0)  ? c1P  :
                 (ta <= 180 && c3P > 0)  ? c3P  :
                 (c10P > 0 ? c10P : flatP);
        targetW = bP * fade;
        v = solveSpeedForTargetPower(targetW, grade, mass, crr, cda, rho, wind, eff);
      } else {
        targetW = flatP * fade;
        v = solveSpeedForTargetPower(targetW, grade, mass, crr, cda, rho, wind, eff);
      }

      if (!v || v <= 0) continue;

      var segT = lenM / v;
      total   += segT;

      // Checkpoint accumulation
      while (cpInt > 0 && dE >= nextCp) {
        var frac = (nextCp - dS) / lenK;
        cpTimes.push({ km: nextCp, timeSec: total - segT + frac * segT });
        nextCp += cpInt;
      }

      var spKmh  = v * 3.6;
      var spDisp = unit === "metric" ? spKmh : spKmh / 1.60934;
      var lnDisp = unit === "metric" ? lenK  : lenK  / 1.60934;
      var frDisp = unit === "metric" ? dS    : dS    / 1.60934;
      var toDisp = unit === "metric" ? dE    : dE    / 1.60934;
      var vam    = (kind === "Climb" && segT > 0)
                   ? Math.round((eE - eS) / (segT / 3600)) : null;

      rows.push({
        from: frDisp, to: toDisp, len: lnDisp,
        kind: kind, grade: grade * 100, power: targetW,
        speed: spDisp, time: segT, timeStr: fmtSec(segT),
        cumTimeSec: total, vam: vam, lapNum: lap + 1,
        windEff: wind, cda: cda
      });
    }
  }

  return {
    rows: rows,
    totalTimeSec: total,
    totalDistKm: dBase * nLaps,
    checkpointTimes: cpTimes
  };
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
    container.innerHTML = '<p style="margin:0;font-size:14px;color:#555;">Select "Power strategy (advanced)" to see per-segment pacing.</p>';
    if (strategyRow) strategyRow.style.display = "none";
    if (strategyVal) strategyVal.textContent = "—";
    return;
  }

  const profile = window.currentRouteProfile;
  if (!profile || !profile.distances || profile.distances.length < 2) {
    container.innerHTML = '<p style="margin:0;font-size:14px;color:#555;">Advanced pacing needs a selected course with elevation data.</p>';
    if (strategyRow) strategyRow.style.display = "flex";
    if (strategyVal) strategyVal.textContent = "—";
    return;
  }

  const unit = document.getElementById("unit").value;

  function gNum(id, def) {
    var el = document.getElementById(id);
    return el ? (parseFloat(el.value) || def) : def;
  }
  function gNumOrNull(id) {
    var el = document.getElementById(id);
    if (!el || el.value === "" || el.value === null) return null;
    var v = parseFloat(el.value);
    return isNaN(v) ? null : v;
  }

  const flatP = gNum("flat_power", 0);
  if (flatP <= 0) {
    container.innerHTML = '<p style="margin:0;font-size:14px;color:#555;">Set at least a flat power in the advanced box above.</p>';
    if (strategyRow) strategyRow.style.display = "flex";
    if (strategyVal) strategyVal.textContent = "—";
    return;
  }

  const windRaw = unit === "metric" ? gNum("wind-metric", 0) : gNum("wind-imperial", 0);
  const windSc_mps = unit === "metric" ? windRaw / 3.6 : windRaw * 0.44704;
  const windDirRaw = gNumOrNull("wind_dir");  // null = scalar mode
  const windDirDeg = windDirRaw;
  const windSpd_mps = Math.abs(windSc_mps);

  const tempC = gNum("temperature-c", 20);
  const pressurePa = pressureAtAltitude(gNum("altitude", 0), gNum("pressure-hpa", 0));
  const rho = moistAirDensity(pressurePa, tempC, gNum("relHumidity", 0));
  const rw  = gNum("rider-weight-kg", 0);

  const cfg = {
    dist: profile.distances,
    elev: profile.elevations,
    latlngs: profile.latlngs || null,
    flatP:    flatP,
    climb1P:  gNum("climb1_power", 0),
    climb3P:  gNum("climb3_power", 0),
    climb10P: gNum("climb10_power", 0),
    descentP: gNum("descent_power", 0),
    maxDesc_mps: (function() {
      var md = gNum("max_descent_speed", 0);
      if (md <= 0) return Infinity;
      return unit === "metric" ? md / 3.6 : md * 0.44704;
    })(),
    totalWeight: rw + gNum("clothes-gear-kg", 0) + gNum("bike-weight-kg", 0),
    crr:    gNum("crr_rolling", 0.0035),
    cda:    gNum("cdaAeroDynamicResistance", 0.18),
    cdaClimbDelta: gNum("cda_climb_delta", 0),
    rho:    rho,
    windScalar:    windSc_mps,
    windSpeed_mps: windSpd_mps,
    windDirDeg:    windDirDeg,
    driveEff: gNum("driveTrainEfficiency", 98) / 100,
    nLaps:    Math.max(1, Math.round(gNum("n_laps", 1))),
    powerFadePctPerHr: gNum("power_fade_pct", 0),
    unit:   unit,
    checkpointIntervalKm: gNum("checkpoint_km", 0)
  };

  const result       = runSimulation(cfg);
  const rows         = result.rows;
  const totalTimeSec = result.totalTimeSec;
  const totalDistKm  = result.totalDistKm;
  const cpTimes      = result.checkpointTimes;

  if (!rows.length) {
    container.innerHTML = '<p style="margin:0;font-size:14px;color:#555;">Route profile too short to build pacing segments.</p>';
    if (strategyRow) strategyRow.style.display = "flex";
    if (strategyVal) strategyVal.textContent = "—";
    return;
  }

  function fmtTotal(sec) {
    sec = Math.max(0, sec);
    var h = Math.floor(sec / 3600);
    var m = Math.floor((sec - h * 3600) / 60);
    var s = Math.round(sec - h * 3600 - m * 60);
    if (s === 60) { s = 0; m++; }
    if (m === 60) { m = 0; h++; }
    return String(h).padStart(2,"0") + ":" + String(m).padStart(2,"0") + ":" + String(s).padStart(2,"0");
  }

  const unitDist  = unit === "metric" ? "km" : "mi";
  const unitSpeed = unit === "metric" ? "km/h" : "mi/h";
  const showCp    = cfg.checkpointIntervalKm > 0;
  const showLap   = cfg.nLaps > 1;
  const cols      = 10 + (showCp ? 1 : 0) + (showLap ? 1 : 0);

  // ── Pacing table ────────────────────────────────────────────────────────
  var html = '<table class="advTable"><thead><tr>'
    + '<th>#</th><th>From (' + unitDist + ')</th><th>To (' + unitDist + ')</th>'
    + '<th>Len</th><th>Type</th><th>Grade %</th>'
    + '<th>Power W</th><th>Speed</th><th>Time</th><th>VAM</th>'
    + (showCp  ? '<th>Cum. time</th>' : '')
    + (showLap ? '<th>Lap</th>' : '')
    + '</tr></thead><tbody>';

  rows.forEach(function(r, i) {
    var kStyle = r.kind === "Climb"   ? ' style="color:#dc2626;font-weight:600"'
               : r.kind === "Descent" ? ' style="color:#2563eb;font-weight:600"' : '';
    html += '<tr>'
      + '<td>' + (i + 1) + '</td>'
      + '<td>' + r.from.toFixed(1) + '</td>'
      + '<td>' + r.to.toFixed(1)   + '</td>'
      + '<td>' + r.len.toFixed(1)  + '</td>'
      + '<td' + kStyle + '>' + r.kind + '</td>'
      + '<td>' + r.grade.toFixed(1) + '</td>'
      + '<td>' + r.power.toFixed(0) + '</td>'
      + '<td>' + r.speed.toFixed(1) + '</td>'
      + '<td>' + r.timeStr + '</td>'
      + '<td>' + (r.vam !== null ? r.vam + ' m/h' : '—') + '</td>'
      + (showCp  ? '<td>' + fmtTotal(r.cumTimeSec) + '</td>' : '')
      + (showLap ? '<td>' + r.lapNum + '</td>' : '')
      + '</tr>';
  });

  // Checkpoint summary block
  if (cpTimes.length) {
    html += '<tr><td colspan="' + cols + '" style="background:#eef2ff;font-weight:700;text-align:left;font-size:12px;padding:3px 6px;">📍 Checkpoints</td></tr>';
    cpTimes.forEach(function(cp) {
      var cpDist = unit === "metric" ? cp.km.toFixed(1) : (cp.km / 1.60934).toFixed(1);
      html += '<tr style="background:#eef2ff;font-size:12px;">'
        + '<td colspan="3">@ ' + cpDist + ' ' + unitDist + '</td>'
        + '<td colspan="' + (cols - 3) + '">' + fmtTotal(cp.timeSec) + '</td></tr>';
    });
  }

  html += '</tbody></table>';

  // ── Derived metrics ──────────────────────────────────────────────────────
  const stratAvgW = rows.reduce(function(s, r) { return s + r.power * r.time; }, 0) / Math.max(1, totalTimeSec);
  const stratAvgSpeedKmh = totalDistKm / Math.max(0.0001, totalTimeSec / 3600);
  const stratAvgSpeedDisp = unit === "metric" ? stratAvgSpeedKmh : stratAvgSpeedKmh / 1.60934;
  const np4avg = rows.reduce(function(s, r) { return s + Math.pow(r.power, 4) * r.time; }, 0) / Math.max(1, totalTimeSec);
  const NP = Math.pow(Math.max(0, np4avg), 0.25);
  const VI = stratAvgW > 0 ? NP / stratAvgW : 1;
  const totalEnergyKJ = rows.reduce(function(s, r) { return s + r.power * r.time; }, 0) / 1000;

  html += '<p class="advSummaryLine">Total: <strong>' + fmtTotal(totalTimeSec)
    + '</strong> · Avg speed: <strong>' + stratAvgSpeedDisp.toFixed(2) + ' ' + unitSpeed
    + '</strong> · Avg W: <strong>' + stratAvgW.toFixed(0)
    + ' W</strong> · NP: <strong>' + NP.toFixed(0)
    + ' W</strong> · VI: <strong>' + VI.toFixed(2) + '</strong></p>';

  // ── Slowest / fastest segments ───────────────────────────────────────────
  if (rows.length >= 4) {
    var sorted = rows.slice().sort(function(a, b) { return a.speed - b.speed; });
    var n3 = Math.min(3, Math.floor(rows.length / 4));
    html += '<div style="margin-top:8px;font-size:12px;line-height:1.7;">'
      + '<strong style="color:#dc2626;">🐢 Slowest:</strong> '
      + sorted.slice(0, n3).map(function(r) {
          return r.from.toFixed(1) + '–' + r.to.toFixed(1) + ' ' + unitDist + ' @ ' + r.speed.toFixed(1) + ' ' + unitSpeed;
        }).join(' &nbsp;·&nbsp; ')
      + '<br><strong style="color:#16a34a;">🚀 Fastest:</strong> '
      + sorted.slice(-n3).reverse().map(function(r) {
          return r.from.toFixed(1) + '–' + r.to.toFixed(1) + ' ' + unitDist + ' @ ' + r.speed.toFixed(1) + ' ' + unitSpeed;
        }).join(' &nbsp;·&nbsp; ')
      + '</div>';
  }

  // ── Zone bar ─────────────────────────────────────────────────────────────
  const ftp = Math.max(1, gNum("known_ftp", 1));
  var zoneSec = YOUSULI_ZONES.map(function() { return 0; });
  var coastSec = 0;
  rows.forEach(function(r) {
    var zi = classifyZone(r.power / ftp);
    if (zi < 0) coastSec += r.time; else zoneSec[zi] += r.time;
  });
  html += buildZoneBarHTML(zoneSec, coastSec, totalTimeSec);

  // ── Nutrition estimate ────────────────────────────────────────────────────
  const timeH   = totalTimeSec / 3600;
  const kcal    = Math.round(totalEnergyKJ);
  const carbsG  = Math.round(timeH * 75);
  const fluidML = Math.round(timeH * (tempC >= 25 ? 800 : 600));
  html += '<div style="margin-top:8px;padding:6px 8px;background:#f5f3ff;border-radius:6px;font-size:12px;color:#6d28d9;">'
    + '🍌 <strong>Nutrition est.:</strong> ~' + kcal + ' kcal &nbsp;·&nbsp; ~' + carbsG + ' g carbs'
    + ' &nbsp;·&nbsp; ~' + (fluidML / 1000).toFixed(1) + ' L fluid'
    + ' <em>(' + (tempC >= 25 ? 'hot' : 'moderate') + ' conditions)</em></div>';

  container.innerHTML = html;

  // ── Sensitivity table (in its own section) ────────────────────────────────
  var sensEl = document.getElementById("sensSection");
  if (sensEl) {
    sensEl.style.display = "block";
    buildSensitivityTable(cfg, totalTimeSec, stratAvgW);
  }

  // ── Strategy finish time row ──────────────────────────────────────────────
  if (strategyRow) strategyRow.style.display = "flex";
  if (strategyVal) strategyVal.textContent = fmtTotal(totalTimeSec);

  // ── Override main results panel ───────────────────────────────────────────
  (function() {
    var set = function(id, txt) { var e = document.getElementById(id); if (e) e.textContent = txt; };
    set("speed",    stratAvgSpeedDisp.toFixed(2) + (unit === "metric" ? " km/h" : " mi/h"));
    set("avg_w",    stratAvgW.toFixed(1) + " W");
    set("avg_w_kg", (rw > 0 ? (stratAvgW / rw).toFixed(2) : "0.00") + " W/kg");
    var IF  = stratAvgW / ftp;
    var TSS = timeH * IF * IF * 100;
    set("intensity",  IF.toFixed(2) + " IF");
    set("stressScore", TSS.toFixed(2));
    var ratio = TSS / Math.max(1, gNum("fitnessValue", 1));
    set("workoutDesc", ratio > 2.01 ? "Extreme workout" : ratio > 1.5 ? "Hard workout" :
        ratio > 1.25 ? "Moderately hard workout" : ratio > 0.75 ? "Average workout" : "Easy workout");
    set("energyKJ",        totalEnergyKJ.toFixed(0) + " kJ");
    set("normalizedPower", NP.toFixed(0) + " W");
    set("variabilityIndex", VI.toFixed(3));
    var dl = unit === "metric" ? " km" : " mi";
    var cL = 0, dL = 0, fL = 0;
    rows.forEach(function(r) {
      if (r.kind === "Climb") cL += r.len;
      else if (r.kind === "Descent") dL += r.len;
      else fL += r.len;
    });
    set("courseSplit", "↑ " + cL.toFixed(1) + dl + " · → " + fL.toFixed(1) + dl + " · ↓ " + dL.toFixed(1) + dl);
    set("nutritionEst", "~" + kcal + " kcal · " + carbsG + " g carbs · " + (fluidML / 1000).toFixed(1) + " L");
    ["npRow","viRow","courseSplitRow","nutritionRow"].forEach(function(id) {
      var el = document.getElementById(id); if (el) el.style.display = "flex";
    });
  })();

  // ── Store result for A/B ──────────────────────────────────────────────────
  window._lastSimResult = {
    cfg: cfg, totalTimeSec: totalTimeSec, stratAvgW: stratAvgW,
    NP: NP, VI: VI, rows: rows, totalDistKm: totalDistKm
  };

  // ── Show A/B section ──────────────────────────────────────────────────────
  var abSec = document.getElementById("abSection");
  if (abSec) abSec.style.display = "block";
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

/* ─── Utility: format seconds → HH:MM:SS ─── */
function fmtSecToHMS(sec) {
  sec = Math.max(0, sec);
  var h = Math.floor(sec / 3600);
  var m = Math.floor((sec - h * 3600) / 60);
  var s = Math.round(sec - h * 3600 - m * 60);
  if (s === 60) { s = 0; m++; }
  if (m === 60) { m = 0; h++; }
  return String(h).padStart(2,"0") + ":" + String(m).padStart(2,"0") + ":" + String(s).padStart(2,"0");
}

/* ─── Sensitivity / what-if table ─────────────────────────────────── */
function buildSensitivityTable(baseCfg, baseTimeSec, baseAvgW) {
  var el = document.getElementById("sensTableInner");
  if (!el) return;
  var unit     = baseCfg.unit || "metric";
  var unitSpd  = unit === "metric" ? "km/h" : "mi/h";
  var totalDst = baseCfg.dist[baseCfg.dist.length - 1] * (baseCfg.nLaps || 1);

  function speedFromResult(r) {
    var distDisp = unit === "metric" ? r.totalDistKm : r.totalDistKm / 1.60934;
    return distDisp / Math.max(0.001, r.totalTimeSec / 3600);
  }
  function runDelta(patch, label) {
    // Merge patch into a shallow copy; for object fields, merge one level deep
    var c2 = Object.assign({}, baseCfg, patch);
    var r2 = runSimulation(c2);
    var dt = r2.totalTimeSec - baseTimeSec;
    return { label: label, timeSec: r2.totalTimeSec, dt: dt, speed: speedFromResult(r2) };
  }
  function fmtDt(dt) {
    var sign = dt > 0 ? "+" : "−";
    var abs  = Math.abs(dt);
    var mm   = Math.floor(abs / 60);
    var ss   = Math.round(abs % 60);
    return sign + String(mm).padStart(2,"0") + ":" + String(ss).padStart(2,"0");
  }

  var baseSpd = speedFromResult({ totalDistKm: totalDst, totalTimeSec: baseTimeSec });

  var scenarios = [
    { label: "✅ Base (current)", timeSec: baseTimeSec, dt: 0, speed: baseSpd, isBase: true },
    runDelta({
      flatP:    baseCfg.flatP    * 1.05,
      climb1P:  baseCfg.climb1P  * 1.05,
      climb3P:  baseCfg.climb3P  * 1.05,
      climb10P: baseCfg.climb10P * 1.05
    }, "⚡ +5% power"),
    runDelta({
      flatP:    baseCfg.flatP    * 0.95,
      climb1P:  baseCfg.climb1P  * 0.95,
      climb3P:  baseCfg.climb3P  * 0.95,
      climb10P: baseCfg.climb10P * 0.95
    }, "🔋 −5% power"),
    runDelta({ totalWeight: baseCfg.totalWeight - 2 }, "⚖ −2 kg weight"),
    runDelta({ totalWeight: baseCfg.totalWeight + 2 }, "⚖ +2 kg weight"),
    runDelta({ cda: baseCfg.cda - 0.02 }, "💨 CdA −0.02 m²"),
    runDelta({ cda: baseCfg.cda + 0.02 }, "🌬 CdA +0.02 m²"),
    runDelta({ windScalar: baseCfg.windScalar - (3 / 3.6), windSpeed_mps: Math.max(0, baseCfg.windSpeed_mps - (3/3.6)) }, "🌀 Wind −3 km/h"),
    runDelta({ windScalar: baseCfg.windScalar + (3 / 3.6), windSpeed_mps: baseCfg.windSpeed_mps + (3/3.6) }, "🌀 Wind +3 km/h"),
  ];

  var html = '<table class="sensTable"><thead><tr>'
    + '<th>Scenario</th><th>Finish time</th><th>Δ time</th><th>Avg speed (' + unitSpd + ')</th>'
    + '</tr></thead><tbody>';

  scenarios.forEach(function(sc) {
    var rowCls = sc.isBase ? ' class="sens-base"' : '';
    var dtCell = sc.isBase ? '—'
      : '<span class="' + (sc.dt < 0 ? 'sens-faster' : 'sens-slower') + '">' + fmtDt(sc.dt) + '</span>';
    html += '<tr' + rowCls + '>'
      + '<td>' + sc.label + '</td>'
      + '<td>' + fmtSecToHMS(sc.timeSec) + '</td>'
      + '<td>' + dtCell + '</td>'
      + '<td>' + sc.speed.toFixed(2) + '</td>'
      + '</tr>';
  });

  html += '</tbody></table>';
  html += '<p style="font-size:11px;color:#888;margin-top:4px;">Deltas relative to current strategy. Green = faster, red = slower.</p>';
  el.innerHTML = html;
}

/* ─── Strategy A vs B comparison ──────────────────────────────────── */
window._stratA = null;

function saveStrategyA() {
  var res = window._lastSimResult;
  if (!res) { alert("Run a strategy calculation first."); return; }
  window._stratA = JSON.parse(JSON.stringify({
    totalTimeSec: res.totalTimeSec,
    stratAvgW:    res.stratAvgW,
    NP:           res.NP,
    VI:           res.VI,
    totalDistKm:  res.totalDistKm
  }));
  var el = document.getElementById("abResults");
  if (el) el.innerHTML = '<p style="color:#166534;font-weight:600;">📌 Strategy A saved: '
    + fmtSecToHMS(res.totalTimeSec) + ' · ' + res.stratAvgW.toFixed(0) + ' W avg · NP '
    + res.NP.toFixed(0) + ' W · VI ' + res.VI.toFixed(3)
    + '</p><p style="margin-top:4px;">Adjust your inputs, recalculate, then click "Compare current as B".</p>';
}

function compareStrategyB() {
  if (!window._stratA) { alert("Save Strategy A first."); return; }
  var res = window._lastSimResult;
  if (!res) { alert("Run a strategy calculation first."); return; }
  var A = window._stratA, B = res;
  var dt = B.totalTimeSec - A.totalTimeSec;
  var dtStr = dt < 0 ? ("−" + fmtSecToHMS(-dt) + " <em>(B is faster)</em>")
                     : ("+" + fmtSecToHMS(dt)  + " <em>(A is faster)</em>");
  function abRow(metric, vA, vB, delta, bWins) {
    var aC = (bWins === false) ? ' class="ab-win"' : '';
    var bC = (bWins === true)  ? ' class="ab-win"' : '';
    return '<tr><td>' + metric + '</td><td' + aC + '>' + vA + '</td><td' + bC + '>' + vB + '</td><td>' + delta + '</td></tr>';
  }
  var unitSpd = (window._lastSimResult && window._lastSimResult.cfg && window._lastSimResult.cfg.unit === "imperial") ? "mi/h" : "km/h";
  var spdA = A.totalDistKm / Math.max(0.001, A.totalTimeSec / 3600);
  var spdB = B.totalDistKm / Math.max(0.001, B.totalTimeSec / 3600);
  var html = '<table class="abResultsWrap" style="width:100%;border-collapse:collapse;">'
    + '<thead><tr><th>Metric</th><th>Strategy A</th><th>Strategy B</th><th>Delta (B−A)</th></tr></thead><tbody>'
    + abRow("Finish time", fmtSecToHMS(A.totalTimeSec), fmtSecToHMS(B.totalTimeSec), dtStr, dt < 0)
    + abRow("Avg speed (" + unitSpd + ")", spdA.toFixed(2), spdB.toFixed(2),
        ((spdB - spdA) >= 0 ? "+" : "") + (spdB - spdA).toFixed(2), spdB > spdA)
    + abRow("Avg W", A.stratAvgW.toFixed(0) + " W", B.stratAvgW.toFixed(0) + " W",
        ((B.stratAvgW - A.stratAvgW) >= 0 ? "+" : "") + (B.stratAvgW - A.stratAvgW).toFixed(0) + " W", null)
    + abRow("NP", A.NP.toFixed(0) + " W", B.NP.toFixed(0) + " W",
        ((B.NP - A.NP) >= 0 ? "+" : "") + (B.NP - A.NP).toFixed(0) + " W", null)
    + abRow("VI (lower = steadier)", A.VI.toFixed(3), B.VI.toFixed(3),
        ((B.VI - A.VI) >= 0 ? "+" : "") + (B.VI - A.VI).toFixed(3), B.VI < A.VI)
    + '</tbody></table>';
  var el = document.getElementById("abResults");
  if (el) el.innerHTML = html;
}

function clearAB() {
  window._stratA = null;
  var el = document.getElementById("abResults");
  if (el) el.innerHTML = 'Load a route and configure powers, then save Strategy A, adjust values, and compare as B.';
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

  // Compute per-point grades for gradient coloring
  var rawElev = window.currentRouteProfile ? (window.currentRouteProfile.elevations || []) : [];
  var rawDist = window.currentRouteProfile ? (window.currentRouteProfile.distances   || []) : [];
  var grades = rawElev.map(function(_, i) {
    if (i === 0 || i >= rawDist.length) return 0;
    var dM = (rawDist[i] - rawDist[i - 1]) * 1000;
    return dM > 0 ? (rawElev[i] - rawElev[i - 1]) / dM : 0;
  });
  window._chartGrades = grades;

  elevChart.data.labels = distDisplay;
  elevChart.data.datasets[0].data = elevDisplay;

  // Grade-based segment colours (Chart.js 3 `segment` option)
  elevChart.data.datasets[0].segment = {
    borderColor: function(ctx) {
      var g = (window._chartGrades || [])[ctx.p0DataIndex] || 0;
      if (g >  0.08) return '#dc2626'; // steep climb
      if (g >  0.04) return '#f97316'; // moderate climb
      if (g >  0.01) return '#fde047'; // easy climb
      if (g < -0.08) return '#1d4ed8'; // steep descent
      if (g < -0.04) return '#22d3ee'; // moderate descent
      if (g < -0.01) return '#4ade80'; // easy descent
      return '#6b7280';                // flat
    }
  };
  elevChart.data.datasets[0].borderWidth = 2.5;

  elevChart.options.scales.x.title.text = isImperial ? "Distance (mi)" : "Distance (km)";
  elevChart.options.scales.y.title.text = isImperial ? "Elevation (ft)" : "Elevation (m)";
  elevChart.options.scales.y.min = yminDisplay;
  elevChart.options.scales.y.max = ymaxDisplay;

  elevChart.options.plugins.tooltip.callbacks.title = (items) => {
    if (!items.length) return "";
    const label = items[0].label;
    const val = (typeof label === "number" ? label : parseFloat(label)) || 0;
    var g = (window._chartGrades || [])[items[0].dataIndex] || 0;
    var gStr = " (grade: " + (g * 100).toFixed(1) + "%)";
    return (isImperial ? "mi " : "km ") + val.toFixed(2) + gStr;
  };

  elevChart.options.plugins.tooltip.callbacks.label = (item) => {
    const y = item.parsed.y || 0;
    return "Elevation: " + y.toFixed(0) + (isImperial ? " ft" : " m");
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
