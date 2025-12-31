import { Injectable } from '@nestjs/common';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

@Injectable()
export class EmailOtpSender {
  private readonly ses: SESClient;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    this.ses = new SESClient({
      region: process.env.AWS_SES_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  async send(destination: string, message: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const command = new SendEmailCommand({
      Source: process.env.EMAIL_FROM!,
      Destination: {
        ToAddresses: [destination],
      },
      Message: {
        Subject: {
          Data: 'Your MunchSpace Verification Code',
        },
        Body: {
          Text: {
            Data: message,
          },
        },
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await this.ses.send(command);
  }
}
