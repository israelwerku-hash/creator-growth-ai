import { vi } from 'vitest';

class NextURL extends URL {
  clone() {
    return new NextURL(this.toString());
  }
}

export class NextRequest extends Request {
  public nextUrl: NextURL;
  public cookies = {
    set: vi.fn(),
    get: vi.fn(),
    getAll: () => [],
  };
  constructor(input: string, init?: RequestInit) {
    super(input, init);
    this.nextUrl = new NextURL(input);
  }
}

export class NextResponse extends Response {
  public cookies = { set: vi.fn() };
  
  constructor(body?: BodyInit | null, init?: ResponseInit) {
    super(body, init);
  }

  static next() {
    const res = new NextResponse();
    return res;
  }

  static redirect(url: string | URL) {
    const res = new NextResponse(null, { status: 307 });
    res.headers.set('location', url.toString());
    return res;
  }

  static json(body: any, init?: ResponseInit) {
    const res = new NextResponse(JSON.stringify(body), init);
    res.headers.set('content-type', 'application/json');
    return res;
  }
}
