import { Http } from '@http/http';

class InitRequester {
  async request(http: Http) {
    const { body } = await http.get(
      'https://unipass.customs.go.kr/csp/persIndexRectOnslCrtf.do?qryIssTp=1',
      {
        responseType: 'text',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
        },
      },
    );
    this.assert(body);
  }

  private assert(body: string) {
    if (body.includes('간편 본인인증 서비스')) {
      return true;
    }

    throw new Error('Invalid init response');
  }
}

export const initRequester = new InitRequester();
