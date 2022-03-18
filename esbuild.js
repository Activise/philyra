//@ts-check
const watch = process.argv.includes('--watch');
const minify = process.argv.includes('--minify');
const success = watch ? 'Watch build succeeded' : 'Build succeeded';

function getTime() {
  const date = new Date();
  return `[${`${padZeroes(date.getHours())}:${padZeroes(date.getMinutes())}:${padZeroes(date.getSeconds())}`}] `;
}

function padZeroes(i) {
  return i.toString().padStart(2, '0');
}

require('esbuild').build({
  entryPoints: ['src/extension.ts', 'src/language/main.ts', 'src/cli/index.ts'],
  outdir: 'out',
  bundle: true,
  loader: { '.ts': 'ts' },
  external: ['vscode'],
  platform: 'node',
  sourcemap: true,
  watch: watch ? {
    onRebuild(error) {
      if (error) console.error(`${getTime()}Watch build failed`)
      else console.log(`${getTime()}${success}`)
    }
  } : false,
  minify
}).then(() => console.log(`${getTime()}${success}`))
  .catch(() => process.exit(1));