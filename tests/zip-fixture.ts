import yauzl from 'yauzl';

/** Small fixture archives only. The stress suite verifies/extracts its entries progressively instead. */
export async function unzip(path: string): Promise<Map<string, Buffer>> {
  return new Promise((resolve, reject) => yauzl.open(path, { lazyEntries: true }, (error, zip) => {
    if (error || !zip) return reject(error);
    const files = new Map<string, Buffer>();
    zip.on('error', reject); zip.on('end', () => resolve(files));
    zip.on('entry', entry => zip.openReadStream(entry, (error, stream) => {
      if (error || !stream) return reject(error);
      const chunks: Buffer[] = []; stream.on('data', chunk => chunks.push(chunk)); stream.on('error', reject);
      stream.on('end', () => { files.set(entry.fileName, Buffer.concat(chunks)); zip.readEntry(); });
    })); zip.readEntry();
  }));
}
