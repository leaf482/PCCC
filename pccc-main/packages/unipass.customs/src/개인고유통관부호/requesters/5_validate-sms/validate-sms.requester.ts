import { Http } from '@http/http';
import { HttpResponse } from '@http/http-response';

interface SmsValidateResult {
  verified: boolean;
  message?: string;
}

class ValidateSmsRequester {
  async request(
    http: Http,
    params: { 전화번호: string; 이름: string; 주민번호: string; 인증번호: string }
  ): Promise<SmsValidateResult> {
    const body = new URLSearchParams({
      act: 'validateSms',
      이름: params.이름,
      주민번호: params.주민번호,
      전화번호: params.전화번호,
      인증번호: params.인증번호,
    }).toString();

    const response = await http.post(
      'https://unipass.customs.go.kr/csp/persIndexRectOnslCrtf.do',
      body,
      {
        responseType: 'text',
        headers: this.getHeaders(),
      }
    );

    return this.parse(response);
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
    };
  }

  private parse(response: HttpResponse): SmsValidateResult {
    const raw = typeof response.body === 'string' ? response.body : JSON.stringify(response.body);

    try {
      const body = JSON.parse(raw);
      if (body.result === 'S') return { verified: true };
      if (body.result === 'F') return { verified: false, message: body.message || 'SMS 인증 실패' };
    } catch {
      if (raw === '"S"') return { verified: true };
      if (raw === '"F"') return { verified: false, message: 'SMS 인증 실패 (F)' };
    }

    throw new Error(`Unexpected validateSms response: ${raw}`);
  }
}

export const validateSmsRequester = new ValidateSmsRequester();