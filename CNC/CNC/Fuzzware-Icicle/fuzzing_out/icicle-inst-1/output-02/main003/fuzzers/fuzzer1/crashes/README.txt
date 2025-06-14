Command line used to find this crash:

/home/mathew/firmrebugger/fuzzers/fuzzware-icicle/pipeline/fuzzware_pipeline/../../emulator/afl/afl-fuzz -m none -U -t 10000 -i /home/mathew/firmrebugger/binaries/P2IM/CNC/icicle-inst/fuzzware-icicle/output-02/main003/base_inputs -o /home/mathew/firmrebugger/binaries/P2IM/CNC/icicle-inst/fuzzware-icicle/output-02/main003/fuzzers/fuzzer1 -d -- /home/mathew/.virtualenvs/fuzzware-icicle/bin/python -m fuzzware_harness.harness -c /home/mathew/firmrebugger/binaries/P2IM/CNC/icicle-inst/fuzzware-icicle/output-02/main003/config.yml @@

If you can't reproduce a bug outside of afl-fuzz, be sure to set the same
memory limit. The limit used for this fuzzing session was 0 B.

Need a tool to minimize test cases before investigating the crashes or sending
them to a vendor? Check out the afl-tmin that comes with the fuzzer!

Found any cool bugs in open-source tools using afl-fuzz? If yes, please drop
me a mail at <lcamtuf@coredump.cx> once the issues are fixed - I'd love to
add your finds to the gallery at:

  http://lcamtuf.coredump.cx/afl/

Thanks :-)
