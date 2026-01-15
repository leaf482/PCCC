import { Http } from '@http/http';
import { initRequester } from './requesters/1_init/init.requester';
import { captchaImgRequester } from './requesters/2_captcha-img/captcha-img.requester';
import { validateCaptchaRequester } from './requesters/3_validate-captcha/validate-captcha.requester';
import { sendSmsRequester } from './requesters/4_sms-send/send-sms.requester';
import { validateSmsRequester } from './requesters/5_validate-sms/validate-sms.requester';

export class 개인고유통관부호 {
  async initialize(http: Http): Promise<void> {
    await initRequester.request(http);
  }

  async requestCaptchaImg(http: Http): Promise<Buffer> {
    return await captchaImgRequester.request(http);
  }

  async validateCaptcha(http: Http, params: { 인증번호: string }): Promise<{ valid: boolean }> {
    return await validateCaptchaRequester.request(http, params);
  }

  async sendSms(http: Http, params: { 전화번호: string; 이름: string; 주민번호: string; 인증번호: string }
  ): Promise<{ valid: boolean; message?: string }> {
    return await sendSmsRequester.request(http, params);
  }

  // verify sms / get 개인고유통관번호
  async verifySms(http: Http, params: { 전화번호: string; 이름: string; 주민번호: string; 인증번호: string }): Promise<{ verified: boolean; message?: string }> {
    return await validateSmsRequester.request(http, params)
  }
}
