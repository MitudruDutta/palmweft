// Declare only the pngjs API used by scripts; qrcode supplies the installed dependency.
declare module 'pngjs' {
  export class PNG {
    constructor(opts?: { width?: number; height?: number });
    width: number;
    height: number;
    data: Buffer;
    static sync: {
      read(buf: Buffer): PNG;
      write(png: PNG): Buffer;
    };
  }
}
