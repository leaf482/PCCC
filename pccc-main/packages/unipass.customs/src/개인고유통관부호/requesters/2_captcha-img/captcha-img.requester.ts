import { Http } from '@http/http';
import { HttpResponse } from '@http/http-response';

class CaptchaImgRequester {
  async request(http: Http): Promise<Buffer> {
    const response = await http.get(
      `https://unipass.customs.go.kr/csp/myc/mainmt/MainMtCtr/captchaImg.do?id=${Math.random()}`,
      {
        responseType: 'buffer',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
        },
      },
    );

    this.assert(response);

    return response.body;
  }

  private assert(response: HttpResponse) {
    if (response.status === 200) {
      return true;
    }

    throw new Error('Invalid captcha img response');
  }
}

export const captchaImgRequester = new CaptchaImgRequester();
