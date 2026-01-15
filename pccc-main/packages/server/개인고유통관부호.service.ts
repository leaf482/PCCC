import { Injectable } from '@nestjs/common';
import { 개인고유통관부호 } from '../unipass.customs/src/개인고유통관부호/개인고유통관부호';
import { Http } from '../http/src//http';


@Injectable()
export class 개인고유통관부호Service {
  private svc = new 개인고유통관부호();

  async initialize(http: Http) {
    return await this.svc.initialize(http);
  }
  async requestCaptchaImg(http: Http) {
    return await this.svc.requestCaptchaImg(http);
  }
  async validateCaptcha(http: Http, params: { 인증번호: string }) {
    return await this.svc.validateCaptcha(http, params);
  }
  async sendSms(http: Http, params: { 전화번호: string; 이름: string; 주민번호: string; 인증번호: string }) {
    return await this.svc.sendSms(http, params);
  }
  async verifySms(http: Http, params: { 전화번호: string; 이름: string; 주민번호: string; 인증번호: string }) {
    return await this.svc.verifySms(http, params);
  }
}