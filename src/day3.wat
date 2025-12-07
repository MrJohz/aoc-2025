(module
  (memory (import "import" "file") 1)
  (func $log64 (import "console" "log") (param i64))
  (func $log32 (import "console" "log") (param i32))
  (func $logstr (import "utils" "logstr") (param i32) (param i32))
  
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

  (func $read-byte-at (param $offset i32) (result i32)
    (return (i32.load8_u (local.get $offset))))

  (func $sum-bytes (param $offset i32) (param $length i32) (result i64)
    (local $result i64)
    (local $end i32)
    (local.set $result (i64.const 0))
    (local.set $end (i32.add (local.get $offset) (local.get $length)))

    loop $start
      (local.set $result (i64.mul (local.get $result) (i64.const 10)))
      (local.set $result
        (i64.add
          (local.get $result)
          (i64.extend_i32_s
            (i32.sub
              (call $read-byte-at (local.get $offset))
              (i32.const 48)))))
      
      (local.tee $offset (i32.add (local.get $offset) (i32.const 1)))
      (local.get $end)
      i32.lt_s
      (br_if $start)
    end

    (return (local.get $result))
)
  
  (func $find-largest-2 (export "findlargest2") (result i32)
    (local $largest i32)
    (local $second i32)
    (local $char1 i32)
    (local $char2 i32)

    (local.tee $char1 (call $read-byte))
    (local.set $largest)
    (local.tee $char2 (call $read-byte))
    (local.set $second)

    block $end
    loop $start
      (local.set $char1 (local.get $char2))
      (local.tee $char2 (call $read-byte))
      (br_if $end (i32.eq (i32.const 10)))

      (if (i32.gt_s (local.get $char1) (local.get $largest))
        (then
          (local.set $largest (local.get $char1))
          (local.set $second (local.get $char2)))
        (else
          (if (i32.gt_s (local.get $char2) (local.get $second))
            (then
              (local.set $second (local.get $char2))))))


      br $start
    end
    end

    (return
      (i32.add
        (i32.mul (i32.sub (local.get $largest) (i32.const 48)) (i32.const 10))
        (i32.sub (local.get $second) (i32.const 48)))))
  
  (func $find-largest-12 (export "findlargest12") (param $arr i32) (result i64)
    (local $ptr i32)
    (local $len i32)

    (memory.copy (local.get $arr) (global.get $offset) (i32.const 12))
    (global.set $offset (i32.add (global.get $offset) (i32.const 12)))

    block $outer-end
    loop $outer-start
      (br_if $outer-end (i32.eq (i32.const 10) (call $read-byte)))

      (local.set $ptr (i32.const 0))

      block $inner-end
      loop $inner-start
        (local.set $len (i32.sub (i32.const 12) (local.get $ptr)))
        (i32.lt_s
          (call $read-byte-at (i32.add (local.get $ptr) (local.get $arr)))
          (call $read-byte-at (i32.sub (global.get $offset) (local.get $len))))
        (if
          (then
            (memory.copy
              (i32.add (local.get $ptr) (local.get $arr))
              (i32.sub (global.get $offset) (local.get $len))
              (local.get $len))
            br $inner-end))

        (local.set $ptr (i32.add (local.get $ptr) (i32.const 1)))
        (if (i32.gt_s (local.get $ptr) (i32.const 12))
          (then br $inner-end))

        br $inner-start
      end
      end

      br $outer-start
    end
    end


    (return (call $sum-bytes (local.get $arr) (i32.const 12))))

  (func $part1 (export "part1") (param $length i32) (result i32)
    (local $sum i32)
    (local.set $sum (i32.const 0))
  
    loop $loop-start
      (local.set $sum
        (i32.add
          (local.get $sum)
          (call $find-largest-2)))

      (br_if $loop-start (i32.lt_s (global.get $offset) (local.get $length)))
    end
    
    (return (local.get $sum)))

  (func $part2 (export "part2") (param $length i32) (result i64)
    (local $sum i64)
    (local.set $sum (i64.const 0))
  
    loop $loop-start
      (local.set $sum
        (i64.add
          (local.get $sum)
          (call $find-largest-12 (local.get $length))))

      (br_if $loop-start (i32.lt_s (global.get $offset) (local.get $length)))
    end
    
    (return (local.get $sum)))
)