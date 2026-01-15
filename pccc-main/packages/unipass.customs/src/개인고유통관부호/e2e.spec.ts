import { Cookie, CookieJar, Http } from '../../../http';
import { describe, it, expect } from 'vitest';
import { 개인고유통관부호 } from './개인고유통관부호';

describe('개인고유통관부호 e2e', () => {
  const sut = new 개인고유통관부호();
  const jar = new CookieJar();
  const proxy = { protocol: 'http', host: 'localhost', port: 9090 } as const;
  const http = Http.create({ jar, proxy });

  it('request captcha', async () => {
    await sut.initialize(http);

    const captchaImg = await sut.requestCaptchaImg(http);
    console.log('captchaImg', captchaImg.toString('base64'));

    const cookies = await jar.getCookies('https://unipass.customs.go.kr');
    console.log('cookies', btoa(JSON.stringify(cookies)));
  });

  it('validate captcha', async () => {
    setCookies(
      jar,
      'W3sia2V5IjoiSlNFU1NJT05JRCIsInZhbHVlIjoiMDAwMTZ2MVRiU1JsZmF1ZC13S3Z0U0NCTnlDaUtkc0lUbzgxZWh5RE01eEhSVWhzd1dTeHJXeVh3YXNlbUcwRjBlMUFGdXZNMVF5YnV3dXR1bGJkdlJ3M0tJVlRSSW9lNlVnNUk4eVQ3WTdvN0MxTFFhOEJlckU2bWpHeHFHQnY4ZTYwOmNzcDIxIiwiZG9tYWluIjoidW5pcGFzcy5jdXN0b21zLmdvLmtyIiwicGF0aCI6Ii8iLCJzZWN1cmUiOnRydWUsImh0dHBPbmx5Ijp0cnVlLCJob3N0T25seSI6dHJ1ZSwiY3JlYXRpb24iOiIyMDI1LTA2LTI5VDA3OjIxOjQxLjExMFoiLCJsYXN0QWNjZXNzZWQiOiIyMDI1LTA2LTI5VDA3OjIxOjQxLjE0NVoiLCJzYW1lU2l0ZSI6Im5vbmUifSx7ImtleSI6IldNT05JRCIsInZhbHVlIjoiZ2Y5QzRtcERkRDUiLCJleHBpcmVzIjoiMjAyNi0wNi0yOVQxNjoyMTo0MC4wMDBaIiwiZG9tYWluIjoidW5pcGFzcy5jdXN0b21zLmdvLmtyIiwicGF0aCI6Ii8iLCJzZWN1cmUiOnRydWUsImhvc3RPbmx5Ijp0cnVlLCJjcmVhdGlvbiI6IjIwMjUtMDYtMjlUMDc6MjE6NDEuMTEwWiIsImxhc3RBY2Nlc3NlZCI6IjIwMjUtMDYtMjlUMDc6MjE6NDEuMTQ1WiIsInNhbWVTaXRlIjoibm9uZSJ9XQ=='
      ,
    );

    const { valid } = await sut.validateCaptcha(http, { 인증번호: '512064' });
    console.log(valid);
  });

  function setCookies(jar: CookieJar, encodedCookies: string) {
    const cookies = JSON.parse(atob(encodedCookies));
    for (const cookieJson of cookies) {
      const cookie = Cookie.fromJSON(cookieJson);
      jar.setCookie(cookie!, `https://${cookie!.domain}`);
    }
  }

  const baseParams = {
    이름: '홍길동',
    주민번호: '0107181234567',
    전화번호: '01012345678',
    인증번호: '512064',
  };

  it('send sms', async () => {
    const 인증번호 = await promptUser('Enter the captcha code you received: ');
    const result = await sut.sendSms(http, { ...baseParams, 인증번호  });

    console.log('sendSms result:', result);
    if (!result.valid) {
      console.warn('Failed to send SMS:', result.message ?? 'Unknown error');
    }
    
    expect(result.valid).toBe(true);
  });
  
  it('validate sms', async () => {
    const 문자인증번호 = await promptUser('Enter the SMS code you received: ');

    const result = await sut.verifySms(http, { ...baseParams, 인증번호: 문자인증번호 });

    console.log('verifySms result:', result);
    if (!result.verified) {
      console.warn('Failed to validate SMS:', result.message ?? 'Unknown error');
    }

    expect(result.verified).toBe(true);
  });

  async function promptUser(message: string): Promise<string> {
    return await new Promise(resolve => {
      process.stdout.write(`${message} `);
      process.stdin.once('data', data => resolve(data.toString().trim()));
    });
  }
});