// import dosboxX from './dosboxX';

import { downloadDosboxX } from "./dosboxX";
import { downloadMsdosPlayer } from './msdos_player';

const targetList = [
    "win32-x64",
    "win32-ia32",
    "win32-arm64",
    "linux-x64",
    "linux-arm64",
    "linux-armhf",
    "alpine-x64",
    "alpine-arm64",
    "darwin-x64",
    "darwin-arm64"
];

async function updateDosboxBin() {
    for (const target of targetList) {
        const [platform, arch] = target.split('-');
        console.log(`>>>update binary files for target ${platform} ${arch} in ${process.platform} ${process.arch}`);
        await downloadDosboxX(platform, arch);
        await downloadMsdosPlayer(platform, arch);
    }
}

updateDosboxBin();