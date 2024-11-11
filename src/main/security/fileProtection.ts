import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

export class FileProtectionService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly key: Buffer;

  constructor() {
    this.key = crypto.scryptSync('password', 'salt', 32);
  }

  async encryptFile(
    sourcePath: string,
    destinationPath: string
  ): Promise<void> {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    const input = fs.createReadStream(sourcePath);
    const output = fs.createWriteStream(destinationPath);

    output.write(iv);

    return new Promise<void>((resolve, reject) => {
      // Tipo añadido
      input
        .pipe(cipher)
        .pipe(output)
        .on('finish', () => resolve()) // Corregido
        .on('error', reject);
    });
  }
}
