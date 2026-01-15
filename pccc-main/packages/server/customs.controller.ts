import { Controller, Post, Body } from '@nestjs/common';
import { 개인고유통관부호Service } from './개인고유통관부호.service';
import { Http } from '../http/src/http';

@Controller('customs')
export class CustomsController {
  constructor(private readonly svc: 개인고유통관부호Service) {}

  @Post('initialize')
  async initialize(@Body() body: any) {
    const http = Http.create();
    return await this.svc.initialize(http);
  }

  @Post('captcha-img')
  async requestCaptchaImg(@Body() body: any) {
    const http = Http.create();
    return await this.svc.requestCaptchaImg(http);
  }

  @Post('validate-captcha')
  async validateCaptcha(@Body() body: { 인증번호: string }) {
    const http = Http.create();
    return await this.svc.validateCaptcha(http, body);
  }

  @Post('send-sms')
  async sendSms(@Body() body: { 전화번호: string; 이름: string; 주민번호: string; 인증번호: string }) {
    const http = Http.create();
    return await this.svc.sendSms(http, body);
  }

  @Post('verify-sms')
  async verifySms(@Body() body: { 전화번호: string; 이름: string; 주민번호: string; 인증번호: string }) {
    const http = Http.create();
    return await this.svc.verifySms(http, body);
  }
}