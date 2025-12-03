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

  (func $parse-number (result i32)
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
)
