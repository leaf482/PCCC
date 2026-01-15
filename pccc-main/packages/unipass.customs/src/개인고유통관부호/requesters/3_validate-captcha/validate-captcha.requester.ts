import { Http } from '@http/http';
import { HttpResponse } from '@http/http-response';

class ValidateCaptchaRequester {
  async request(http: Http, params: { 인증번호: string }): Promise<{ valid: boolean }> {
    const response = await http.post(
      'https://unipass.customs.go.kr/csp/myc/mainmt/MainMtCtr/captchaReq.do',
      `answer=${params.인증번호}`,
      {
        responseType: 'text',
        headers: {
          Accept: '*/*',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
        },
      },
    );

    return { valid: this.parse(response) };
  }

  private parse(response: HttpResponse) {
    if (response.body === '"S"') {
      return true;
    }
    if (response.body === '"F"') {
      return false;
    }
    throw new Error('Invalid validate captcha response');
  }
}

export const validateCaptchaRequester = new ValidateCaptchaRequester();
