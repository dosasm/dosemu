
import * as fs from 'fs';
import * as path from 'path';

import Seven from 'node-7z';
import download from 'download';

const url = "http://takeda-toshiya.my.coocan.jp/msdos/msdos.7z";

const tempFolder = path.resolve(__dirname, "..", `out/msdos_player`);

export async function downloadMsdosPlayer(platform: string, arch: string) {
    if (platform === 'win32') {

        console.log('[zip]');
        const zipPath = path.resolve(tempFolder, path.basename(url));
        if (fs.existsSync(zipPath)) {
            console.log("finded zip file, skip downloading");
        } else {
            console.log("download msdos zip package");
            await download(url, tempFolder);
        }

        console.log('[unpack]');
        // myStream is a Readable stream
        const myStream = Seven.extractFull(zipPath, tempFolder, {
            $progress: true
        });
        let percent = 0;
        myStream.on('progress', function (progress) {
            if (percent !== progress.percent) {
                percent = progress.percent;
                console.log(progress.percent);
            }
            //? { percent: 67, fileCount: 5, file: undefinded }
        });
        const p = new Promise<void>(
            resolve => myStream.on('end', resolve)
        );
        await p;

        console.log('[copy]');
        if (arch === "x64" || arch === "ia32") {
            const src = path.resolve(tempFolder, 'msdos/binary/', arch === "x64" ? 'i486_x64' : 'i486_x86', 'msdos.exe');
            const dstFolder = path.resolve(__dirname, '..', 'msdos_player', platform + '-' + arch);
            fs.mkdirSync(dstFolder, { recursive: true });
            const dest = path.resolve(dstFolder, 'msdos.exe');
            fs.copyFileSync(
                src,
                dest
            );
        }

    }
}