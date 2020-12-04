# {device-name} Driver

Driver description if have.

## Device Model

- [{device-model}](https://rap.ruff.io/devices/{device-model})

> You can name {device-model} by {model-name} like gy-30 or {chip-name}-({interface}) like ssd1306-i2c.

## Install

```sh
> rap device add --model {device-model} --id <device-id> 
```

## Demo

Supposed \<device-id\> is `xxx` in the following demos.

```js
$('#xxx').func();
```

> It will be better if you attach some pictures of your device demo.**

<div align="center">
<img src="https://xxx" width = "100" height = "100" alt="device demo" />
</div>

## API References

```
// default adc ref is internal
adc.setIntRef(callback) // use interanl ref 
adc.setExtRef(callback) // use external ref

// One shot read ADC channel
adc.readChanOneShot(channel, callback)

// Continous reading ADC channel
adc.start()
adc.readChan(channel, callback)
adc.stop()

// channels
adc.chan0
adc.chan1
adc.chan2
adc.chan3
adc.chan4

// read temp
adc.readTemp(callback)


// read rev
adc.readVer(callback)

// read manufacture id
adc.readManuId(callback)


```

### Methods

#### `func()`

The function of method func().

### Properties (opt.)

### Events (opt.)

## Supported OS

Test passed on Ruff v1.6.0 and Ruff Lite v0.6.0

## Note

Some notes about device or driver if have.

### Quick Start
1. Power on the device , wait at least 33ms
2. Read busy status register, 0x0C, wait it to be 0
3. Program the Advanced Configuration REgister, 0x0B
   - Choose internal or external VREF
   - choose operation mode
4. Program the conversion rate register 0x07
5. enable channels, Channel Disable Register, 0x08
6. Interrupt Mask Register, 0x03
7. Program Limit Register
8. Set Start bit, to 1
9. set INT_Clear bit to 0, INT_Enable to 0


