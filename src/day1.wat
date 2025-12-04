(module
  (memory (import "import" "file") 1)
  (func $__log (import "console" "log") (param i32))
  (func $log (param $p i32) (result i32)
    (call $__log (local.get $p))
    (return (local.get $p)))
  
  (global $offset (mut i32) (i32.const 0))

  (func $read-byte (result i32)
    (local $lcoffset i32)
    (local $char i32)

    (local.tee $lcoffset (global.get $offset))

    (local.set $char
      (i32.load8_u))

    (global.set $offset
      (i32.add
        (i32.const 1)
        (local.get $lcoffset)))

    (return (local.get $char)))

  (func $parse-number (export "parse_number") (result i32)
    (local $number i32)
    (local $char i32)

    (local.set $number (i32.const 0))

    block $parse_end
    loop $parse_start
      (local.set $char (call $read-byte))

      (br_if $parse_end
        (i32.eq (i32.const 10) (local.get $char)))

      (local.set $number
        (i32.add
          (i32.sub (local.get $char) (i32.const 48))
          (i32.mul (local.get $number) (i32.const 10))))

      br $parse_start
    end
    end
    (return (local.get $number)))

  (func $parse-line (export "parse_line") (result i32)
    (return
      (if (result i32) (i32.eq (call $read-byte) (i32.const 76))
        (then (i32.sub (i32.const 0) (call $parse-number)))
        (else (call $parse-number)))))

  (func $eq-zero (export "eq_zero") (param $value i32) (result i32)
    (return
      (i32.eq
        (i32.rem_s (local.get $value) (i32.const 100))
        (i32.const 0))))

  (func $pass-thru-zero (export "pass_thru_zero") (param $start i32) (param $end i32) (result i32)
    (local $changes i32)
    (local $scratch i32)

    (local.set $scratch (i32.div_s (local.get $start) (i32.const 100)))
    (if (result i32) (i32.lt_s (local.get $start) (i32.const 0))
      (then (i32.add (i32.const -1) (local.get $scratch)))
      (else (local.get $scratch)))
    call $log
    (local.set $scratch (i32.div_s (local.get $end) (i32.const 100)))
    (if (result i32) (i32.lt_s (local.get $end) (i32.const 0))
      (then (i32.add (i32.const -1) (local.get $scratch)))
      (else (local.get $scratch)))
    call $log
    (local.set $changes (i32.sub))

    (if (result i32) (i32.lt_s (local.get $changes) (i32.const 0))
      (then (i32.sub (i32.const 0) (local.get $changes)))
      (else (local.get $changes)))

    (return))

  (func $part1 (export "part1") (param $length i32) (result i32)
    (local $rotation i32)
    (local $count-zeroes i32)

    (local.set $rotation (i32.const 50))
    (local.set $count-zeroes (i32.const 0))
    
    loop $loop-start
      (local.set $rotation (i32.add (local.get $rotation) (call $parse-line)))
      (local.set $count-zeroes (i32.add (local.get $count-zeroes) (call $eq-zero (local.get $rotation))))

      (br_if $loop-start (i32.lt_s (global.get $offset) (local.get $length)))
    end
    
    (return (local.get $count-zeroes)))

  (func $part2 (export "part2") (param $length i32) (result i32)
    (local $rotation i32)
    (local $count-zeroes i32)
    (local $diff i32)
    
    (local.set $rotation (i32.const 50))
    (local.set $count-zeroes (i32.const 0))
    
    loop $loop-start
      (local.set $diff (call $parse-line))
      (local.get $rotation)
      (local.tee $rotation (i32.add (local.get $rotation) (local.get $diff)))
      (local.set $count-zeroes (i32.add (local.get $count-zeroes) (call $pass-thru-zero)))

      (br_if $loop-start (i32.lt_s (global.get $offset) (local.get $length)))
    end
    
    (return (local.get $count-zeroes)))
)
