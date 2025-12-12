(module
  (memory (import "import" "file") 1)
  
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

  (func $handle-left (param $start i32) (param $rotation i32) (result i32 i32)
    (local $rots i32)
    
    (local.set $rots (i32.div_s (local.get $rotation) (i32.const 100)))
    (if (i32.eq (local.get $start) (i32.const 0))
      (then (local.set $rots (i32.sub (local.get $rots) (i32.const 1)))))

    (local.set $start
      (i32.sub
        (local.get $start)
        (i32.rem_s (local.get $rotation) (i32.const 100))))
    
    (if (i32.le_s (local.get $start) (i32.const 0))
      (then (local.set $rots (i32.add (local.get $rots) (i32.const 1)))))
    (if (i32.lt_s (local.get $start) (i32.const 0))
      (then (local.set $start (i32.add (local.get $start) (i32.const 100)))))
    
    (return (local.get $start) (local.get $rots)))

  (func $handle-right (param $start i32) (param $rotation i32) (result i32 i32)
    (local $rots i32)
    
    (local.set $rots (i32.div_s (local.get $rotation) (i32.const 100)))
    (local.set $start
      (i32.add
        (local.get $start)
        (i32.rem_s (local.get $rotation) (i32.const 100))))
    (if (i32.ge_s (local.get $start) (i32.const 100))
      (then 
        (local.set $start (i32.sub (local.get $start) (i32.const 100)))
        (local.set $rots (i32.add (local.get $rots) (i32.const 1)))))
    
    (return (local.get $start) (local.get $rots)))

  (func $handle-row (export "handle_row") (param $start i32) (param $rotation i32) (result i32 i32)
    (if (result i32 i32) (i32.gt_s (local.get $rotation) (i32.const 0))
      (then (return_call $handle-right (local.get $start) (local.get $rotation)))
      (else (return_call $handle-left (local.get $start) (i32.sub (i32.const 0) (local.get $rotation))))))

  (func $part1 (export "part1") (param $length i32) (result i32)
    (local $rotation i32)
    (local $count-zeroes i32)

    (local.set $rotation (i32.const 50))
    (local.set $count-zeroes (i32.const 0))
    
    loop $loop-start
      (call $handle-row (local.get $rotation) (call $parse-line))
      drop
      (local.tee $rotation)
      (i32.eq (i32.const 0))
      (local.set $count-zeroes (i32.add (local.get $count-zeroes)))

      (br_if $loop-start (i32.lt_s (global.get $offset) (local.get $length)))
    end
    
    (return (local.get $count-zeroes)))

  (func $part2 (export "part2") (param $length i32) (result i32)
    (local $rotation i32)
    (local $count-zeroes i32)
    
    (local.set $rotation (i32.const 50))
    (local.set $count-zeroes (i32.const 0))
    
    loop $loop-start
      (call $handle-row (local.get $rotation) (call $parse-line))
      (local.set $count-zeroes (i32.add (local.get $count-zeroes)))
      (local.set $rotation)

      (br_if $loop-start (i32.lt_s (global.get $offset) (local.get $length)))
    end
    
    (return (local.get $count-zeroes)))
)
