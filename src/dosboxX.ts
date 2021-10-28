import { existsSync, mkdirSync } from 'fs';
import * as fs from 'fs';
import { resolve, basename } from 'path';

import Seven from 'node-7z';
import download from 'download';

const tempFolder = resolve(__dirname, "..", `out/dosbox-x`);

//from https://raw.githubusercontent.com/joncampbell123/dosbox-x/master/INSTALL.md
const dosboxX = {
    arm64: {
        url: "https://github.com/joncampbell123/dosbox-x/releases/download/dosbox-x-v0.83.18/dosbox-x-vsbuild-arm64-20211001115143.zip",
        location: "bin/ARM64/Release/"
    },
    ia32: {
        url: "https://github.com/joncampbell123/dosbox-x/releases/download/dosbox-x-v0.83.18/dosbox-x-vsbuild-win32-20211001115143.zip",
        location: "bin/Win32/Release/"
    }
    ,
    x64: {
        url: "https://github.com/joncampbell123/dosbox-x/releases/download/dosbox-x-v0.83.18/dosbox-x-vsbuild-win64-20211001115143.zip",
        location: "bin/x64/Release/"
    }
};

export async function downloadDosboxX(platform: string, arch: string) {
    if (platform === 'win32') {
        const { url, location } = dosboxX[arch as keyof (typeof dosboxX)];

        console.log('[download]');
        const zipPath = resolve(tempFolder, basename(url));
        if (existsSync(zipPath)) {
            console.log("finded zip file, skip downloading");
        } else {
            console.log("download dosbox-x zip package");
            await download(url, tempFolder);
        }

        console.log('[unpack]');
        console.log('start copy binary files');
        // myStream is a Readable stream
        const myStream = Seven.extractFull(zipPath, tempFolder, {
            $progress: true,
            // $bin: pathTo7zip
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
        // end of the operation, get the number of folders involved in the operation
        console.log(myStream.info.get('Folders')+' Folder downloaded'); //? '4'

        console.log('[copy]');
        //copy main binary and config files
        const copyFileName = [
            'dosbox-x.exe',
            'dosbox-x.reference.full.conf',
            'dosbox-x.reference.conf'
        ];
        for (const file of copyFileName) {
            const src = resolve(__dirname, '..', tempFolder, location, file);
            if (!existsSync(src)) {
                console.error('download Failed', src);
                process.exit(1);
            }
            const folder = file.endsWith('conf') ? '.' : platform + '-' + arch;
            const dstFolder = resolve(__dirname, '..', 'dosbox_x', folder);
            mkdirSync(dstFolder, { recursive: true });
            const dst = resolve(dstFolder, file);
            console.log(`copy /Y ${src} ${dst}`);
            await fs.promises.copyFile(src, dst).catch(
                e => console.error(`${src} was not copied`, e)
            );
        }
    }
}