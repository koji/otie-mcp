# Opentrons Hardware Modules Guide & API Reference

## 1. Temperature Module (`temperature module gen2`)

### Load Module
```python
temp_mod = protocol.load_module('temperature module gen2', '4') # or slot number e.g. 'D3'
temp_block = temp_mod.load_labware('opentrons_24_aluminumblock_generic_2to2_1_5ml_screwcap')
```

### API Commands
- `temp_mod.set_temperature(celsius: float)`
  - Sets target temperature in °C (4°C to 99°C) and waits until target is reached.
- `temp_mod.start_set_temperature(celsius: float)`
  - Sets target temperature asynchronously without blocking execution.
- `temp_mod.await_temperature(celsius: float)`
  - Blocks execution until temperature reaches specified target.
- `temp_mod.deactivate()`
  - Turns off heating/cooling element.
- `temp_mod.temperature`: Current temperature in °C.
- `temp_mod.target`: Target temperature in °C.
- `temp_mod.status`: Status string (`'holding at target'`, `'cooling'`, `'heating'`, `'idle'`).

---

## 2. Magnetic Module (`magnetic module gen2`)

### Load Module
```python
mag_mod = protocol.load_module('magnetic module gen2', '6')
mag_plate = mag_mod.load_labware('nest_96_wellplate_100ul_pcr_full_skirt')
```

### API Commands
- `mag_mod.engage(height_from_base: float = None, height: float = None, offset: float = None)`
  - Raises magnetic disc array into engagement height (in mm above labware base).
- `mag_mod.disengage()`
  - Lowers magnets to bottom rest position.
- `mag_mod.status`: Status string (`'engaged'`, `'disengaged'`).

---

## 3. Thermocycler Module (`thermocycler module`)

### Load Module
Note: Thermocycler occupies slots 7, 8, 10, 11 on OT-2, or slot B1 on Flex.
```python
tc_mod = protocol.load_module('thermocycler module')
tc_plate = tc_mod.load_labware('nest_96_wellplate_100ul_pcr_full_skirt')
```

### API Commands
- `tc_mod.open_lid()`: Opens heated lid.
- `tc_mod.close_lid()`: Closes heated lid.
- `tc_mod.set_lid_temperature(celsius: float)`: Sets lid temperature (up to 110°C).
- `tc_mod.deactivate_lid()`: Deactivates lid heater.
- `tc_mod.set_block_temperature(celsius: float, hold_time_seconds: float = None, hold_time_minutes: float = None)`
  - Sets PCR block temperature.
- `tc_mod.execute_profile(steps: list, repetitions: int, block_max_volume: float = None)`
  - Executes multi-step PCR thermal cycling profile.
```python
profile = [
    {'temperature': 95, 'hold_time_seconds': 30},
    {'temperature': 55, 'hold_time_seconds': 30},
    {'temperature': 72, 'hold_time_seconds': 60}
]
tc_mod.execute_profile(steps=profile, repetitions=30, block_max_volume=50)
```

---

## 4. Heater-Shifter Module (`heaterShifterModuleV1`)

### Load Module
```python
hs_mod = protocol.load_module('heaterShifterModuleV1', '1')
hs_plate = hs_mod.load_labware('nest_96_wellplate_200ul_flat')
```

### API Commands
- `hs_mod.set_target_temperature(celsius: float)`: Sets temperature (up to 95°C).
- `hs_mod.set_and_wait_for_shake_speed(rpm: int)`: Sets shaking speed (200 - 3000 RPM) and waits for stabilization.
- `hs_mod.open_labware_latch()`: Opens automated labware clamp.
- `hs_mod.close_labware_latch()`: Closes automated labware clamp.
- `hs_mod.deactivate_heater()`: Turns off heater.
- `hs_mod.deactivate_shaker()`: Stops shaking.

> **Important**: Always close labware latch (`close_labware_latch()`) before initiating shaking or heating!
