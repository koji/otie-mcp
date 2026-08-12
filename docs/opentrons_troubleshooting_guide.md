# Opentrons Troubleshooting & Error Handling Guide

## Overview
This guide provides error diagnoses, causes, and actionable remediation steps for common Opentrons API v2 and Protocol Engine errors.

---

## 1. Missing Hardware / Module Errors

### Error: `ERR_MODULE_NOT_CONNECTED`
- **Symptom**: `Required module 'temperature module gen2' is not connected to the robot.`
- **Cause**: Protocol calls `protocol.load_module()` for a module that is not physically plugged in via USB or powered on.
- **Remediation**:
  1. Check USB connection between module and robot back panel.
  2. Verify module AC power switch is turned ON.
  3. Query `opentrons_get_robot_status` to inspect connected modules list.

---

## 2. Tip Rack & Pipette Errors

### Error: `ERR_TIP_RACK_EMPTY` / `Out of Tips`
- **Symptom**: `ProtocolEngineError: Tip attached error or no tips remaining in loaded tip racks.`
- **Cause**: Pipette attempted `pick_up_tip()` but all tips in assigned tip racks have been used.
- **Remediation**:
  1. Add additional tip racks using `protocol.load_labware('opentrons_96_tiprack_300ul', slot)`.
  2. Reset pipette tip tracking with `pipette.reset_tipracks()`.
  3. Specify `pipette.starting_tip = tiprack['A1']`.

---

## 3. Labware & Deck Slot Errors

### Error: `ERR_INVALID_LABWARE`
- **Symptom**: `Could not find labware definition for 'invalid_plate_name'`
- **Cause**: Typo in labware `load_name` passed to `protocol.load_labware()`.
- **Remediation**:
  1. Search valid load names using `opentrons_search_docs` or inspect `docs/opentrons_labware_library.md`.
  2. For custom labware, ensure the custom labware JSON definition file is uploaded to the robot.

---

## 4. Python Protocol Syntax Errors

### Error: `ERR_PYTHON_SYNTAX`
- **Symptom**: `IndentationError: unexpected indent on line X` or `SyntaxError: invalid syntax`
- **Cause**: Formatting error in the Python protocol file.
- **Remediation**:
  1. Inspect reported line number.
  2. Use `opentrons_validate_protocol` tool before uploading.

---

## 5. Movement & Collision Safety

### Shaker Latch Warning
- **Symptom**: Cannot aspirate/dispense or shake on Heater-Shifter module.
- **Cause**: Labware latch is open (`open_labware_latch()`).
- **Remediation**: Always call `hs_mod.close_labware_latch()` before pipette operations or shaking.
