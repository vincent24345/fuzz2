#include <tcclib.h>
#include <stdint.h>

extern uint32_t reg_state[16];
extern uint32_t frb_mem_read(uint32_t read_addr, size_t size);

typedef void (*func_ptr_t)(void);

typedef struct {
    uint32_t address;
    func_ptr_t bug_func;
} context_struct;

static void report_bug(char* bug_id) {
    printf("CRASH LOGGER BUG ID: %s\n", bug_id);
}

static void report_reached(char* bug_id) {
    printf("REACHED: %s\n", bug_id);
}

void BUG_FW11() {
    report_reached("FW11");
    //Stack buffer Overflow in printFloat
    if (reg_state[2] > 9) {
        report_bug("FW11");
    }
}

void  BUG_FW18() {
    report_reached("FW18");
    //Validation issue in planner_recalculate_trapezoids
    if (reg_state[3] == 0) {
        report_bug("FW18");
    }
}

void BUG_CNCFP01() {
    report_reached("CNCFP01");
    // (FP) Data race in st_cycle_reinitialize
    if (frb_mem_read(0x20000e38,4) == 0) {
        report_bug("CNCFP01");
    }
}

context_struct context_array[] = {
    {0x08004f8a, BUG_FW11},
    {0x08002f28, BUG_FW18},
    {0x08005856, BUG_CNCFP01}
};

void send_context_struct(const context_struct **arr, size_t *size) {
    *arr = context_array;
    *size = sizeof(context_array) / sizeof(context_array[0]);
}

// static void print_reg_state(uint32_t *reg_state){
//     printf("Register State:\n");
//     printf("r0:  0x%08X\n", reg_state[0]);
//     printf("r1:  0x%08X\n", reg_state[1]);
//     printf("r2:  0x%08X\n", reg_state[2]);
//     printf("r3:  0x%08X\n", reg_state[3]);
//     printf("r4:  0x%08X\n", reg_state[4]);
//     printf("r5:  0x%08X\n", reg_state[5]);
//     printf("r6:  0x%08X\n", reg_state[6]);
//     printf("r7:  0x%08X\n", reg_state[7]);
//     printf("r8:  0x%08X\n", reg_state[8]);
//     printf("r9:  0x%08X\n", reg_state[9]);
//     printf("r10: 0x%08X\n", reg_state[10]);
//     printf("r11: 0x%08X\n", reg_state[11]);
//     printf("r12: 0x%08X\n", reg_state[12]);
//     printf("sp:  0x%08X\n", reg_state[13]);
//     printf("lr:  0x%08X\n", reg_state[14]);
//     printf("pc:  0x%08X\n", reg_state[15]);
// }