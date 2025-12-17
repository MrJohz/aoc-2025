(module
  (memory $file (import "import" "file") 1)
  (memory $mem 1)
  
  (global $offset (mut i32) (i32.const 0))

  (func $read-byte (result i32)
    (local $lcoffset i32)
    (local $char i32)

    (local.tee $lcoffset (global.get $offset))

    (local.set $char
      (i32.load8_u $file))

    (global.set $offset
      (i32.add
        (i32.const 1)
        (local.get $lcoffset)))

    (return (local.get $char)))
  
  (func $read-address (export "readaddress") (result i32)
    (local $result i32)
    (local.tee $result (i32.sub (call $read-byte) (i32.const 97)))
    (i32.mul (i32.const 26))
    (local.tee $result (i32.add (i32.sub (call $read-byte) (i32.const 97))))
    (i32.mul (i32.const 26))
    (i32.add (i32.sub (call $read-byte) (i32.const 97)))
    (return))

  (func $part1 (export "part1") (param $length i32) (result i32)
    (return (i32.const 0)))

  (func $part2 (export "part2") (param $length i32) (result i32)
    (return (i32.const 0)))
)
