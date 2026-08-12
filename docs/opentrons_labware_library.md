# Opentrons Standard Labware Library Reference

## Overview
This reference lists official Opentrons standard labware `load_name` definitions for OT-2 and Opentrons Flex protocols.

---

## Tip Racks (`load_labware`)

### OT-2 Tip Racks
- `opentrons_96_tiprack_10ul` (10uL Standard Tip Rack)
- `opentrons_96_tiprack_20ul` (20uL Standard Tip Rack)
- `opentrons_96_tiprack_300ul` (300uL Standard Tip Rack)
- `opentrons_96_tiprack_1000ul` (1000uL Standard Tip Rack)
- `opentrons_96_filtertiprack_20ul` (20uL Filter Tip Rack)
- `opentrons_96_filtertiprack_200ul` (200uL Filter Tip Rack)
- `opentrons_96_filtertiprack_1000ul` (1000uL Filter Tip Rack)

### Flex Tip Racks
- `opentrons_flex_96_tiprack_50ul`
- `opentrons_flex_96_tiprack_200ul`
- `opentrons_flex_96_tiprack_1000ul`
- `opentrons_flex_96_filtertiprack_50ul`
- `opentrons_flex_96_filtertiprack_200ul`
- `opentrons_flex_96_filtertiprack_1000ul`

---

## Well Plates

### PCR Plates
- `nest_96_wellplate_100ul_pcr_full_skirt`
- `biorad_96_wellplate_200ul_pcr`
- `armadillo_96_wellplate_200ul_pcr_full_skirt`

### Microplates (96 Well / 384 Well)
- `nest_96_wellplate_200ul_flat`
- `corning_96_wellplate_360ul_flat`
- `corning_384_wellplate_112ul_flat`
- `nest_384_wellplate_100ul_flat`

### Deep Well Plates
- `nest_96_deepwellplate_2ml`
- `usa_scientific_96_deepwellplate_2.4ml`

---

## Reservoirs
- `nest_12_reservoir_15ml` (12 Column Reservoir, 15mL per well)
- `nest_1_reservoir_290ml` (Single Cavity Open Reservoir, 290mL)
- `usa_scientific_12_reservoir_22ml`

---

## Tube Racks & Aluminum Blocks

### Tube Racks
- `opentrons_24_tuberack_eppendorf_1.5ml_safelock_snapcap`
- `opentrons_24_tuberack_eppendorf_2ml_safelock_snapcap`
- `opentrons_24_tuberack_generic_2ml_screwcap`
- `opentrons_10_tuberack_falcon_4x50ml_6x15ml_conical`
- `opentrons_6_tuberack_falcon_50ml_conical`
- `opentrons_15_tuberack_falcon_15ml_conical`

### Aluminum Blocks (for Temperature & Thermocycler Modules)
- `opentrons_24_aluminumblock_generic_2to2_1_5ml_screwcap`
- `opentrons_96_aluminumblock_biorad_wellplate_200ul`
- `opentrons_24_aluminumblock_nest_1.5ml_screwcap`
- `opentrons_96_aluminumblock_nest_wellplate_100ul`

---

## Example Usage
```python
# Loading a standard tip rack and deepwell plate
tiprack = protocol.load_labware('opentrons_96_tiprack_300ul', '1')
plate = protocol.load_labware('nest_96_wellplate_200ul_flat', '2')
reservoir = protocol.load_labware('nest_12_reservoir_15ml', '3')
```
