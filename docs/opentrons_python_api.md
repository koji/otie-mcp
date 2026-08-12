# Opentrons Python Protocol API v2 Reference

## Overview
The Opentrons Python Protocol API allows users to write automated liquid handling protocols for OT-2 and Opentrons Flex robots.

## Metadata & Requirements
```python
from opentrons import protocol_api

metadata = {
    'protocolName': 'My Liquid Handling Protocol',
    'author': 'User',
    'description': 'Automated transfer protocol',
    'apiLevel': '2.15'
}

def run(protocol: protocol_api.ProtocolContext):
    # Protocol steps go here
    pass
```

## Labware Loading
Use `protocol.load_labware(load_name, location)` to place labware on the deck.
```python
tiprack_1 = protocol.load_labware('opentrons_96_tiprack_300ul', '1')
plate_1 = protocol.load_labware('nest_96_wellplate_200ul_flat', '2')
trough = protocol.load_labware('nest_12_reservoir_15ml', '3')
```

## Pipette Loading & Basic Operations
Load pipettes using `protocol.load_instrument(instrument_name, mount, tip_racks)`.
```python
p300 = protocol.load_instrument('p300_single_gen2', 'left', tip_racks=[tiprack_1])

# Basic Liquid Handling Operations
p300.pick_up_tip()
p300.aspirate(100, trough['A1'])
p300.dispense(100, plate_1['A1'])
p300.drop_tip()

# High-level transfers
p300.transfer(100, trough['A1'], plate_1.wells(), new_tip='always')
p300.distribute(50, trough['A1'], plate_1.wells()[:4], new_tip='once')
p300.consolidate(50, plate_1.wells()[:4], trough['A1'], new_tip='once')
```

## Modules Loading & Control
### Temperature Module
```python
temp_mod = protocol.load_module('temperature module gen2', '4')
temp_block = temp_mod.load_labware('opentrons_24_aluminumblock_generic_2to2_1_5ml_screwcap')
temp_mod.set_temperature(4) # set to 4°C
temp_mod.deactivate()
```

### Magnetic Module
```python
mag_mod = protocol.load_module('magnetic module gen2', '6')
mag_plate = mag_mod.load_labware('nest_96_wellplate_100ul_pcr_full_skirt')
mag_mod.engage(height_from_base=5) # engage magnet
mag_mod.disengage()
```

### Thermocycler Module
```python
tc_mod = protocol.load_module('thermocycler module')
tc_plate = tc_mod.load_labware('nest_96_wellplate_100ul_pcr_full_skirt')
tc_mod.open_lid()
tc_mod.set_lid_temperature(105)
tc_mod.set_block_temperature(4, hold_time_minutes=5)
tc_mod.close_lid()
```

### Heater-Shifter Module
```python
hs_mod = protocol.load_module('heaterShifterModuleV1', '1')
hs_plate = hs_mod.load_labware('nest_96_wellplate_200ul_flat')
hs_mod.set_target_temperature(37)
hs_mod.set_and_wait_for_shake_speed(rpm=1000)
hs_mod.deactivate_heater()
hs_mod.deactivate_shaker()
hs_mod.open_labware_latch()
```
