# Opentrons Python Protocol API v2 Comprehensive Reference

## Protocol Engine & Context (`ProtocolContext`)

The `ProtocolContext` is the primary interface for interacting with the Opentrons robot inside a protocol's `run(protocol: protocol_api.ProtocolContext)` function.

### Key Methods
- `protocol.load_labware(load_name: str, location: str|int, label: str = None, namespace: str = None, version: int = None)`
  - Loads a piece of labware onto a deck slot (e.g. `'1'`, `'D2'`).
- `protocol.load_instrument(instrument_name: str, mount: str, tip_racks: list = None)`
  - Loads an instrument e.g. `'p300_single_gen2'`, `'p20_multi_gen2'`, `'p1000_single_gen2'`, `'flex_1channel_50ul'`, `'flex_8channel_300ul'`. Mounts: `'left'`, `'right'`.
- `protocol.load_module(module_name: str, location: str|int)`
  - Loads a hardware module e.g. `'temperature module gen2'`, `'magnetic module gen2'`, `'thermocycler module'`, `'heaterShifterModuleV1'`.
- `protocol.pause(msg: str = None)`
  - Pauses execution until resumed by user via Opentrons App or HTTP API.
- `protocol.resume()`
  - Resumes execution.
- `protocol.delay(seconds: float = 0, minutes: float = 0, msg: str = None)`
  - Pauses execution for a specified duration.
- `protocol.comment(msg: str)`
  - Prints a message to the run log.
- `protocol.home()`
  - Homes all robot axes.

---

## Instrument Context (`InstrumentContext` / Pipette)

Represents a loaded pipette.

### Pipette Properties
- `pipette.starting_tip`: The tip location where automatic tip picking starts.
- `pipette.default_speed`: Movement speed in mm/s.
- `pipette.well_bottom_clearance`: Clearance from well bottom in mm for `aspirate` (default 1.0mm) and `dispense` (default 1.0mm).
- `pipette.flow_rate`: Liquid handling speed settings.
  - `pipette.flow_rate.aspirate`: Volume per second (uL/s).
  - `pipette.flow_rate.dispense`: Volume per second (uL/s).
  - `pipette.flow_rate.blow_out`: Volume per second (uL/s).

### Liquid Handling Operations

#### `pick_up_tip(location=None, presses=None, increment=None)`
Picks up a tip from the loaded tip racks or a specific tip location.

#### `drop_tip(location=None, home_after=True)`
Drops the attached tip into the trash or a specified location/tiprack.

#### `aspirate(volume=None, location=None, rate=1.0)`
Aspirates liquid into the tip.
```python
pipette.aspirate(50, plate['A1'].bottom(1))
```

#### `dispense(volume=None, location=None, rate=1.0)`
Dispenses liquid from the tip.
```python
pipette.dispense(50, plate['B1'].top(-2))
```

#### `blow_out(location=None)`
Blows out remaining liquid from the tip into a well or trash.

#### `touch_tip(location=None, radius=1.0, v_offset=-1.0, speed=60.0)`
Touches the inside edges of a well to knock off remaining droplets.

#### `mix(repetitions=1, volume=None, location=None, rate=1.0)`
Repeatedly aspirates and dispenses liquid to mix.
```python
pipette.mix(3, 100, plate['A1'])
```

#### `air_gap(volume=None, height=None)`
Draws an air gap into the tip to prevent dripping during transit.

---

## Complex Complex Transfer Operations

### `transfer(volume, source, dest, new_tip='every', trash=True, touch_tip=False, blow_out=False, blowout_location='trash', mix_before=None, mix_after=None, air_gap=0)`
High-level transfer helper. `source` and `dest` can be single wells, lists of wells, or labware.

```python
pipette.transfer(
    100,
    reservoir['A1'],
    plate.wells(),
    new_tip='once',
    touch_tip=True,
    blow_out=True
)
```

### `distribute(volume, source, dest, allow_volume_overfill=True, ...)`
Dispenses liquid from one source well into multiple destination wells in a single aspirate draw.

### `consolidate(volume, source, dest, ...)`
Aspirates liquid from multiple source wells and dispenses into a single destination well.

---

## Well & Labware API

### Well Locations & Offsets
- `well.top(z=0)`: Point at the top edge of the well.
- `well.bottom(z=0)`: Point at the bottom center of the well.
- `well.center()`: Geometric center of the well.
- `well.diameter`: Diameter in mm (if circular).
- `well.max_volume`: Capacity in uL.

### Labware Methods
- `labware.wells()`: Returns list of all wells ordered column-wise (`A1`, `B1`, `C1`, ...).
- `labware.rows()`: Returns list of rows (`[[A1, A2...], [B1, B2...]]`).
- `labware.columns()`: Returns list of columns (`[[A1, B1...], [A2, B2...]]`).
- `labware.wells_by_name()`: Dictionary mapping well names (e.g. `'A1'`) to Well objects.
