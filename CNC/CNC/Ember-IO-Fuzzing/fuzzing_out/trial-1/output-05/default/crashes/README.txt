Command line used to find this crash:

/home/mathew/firmrebugger/fuzzers/Ember-IO-Fuzzing//AFLplusplus/afl-fuzz -V 86400 -i ./seeds -o MORE-CNC-real/Ember-IO-Fuzzing/output-05 -t 200 -Q ./CNC.elf -sram_size 256k -flash_size 52k -machine embedded_fuzz -fuzz_input @@

If you can't reproduce a bug outside of afl-fuzz, be sure to set the same
memory limit. The limit used for this fuzzing session was 0 B.

Need a tool to minimize test cases before investigating the crashes or sending
them to a vendor? Check out the afl-tmin that comes with the fuzzer!

Found any cool bugs in open-source tools using afl-fuzz? If yes, please drop
an mail at <afl-users@googlegroups.com> once the issues are fixed

  https://github.com/AFLplusplus/AFLplusplus

