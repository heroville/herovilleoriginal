'use strict';

(async function runAllTests() {
    await import('./saveLoad.test.js');
    await import('./economyService.test.js');
}()).catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
